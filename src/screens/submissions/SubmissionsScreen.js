// Submission list: students upload and track; staff review and grade.
// Search and status filters run against the loaded rows (same approach as the web app).
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { SubmissionCard } from '../../components/lists/SubmissionCard';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useToast } from '../../context/ToastContext';
import { listSubmissions } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { isStudentRole } from '../../utils/access';
import { COMMON, FILES, SUBMISSIONS, GRADING } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { layout, spacing } from '../../constants/theme';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';

export function SubmissionsScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.LEARNING);
  const canGrade = can(user, PERMISSIONS.SUBMISSIONS_GRADE, ROLE_SETS.STAFF);
  const student = isStudentRole(user);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState('');
  const list = usePaginatedList(listSubmissions, {}, { enabled: canView });
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return list.items.filter((item) => {
      if (status && item.status !== status) return false;
      if (!query) return true;
      return [
        item.student?.name,
        item.student?.email,
        item.assignment?.title,
        item.feedback,
      ]
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

  const header = (
    <ListHeader
      title={SUBMISSIONS.title}
      subtitle={SUBMISSIONS.subtitle}
      action={
        student ? (
          <Button
            title={COMMON.create}
            icon="cloud-upload-outline"
            compact
            onPress={() => navigation.navigate(ROUTES.submissionUpload)}
          />
        ) : canGrade ? (
          <Button
            title={GRADING.title}
            icon="ribbon-outline"
            variant="secondary"
            compact
            onPress={() => navigation.navigate(ROUTES.grading)}
          />
        ) : null
      }
      search={search}
      onSearchChange={setSearch}
      filterLabel={SUBMISSIONS.filterLabel}
      filterValue={status}
      options={[
        { value: '', label: COMMON.all },
        { value: 'submitted', label: SUBMISSIONS.submitted },
        { value: 'graded', label: SUBMISSIONS.graded },
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
            onPress={() =>
              navigation.navigate(ROUTES.submissionDetail, { submission: item })
            }
            onDownload={() => onDownload(item)}
            downloadLoading={busyId === item._id}
            onGrade={
              canGrade
                ? () => navigation.navigate(ROUTES.gradeForm, { submission: item })
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={SUBMISSIONS.empty}
            message={student ? SUBMISSIONS.emptyHint : SUBMISSIONS.emptyStaffHint}
            actionLabel={student ? SUBMISSIONS.uploadTitle : undefined}
            onAction={student ? () => navigation.navigate(ROUTES.submissionUpload) : undefined}
            icon="cloud-upload-outline"
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
