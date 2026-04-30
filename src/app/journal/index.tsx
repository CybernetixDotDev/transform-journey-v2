import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { usePlayerStore } from "@/state/usePlayerStore";

export default function JournalScreen() {
  const router = useRouter();
  const [entryText, setEntryText] = useState("");
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );
  const createJournalEntry = usePlayerStore(
    (state) => state.createJournalEntry,
  );

  useEffect(() => {
    if (!hasHydrated) {
      void initializeFromStorage();
    }
  }, [hasHydrated, initializeFromStorage]);

  async function handleCreateEntry() {
    console.log(
      `[UI] save journal entry button pressed currentDay=${playerState?.currentDay ?? "unknown"} AP=${playerState?.ascensionPoints ?? "unknown"}`,
    );
    await createJournalEntry(entryText);
    setEntryText("");
  }

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Journal</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  if (!playerState) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Journal</Text>
        <Text>Begin a Soul Scan before writing journal entries.</Text>
        <Button
          title="Begin Soul Scan"
          onPress={() => {
            console.log("[UI] begin soul scan from journal intendedRoute=/onboarding");
            router.push("/onboarding");
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Akashic Library</Text>
      <Text style={styles.title}>Journal</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Entry</Text>
        <TextInput
          multiline
          onChangeText={setEntryText}
          placeholder="Write what is true right now."
          style={styles.input}
          value={entryText}
        />
        <Button
          title="Save Journal Entry"
          disabled={entryText.trim().length === 0}
          onPress={() => {
            void handleCreateEntry();
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entries</Text>
        {playerState.journalEntries.length > 0 ? (
          [...playerState.journalEntries].reverse().map((entry) => (
            <View key={entry.id} style={styles.card}>
              <Text style={styles.cardTitle}>{entry.prompt}</Text>
              <Text>{entry.response}</Text>
              <Text>{entry.createdAt}</Text>
              {entry.ritualId ? <Text>Ritual: {entry.ritualId}</Text> : null}
              {entry.bossId ? <Text>Boss: {entry.bossId}</Text> : null}
              {entry.questId ? <Text>Quest: {entry.questId}</Text> : null}
            </View>
          ))
        ) : (
          <Text>No journal entries yet.</Text>
        )}
      </View>

      <Button
        title="Continue Home"
        onPress={() => {
          console.log(
            `[NAV] return home from journal intendedRoute=/ currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
          );
          router.replace("/");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
  },
  eyebrow: {
    fontSize: 14,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 120,
    padding: 12,
    textAlignVertical: "top",
  },
  card: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
