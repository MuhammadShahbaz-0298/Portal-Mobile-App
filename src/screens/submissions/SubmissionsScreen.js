// Submission list with client-side search/status filtering and role-aware actions.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
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
import { useToast } from '../../context/ToastContext';
import { listSubmissions } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { COMMON, FILES, SUBMISSIONS } from '../../constants/strings';
import { SUBMISSION_FILTERS } from '../../constants/options';
import { ROUTES } from '../../constants/app';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { spacing } from '../../constants/theme';

export function SubmissionsScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canView = hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const canGrade = hasPermission(user, PERMISSIONS.SUBMISSIONS_GRADE);
  const isStudent = user?.role === 'student';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState('');
  const list = usePaginatedList(listSubmissions, {}, { enabled: canView });

  useFocusEffect(
    useCallback(() => {
      if (canView) list.refresh();
    }, [canView])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return list.items.filter((item) => {
      if (status && item.status !== status) return false;
      if (!query) return true;
      return [item.student?.name, item.student?.email, item.assignment?.title, item.feedback]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [list.items, search, status]);

  if (!canView) return <Screen><PermissionState /></Screen>;

  async function onDownload(submission) {
    setBusyId(getId(submission));
    try {
      await downloadSubmission(submission);
      toast(FILES.downloadComplete);
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusyId('');
    }
  }

  const statusLabel = SUBMISSION_FILTERS.find((item) => item.value === status)?.label;
  const header = (
    <View style={styles.header}>
      <PageHeader
        title={SUBMISSIONS.title}
        subtitle={SUBMISSIONS.subtitle}
        action={
          isStudent ? (
            <Button
              title={COMMON.submit}
              icon="cloud-upload-outline"
              compact
              onPress={() => navigation.navigate(ROUTES.submissionUpload)}
            />
          ) : null
        }
      />
      <SearchBar value={search} onChangeText={setSearch} />
      <SelectRow
        label={SUBMISSIONS.filterLabel}
        value={status}
        valueLabel={statusLabel}
        options={SUBMISSION_FILTERS}
        onChange={setStatus}
      />
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
          <SubmissionCard
            submission={item}
            onPress={() => {
              if (canGrade) navigation.navigate(ROUTES.gradeForm, { submission: item });
              else navigation.navigate(ROUTES.assignmentDetail, { id: item.assignment?._id });
            }}
            onDownload={busyId === item._id ? undefined : () => onDownload(item)}
            onGrade={
              canGrade
                ? () => navigation.navigate(ROUTES.gradeForm, { submission: item })
                : undefined
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
              title={SUBMISSIONS.empty}
              message={isStudent ? SUBMISSIONS.studentEmpty : SUBMISSIONS.emptyHint}
              actionLabel={isStudent ? SUBMISSIONS.uploadTitle : undefined}
              onAction={
                isStudent
                  ? () => navigation.navigate(ROUTES.submissionUpload)
                  : undefined
              }
              icon="cloud-upload-outline"
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
