import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useAppState } from '../../hooks/useAppState';
import { useCountdown } from '../../hooks/useCountdown';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  getQuiz,
  recordFocusViolation,
  saveAttemptAnswers,
  startAttempt,
  submitAttempt,
} from '../../api/quizzes';
import {
  PERMISSIONS,
  ROLE_SETS,
  can,
} from '../../constants/permissions';
import { isStudentRole } from '../../utils/access';
import { getErrorMessage } from '../../utils/errors';
import {
  QUIZ_AUTOSAVE_DELAY_MS,
  QUIZ_ATTEMPT_STATUSES,
  QUIZ_FOCUS_WARNING_LIMIT,
  QUIZ_UNANSWERED,
} from '../../constants/options';
import { spacing, radius } from '../../constants/theme';
import { QUIZZES } from '../../constants/strings';
import { getBatchName } from '../../utils/ids';
import { useThemeColors } from '../../hooks/useThemeColors';

function toAnswerMap(answers) {
  const map = {};
  (answers || []).forEach((answer, index) => {
    if (typeof answer === 'number' && answer !== QUIZ_UNANSWERED) map[index] = answer;
  });
  return map;
}

function toAnswerArray(answerMap, length) {
  return Array.from({ length }, (_, index) => {
    const answer = answerMap[index];
    return typeof answer === 'number' ? answer : QUIZ_UNANSWERED;
  });
}

function formatRemaining(remaining) {
  if (remaining === null) return QUIZZES.noTimeLimit;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return QUIZZES.timeLeft(minutes, String(seconds).padStart(2, '0'));
}

export function QuizTakeScreen({ route, navigation }) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const allowed = isStudentRole(user) && can(user, PERMISSIONS.QUIZ_VIEW, ROLE_SETS.STUDENT);
  const quizId = route.params?.id;
  const quiz = useApiData(() => getQuiz(quizId), {
    enabled: allowed && Boolean(quizId),
  });
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const appState = useAppState();
  const debouncedAnswers = useDebouncedValue(answers, QUIZ_AUTOSAVE_DELAY_MS);
  const remaining = useCountdown(attempt?.expiresAt);
  const quizData = quiz.data || {};
  const questions = quizData.questions || [];
  const lastSavedRef = useRef('');
  const finalizingRef = useRef(false);
  const lastViolationStateRef = useRef('active');

  const receiveAttempt = useCallback((next) => {
    if (!next) return;
    setAttempt(next);
    if (next.status === QUIZ_ATTEMPT_STATUSES.SUBMITTED) setResult(next);
  }, []);

  useEffect(() => {
    if (!attempt || attempt.status !== QUIZ_ATTEMPT_STATUSES.IN_PROGRESS || result) return undefined;
    const serialized = JSON.stringify(debouncedAnswers);
    if (serialized === lastSavedRef.current) return undefined;
    let active = true;
    saveAttemptAnswers(quizId, toAnswerArray(debouncedAnswers, questions.length))
      .then((next) => {
        if (!active) return;
        lastSavedRef.current = serialized;
        receiveAttempt(next);
      })
      .catch((saveError) => {
        if (active) setError(getErrorMessage(saveError) || QUIZZES.saveFailed);
      });
    return () => {
      active = false;
    };
  }, [attempt, debouncedAnswers, questions.length, quizId, receiveAttempt, result]);

  useEffect(() => {
    if (
      !attempt ||
      remaining !== 0 ||
      attempt.status !== QUIZ_ATTEMPT_STATUSES.IN_PROGRESS ||
      finalizingRef.current
    ) {
      return;
    }
    finalizingRef.current = true;
    submitAttempt(quizId, toAnswerArray(answers, questions.length))
      .then(receiveAttempt)
      .catch((submitError) => {
        finalizingRef.current = false;
        setError(getErrorMessage(submitError));
      });
  }, [attempt, answers, questions.length, quizId, receiveAttempt, remaining]);

  useEffect(() => {
    if (
      !attempt ||
      appState === 'active' ||
      appState === lastViolationStateRef.current ||
      attempt.status !== QUIZ_ATTEMPT_STATUSES.IN_PROGRESS
    ) {
      return;
    }
    lastViolationStateRef.current = appState;
    recordFocusViolation(quizId)
      .then((next) => {
        receiveAttempt(next);
        if (next?.status === QUIZ_ATTEMPT_STATUSES.IN_PROGRESS) {
          setWarning(
            QUIZZES.violationWarning(
              next.focusViolationCount || 0,
              QUIZ_FOCUS_WARNING_LIMIT
            )
          );
        }
      })
      .catch((violationError) => setError(getErrorMessage(violationError)));
  }, [appState, attempt, quizId, receiveAttempt]);

  if (!allowed) return <Screen><PermissionState /></Screen>;
  if (quiz.loading) return <Screen><LoadingState /></Screen>;
  if (quiz.error && !quiz.data) {
    return <Screen><ErrorState message={quiz.error} onRetry={quiz.retry} /></Screen>;
  }

  function choose(questionIndex, optionIndex) {
    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
  }

  async function onStart() {
    setStarting(true);
    setError('');
    try {
      const next = await startAttempt(quizId);
      const restored = toAnswerMap(next?.answers);
      lastSavedRef.current = JSON.stringify(restored);
      setAnswers(restored);
      receiveAttempt(next);
      setConfirmStart(false);
    } catch (startError) {
      setError(getErrorMessage(startError) || QUIZZES.startFailed);
    } finally {
      setStarting(false);
    }
  }

  async function onSubmit() {
    if (!attempt || attempt.status !== QUIZ_ATTEMPT_STATUSES.IN_PROGRESS) return;
    setBusy(true);
    setError('');
    try {
      const next = await submitAttempt(quizId, toAnswerArray(answers, questions.length));
      receiveAttempt(next);
      setConfirmSubmit(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  const answeredCount = Object.keys(answers).filter(
    (index) => answers[index] >= 0 && answers[index] < (questions[index]?.options?.length || 0)
  ).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const unansweredCount = questions.length - answeredCount;
  const duration = quizData.timeLimitMinutes
    ? `${quizData.timeLimitMinutes} ${QUIZZES.minutesShort}`
    : QUIZZES.noTimeLimit;

  if (result) {
    return (
      <Screen edges={['left', 'right', 'bottom']} contentStyle={styles.resultScreen}>
        <Card style={styles.resultCard}>
          <View style={[styles.resultIcon, { backgroundColor: colors.brandSoft }]}>
            <Ionicons name="checkmark-done-outline" size={32} color={colors.brand} />
          </View>
          <AppText variant="title">{QUIZZES.result}</AppText>
          <AppText variant="heading" style={{ color: colors.brand }}>
            {`${result.score} / ${result.total}`}
          </AppText>
          <AppText variant="caption">{quizData.title}</AppText>
        </Card>
        <Button title={QUIZZES.backToQuizzes} variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  if (!attempt) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Card style={styles.introHero}>
          <View style={[styles.quizIcon, { backgroundColor: colors.brand }]}>
            <Ionicons name="document-text-outline" size={28} color={colors.white} />
          </View>
          <Badge label={getBatchName(quizData.batch)} tone="brand" />
          <AppText variant="title" style={styles.center}>{quizData.title}</AppText>
          <AppText variant="small" style={styles.center}>{QUIZZES.beforeYouBegin}</AppText>
        </Card>
        <View style={styles.infoGrid}>
          <Card style={styles.infoCard}>
            <Ionicons name="help-circle-outline" size={22} color={colors.brand} />
            <AppText variant="title">{questions.length}</AppText>
            <AppText variant="caption">{QUIZZES.questionsLabel}</AppText>
          </Card>
          <Card style={styles.infoCard}>
            <Ionicons name="time-outline" size={22} color={colors.brand} />
            <AppText variant="title">{duration}</AppText>
            <AppText variant="caption">{QUIZZES.durationLabel}</AppText>
          </Card>
        </View>
        <Card style={styles.instructions}>
          <AppText variant="subtitle">{QUIZZES.instructionsTitle}</AppText>
          <View style={styles.instructionRow}>
            <Ionicons name="play-circle-outline" size={20} color={colors.brand} />
            <AppText variant="body" style={styles.instructionText}>{QUIZZES.instructionStart}</AppText>
          </View>
          <View style={styles.instructionRow}>
            <Ionicons name="save-outline" size={20} color={colors.brand} />
            <AppText variant="body" style={styles.instructionText}>{QUIZZES.instructionSave}</AppText>
          </View>
          {quizData.timeLimitMinutes ? (
            <View style={styles.instructionRow}>
              <Ionicons name="hourglass-outline" size={20} color={colors.brand} />
              <AppText variant="body" style={styles.instructionText}>
                {QUIZZES.instructionTimer(quizData.timeLimitMinutes)}
              </AppText>
            </View>
          ) : null}
        </Card>
        {error ? <AppText variant="error">{error}</AppText> : null}
        <Button
          title={QUIZZES.startQuiz}
          icon="play"
          loading={starting}
          disabled={!questions.length}
          onPress={() => setConfirmStart(true)}
        />
        <ConfirmDialog
          visible={confirmStart}
          title={QUIZZES.startConfirmTitle}
          body={QUIZZES.startConfirmBody(duration)}
          confirmLabel={QUIZZES.startQuiz}
          loading={starting}
          onCancel={() => setConfirmStart(false)}
          onConfirm={onStart}
        />
      </Screen>
    );
  }

  const currentQuestion = questions[questionIndex];
  if (reviewing) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Card style={styles.reviewHeader}>
          <AppText variant="title">{QUIZZES.reviewTitle}</AppText>
          <AppText variant="small">{QUIZZES.answeredSummary(answeredCount, questions.length)}</AppText>
        </Card>
        {questions.map((question, index) => {
          const answered = typeof answers[index] === 'number' && answers[index] >= 0;
          return (
            <Pressable
              key={`review-${index}`}
              accessibilityRole="button"
              onPress={() => {
                setQuestionIndex(index);
                setReviewing(false);
              }}
            >
              <Card style={styles.reviewItem}>
                <View style={styles.reviewRow}>
                  <View style={[styles.reviewNumber, { backgroundColor: colors.brandSoft }]}>
                    <AppText variant="label" style={{ color: colors.brand }}>{index + 1}</AppText>
                  </View>
                  <View style={styles.reviewCopy}>
                    <AppText variant="subtitle">{QUIZZES.questionNumber(index + 1)}</AppText>
                    <AppText variant="caption" numberOfLines={2}>{question.text}</AppText>
                  </View>
                  <Badge
                    label={answered ? QUIZZES.answered : QUIZZES.notAnswered}
                    tone={answered ? 'success' : 'warning'}
                  />
                </View>
              </Card>
            </Pressable>
          );
        })}
        <Button title={QUIZZES.continueReview} variant="secondary" onPress={() => setReviewing(false)} />
        <Button title={QUIZZES.submit} onPress={() => setConfirmSubmit(true)} />
        <ConfirmDialog
          visible={confirmSubmit}
          title={QUIZZES.submitConfirmTitle}
          body={unansweredCount
            ? QUIZZES.submitConfirmUnanswered(unansweredCount)
            : QUIZZES.submitConfirmBody}
          confirmLabel={QUIZZES.submit}
          loading={busy}
          onCancel={() => setConfirmSubmit(false)}
          onConfirm={onSubmit}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']} contentStyle={styles.attemptScreen}>
      <Card style={styles.attemptHeader}>
        <View style={styles.attemptTitleRow}>
          <View style={styles.attemptTitleCopy}>
            <AppText variant="subtitle" numberOfLines={1}>{quizData.title}</AppText>
            <AppText variant="caption">
              {QUIZZES.answeredSummary(answeredCount, questions.length)}
            </AppText>
          </View>
          <View style={[styles.timerPill, { backgroundColor: colors.brandSoft }]}>
            <Ionicons name="time-outline" size={17} color={colors.brand} />
            <AppText variant="label" style={{ color: colors.brand }}>{formatRemaining(remaining)}</AppText>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.brand }]} />
        </View>
        {warning ? <AppText variant="caption" style={{ color: colors.danger }}>{warning}</AppText> : null}
      </Card>
      <Card style={styles.questionCard}>
        <View style={styles.questionTopline}>
          <AppText variant="label">{QUIZZES.questionNumber(questionIndex + 1)}</AppText>
          <Badge
            label={typeof answers[questionIndex] === 'number' ? QUIZZES.answered : QUIZZES.notAnswered}
            tone={typeof answers[questionIndex] === 'number' ? 'success' : 'warning'}
          />
        </View>
        <AppText variant="heading" style={styles.questionText}>{currentQuestion?.text}</AppText>
        <View style={styles.options}>
          {(currentQuestion?.options || []).map((option, optionIndex) => {
            const selected = answers[questionIndex] === optionIndex;
            return (
              <Pressable
                key={`option-${optionIndex}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => choose(questionIndex, optionIndex)}
                style={[
                  styles.option,
                  {
                    borderColor: selected ? colors.brand : colors.line,
                    backgroundColor: selected ? colors.brandSoft : colors.surface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.optionLetter,
                    { backgroundColor: selected ? colors.brand : colors.surfaceMuted },
                  ]}
                >
                  <AppText variant="label" style={selected ? { color: colors.white } : undefined}>
                    {String.fromCharCode(65 + optionIndex)}
                  </AppText>
                </View>
                <AppText
                  variant="body"
                  style={[styles.optionText, selected && { color: colors.brand, fontWeight: '600' }]}
                >
                  {option}
                </AppText>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={21}
                  color={selected ? colors.brand : colors.muted}
                />
              </Pressable>
            );
          })}
        </View>
      </Card>
      {error ? <AppText variant="error">{error}</AppText> : null}
      <View style={styles.navigationRow}>
        <Button
          title={QUIZZES.previous}
          variant="secondary"
          compact
          icon="chevron-back"
          disabled={questionIndex === 0}
          onPress={() => setQuestionIndex((index) => Math.max(0, index - 1))}
        />
        {questionIndex < questions.length - 1 ? (
          <Button
            title={QUIZZES.next}
            compact
            icon="chevron-forward"
            onPress={() => setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}
          />
        ) : (
          <Button title={QUIZZES.reviewTitle} compact icon="list-outline" onPress={() => setReviewing(true)} />
        )}
      </View>
      <Button
        title={QUIZZES.reviewAndSubmit}
        variant="secondary"
        onPress={() => setReviewing(true)}
        disabled={attempt.status !== QUIZ_ATTEMPT_STATUSES.IN_PROGRESS}
      />
      <ConfirmDialog
        visible={confirmSubmit}
        title={QUIZZES.submitConfirmTitle}
        body={unansweredCount
          ? QUIZZES.submitConfirmUnanswered(unansweredCount)
          : QUIZZES.submitConfirmBody}
        confirmLabel={QUIZZES.submit}
        loading={busy}
        onCancel={() => setConfirmSubmit(false)}
        onConfirm={onSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  introHero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  quizIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGrid: { flexDirection: 'row', gap: spacing.md },
  infoCard: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  instructions: { gap: spacing.md },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  instructionText: { flex: 1 },
  resultScreen: { flex: 1, justifyContent: 'center', gap: spacing.md },
  resultCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptScreen: { gap: spacing.md },
  attemptHeader: { gap: spacing.md },
  attemptTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  attemptTitleCopy: { flex: 1, gap: spacing.xs },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressTrack: { height: 7, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill },
  questionCard: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  questionTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { lineHeight: 32 },
  options: { gap: spacing.md },
  option: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionLetter: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  optionText: { flex: 1 },
  navigationRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  reviewHeader: { gap: spacing.xs },
  reviewItem: { padding: spacing.md },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewNumber: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  reviewCopy: { flex: 1, gap: spacing.xs },
});
