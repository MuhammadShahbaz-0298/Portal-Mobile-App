// Submission detail: file, grade, permission-gated comments, and upload history.
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppText } from '../../components/ui/AppText';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/states/EmptyState';
import { LoadingState } from '../../components/states/LoadingState';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useToast } from '../../context/ToastContext';
import { createComment, listComments } from '../../api/comments';
import { getSubmissionVersions } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import {
  PERMISSIONS,
  ROLE_SETS,
  can,
} from '../../constants/permissions';
import {
  COMMENTS,
  SUBMISSION_DETAILS,
  COMMON,
} from '../../constants/strings';
import { SUBMISSION_STATUSES } from '../../constants/options';
import { formatDateTime } from '../../utils/dates';
import { formatFileSize } from '../../utils/files';
import { getBatchName, getDisplayName, getId } from '../../utils/ids';
import { getErrorMessage } from '../../utils/errors';
import { required } from '../../utils/validators';
import { spacing } from '../../constants/theme';

export function SubmissionDetailScreen({ route }) {
  const submission = route.params?.submission;
  const submissionId = getId(submission);
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.LEARNING);
  const canViewComments = can(user, PERMISSIONS.COMMENTS_VIEW, ROLE_SETS.LEARNING);
  const canWriteComments = can(user, PERMISSIONS.COMMENTS_CREATE, ROLE_SETS.LEARNING);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const comments = usePaginatedList(
    (params) => listComments(submissionId, params),
    {},
    { enabled: canView && canViewComments && Boolean(submissionId) }
  );
  const versions = useApiData(() => getSubmissionVersions(submissionId), {
    enabled: canView && Boolean(submissionId),
    reloadKey: submissionId,
  });
  const refreshComments = comments.refresh;
  const refreshVersions = versions.refresh;

  useFocusEffect(
    useCallback(() => {
      if (!canView || !submissionId) return;
      if (canViewComments) refreshComments();
      refreshVersions();
    }, [canView, canViewComments, submissionId, refreshComments, refreshVersions])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;
  if (!submission) {
    return <Screen><EmptyState title={COMMON.noResults} icon="document-text-outline" /></Screen>;
  }

  async function onDownload() {
    setBusy(true);
    try {
      await downloadSubmission(submission);
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onPostComment() {
    const error = required(comment, COMMENTS.title);
    if (error) {
      toast(error);
      return;
    }
    setBusy(true);
    try {
      await createComment(submissionId, comment.trim());
      setComment('');
      toast(COMMENTS.posted);
      refreshComments();
    } catch (postError) {
      toast(getErrorMessage(postError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <PageHeader title={SUBMISSION_DETAILS.title} subtitle={SUBMISSION_DETAILS.subtitle} />

      <Card>
        <AppText variant="subtitle">{getDisplayName(submission.student)}</AppText>
        <AppText variant="small">{submission.assignment?.title || COMMON.assignment}</AppText>
        <Badge
          label={
            SUBMISSION_STATUSES.find((status) => status.value === submission.status)?.label ||
            submission.status
          }
          tone="brand"
        />
        <Row label={COMMON.batch} value={getBatchName(submission.batch)} />
        <Row label={SUBMISSION_DETAILS.current} value={submission.fileName} />
        <Row label={COMMON.fileSize} value={formatFileSize(submission.fileSize)} />
        <Row label={COMMON.submittedAt} value={formatDateTime(submission.submittedAt)} />
        {submission.grade ? <Row label={COMMON.grade} value={String(submission.grade)} /> : null}
        {submission.feedback ? (
          <Row label={COMMON.feedback} value={submission.feedback} />
        ) : null}
        <Button
          title={COMMON.download}
          variant="secondary"
          compact
          loading={busy}
          onPress={onDownload}
        />
      </Card>

      {canViewComments ? (
        <Card>
          <AppText variant="subtitle">{COMMENTS.title}</AppText>
          <AppText variant="caption">{COMMENTS.subtitle}</AppText>
          <ListState
            loading={comments.loading}
            error={comments.error}
            onRetry={comments.retry}
            title={COMMENTS.empty}
            message={COMMENTS.emptyHint}
            icon="chatbubble-outline"
          />
          {comments.items.map((item) => (
            <View key={item._id} style={styles.comment}>
              <AppText variant="label">{getDisplayName(item.author)}</AppText>
              <AppText variant="body">{item.text}</AppText>
              <AppText variant="caption">{formatDateTime(item.createdAt)}</AppText>
            </View>
          ))}
          {canWriteComments ? (
            <View style={styles.compose}>
              <Input
                value={comment}
                onChangeText={setComment}
                placeholder={COMMENTS.placeholder}
                multiline
              />
              <Button
                title={COMMENTS.action}
                compact
                loading={busy}
                onPress={onPostComment}
              />
            </View>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <AppText variant="subtitle">{SUBMISSION_DETAILS.versions}</AppText>
        {versions.loading ? <LoadingState /> : null}
        {versions.error ? (
          <ListState
            loading={false}
            error={versions.error}
            onRetry={versions.retry}
            title={COMMON.noResults}
            icon="time-outline"
          />
        ) : null}
        {!versions.loading && !versions.error && !(versions.data || []).length ? (
          <AppText variant="small">{SUBMISSION_DETAILS.noOlder}</AppText>
        ) : null}
        {(versions.data || []).map((version, index) => (
          <Row
            key={`${version.fileName}-${version.uploadedAt}`}
            label={SUBMISSION_DETAILS.version(index + 1)}
            value={`${version.fileName} · ${formatFileSize(version.fileSize)} · ${formatDateTime(version.uploadedAt)}`}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  comment: { gap: spacing.xs, paddingTop: spacing.md },
  compose: { gap: spacing.sm, paddingTop: spacing.md },
});
