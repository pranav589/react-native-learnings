import { Pedometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PedometerScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [steps, setSteps] = useState(0);
  const [permission, setPermission] = useState("checking");

  useEffect(() => {
    let subscription: any;

    const startTracking = async () => {
      // Check if device has a pedometer
      const available = await Pedometer.isAvailableAsync();

      console.log("Pedometer available:", available);

      setIsAvailable(available);

      if (!available) {
        return;
      }

      // Ask Expo for permission
      const permissionResult = await Pedometer.requestPermissionsAsync();

      console.log("Permission:", permissionResult);

      setPermission(permissionResult.status);

      if (!permissionResult.granted) {
        console.log("Permission denied");
        return;
      }

      // Listen for live steps
      subscription = Pedometer.watchStepCount((result) => {
        console.log("Steps:", result.steps);

        setSteps(result.steps);
      });
    };

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Pedometer Available: {String(isAvailable)}</Text>

      <Text>Permission: {permission}</Text>

      <Text style={styles.largeText}>Steps: {steps}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  largeText: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },
});
