import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const Index = () => {
  return (
    <View style={styles.container}>
      <Link href={"/async-storage"}>Async Storage</Link>
      <Link href={"/secure-storage"}>Secure Storage</Link>
      <Link href={"/sqlite"}>SQLite</Link>
      <Link href={"/file-system"}>File System</Link>
      <Link href={"/accelerometer"}>Accelerometer</Link>
      <Link href={"/gyroscope"}>Gyroscope</Link>
      <Link href={"/magnetometer"}>Magnetometer</Link>
    </View>
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
