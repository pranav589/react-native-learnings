import constants from "expo-constants";
import * as Notifications from "expo-notifications";

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted");
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: constants.expoConfig?.extra?.eas?.projectId,
  });

  return tokenData.data;
}
