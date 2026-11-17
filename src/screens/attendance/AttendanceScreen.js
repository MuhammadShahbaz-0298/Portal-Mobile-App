// Attendance register: students see their own history; staff see the register
// with batch/date filters and can mark a batch. Search filters loaded rows.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { DateField } from '../../components/ui/DateField';
import { SelectRow } from '../../components/ui/SelectRow';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { AttendanceCard } from '../../components/lists/AttendanceCard';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listAttendance } from '../../api/attendance';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, can } from '../../constants/permissions';
import { isStudentRole, isStaffRole } from '../../utils/access';
import { ATTENDANCE, COMMON, PICKER } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { QUERY_LIMIT } from '../../constants/options';
import { layout, spacing } from '../../constants/theme';

export function AttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const canView = can(user, PERMISSIONS.ATTENDANCE_VIEW, ['admin', 'teacher', 'student']);
  const canManage = can(user, PERMISSIONS.ATTENDANCE_MANAGE, ['admin', 'teacher']);
  const canBatches = can(user, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher']);
  const student = isStudentRole(user);
  const staff = isStaffRole(user);
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState('');
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
  const params = student ? {} : { batchId, date: validDate };
  const list = usePaginatedList(listAttendance, params, { enabled: canView });
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: staff && canBatches,
  });
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return list.items;
    return list.items.filter((item) =>
      [item.student?.name, item.student?.email, item.batch?.name, item.status, item.leaveReason]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [list.items, search]);

  if (!canView) return <Screen><PermissionState /></Screen>;

  const batchOptions = [
    { value: '', label: COMMON.all },
    ...(batches.data?.items || []).map((batch) => ({ value: batch._id, label: batch.name })),
  ];

  const header = (
    <>
      <ListHeader
        title={ATTENDANCE.title}
        subtitle={ATTENDANCE.subtitle}
        action={
          canManage && staff ? (
            <Button
              title={ATTENDANCE.markTitle}
              icon="checkmark-done"
              compact
              onPress={() => navigation.navigate(ROUTES.attendanceMark)}
            />
          ) : null
        }
        search={search}
        onSearchChange={setSearch}
      />
      {staff && canBatches ? (
        <View style={styles.filters}>
          <SelectRow
            label={ATTENDANCE.batchLabel}
            value={batchId}
            valueLabel={batchOptions.find((item) => item.value === batchId)?.label}
            options={batchOptions}
            onChange={setBatchId}
          />
          <DateField
            label={ATTENDANCE.dateLabel}
            value={date}
            onChange={setDate}
            placeholder={PICKER.allDates}
            maximumDate={new Date()}
            allowClear
          />
        </View>
      ) : null}
    </>
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => <AttendanceCard record={item} />}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={ATTENDANCE.empty}
            message={ATTENDANCE.emptyHint}
            icon="calendar-outline"
          />
        }
        ListFooterComponent={
          <ListFooter
            loaded={list.items.length}
            total={list.meta.total}
            loading={list.loadingMore}
            onLoadMore={list.loadMore}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  list: { padding: spacing.lg, paddingBottom: layout.listBottomSpacing },
  gap: { height: spacing.md },
  filters: { gap: spacing.md, marginBottom: spacing.md },
});
