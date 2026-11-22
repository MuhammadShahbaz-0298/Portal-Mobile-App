import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { PUSH } from "../constants/app";

export async function getExpoPushToken() {
  if (!Device.isDevice) {
    return { token: null, reason: "Push notifications are unavailable on a simulator or emulator." };
  }

  if (!PUSH.projectId) {
    return { token: null, reason: "Expo push project ID is missing." };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return { token: null, reason: "Push notification permission was denied." };
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(PUSH.androidChannelName, {
        name: PUSH.androidChannelName,
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const response = await Notifications.getExpoPushTokenAsync({
      projectId: PUSH.projectId,
    });
    return { token: response.data || null, reason: response.data ? null : "Expo did not return a push token." };
  } catch (error) {
    return {
      token: null,
      reason: error?.message ? `Could not get Expo push token: ${error.message}` : "Could not get Expo push token.",
    };
  }
}

export const registerForPushNotificationsAsync = getExpoPushToken;
