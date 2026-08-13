import { LightSensor } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const LightSensorScreen = () => {
  const [lux, setLux] = useState(0);

  useEffect(() => {
    const sub = LightSensor.addListener(({ illuminance }) => {
      setLux(illuminance);
    });
    return () => sub.remove();
  }, []);

  const mood = lux > 1000 ? "Bright" : lux > 300 ? "Normal" : "Dark";

  return (
    <View>
      <Text>LightSensorScreen :{mood}</Text>
    </View>
  );
};

export default LightSensorScreen;

const styles = StyleSheet.create({});
