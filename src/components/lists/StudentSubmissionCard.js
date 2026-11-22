// Student's own submission panel: file info, download, and upload/replace action.
// Used by the assignment detail screen.
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Row } from '../ui/Row';
import { Button } from '../ui/Button';
import { SUBMISSIONS, SUBMISSION_DETAILS, COMMON } from '../../constants/strings';
import { formatDateTime } from '../../utils/dates';
import { formatFileSize } from '../../utils/files';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/theme';

export function StudentSubmissionCard({
  mine,
  open,
  canUpload,
  busy,
  onUpload,
  onReplace,
  onDownload,
  onDetails,
}) {
  return (
    <Card>
      <AppText variant="subtitle">{SUBMISSIONS.currentFile}</AppText>
      {mine ? (
        <>
          <Row label={COMMON.file} value={mine.fileName} />
          <Row label={COMMON.fileSize} value={formatFileSize(mine.fileSize)} />
          <Row
            label={SUBMISSIONS.submittedOn}
            value={formatDateTime(mine.submittedAt)}
          />
          <Row label={COMMON.status} value={mine.status} />
          {mine.grade ? <Row label={COMMON.grade} value={String(mine.grade)} /> : null}
          {mine.feedback ? (
            <Row label={COMMON.feedback} value={mine.feedback} />
          ) : null}
          <View style={styles.actions}>
            <Button
              title={COMMON.download}
              variant="secondary"
              compact
              onPress={onDownload}
              loading={busy}
            />
            {onDetails ? (
              <Button
                title={SUBMISSION_DETAILS.open}
                variant="secondary"
                compact
                onPress={onDetails}
              />
            ) : null}
            {open && canUpload ? (
              <Button
                title={SUBMISSIONS.replace}
                compact
                onPress={onReplace}
              />
            ) : null}
          </View>
        </>
      ) : (
        <AppText variant="small">{SUBMISSIONS.studentEmpty}</AppText>
      )}
      {!mine && open && canUpload ? (
        <Button title={SUBMISSIONS.uploadTitle} onPress={onUpload} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
});
