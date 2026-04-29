import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { usePlayerStore } from "@/state/usePlayerStore";

export default function Index() {
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );
  const startNewJourney = usePlayerStore((state) => state.startNewJourney);
  const completeTrialDay = usePlayerStore((state) => state.completeTrialDay);
  const completeRitual = usePlayerStore((state) => state.completeRitual);
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
      <Text style={styles.title}>Transform Journey V2 Dev Harness</Text>
      <Text>Hydrated: {hasHydrated ? "yes" : "no"}</Text>
      <Text>Journey exists: {playerState ? "yes" : "no"}</Text>

      {!playerState ? (
        <View style={styles.section}>
          <Button
            title="Start Test Journey"
            onPress={() => {
              void startNewJourney("seer");
            }}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text>archetypeId: {playerState.archetypeId}</Text>
          <Text>currentDay: {playerState.currentDay}</Text>
          <Text>ascensionPoints: {playerState.ascensionPoints}</Text>
          <Text>trialCompleted: {String(playerState.trialCompleted)}</Text>
          <Text>premiumUnlocked: {String(playerState.premiumUnlocked)}</Text>
          <Text>completedRooms: {playerState.completedRooms.length}</Text>
          <Text>
            completedRituals: {playerState.completedRituals.length}
          </Text>
          <Text>defeatedBosses: {playerState.defeatedBosses.length}</Text>
          <Text>completedQuests: {playerState.completedQuests.length}</Text>

          <View style={styles.buttonGroup}>
            <Button
              title="Complete Current Trial Day"
              onPress={() => {
                void completeTrialDay(playerState.currentDay);
              }}
            />
            <Button
              title="Complete Breath of Arrival Ritual"
              onPress={() => {
                void completeRitual(
                  "breath-of-arrival",
                  "Developer test journal entry.",
                );
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
  section: {
    gap: 8,
    marginTop: 12,
  },
  buttonGroup: {
    gap: 8,
    marginTop: 16,
  },
});
