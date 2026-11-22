import { ENDPOINTS } from "../constants/endpoints";
import { apiRequest } from "./client";

export async function registerDevice(token, platform) {
  const { data } = await apiRequest(ENDPOINTS.devices.register, {
    method: "POST",
    body: { token, platform },
  });
  return data;
}

export async function unregisterDevice(token) {
  const { data } = await apiRequest(ENDPOINTS.devices.unregister(token), {
    method: "DELETE",
  });
  return data;
}
