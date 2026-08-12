import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

async function initializeDatabase(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL
    );
  `);
}

export default function SqlLite() {
  return (
    <SQLiteProvider databaseName="myNotes.db" onInit={initializeDatabase}>
      <MainContent />
    </SQLiteProvider>
  );
}

function MainContent() {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    const allRows = await db.getAllAsync("SELECT * FROM notes");

    setNotes(allRows);
  };

  const addNote = async () => {
    await db.runAsync("INSERT INTO notes (content) VALUES (?)", ["Buy milk"]);
    fetchNotes(); // Refresh the list
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <View style={{ padding: 50 }}>
      <Button title="Add Note" onPress={addNote} />
      {notes.map((note: any) => (
        <Text key={note.id}>{note.content}</Text>
      ))}
    </View>
  );
}
