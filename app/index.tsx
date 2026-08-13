import { Link } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const Index = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Link href={"/async-storage"}>Async Storage</Link>
      <Link href={"/secure-storage"}>Secure Storage</Link>
      <Link href={"/sqlite"}>SQLite</Link>
      <Link href={"/file-system"}>File System</Link>
      <Link href={"/accelerometer"}>Accelerometer</Link>
      <Link href={"/gyroscope"}>Gyroscope</Link>
      <Link href={"/magnetometer"}>Magnetometer</Link>
      <Link href={"/light-sensor"}>Light Sensor</Link>
      <Link href={"/pedometer"}>Pedometer</Link>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
