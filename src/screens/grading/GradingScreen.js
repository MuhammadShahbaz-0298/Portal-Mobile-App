// Grading queue: submissions awaiting review, searchable, staff only.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { SubmissionCard } from '../../components/lists/SubmissionCard';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listSubmissions } from '../../api/submissions';
import { PERMISSIONS, can } from '../../constants/permissions';
import { GRADING } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { layout, spacing } from '../../constants/theme';

export function GradingScreen({ navigation }) {
  const { user } = useAuth();
  const canGrade = can(user, PERMISSIONS.SUBMISSIONS_GRADE, ['admin', 'teacher']);
  const canView = can(user, PERMISSIONS.SUBMISSIONS_VIEW, ['admin', 'teacher']);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const list = usePaginatedList(listSubmissions, {}, { enabled: canGrade && canView });
  const quietRefresh = list.quietRefresh;

  // Returning from GradeFormScreen should update the AI badges without a
  // spinner or resetting the list, search, or status filter.
  useFocusEffect(
    useCallback(() => {
      if (canGrade && canView) quietRefresh();
    }, [canGrade, canView, quietRefresh])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return list.items.filter((item) => {
      if (status && item.status !== status) return false;
      if (!query) return true;
      return [item.student?.name, item.assignment?.title, item.feedback]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [list.items, search, status]);

  if (!canGrade || !canView) return <Screen><PermissionState /></Screen>;

  const header = (
    <ListHeader
      title={GRADING.title}
      subtitle={GRADING.subtitle}
      search={search}
      onSearchChange={setSearch}
      filterLabel={GRADING.statusLabel}
      filterValue={status}
      options={[
        { value: '', label: GRADING.all },
        { value: 'submitted', label: GRADING.needsReview },
        { value: 'graded', label: GRADING.gradedFilter },
      ]}
      onFilterChange={setStatus}
    />
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
        renderItem={({ item }) => (
          <SubmissionCard
            submission={item}
            onPress={() => navigation.navigate(ROUTES.gradeForm, { submission: item })}
            onGrade={() => navigation.navigate(ROUTES.gradeForm, { submission: item })}
          />
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={GRADING.empty}
            message={GRADING.emptyHint}
            icon="checkmark-done-outline"
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
});
