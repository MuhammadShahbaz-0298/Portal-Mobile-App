// Submission card with learner, assignment, status, and optional actions.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { COMMON, SUBMISSIONS } from '../../constants/strings';
import { SUBMISSION_STATUSES } from '../../constants/options';
import { formatDateTime } from '../../utils/dates';
import { getBatchName, getDisplayName } from '../../utils/ids';
import { colors, spacing } from '../../constants/theme';

export function SubmissionCard({
  submission,
  onPress,
  onGrade,
  onDownload,
  downloadLoading = false,
}) {
  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.text}>
          <AppText variant="subtitle">{getDisplayName(submission.student)}</AppText>
          <AppText variant="small">
            {submission.assignment?.title || COMMON.assignment}
          </AppText>
        </View>
        <Badge
          label={
            SUBMISSION_STATUSES.find((item) => item.value === submission.status)
              ?.label || submission.status
          }
          status={submission.status}
        />
      </View>
      <View style={styles.meta}>
        <AppText variant="caption">{getBatchName(submission.batch)}</AppText>
        <AppText variant="caption">
          {SUBMISSIONS.submittedOn}: {formatDateTime(submission.submittedAt)}
        </AppText>
      </View>
      {submission.grade ? (
        <AppText variant="small" style={styles.grade}>
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
  meta: { gap: 2 },
  grade: { color: colors.success },
  actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
