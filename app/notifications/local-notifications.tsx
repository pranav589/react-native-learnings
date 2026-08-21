import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowBanner: true,
      shouldShowList: false,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

const LocalNotifications = () => {
  const [permissionGuard, stePermissionGuard] = useState(false);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    stePermissionGuard(status === "granted");
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permission not granted");
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }
      stePermissionGuard(true);
      Alert.alert("Success", "Notfication permission granted");
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "hello",
          body: "This is local notification",
        },
        trigger: null,
      });
    } catch (error) {
      Alert.alert("Error", "failed to send notification");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Demo</Text>

      <Text style={styles.status}>
        Permission Status: {permissionGuard ? "✅ Granted" : "❌ Not Granted"}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Request Permission"
          onPress={requestNotificationPermission}
          disabled={permissionGuard}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Send Test Notification" onPress={sendTestNotification} />
      </View>
    </View>
  );
};

export default LocalNotifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
    width: "80%",
  },
});
