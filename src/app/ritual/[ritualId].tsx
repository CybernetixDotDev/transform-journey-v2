import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { rituals } from "@/content/rituals";
import { usePlayerStore } from "@/state/usePlayerStore";

export default function RitualScreen() {
  const router = useRouter();
  const { ritualId } = useLocalSearchParams<{ ritualId: string }>();
  const completeRitual = usePlayerStore((state) => state.completeRitual);
  const ritual = rituals.find((candidate) => candidate.id === ritualId);

  async function handleCompleteRitual() {
    if (!ritual) {
      return;
    }

    await completeRitual(ritual.id);
    router.replace("/");
  }

  if (!ritual) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ritual Not Found</Text>
        <Text>No ritual exists for this path.</Text>
        <Button
          title="Return Home"
          onPress={() => {
            router.replace("/");
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Day 1 Ritual</Text>
      <Text style={styles.title}>{ritual.title}</Text>
      <Text style={styles.body}>{ritual.description}</Text>

      <View style={styles.script}>
        {ritual.script.map((line, index) => (
          <Text key={line} style={styles.scriptLine}>
            {index + 1}. {line}
          </Text>
        ))}
      </View>

      <Button title="Complete Ritual" onPress={() => void handleCompleteRitual()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    justifyContent: "center",
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
  body: {
    fontSize: 16,
  },
  script: {
    gap: 10,
  },
  scriptLine: {
    fontSize: 16,
  },
});
