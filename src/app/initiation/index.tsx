import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { bosses } from "@/content/bosses";
import { rituals } from "@/content/rituals";
import { getProgressSummary } from "@/engine/progressionEngine";
import { getCurrentTrialDay, getTrialDay } from "@/engine/trialEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

const TRIAL_DAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

export default function InitiationScreen() {
  const router = useRouter();
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );

  useEffect(() => {
    if (!hasHydrated) {
      void initializeFromStorage();
    }
  }, [hasHydrated, initializeFromStorage]);

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>7-Day Initiation</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  if (!playerState) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>7-Day Initiation</Text>
        <Text>Begin a Soul Scan before entering the initiation.</Text>
        <Button
          title="Begin Soul Scan"
          onPress={() => {
            router.push("/onboarding");
          }}
        />
      </View>
    );
  }

  const currentTrialDay = getCurrentTrialDay(playerState);
  const progressSummary = getProgressSummary(playerState);
  const currentActionPath = currentTrialDay?.ritualId
    ? (`/ritual/${currentTrialDay.ritualId}` as Href)
    : currentTrialDay?.bossId
      ? (`/boss/${currentTrialDay.bossId}` as Href)
      : undefined;
  const nextStepText = playerState.trialCompleted
    ? "Your initiation is complete. Explore the Library."
    : `Next step: Continue Day ${playerState.currentDay}.`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Akashic Library</Text>
      <Text style={styles.title}>7-Day Initiation</Text>
      <Text style={styles.body}>
        Day {playerState.currentDay} of 7
        {playerState.trialCompleted ? " - complete" : ""}
      </Text>
      <Text style={styles.body}>{nextStepText}</Text>

      {!playerState.trialCompleted && currentTrialDay && currentActionPath ? (
        <View style={styles.primaryAction}>
          <Text style={styles.sectionTitle}>Continue your initiation journey</Text>
          <Button
            title={`Begin Day ${currentTrialDay.day}`}
            onPress={() => {
              console.log(
                `[UI] begin day button pressed intendedRoute=${currentActionPath} currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
              );
              router.push(currentActionPath);
            }}
          />
        </View>
      ) : null}

      <View style={styles.summary}>
        <Text>Ascension Level: {progressSummary.ascensionLevel}</Text>
        <Text>AP: {progressSummary.ascensionPoints}</Text>
        <Text>Next Level: {progressSummary.nextLevelRequirement} AP</Text>
        <Text>Primary Stat: {progressSummary.primaryStat}</Text>
        <Text>
          Rituals Completed: {progressSummary.completedRitualsCount}
        </Text>
      </View>

      <View style={styles.days}>
        {TRIAL_DAY_NUMBERS.map((dayNumber) => {
          const trialDay = getTrialDay(dayNumber);

          if (!trialDay) {
            return null;
          }

          const ritual = trialDay.ritualId
            ? rituals.find((candidate) => candidate.id === trialDay.ritualId)
            : undefined;
          const boss = trialDay.bossId
            ? bosses.find((candidate) => candidate.id === trialDay.bossId)
            : undefined;
          const isCompleted =
            playerState.trialCompleted || dayNumber < playerState.currentDay;
          const isCurrent =
            !playerState.trialCompleted && dayNumber === playerState.currentDay;
          const isLocked =
            !playerState.trialCompleted && dayNumber > playerState.currentDay;
          const statusLabel = isCompleted
            ? "Completed"
            : isCurrent
              ? "Unlocked"
              : "Locked";

          return (
            <View
              key={trialDay.day}
              style={[
                styles.dayCard,
                isCurrent ? styles.availableCard : null,
                isCompleted ? styles.completedCard : null,
                isLocked ? styles.lockedCard : null,
              ]}
            >
              <Text
                style={[
                  styles.dayStatus,
                  isCurrent ? styles.availableStatus : null,
                  isCompleted ? styles.completedStatus : null,
                  isLocked ? styles.lockedStatus : null,
                ]}
              >
                {statusLabel}
              </Text>
              <Text style={styles.dayTitle}>
                Day {trialDay.day}: {trialDay.title}
              </Text>
              <Text>{trialDay.theme}</Text>
              <Text style={styles.body}>{trialDay.description}</Text>
              {ritual ? <Text>Ritual: {ritual.title}</Text> : null}
              {boss ? <Text>Boss: {boss.name}</Text> : null}

              {isCurrent && ritual ? (
                <Button
                  title="Begin Ritual"
                  onPress={() => {
                    console.log(
                      `[UI] start current ritual button pressed intendedRoute=/ritual/${ritual.id} ritualId=${ritual.id} currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                    );
                    router.push(`/ritual/${ritual.id}` as Href);
                  }}
                />
              ) : null}

              {isCurrent && !ritual && currentTrialDay?.bossId ? (
                <Button
                  title="Face the Boss"
                  onPress={() => {
                    console.log(
                      `[UI] start current boss button pressed intendedRoute=/boss/${currentTrialDay.bossId} bossId=${currentTrialDay.bossId} currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                    );
                    router.push(`/boss/${currentTrialDay.bossId}` as Href);
                  }}
                />
              ) : null}

              {isLocked ? <Text>Continue earlier days to unlock.</Text> : null}
            </View>
          );
        })}
      </View>

      {playerState.trialCompleted ? (
        <Button
          title="Explore Library"
          onPress={() => {
            console.log(
              `[NAV] return to library after initiation complete intendedRoute=/library currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
            );
            router.push("/library" as Href);
          }}
        />
      ) : null}
      <Button
        title="Continue Home"
        onPress={() => {
          router.replace("/");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 18,
    padding: 24,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  summary: {
    backgroundColor: "#f8f8f8",
    borderColor: "#aaa",
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  primaryAction: {
    backgroundColor: "#f3f6ff",
    borderColor: "#3f5f91",
    borderRadius: 6,
    borderWidth: 2,
    gap: 10,
    padding: 16,
  },
  days: {
    gap: 14,
  },
  dayCard: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  availableCard: {
    backgroundColor: "#f6fbf7",
    borderColor: "#4f8f64",
    borderWidth: 2,
  },
  completedCard: {
    backgroundColor: "#f7f7f7",
    borderColor: "#777",
  },
  lockedCard: {
    backgroundColor: "#fafafa",
    borderColor: "#ccc",
  },
  dayStatus: {
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  availableStatus: {
    color: "#2e6f40",
  },
  completedStatus: {
    color: "#555",
  },
  lockedStatus: {
    color: "#777",
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
});
