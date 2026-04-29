import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

import { archetypes } from "@/content/archetypes";
import { usePlayerStore } from "@/state/usePlayerStore";

export default function OnboardingResult() {
  const router = useRouter();
  const playerState = usePlayerStore((state) => state.playerState);
  const archetype = archetypes.find(
    (candidate) => candidate.id === playerState?.archetypeId,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Your Archetype</Text>
      <Text style={styles.title}>{archetype?.name ?? "Unknown"}</Text>
      <Text style={styles.body}>
        {archetype?.description ??
          "Complete the Soul Scan to reveal your archetype."}
      </Text>
      <Button
        title="Continue"
        onPress={() => {
          router.replace("/");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
