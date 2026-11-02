// Attendance register: staff filters and edits; students see their own history and summary.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { PageHeader } from '../../components/ui/PageHeader';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchBar } from '../../components/ui/SearchBar';
import { SelectRow } from '../../components/ui/SelectRow';
import { ListFooter } from '../../components/lists/ListFooter';
import { AttendanceCard } from '../../components/lists/AttendanceCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listAttendance, getAttendanceSummary } from '../../api/attendance';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ATTENDANCE, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { getId } from '../../utils/ids';
import { spacing } from '../../constants/theme';

export function AttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.ATTENDANCE_VIEW);
  const canManage = hasPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
  const canBatches = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const isStudent = user?.role === 'student';
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [dateText, setDateText] = useState('');
  const debouncedDate = useDebouncedValue(dateText, 450);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(debouncedDate) ? debouncedDate : '';
  const params = isStudent ? {} : { batchId, date: validDate };
  const list = usePaginatedList(listAttendance, params, { enabled: canView });
  const batches = useApiData(() => listBatches({ limit: 100 }), [], {
    enabled: canBatches && !isStudent,
  });
  const summary = useApiData(() => getAttendanceSummary(getId(user)), [user], {
    enabled: canView && isStudent,
  });

  useFocusEffect(
    useCallback(() => {
      if (canView) list.refresh();
    }, [canView])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return list.items;
    return list.items.filter((item) =>
      [item.student?.name, item.student?.email, item.batch?.name, item.batchName, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [list.items, search]);

  if (!canView) return <Screen><PermissionState /></Screen>;

  const batchOptions = [
    { value: '', label: COMMON.allClasses },
    ...(batches.data?.items || []).map((batch) => ({
      value: batch._id,
      label: batch.name,
    })),
  ];

  const header = (
    <View style={styles.header}>
      <PageHeader
        title={ATTENDANCE.title}
        subtitle={ATTENDANCE.subtitle}
        action={
          canManage ? (
            <Button
              title={COMMON.create}
              icon="calendar-outline"
              compact
              onPress={() => navigation.navigate(ROUTES.attendanceMark)}
            />
          ) : null
        }
      />
      {isStudent && summary.data ? (
        <Card>
          <AppText variant="subtitle">{ATTENDANCE.summaryTitle}</AppText>
          <AppText variant="heading">{summary.data.percentage}%</AppText>
          <AppText variant="small">
            {ATTENDANCE.summaryLine(summary.data.present, summary.data.total)}
          </AppText>
          <Button
            title={COMMON.view}
            variant="secondary"
            compact
            onPress={() =>
              navigation.navigate(ROUTES.attendanceSummary, { studentId: getId(user) })
            }
          />
        </Card>
      ) : null}
      <SearchBar value={search} onChangeText={setSearch} />
      {!isStudent && canBatches ? (
        <SelectRow
          label={COMMON.batch}
          value={batchId}
          valueLabel={batchOptions.find((item) => item.value === batchId)?.label}
          options={batchOptions}
          onChange={setBatchId}
        />
      ) : null}
      {!isStudent ? (
        <Input
          label={ATTENDANCE.dateLabel}
          value={dateText}
          onChangeText={setDateText}
          placeholder={COMMON.dateHint}
          keyboardType="numbers-and-punctuation"
        />
      ) : null}
      {summary.error ? <InfoBanner tone="danger" text={summary.error} /> : null}
      {list.error && list.items.length ? (
        <InfoBanner tone="danger" text={list.error} />
      ) : null}
    </View>
  );

  return (
    <Screen
      edges={['top', 'left', 'right']}
      scroll={false}
      contentStyle={styles.screen}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <AttendanceCard
            record={item}
            onPress={
              canManage
                ? () => navigation.navigate(ROUTES.attendanceEdit, { record: item })
                : undefined
            }
            onSummary={() =>
              navigation.navigate(ROUTES.attendanceSummary, {
                studentId: getId(item.student),
              })
            }
          />
        )}
        ListEmptyComponent={
          list.loading ? (
            <LoadingState />
          ) : list.error ? (
            <ErrorState message={list.error} onRetry={list.retry} />
          ) : (
            <EmptyState
              title={ATTENDANCE.empty}
              message={ATTENDANCE.emptyHint}
              actionLabel={canManage ? ATTENDANCE.markTitle : undefined}
              onAction={
                canManage
                  ? () => navigation.navigate(ROUTES.attendanceMark)
                  : undefined
              }
              icon="calendar-outline"
            />
          )
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  gap: { height: spacing.md },
});
