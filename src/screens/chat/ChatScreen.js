import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Input } from '../../components/ui/Input';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { askAssistant } from '../../api/assistant';
import { getErrorMessage } from '../../utils/errors';
import { spacing, radius } from '../../constants/theme';
import { FEATURES } from '../../constants/strings';
import { isStudentRole } from '../../utils/access';
import { useThemeColors } from '../../hooks/useThemeColors';

const STUDENT_SUGGESTIONS = [
  'What work is due soon?',
  'How do I take a quiz?',
  'How is my attendance?',
];
const STAFF_SUGGESTIONS = [
  'How do I review submissions?',
  'How do I mark attendance?',
  'How do I create an announcement?',
];
const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: FEATURES.welcome,
};

export function ChatScreen() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const allowed = can(user, PERMISSIONS.ASSISTANT_USE, ROLE_SETS.LEARNING);
  const student = isStudentRole(user);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const conversationRef = useRef(null);
  const suggestions = student ? STUDENT_SUGGESTIONS : STAFF_SUGGESTIONS;
  const conversationMessages = messages.filter((message) => message.id !== WELCOME_MESSAGE.id);

  useEffect(() => {
    conversationRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  if (!allowed) return <Screen><PermissionState /></Screen>;

  async function onAsk(value = question) {
    const prompt = value.trim();
    if (!prompt || loading) return;
    const conversation = messages
      .filter((message) => message.id !== WELCOME_MESSAGE.id)
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    setQuestion('');
    setError('');
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: 'user', content: prompt },
    ]);
    setLoading(true);
    try {
      const data = await askAssistant(prompt, conversation);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: data?.answer || data?.reply || FEATURES.noReply,
        },
      ]);
    } catch (askError) {
      setError(getErrorMessage(askError));
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    if (loading) return;
    setMessages([WELCOME_MESSAGE]);
    setQuestion('');
    setError('');
  }

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.line }]}>
          <View style={[styles.botIcon, { backgroundColor: colors.brand }]}>
            <Ionicons name="sparkles" size={20} color={colors.white} />
          </View>
          <View style={styles.headerCopy}>
            <AppText variant="subtitle">
              {student ? FEATURES.studentAssistant : FEATURES.portalAssistant}
            </AppText>
            <AppText variant="caption">
              {student ? FEATURES.studentSubtitle : FEATURES.portalSubtitle}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={FEATURES.newChat}
            onPress={startNewConversation}
            disabled={loading}
            style={[styles.newChat, { backgroundColor: colors.brandSoft }]}
          >
            <Ionicons name="create-outline" size={20} color={colors.brand} />
          </Pressable>
        </View>

        <ScrollView
          ref={conversationRef}
          style={styles.conversation}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!conversationMessages.length ? (
            <View style={styles.welcome}>
              <View style={[styles.welcomeIcon, { backgroundColor: colors.brandSoft }]}>
                <Ionicons name="sparkles" size={25} color={colors.brand} />
              </View>
              <AppText variant="heading" style={styles.welcomeTitle}>
                {FEATURES.welcome}
              </AppText>
              <AppText variant="small" style={styles.welcomeSubtitle}>
                {student ? FEATURES.studentSubtitle : FEATURES.portalSubtitle}
              </AppText>
              <View style={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => onAsk(suggestion)}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.suggestion,
                      { borderColor: colors.line },
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText variant="small" style={{ color: colors.brand }}>
                      {suggestion}
                    </AppText>
                    <Ionicons name="arrow-up-outline" size={17} color={colors.brand} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : conversationMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
              ]}
            >
              {message.role === 'assistant' ? (
                <View style={[styles.assistantAvatar, { backgroundColor: colors.brandSoft }]}>
                  <Ionicons name="sparkles" size={15} color={colors.brand} />
                </View>
              ) : null}
              <View
                style={[
                  styles.message,
                  message.role === 'user'
                    ? { backgroundColor: colors.surfaceMuted }
                    : styles.assistantMessage,
                ]}
              >
                <AppText
                  variant="body"
                  style={message.role === 'user' ? { color: colors.ink } : undefined}
                >
                  {message.content}
                </AppText>
              </View>
            </View>
          ))}
          {loading ? (
            <View style={[styles.messageRow, styles.assistantMessageRow]}>
              <View style={[styles.assistantAvatar, { backgroundColor: colors.brandSoft }]}>
                <Ionicons name="sparkles" size={15} color={colors.brand} />
              </View>
              <View style={styles.assistantMessage}>
                <AppText variant="small">{FEATURES.thinking}</AppText>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {error ? <AppText variant="error">{error}</AppText> : null}
        <View
          style={[
            styles.composer,
            { borderColor: colors.line, backgroundColor: colors.surface },
          ]}
        >
          <Input
            value={question}
            onChangeText={setQuestion}
            placeholder={FEATURES.inputPlaceholder}
            multiline={false}
            style={styles.question}
            editable={!loading}
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={() => onAsk()}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={FEATURES.send}
            accessibilityState={{ disabled: loading || !question.trim(), busy: loading }}
            onPress={() => onAsk()}
            disabled={loading || !question.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: colors.brand },
              pressed && styles.pressed,
              (loading || !question.trim()) && styles.sendDisabled,
            ]}
          >
            {loading ? (
              <Ionicons name="hourglass-outline" size={19} color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  container: { flex: 1, gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: spacing.xs },
  conversation: { flex: 1, minHeight: 180 },
  messages: { flexGrow: 1, justifyContent: 'flex-end', gap: spacing.lg, padding: spacing.sm },
  newChat: { padding: spacing.sm, borderRadius: radius.pill },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.md },
  welcomeIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: { textAlign: 'center' },
  welcomeSubtitle: { textAlign: 'center' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  assistantMessageRow: { justifyContent: 'flex-start' },
  userMessageRow: { justifyContent: 'flex-end' },
  assistantAvatar: {
    width: 28,
    height: 28,
    marginTop: spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { maxWidth: '86%', borderRadius: radius.lg, padding: spacing.md },
  assistantMessage: { flex: 1, paddingHorizontal: spacing.xs, paddingVertical: spacing.sm },
  suggestions: { width: '100%', gap: spacing.sm, marginTop: spacing.md },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.7 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xs,
    elevation: 2,
  },
  question: { flex: 1, marginTop: 0 },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  sendDisabled: { opacity: 0.5 },
});
