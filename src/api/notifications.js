import { ENDPOINTS } from "../constants/endpoints";
import { buildQuery } from "../utils/query";
import { apiRequest } from "./client";

export async function listNotifications(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.notifications.list}${buildQuery(params)}`,
  );
  return { items: Array.isArray(data) ? data : [], meta };
}

export async function markNotificationRead(id) {
  const { data } = await apiRequest(ENDPOINTS.notifications.markRead(id), {
    method: "PATCH",
  });
  return data;
}

export async function clearAllNotifications() {
  const { data } = await apiRequest(ENDPOINTS.notifications.clear, {
    method: "DELETE",
  });
  return data;
}
