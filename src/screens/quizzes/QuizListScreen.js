// Quiz list: published quizzes opened through the backend-controlled attempt flow.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { ListState } from '../../components/states/ListState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listQuizzes, updateQuiz } from '../../api/quizzes';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { COMMON, QUIZZES } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { getBatchName, getId } from '../../utils/ids';
import { isStudentRole } from '../../utils/access';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { QUERY_LIMIT } from '../../constants/options';
import { layout, spacing } from '../../constants/theme';

export function QuizListScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.QUIZ_VIEW, ROLE_SETS.LEARNING);
  const canManage = can(user, PERMISSIONS.QUIZ_MANAGE, ROLE_SETS.STAFF);
  const isStudent = isStudentRole(user);
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('all');
  const [archiveQuiz, setArchiveQuiz] = useState(null);
  const [busy, setBusy] = useState(false);
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canManage,
  });
  const list = usePaginatedList(
    listQuizzes,
    { batchId: batchId === 'all' ? undefined : batchId },
    { enabled: canView }
  );
  const refresh = list.refresh;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return list.items;
    return list.items.filter((item) =>
      String(item.title || '').toLowerCase().includes(query)
    );
  }, [list.items, search]);

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  async function onArchive() {
    if (!archiveQuiz) return;
    setBusy(true);
    try {
      await updateQuiz(getId(archiveQuiz), { active: false });
      setArchiveQuiz(null);
      toast(QUIZZES.archived);
      list.refresh();
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const batchOptions = [
    { value: 'all', label: COMMON.all },
    ...(batches.data?.items || []).map((batch) => ({
      value: getId(batch),
      label: getBatchName(batch),
    })),
  ];

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <ListHeader
              title={QUIZZES.title}
              subtitle={QUIZZES.subtitle}
              action={canManage ? (
                <Button
                  title={QUIZZES.newTitle}
                  icon="add-outline"
                  compact
                  onPress={() => navigation.navigate(ROUTES.quizForm)}
                />
              ) : null}
              search={search}
              onSearchChange={setSearch}
              filterLabel={QUIZZES.batchFilter}
              filterValue={batchId}
              options={canManage ? batchOptions : undefined}
              onFilterChange={setBatchId}
            />
            {canManage && batches.error ? (
              <ErrorState message={batches.error} onRetry={batches.retry} />
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card
            onPress={isStudent ? () => navigation.navigate(ROUTES.quizTake, { id: item._id }) : undefined}
            accessibilityLabel={item.title}
          >
            <AppText variant="subtitle">{item.title}</AppText>
            <Badge label={getBatchName(item.batch)} tone="brand" />
            <View style={styles.detailRow}>
              <AppText variant="caption">
                {`${item.questions?.length || 0} ${item.questions?.length === 1 ? 'question' : 'questions'}`}
              </AppText>
              {item.timeLimitMinutes ? (
                <AppText variant="caption">{`${item.timeLimitMinutes} min`}</AppText>
              ) : null}
            </View>
            {isStudent ? (
              <AppText variant="caption">{QUIZZES.take}</AppText>
            ) : canManage ? (
              <View style={styles.actions}>
                <Button
                  title={COMMON.edit}
                  variant="secondary"
                  compact
                  onPress={() => navigation.navigate(ROUTES.quizForm, { quiz: item })}
                />
                <Button
                  title={COMMON.archive}
                  variant="danger"
                  compact
                  onPress={() => setArchiveQuiz(item)}
                />
              </View>
            ) : (
              <AppText variant="caption">{QUIZZES.availableForStudents}</AppText>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={QUIZZES.empty}
            message={QUIZZES.emptyHint}
            icon="help-circle-outline"
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
      <ConfirmDialog
        visible={Boolean(archiveQuiz)}
        title={QUIZZES.archiveTitle}
        body={QUIZZES.archiveBody}
        confirmLabel={COMMON.archive}
        danger
        loading={busy}
        onCancel={() => setArchiveQuiz(null)}
        onConfirm={onArchive}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  list: { padding: spacing.lg, paddingBottom: layout.listBottomSpacing },
  header: { gap: spacing.sm },
  gap: { height: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
