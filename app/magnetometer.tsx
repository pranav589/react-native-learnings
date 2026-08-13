import { Magnetometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const MagnetometerScreen = () => {
  const [direction, setDirection] = useState("Unknown");

  useEffect(() => {
    const sub = Magnetometer.addListener(({ x, y }) => {
      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
          setDirection("East");
        } else {
          setDirection("West");
        }
      } else {
        if (y > 0) {
          setDirection("North");
        } else {
          setDirection("South");
        }
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <View>
      <Text>Magnetometer -{direction}</Text>
    </View>
  );
};

export default MagnetometerScreen;

const styles = StyleSheet.create({});
