import { type Href, useRouter } from "expo-router";
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
              console.log("[UI] begin soul scan button pressed intendedRoute=/onboarding");
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
                console.log(
                  `[UI] initiation button pressed intendedRoute=/initiation currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                );
                router.push("/initiation");
              }}
            />
            <Button
              title="Enter Library"
              onPress={() => {
                console.log(
                  `[UI] library button pressed intendedRoute=/library currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                );
                router.push("/library" as Href);
              }}
            />
            <Button
              title="Quests"
              onPress={() => {
                console.log(
                  `[UI] quests button pressed intendedRoute=/quests currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                );
                router.push("/quests" as Href);
              }}
            />
            <Button
              title="Journal"
              onPress={() => {
                console.log(
                  `[UI] journal button pressed intendedRoute=/journal currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                );
                router.push("/journal" as Href);
              }}
            />
            <Button
              title="Reset Journey"
              onPress={() => {
                console.log(
                  `[UI] reset journey button pressed currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                );
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
