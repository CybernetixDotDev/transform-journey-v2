import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import type { PlayerState } from "@/domain/types";
import { getCurrentTrialDay } from "@/engine/trialEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

function getHomeRecommendation(playerState: PlayerState) {
  if (playerState.trialCompleted) {
    return {
      status: "Your initiation is complete",
      next: "Next: Explore unlocked room",
    };
  }

  const currentTrialDay = getCurrentTrialDay(playerState);

  if (currentTrialDay?.bossId) {
    return {
      status: `You are on Day ${playerState.currentDay}`,
      next: "Next: Face your trial boss",
    };
  }

  if (currentTrialDay?.ritualId) {
    return {
      status: `You are on Day ${playerState.currentDay}`,
      next: `Next: Begin Day ${playerState.currentDay} ritual`,
    };
  }

  return {
    status: `You are on Day ${playerState.currentDay}`,
    next: "Next: Continue your initiation journey",
  };
}

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
          <View style={styles.recommendation}>
            <Text style={styles.sectionTitle}>
              {getHomeRecommendation(playerState).status}
            </Text>
            <Text>{getHomeRecommendation(playerState).next}</Text>
          </View>

          <Text style={styles.subtitle}>
            {playerState.trialCompleted
              ? "Current objective: Explore the Library and continue room work."
              : `Current objective: Continue Day ${playerState.currentDay} of the 7-Day Initiation.`}
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
              title="Continue Initiation"
              onPress={() => {
                console.log(
                  `[UI] initiation button pressed intendedRoute=/initiation currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                );
                router.push("/initiation");
              }}
            />
            <Button
              title="Explore Library"
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
    gap: 18,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    gap: 12,
    marginTop: 12,
  },
  recommendation: {
    backgroundColor: "#f3f6ff",
    borderColor: "#3f5f91",
    borderRadius: 6,
    borderWidth: 2,
    gap: 8,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  buttonGroup: {
    gap: 8,
    marginTop: 18,
  },
});
