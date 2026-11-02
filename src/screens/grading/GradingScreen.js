// Grading queue with client-side search and review filters.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { SearchBar } from '../../components/ui/SearchBar';
import { SelectRow } from '../../components/ui/SelectRow';
import { ListFooter } from '../../components/lists/ListFooter';
import { SubmissionCard } from '../../components/lists/SubmissionCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listSubmissions } from '../../api/submissions';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { GRADING } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { spacing } from '../../constants/theme';

const filters = [
  { value: '', label: GRADING.all },
  { value: 'submitted', label: GRADING.needsReview },
  { value: 'graded', label: GRADING.gradedFilter },
];

export function GradingScreen({ navigation }) {
  const { user } = useAuth();
  const canGrade = hasPermission(user, PERMISSIONS.SUBMISSIONS_GRADE);
  const canView = hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const list = usePaginatedList(listSubmissions, {}, {
    enabled: canGrade && canView,
  });

  useFocusEffect(
    useCallback(() => {
      if (canGrade && canView) list.refresh();
    }, [canGrade, canView])
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
    <View style={styles.header}>
      <AppText variant="small">{GRADING.subtitle}</AppText>
      <SearchBar value={search} onChangeText={setSearch} />
      <SelectRow
        label={GRADING.statusLabel}
        value={status}
        valueLabel={filters.find((item) => item.value === status)?.label}
        options={filters}
        onChange={setStatus}
      />
      {list.error && list.items.length ? (
        <InfoBanner tone="danger" text={list.error} />
      ) : null}
    </View>
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
          list.loading ? (
            <LoadingState />
          ) : list.error ? (
            <ErrorState message={list.error} onRetry={list.retry} />
          ) : (
            <EmptyState
              title={GRADING.empty}
              message={GRADING.emptyHint}
              icon="checkmark-done-outline"
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
