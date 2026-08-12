import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function AsyncStorageScreen() {
  const storeData = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem("my-key", jsonValue);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("my-key");
      console.log(jsonValue);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    storeData({
      name: "Pranav",
      age: 26,
    });

    getData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
