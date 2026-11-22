import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import {
  clearAllNotifications,
  listNotifications,
  markNotificationRead,
} from "../api/notifications";
import {
  NOTIFICATION_POLL_INTERVAL_MS,
  QUERY_LIMIT,
} from "../constants/options";
import { PERMISSIONS, ROLE_SETS, can } from "../constants/permissions";
import { NOTIFICATIONS } from "../constants/strings";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastContext";
import { getErrorMessage } from "../utils/errors";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const allowed = can(user, PERMISSIONS.NOTIFICATIONS_VIEW, ROLE_SETS.LEARNING);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async ({ refresh = false, quiet = true } = {}) => {
      if (!allowed) return;
      const currentRequest = ++requestId.current;
      if (refresh) setRefreshing(true);
      else if (!quiet) setLoading(true);
      setError("");

      try {
        const { items: nextItems } = await listNotifications({
          limit: QUERY_LIMIT,
        });
        if (currentRequest !== requestId.current) return;
        setItems(nextItems);
      } catch (loadError) {
        if (currentRequest === requestId.current) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [allowed],
  );

  useEffect(() => {
    if (!allowed) {
      setItems([]);
      return undefined;
    }

    load({ quiet: false });
    const timer = setInterval(() => {
      if (AppState.currentState === "active") load();
    }, NOTIFICATION_POLL_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    return () => {
      requestId.current += 1;
      clearInterval(timer);
      subscription.remove();
    };
  }, [allowed, load]);

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setItems((current) =>
        current.map((item) =>
          String(item._id || item.id) === String(id)
            ? { ...item, read: true }
            : item,
        ),
      );
      setError("");
      return true;
    } catch (markError) {
      setError(getErrorMessage(markError));
      return false;
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadItems = items.filter((item) => !item.read);
    const results = await Promise.all(
      unreadItems.map((item) => markRead(item._id || item.id)),
    );
    return results.every(Boolean);
  }, [items, markRead]);

  const clearAll = useCallback(async () => {
    setClearing(true);
    try {
      await clearAllNotifications();
      setItems([]);
      setError("");
      toast(NOTIFICATIONS.cleared);
      return true;
    } catch (clearError) {
      setError(getErrorMessage(clearError));
      return false;
    } finally {
      setClearing(false);
    }
  }, [toast]);

  const value = useMemo(
    () => ({
      items,
      unread: items.filter((item) => !item.read).length,
      loading,
      refreshing,
      error,
      clearing,
      refresh,
      markRead,
      markAllRead,
      clearAll,
    }),
    [
      items,
      loading,
      refreshing,
      error,
      clearing,
      refresh,
      markRead,
      markAllRead,
      clearAll,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider.",
    );
  }
  return context;
}
