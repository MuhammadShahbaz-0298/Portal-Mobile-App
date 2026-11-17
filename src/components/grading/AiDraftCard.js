// AI suggestion card for the grading form. It only shows what the AI thinks;
// the teacher still chooses what to put in the grade and feedback boxes.
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Row } from '../ui/Row';
import { GRADING } from '../../constants/strings';
import { colors, spacing } from '../../constants/theme';

function Header() {
  return (
    <>
      <AppText variant="subtitle">{GRADING.aiTitle}</AppText>
      <AppText variant="small">{GRADING.aiDisclaimer}</AppText>
      <AppText variant="caption">{GRADING.aiNotSaved}</AppText>
    </>
  );
}

function BulletList({ title, items }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) return null;

  return (
    <View style={styles.block}>
      <AppText variant="label">{title}</AppText>
      {list.map((item, index) => (
        <AppText key={`${title}-${index}`} variant="small">
          {`\u2022 ${item}`}
        </AppText>
      ))}
    </View>
  );
}

export function AiDraftCard({ draft, busy, onUse, onDiscard, onRefresh, onGenerate }) {
  if (!draft) return null;

  const requestBusy = busy === 'refresh' || busy === 'generate' || busy === 'discard';
  const marks =
    typeof draft.suggestedMarks === 'number' && Number.isFinite(draft.suggestedMarks)
      ? String(draft.suggestedMarks)
      : '';

  let body = null;
  if (draft.status === 'ready') {
    body = (
      <>
        {marks ? <Row label={GRADING.aiSuggestedMarks} value={marks} /> : null}
        <BulletList title={GRADING.aiStrengths} items={draft.strengths} />
        <BulletList title={GRADING.aiImprovements} items={draft.improvements} />
        {draft.feedback ? (
          <View style={styles.block}>
            <AppText variant="label">{GRADING.aiFeedback}</AppText>
            <AppText variant="body">{draft.feedback}</AppText>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button
            title={GRADING.aiUseDraft}
            onPress={onUse}
            disabled={requestBusy}
            style={styles.action}
          />
          <Button
            title={GRADING.aiDiscard}
            variant="secondary"
            onPress={onDiscard}
            loading={busy === 'discard'}
            disabled={busy === 'refresh' || busy === 'generate'}
            style={styles.action}
          />
        </View>
      </>
    );
  } else if (draft.status === 'pending') {
    body = (
      <>
        <View style={styles.pendingRow}>
          <ActivityIndicator color={colors.brand} size="small" />
          <AppText variant="small">{GRADING.aiPendingMessage}</AppText>
        </View>
        <Button
          title={GRADING.aiRefresh}
          variant="secondary"
          onPress={onRefresh}
          loading={busy === 'refresh'}
        />
      </>
    );
  } else if (draft.status === 'failed' || draft.status === 'discarded') {
    body = (
      <>
        <AppText variant="small">
          {draft.status === 'failed'
            ? GRADING.aiFailedMessage
            : GRADING.aiDiscardedMessage}
        </AppText>
        <Button
          title={GRADING.aiGenerateAgain}
          onPress={onGenerate}
          loading={busy === 'generate'}
        />
      </>
    );
  } else if (draft.status === 'used' || draft.status === 'edited') {
    body = (
      <AppText variant="small">
        {draft.status === 'used' ? GRADING.aiUsedMessage : GRADING.aiEditedMessage}
      </AppText>
    );
  }

  return (
    <Card>
      <Header />
      {body}
    </Card>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1, flexBasis: 120 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
