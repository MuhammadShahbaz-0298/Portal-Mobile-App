// Assignment resources: staff upload files; every permitted learner can download them.
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { PageHeader } from '../../components/ui/PageHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { listResources, uploadResource } from '../../api/resources';
import { downloadResource } from '../../services/download';
import { pickFile, formatFileSize } from '../../utils/files';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { RESOURCES, COMMON } from '../../constants/strings';
import { formatDateTime } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { layout, spacing } from '../../constants/theme';

export function AssignmentResourcesScreen({ route }) {
  const assignmentId = route.params?.assignmentId;
  const title = route.params?.title || COMMON.assignment;
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.ASSIGNMENTS_RESOURCES_VIEW, ROLE_SETS.LEARNING);
  const canUpload = can(user, PERMISSIONS.ASSIGNMENTS_RESOURCES_UPLOAD, ROLE_SETS.STAFF);
  const [busy, setBusy] = useState(false);
  const resources = useApiData(() => listResources(assignmentId), {
    enabled: canView && Boolean(assignmentId),
    reloadKey: assignmentId,
  });
  const refresh = resources.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView && assignmentId) refresh();
    }, [canView, assignmentId, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  async function onUpload() {
    setBusy(true);
    try {
      const file = await pickFile();
      if (!file) return;
      await uploadResource(assignmentId, file);
      toast(RESOURCES.uploaded);
      refresh();
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onDownload(resource) {
    setBusy(true);
    try {
      await downloadResource(assignmentId, resource, RESOURCES.downloadTitle);
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const header = (
    <PageHeader
      title={RESOURCES.title}
      subtitle={`${title} · ${RESOURCES.subtitle}`}
      action={
        canUpload ? (
          <Button
            title={RESOURCES.upload}
            icon="attach-outline"
            compact
            loading={busy}
            onPress={onUpload}
          />
        ) : null
      }
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={resources.data || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={resources.refreshing}
        onRefresh={resources.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card>
            <AppText variant="subtitle">{item.fileName}</AppText>
            <AppText variant="caption">
              {formatFileSize(item.fileSize)} · {formatDateTime(item.uploadedAt)}
            </AppText>
            <Button
              title={COMMON.download}
              variant="secondary"
              compact
              loading={busy}
              onPress={() => onDownload(item)}
            />
          </Card>
        )}
        ListEmptyComponent={
          <ListState
            loading={resources.loading}
            error={resources.error}
            onRetry={resources.retry}
            title={RESOURCES.empty}
            message={RESOURCES.emptyHint}
            icon="folder-open-outline"
          />
        }
        ListFooterComponent={<ListFooter loaded={resources.data?.length || 0} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  list: { padding: spacing.lg, paddingBottom: layout.listBottomSpacing },
  gap: { height: spacing.md },
});
