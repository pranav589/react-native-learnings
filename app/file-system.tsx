import { File, Paths } from "expo-file-system";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const FileSystem = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${message}`]);
  };

  const createAndReadFile = async () => {
    try {
      const file = new File(Paths.document, "hello.txt");

      file.create();
      file.write("Hello from expo file system");

      const content = await file.text();

      addLog(`File created and read. ${content}`);
    } catch (error: any) {
      addLog(`Error :${error.message}`);
    }
  };

  console.log({ logs });

  return (
    <View>
      <Text>FileSystem</Text>
      <Button title="Create and Read" onPress={createAndReadFile} />
    </View>
  );
};

export default FileSystem;

const styles = StyleSheet.create({});
