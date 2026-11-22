import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SelectRow } from '../../components/ui/SelectRow';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { listBatches } from '../../api/batches';
import { createQuiz, updateQuiz } from '../../api/quizzes';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { COMMON, QUIZZES } from '../../constants/strings';
import { QUERY_LIMIT, QUIZ_MAX_TIME_LIMIT_MINUTES } from '../../constants/options';
import { getBatchName, getId } from '../../utils/ids';
import { getErrorMessage } from '../../utils/errors';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const EMPTY_QUESTION = { text: '', options: ['', ''], correctIndex: null };

function QuizQuestionEditor({ question, index, onChange, onRemove, canRemove }) {
  const colors = useThemeColors();

  function updateOption(optionIndex, value) {
    onChange({
      ...question,
      options: question.options.map((option, current) =>
        current === optionIndex ? value : option
      ),
    });
  }

  function removeOption(optionIndex) {
    const correctIndex = question.correctIndex === optionIndex
      ? null
      : question.correctIndex > optionIndex
        ? question.correctIndex - 1
        : question.correctIndex;
    onChange({
      ...question,
      options: question.options.filter((_, current) => current !== optionIndex),
      correctIndex,
    });
  }

  return (
    <Card>
      <View style={styles.questionHeader}>
        <AppText variant="subtitle">{`Question ${index + 1}`}</AppText>
        {canRemove ? (
          <Button
            title={QUIZZES.removeQuestion}
            variant="ghost"
            compact
            onPress={onRemove}
          />
        ) : null}
      </View>
      <Input
        label={QUIZZES.questionLabel}
        value={question.text}
        onChangeText={(text) => onChange({ ...question, text })}
        multiline
      />
      {question.options.map((option, optionIndex) => {
        const isCorrect = question.correctIndex === optionIndex;
        return (
          <View key={`option-${index}-${optionIndex}`} style={styles.optionContainer}>
            <AppText variant="label">{`${QUIZZES.optionLabel} ${optionIndex + 1}`}</AppText>
            <View style={styles.optionRow}>
              <Input
                value={option}
                onChangeText={(value) => updateOption(optionIndex, value)}
                style={styles.optionInput}
              />
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: isCorrect }}
                accessibilityLabel={`${QUIZZES.correctAnswer}: ${QUIZZES.optionLabel} ${optionIndex + 1}`}
                onPress={() => onChange({ ...question, correctIndex: optionIndex })}
                style={[
                  styles.answerSelector,
                  {
                    borderColor: isCorrect ? colors.brand : colors.line,
                    backgroundColor: isCorrect ? colors.brandSoft : colors.surface,
                  },
                ]}
              >
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isCorrect ? colors.brand : colors.muted}
                />
              </Pressable>
              {question.options.length > 2 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${COMMON.delete} ${QUIZZES.optionLabel} ${optionIndex + 1}`}
                  onPress={() => removeOption(optionIndex)}
                  style={styles.removeOption}
                >
                  <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
      <View style={styles.optionActions}>
        {question.options.length < 6 ? (
          <Button
            title={QUIZZES.addOption}
            variant="secondary"
            compact
            onPress={() => onChange({ ...question, options: [...question.options, ''] })}
          />
        ) : null}
        <AppText variant="caption">{QUIZZES.correctAnswer}</AppText>
      </View>
    </Card>
  );
}

export function QuizFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const quiz = route.params?.quiz;
  const quizId = getId(quiz);
  const canManage = can(user, PERMISSIONS.QUIZ_MANAGE, ROLE_SETS.STAFF);
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canManage,
  });
  const [title, setTitle] = useState(quiz?.title || '');
  const [batchId, setBatchId] = useState(getId(quiz?.batch) || '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    quiz?.timeLimitMinutes ? String(quiz.timeLimitMinutes) : ''
  );
  const [questions, setQuestions] = useState(
    quiz?.questions?.length
      ? quiz.questions.map((question) => ({
          text: question.text || '',
          options: [...(question.options || ['', ''])],
          correctIndex: Number.isInteger(question.correctIndex) ? question.correctIndex : null,
        }))
      : [{ ...EMPTY_QUESTION }]
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!quizId && !batchId && batches.data?.items?.length === 1) {
      setBatchId(getId(batches.data.items[0]));
    }
  }, [batchId, batches.data, quizId]);

  if (!canManage) return <Screen edges={['left', 'right', 'bottom']}><PermissionState /></Screen>;

  function updateQuestion(index, nextQuestion) {
    setQuestions((current) =>
      current.map((question, currentIndex) =>
        currentIndex === index ? nextQuestion : question
      )
    );
    setError('');
  }

  async function onSave() {
    const timeLimit = Number(timeLimitMinutes);
    const preparedQuestions = questions.map((question) => ({
      text: question.text.trim(),
      options: question.options.map((option) => option.trim()),
      correctIndex: question.correctIndex,
    }));
    const invalidQuestion = preparedQuestions.some((question) =>
      !question.text ||
      question.options.length < 2 ||
      question.options.length > 6 ||
      question.options.some((option) => !option) ||
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    );

    if (
      !title.trim() ||
      (!quizId && !batchId) ||
      !Number.isInteger(timeLimit) ||
      timeLimit < 1 ||
      timeLimit > QUIZ_MAX_TIME_LIMIT_MINUTES ||
      !preparedQuestions.length ||
      invalidQuestion
    ) {
      setError(QUIZZES.invalidForm);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        timeLimitMinutes: timeLimit,
        questions: preparedQuestions,
      };
      if (quizId) {
        await updateQuiz(quizId, payload);
        toast(QUIZZES.updated);
      } else {
        await createQuiz({ ...payload, batchId });
        toast(QUIZZES.created);
      }
      navigation.goBack();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setBusy(false);
    }
  }

  const batchOptions = (batches.data?.items || []).map((batch) => ({
    value: getId(batch),
    label: getBatchName(batch),
  }));
  const selectedBatchLabel = batchOptions.find((option) => option.value === batchId)?.label;

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Card>
        <AppText variant="subtitle">
          {quizId ? QUIZZES.editTitle : QUIZZES.newTitle}
        </AppText>
        <Input
          label={QUIZZES.titleLabel}
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError('');
          }}
        />
        {quizId ? (
          <AppText variant="small">{`${COMMON.batch}: ${selectedBatchLabel || getBatchName(quiz.batch)}`}</AppText>
        ) : (
          <SelectRow
            label={COMMON.batch}
            value={batchId}
            valueLabel={selectedBatchLabel}
            options={batchOptions}
            onChange={(value) => {
              setBatchId(value);
              setError('');
            }}
          />
        )}
        <Input
          label={QUIZZES.timeLimitLabel}
          value={timeLimitMinutes}
          onChangeText={(value) => {
            setTimeLimitMinutes(value);
            setError('');
          }}
          keyboardType="number-pad"
        />
        {batches.loading ? <LoadingState /> : null}
        {batches.error ? (
          <ErrorState message={batches.error} onRetry={batches.retry} />
        ) : null}
        {!quizId && !batches.loading && !batches.error && !batchOptions.length ? (
          <AppText variant="error">{QUIZZES.batchUnavailable}</AppText>
        ) : null}
      </Card>

      <View style={styles.questionsHeading}>
        <AppText variant="heading">{QUIZZES.questionsTitle}</AppText>
        <Button
          title={QUIZZES.addQuestion}
          variant="secondary"
          compact
          onPress={() => setQuestions((current) => [...current, { ...EMPTY_QUESTION }])}
        />
      </View>
      {questions.map((question, index) => (
        <QuizQuestionEditor
          key={`question-${index}`}
          index={index}
          question={question}
          canRemove={questions.length > 1}
          onChange={(next) => updateQuestion(index, next)}
          onRemove={() => setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== index))}
        />
      ))}
      {error ? <AppText variant="error">{error}</AppText> : null}
      <Button
        title={quizId ? QUIZZES.save : QUIZZES.create}
        loading={busy}
        disabled={batches.loading || (!quizId && !batchOptions.length)}
        onPress={onSave}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  questionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  optionContainer: { gap: spacing.xs },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionInput: { flex: 1, minWidth: 0 },
  answerSelector: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  removeOption: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});
