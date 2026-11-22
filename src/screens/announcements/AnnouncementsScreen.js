// Announcements: read school/class updates; managers may post a new one.
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useToast } from '../../context/ToastContext';
import { createAnnouncement, listAnnouncements } from '../../api/announcements';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { ANNOUNCEMENTS, COMMON } from '../../constants/strings';
import {
  ANNOUNCEMENT_SCOPE,
  ANNOUNCEMENT_SCOPES,
  QUERY_LIMIT,
} from '../../constants/options';
import { formatDateTime } from '../../utils/dates';
import { getBatchName, getDisplayName } from '../../utils/ids';
import { getErrorMessage } from '../../utils/errors';
import { firstError, required } from '../../utils/validators';
import { layout, spacing } from '../../constants/theme';

const EMPTY_FORM = { title: '', body: '', scope: ANNOUNCEMENT_SCOPE.SCHOOL, batchId: '' };

export function AnnouncementsScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.ANNOUNCEMENTS_VIEW, ROLE_SETS.LEARNING);
  const canPost = can(user, PERMISSIONS.ANNOUNCEMENTS_MANAGE, ROLE_SETS.STAFF);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const list = usePaginatedList(listAnnouncements, {}, { enabled: canView });
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canPost,
  });

  const refresh = list.refresh;
  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onPost() {
    const nextErrors = {
      title: required(form.title, ANNOUNCEMENTS.titleLabel),
      body: required(form.body, ANNOUNCEMENTS.bodyLabel),
    };
    setErrors(nextErrors);
    if (firstError(nextErrors)) return;

    setBusy(true);
    try {
      await createAnnouncement({
        title: form.title.trim(),
        body: form.body.trim(),
        scope: form.scope,
        batchId: form.scope === ANNOUNCEMENT_SCOPE.BATCH ? form.batchId : undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast(ANNOUNCEMENTS.created);
      refresh();
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const scopeOptions = ANNOUNCEMENT_SCOPES.map((scope) => ({
    value: scope,
    label: scope === ANNOUNCEMENT_SCOPE.SCHOOL
      ? ANNOUNCEMENTS.schoolWide
      : ANNOUNCEMENTS.oneBatch,
  }));
  const batchOptions = (batches.data?.items || []).map((item) => ({
    value: item._id,
    label: getBatchName(item),
  }));

  const header = (
    <View style={styles.listHeader}>
      <ListHeader title={ANNOUNCEMENTS.title} subtitle={ANNOUNCEMENTS.subtitle} />
      {canPost ? (
        <Card style={styles.postCard}>
          <Button
            title={showForm ? ANNOUNCEMENTS.hideForm : ANNOUNCEMENTS.post}
            variant="secondary"
            compact
            onPress={() => setShowForm((current) => !current)}
          />
          {showForm ? (
            <>
              <Input
                label={ANNOUNCEMENTS.titleLabel}
                value={form.title}
                onChangeText={(value) => updateField('title', value)}
                error={errors.title}
              />
              <Input
                label={ANNOUNCEMENTS.bodyLabel}
                value={form.body}
                onChangeText={(value) => updateField('body', value)}
                multiline
                error={errors.body}
              />
              <SelectRow
                label={ANNOUNCEMENTS.scopeLabel}
                value={form.scope}
                valueLabel={scopeOptions.find((item) => item.value === form.scope)?.label}
                options={scopeOptions}
                onChange={(value) => updateField('scope', value)}
              />
              {form.scope === ANNOUNCEMENT_SCOPE.BATCH ? (
                <SelectRow
                  label={COMMON.batch}
                  value={form.batchId}
                  valueLabel={batchOptions.find((item) => item.value === form.batchId)?.label}
                  options={batchOptions}
                  onChange={(value) => updateField('batchId', value)}
                />
              ) : null}
              <Button title={ANNOUNCEMENTS.post} onPress={onPost} loading={busy} />
            </>
          ) : null}
        </Card>
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card style={styles.announcementCard}>
            <AppText variant="subtitle">{item.title}</AppText>
            <AppText variant="body">{item.body}</AppText>
            <Badge
              label={item.scope === ANNOUNCEMENT_SCOPE.SCHOOL
                ? ANNOUNCEMENTS.schoolWide
                : getBatchName(item.batch)}
              tone="brand"
            />
            <AppText variant="caption">
              {getDisplayName(item.createdBy)} · {formatDateTime(item.createdAt)}
            </AppText>
          </Card>
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={ANNOUNCEMENTS.empty}
            message={ANNOUNCEMENTS.emptyHint}
            icon="megaphone-outline"
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
  listHeader: { paddingBottom: spacing.lg },
  gap: { height: spacing.md },
  postCard: { padding: spacing.xl, gap: spacing.md, marginTop: spacing.sm },
  announcementCard: { padding: spacing.xl, gap: spacing.md },
});
