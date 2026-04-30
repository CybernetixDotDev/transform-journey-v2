import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/state/usePlayerStore";

export default function Index() {
  const router = useRouter();
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );
  const resetJourney = usePlayerStore((state) => state.resetJourney);

  useEffect(() => {
    void initializeFromStorage();
  }, [initializeFromStorage]);

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Transform Journey V2</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Transform Journey</Text>

      {!playerState ? (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Begin your first Soul Scan.</Text>
          <Button
            title="Begin Soul Scan"
            onPress={() => {
              router.push("/onboarding");
            }}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            {playerState.trialCompleted
              ? "Current objective: Explore the Library and continue room work."
              : `Current objective: Complete Day ${playerState.currentDay} of the 7-Day Initiation.`}
          </Text>
          <Text>Archetype: {playerState.archetypeId}</Text>
          <Text>Day: {playerState.currentDay}</Text>
          <Text>AP: {playerState.ascensionPoints}</Text>
          <Text>Trial complete: {String(playerState.trialCompleted)}</Text>
          <Text>Unlocked rooms: {playerState.unlockedRooms.length}</Text>
          <Text>Completed rituals: {playerState.completedRituals.length}</Text>
          <Text>Defeated bosses: {playerState.defeatedBosses.length}</Text>
          <Text>Completed quests: {playerState.completedQuests.length}</Text>

          <View style={styles.buttonGroup}>
            <Button
              title="View 7-Day Initiation"
              onPress={() => {
                router.push("/initiation");
              }}
            />
            <Button
              title="Enter Library"
              onPress={() => {
                router.push("/library/index");
              }}
            />
            <Button
              title="Quests"
              onPress={() => {
                router.push("/quests/index");
              }}
            />
            <Button
              title="Journal"
              onPress={() => {
                router.push("/journal/index");
              }}
            />
            <Button
              title="Reset Journey"
              onPress={() => {
                void resetJourney();
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    gap: 8,
    marginTop: 12,
  },
  buttonGroup: {
    gap: 8,
    marginTop: 16,
  },
});
