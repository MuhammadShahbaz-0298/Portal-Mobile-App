// Navigation section titles and the access-restricted screen copy.

export const NAV = Object.freeze({
  explore: "Explore",
  learning: "Learning",
  management: "Management",
  account: "Account",
});

export const APPEARANCE = Object.freeze({
  title: "Dark mode",
  subtitle: "Turn on dark appearance. Turn it off to use light mode.",
  loadFailed: "The saved appearance preference could not be loaded.",
  saveFailed: "The appearance preference could not be saved.",
});

export const NOTIFICATIONS = Object.freeze({
  title: "Notifications",
  subtitle: "Updates from your classes and school.",
  empty: "No notifications yet",
  emptyHint:
    "New announcements, quizzes, and assignment updates will appear here.",
  markRead: "Mark read",
  markAllRead: "Mark all read",
  clearAll: "Clear all",
  clearTitle: "Clear all notifications?",
  clearBody: "This permanently removes notifications from your account.",
  cleared: "Notifications cleared.",
  unread: (count) => `${count} unread`,
  newNotification: "New notification",
});

export const FEATURES = Object.freeze({
  chat: "Assistant",
  askPlaceholder: "Ask a question",
  askAction: "Ask",
  noReply: "No reply.",
  replyFailed: "Unable to get a reply.",
  studentAssistant: "Student assistant",
  portalAssistant: "Portal assistant",
  studentSubtitle: "Answers use only your own progress",
  portalSubtitle: "Ask for help using your portal",
  studentPlaceholder: "Ask about your progress...",
  portalPlaceholder: "Ask about the portal...",
  welcome: "How can I help you today?",
  thinking: "Thinking...",
  newChat: "New conversation",
  send: "Send message",
  inputPlaceholder: "Message the assistant...",
});

export const PERMISSION_SCREEN = Object.freeze({
  title: "Access restricted",
  body: "Your role does not include this permission. Ask an administrator if you need access.",
});
