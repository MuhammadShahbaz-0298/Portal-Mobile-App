// Submission card with learner, assignment, status, and optional actions.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { COMMON, SUBMISSIONS, GRADING } from '../../constants/strings';
import { SUBMISSION_STATUSES } from '../../constants/options';
import { formatDateTime } from '../../utils/dates';
import { getBatchName, getDisplayName } from '../../utils/ids';
import { spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

// Only these three AI draft states deserve a badge in the list.
function aiBadge(draft) {
  if (draft?.status === 'ready') {
    return { label: GRADING.aiBadgeReady, tone: 'brand' };
  }
  if (draft?.status === 'pending') {
    return { label: GRADING.aiBadgePending, tone: 'neutral' };
  }
  if (draft?.status === 'failed') {
    return { label: GRADING.aiBadgeFailed, tone: 'danger' };
  }
  return null;
}

export function SubmissionCard({
  submission,
  onPress,
  onGrade,
  onDownload,
  downloadLoading = false,
}) {
  const colors = useThemeColors();
  const draftBadge = aiBadge(submission.aiDraft);

  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.text}>
          <AppText variant="subtitle">{getDisplayName(submission.student)}</AppText>
          <AppText variant="small">
            {submission.assignment?.title || COMMON.assignment}
          </AppText>
        </View>
        <View style={styles.badges}>
          <Badge
            label={
              SUBMISSION_STATUSES.find((item) => item.value === submission.status)
                ?.label || submission.status
            }
            status={submission.status}
          />
          {draftBadge ? <Badge label={draftBadge.label} tone={draftBadge.tone} /> : null}
        </View>
      </View>
      <View style={styles.meta}>
        <AppText variant="caption">{getBatchName(submission.batch)}</AppText>
        <AppText variant="caption">
          {SUBMISSIONS.submittedOn}: {formatDateTime(submission.submittedAt)}
        </AppText>
      </View>
      {submission.grade ? (
        <AppText variant="small" style={{ color: colors.success }}>
          {COMMON.grade}: {submission.grade}
        </AppText>
      ) : null}
      {submission.feedback ? (
        <AppText variant="small" numberOfLines={2}>
          {submission.feedback}
        </AppText>
      ) : null}
      {onDownload || onGrade ? (
        <View style={styles.actions}>
          {onDownload ? (
            <Button
              title={COMMON.download}
              variant="secondary"
              compact
              loading={downloadLoading}
              onPress={onDownload}
            />
          ) : null}
          {onGrade ? (
            <Button title={SUBMISSIONS.gradeAction} compact onPress={onGrade} />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '55%',
  },
  meta: { gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
