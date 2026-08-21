import { registerForPushNotificationsAsync } from "@/notfications/registerPush";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

const PushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    setupAndroidChannel();

    registerForPushNotificationsAsync().then(setToken);
  }, []);

  const setupAndroidChannel = () => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ff231f7c",
      });
    }
  };

  return (
    <View
      style={{
        padding: 20,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
        }}
      >
        Expo Push Token
      </Text>
      <Text selectable>{token || "Fetching token..."}</Text>
      <Button
        title="Copy Token"
        onPress={() => token && Clipboard.setStringAsync(token)}
      />
    </View>
  );
};

export default PushNotifications;

const styles = StyleSheet.create({});
