import { registerForPushNotificationsAsync } from "@/notfications/registerPush";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Reminder {
  id: string;
  title: string;
  message: string;
  date: Date;
  emoji: string;
  notificationId?: string;
}

const EMOJI_OPTIONS = [
  "⏰",
  "💊",
  "🏋️",
  "💧",
  "📚",
  "🎯",
  "☕",
  "🌙",
  "🎉",
  "📝",
];

const RemindersApp = () => {
  const [token, setToken] = useState<string | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("⏰");

  const [selectedMinutes, setSelectedMinutes] = useState(0.05); // Default to 3 seconds

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    setupAndroidChannel();

    registerForPushNotificationsAsync().then(setToken);
  }, []);

  const setupAndroidChannel = () => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ff231f7c",
      });
    }
  };

  async function scheduleReminder() {
    if (!title) {
      Alert.alert("Error", "Please enter a reminder title");
      return;
    }

    try {
      const scheduledDate = new Date(Date.now() + selectedMinutes * 60 * 1000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${selectedEmoji} ${title}`,
          body: message || "Reminder from Reminder Buddy",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            reminderId: Date.now().toString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: selectedMinutes * 60,
          repeats: false,
        },
      });

      const newReminder: Reminder = {
        id: Date.now().toString(),
        title,
        message,
        date: scheduledDate,
        emoji: selectedEmoji,
        notificationId,
      };

      setReminders([...reminders, newReminder]);
      Alert.alert("Success", "Reminder Scheduled");
    } catch (error) {
      console.error("Error scheduling notification:", error);
      Alert.alert("Error", "Failed to schedule reminder");
    }
  }

  async function deleteReminder(reminder: Reminder) {
    Alert.alert(
      "Delete Reminder",
      `Are you sure you want to delete "${reminder.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (reminder.notificationId) {
              await Notifications.cancelScheduledNotificationAsync(
                reminder.notificationId,
              );
            }
            setReminders(reminders.filter((r) => r.id !== reminder.id));
          },
        },
      ],
    );
  }

  function resetForm() {
    setTitle("");
    setMessage("");
    setSelectedEmoji("⏰");
    setSelectedMinutes(0.05); // Reset to 3 seconds for quick testing
  }

  function formatDateTime(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  }

  function getTimeUntil(date: Date) {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return "Past due";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h ${minutes}m`;

    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  }

  const sortedReminders = [...reminders].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const upcomingReminders = sortedReminders.filter((r) => r.date > new Date());

  const timeOptions = [
    { label: "3 seconds ⚡", value: 0.05 }, // 3 seconds for testing
    { label: "5 minutes", value: 5 },
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "4 hours", value: 240 },
    { label: "8 hours", value: 480 },
    { label: "1 day", value: 1440 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Reminder Buddy</Text>
        <TouchableOpacity
          onPress={() => setShowTokenModal(true)}
          style={styles.tokenButton}
        >
          <Text style={styles.tokenButtonText}>📱 Token</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{upcomingReminders.length}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reminders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Reminders List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>📋 Your Reminders</Text>
        {upcomingReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No reminders yet!</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first reminder
            </Text>
          </View>
        ) : (
          <FlatList
            data={upcomingReminders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.reminderCard}
                onLongPress={() => deleteReminder(item)}
              >
                <View style={styles.reminderEmoji}>
                  <Text style={styles.reminderEmojiText}>{item.emoji}</Text>
                </View>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{item.title}</Text>
                  {item.message ? (
                    <Text style={styles.reminderMessage}>{item.message}</Text>
                  ) : null}
                  <View style={styles.reminderFooter}>
                    <Text style={styles.reminderDate}>
                      📅 {formatDateTime(item.date)}
                    </Text>
                    <Text style={styles.reminderCountdown}>
                      {getTimeUntil(item.date)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✨ New Reminder</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Emoji Selector */}
              <Text style={styles.label}>Choose an icon:</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.emojiSelected,
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title Input */}
              <Text style={styles.label}>Title:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Take medicine"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />

              {/* Message Input */}
              <Text style={styles.label}>Message (optional):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add more details..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
                maxLength={200}
              />

              {/* Time Selection */}
              <Text style={styles.label}>Remind me in:</Text>
              <View style={styles.timeGrid}>
                {timeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timeOption,
                      selectedMinutes === option.value && styles.timeSelected,
                    ]}
                    onPress={() => setSelectedMinutes(option.value)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedMinutes === option.value &&
                          styles.timeSelectedText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    resetForm();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={scheduleReminder}
                >
                  <Text style={styles.saveButtonText}>Schedule 🎯</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Token Modal */}
      <Modal
        visible={showTokenModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTokenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tokenModalContent}>
            <Text style={styles.modalTitle}>📱 Push Token</Text>
            <Text style={styles.tokenText} selectable>
              {token || "Fetching token..."}
            </Text>
            <View style={styles.tokenActions}>
              <Button
                title="Copy Token"
                onPress={async () => {
                  if (token) {
                    await Clipboard.setStringAsync(token);
                    Alert.alert("Copied! 📋", "Token copied to clipboard");
                  }
                }}
                disabled={!token}
              />
              <View style={{ height: 10 }} />
              <Button
                title="Close"
                onPress={() => setShowTokenModal(false)}
                color="#666"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#6366f1",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  tokenButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tokenButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366f1",
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  reminderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderEmoji: {
    width: 48,
    height: 48,
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reminderEmojiText: {
    fontSize: 24,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  reminderCountdown: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: "white",
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    fontSize: 28,
    color: "#94a3b8",
    fontWeight: "300",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 16,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  emojiOption: {
    width: 50,
    height: 50,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  emojiSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  emojiText: {
    fontSize: 24,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  timeSelected: {
    backgroundColor: "#eef2ff",
    borderColor: "#6366f1",
  },
  timeOptionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  timeSelectedText: {
    color: "#6366f1",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6366f1",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  tokenModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
  },
  tokenText: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginVertical: 16,
  },
  tokenActions: {
    marginTop: 8,
  },
});

export default RemindersApp;
