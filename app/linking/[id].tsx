import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LinkingProfile = () => {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Linking Profile ID: {id}</Text>
    </View>
  );
};

export default LinkingProfile;

const styles = StyleSheet.create({});
