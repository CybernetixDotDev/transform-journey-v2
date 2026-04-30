import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { bosses } from "@/content/bosses";
import { rewards } from "@/content/rewards";
import { rooms } from "@/content/rooms";
import type { PlayerState, StatId } from "@/domain/types";
import { getBossStatus } from "@/engine/bossEngine";
import { getTrialDay } from "@/engine/trialEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

const TRIAL_DAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;
const LIBRARY_ROUTE = "/library" as Href;

type StatChange = {
  readonly statId: StatId;
  readonly before: number;
  readonly after: number;
};

type EncounterResult = {
  readonly statChanges: readonly StatChange[];
  readonly ascensionPointsGained: number;
  readonly rewardTitles: readonly string[];
  readonly unlockedRooms: readonly string[];
  readonly unlockedQuests: readonly string[];
  readonly sigils: readonly string[];
  readonly titles: readonly string[];
};

function getAddedValues(
  beforeValues: readonly string[],
  afterValues: readonly string[],
): readonly string[] {
  return afterValues.filter((value) => !beforeValues.includes(value));
}

function getStatChanges(
  beforePlayerState: PlayerState,
  afterPlayerState: PlayerState,
): readonly StatChange[] {
  return (Object.keys(afterPlayerState.stats) as StatId[])
    .map((statId) => ({
      statId,
      before: beforePlayerState.stats[statId],
      after: afterPlayerState.stats[statId],
    }))
    .filter((change) => change.before !== change.after);
}

function createEncounterResult(
  beforePlayerState: PlayerState,
  afterPlayerState: PlayerState,
  rewardIds: readonly string[],
): EncounterResult {
  const rewardTitles = rewardIds
    .map((rewardId) => rewards.find((reward) => reward.id === rewardId)?.title)
    .filter((title): title is string => title !== undefined);

  return {
    statChanges: getStatChanges(beforePlayerState, afterPlayerState),
    ascensionPointsGained:
      afterPlayerState.ascensionPoints - beforePlayerState.ascensionPoints,
    rewardTitles,
    unlockedRooms: getAddedValues(
      beforePlayerState.unlockedRooms,
      afterPlayerState.unlockedRooms,
    ),
    unlockedQuests: getAddedValues(
      beforePlayerState.activeQuests,
      afterPlayerState.activeQuests,
    ),
    sigils: getAddedValues(beforePlayerState.sigils, afterPlayerState.sigils),
    titles: getAddedValues(beforePlayerState.titles, afterPlayerState.titles),
  };
}

function findTrialDayForBoss(bossId: string) {
  return TRIAL_DAY_NUMBERS.map((dayNumber) => getTrialDay(dayNumber)).find(
    (trialDay) => trialDay?.bossId === bossId,
  );
}

export default function BossEncounterScreen() {
  const router = useRouter();
  const { bossId } = useLocalSearchParams<{ bossId: string }>();
  const invalidRouteRedirectedRef = useRef(false);
  const [encounterResult, setEncounterResult] =
    useState<EncounterResult | null>(null);
  const [completionReturnTarget, setCompletionReturnTarget] = useState<{
    readonly label: string;
    readonly path: Href;
  } | null>(null);
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );
  const defeatBoss = usePlayerStore((state) => state.defeatBoss);
  const completeTrialDay = usePlayerStore((state) => state.completeTrialDay);
  const boss = bosses.find((candidate) => candidate.id === bossId);
  const trialDay = boss ? findTrialDayForBoss(boss.id) : undefined;
  const room = boss?.roomId
    ? rooms.find((candidate) => candidate.id === boss.roomId)
    : undefined;
  const bossStatus =
    playerState && boss ? getBossStatus(playerState, boss.id) : undefined;
  const isInitiationBoss =
    !!trialDay && !playerState?.trialCompleted && trialDay.day === playerState?.currentDay;
  // Initiation bosses return to initiation; room bosses return to their room.
  const primaryReturnPath = isInitiationBoss
    ? "/initiation"
    : room
      ? (`/library/${room.id}` as Href)
      : LIBRARY_ROUTE;
  const primaryReturnLabel = isInitiationBoss
    ? "Continue your journey"
    : room
      ? "Explore Room"
      : "Explore Library";
  const activeReturnPath = completionReturnTarget?.path ?? primaryReturnPath;
  const activeReturnLabel = completionReturnTarget?.label ?? primaryReturnLabel;

  // Invalid content links should redirect only once to avoid navigation loops.
  useEffect(() => {
    if (boss?.roomId && !room && !invalidRouteRedirectedRef.current) {
      invalidRouteRedirectedRef.current = true;
      console.log(
        `[NAV] invalid boss room fallback -> /library bossId=${boss.id} roomId=${boss.roomId}`,
      );
      router.replace(LIBRARY_ROUTE);
    }
  }, [boss?.id, boss?.roomId, room?.id, router]);

  useEffect(() => {
    if (!hasHydrated) {
      void initializeFromStorage();
    }
  }, [hasHydrated, initializeFromStorage]);

  async function handleAttemptEncounter() {
    if (!playerState || !boss || !bossStatus?.canConfront) {
      return;
    }

    console.log(
      `[UI] boss attempt button pressed bossId=${boss.id} currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
    );
    const beforePlayerState = playerState;

    // Day 6 boss is part of trial progression; other bosses complete normally.
    if (
      isInitiationBoss
    ) {
      await completeTrialDay(trialDay.day);
      setCompletionReturnTarget({
        label: "Continue your journey",
        path: "/initiation",
      });
    } else {
      await defeatBoss(boss.id);
      setCompletionReturnTarget({
        label: primaryReturnLabel,
        path: primaryReturnPath,
      });
    }

    const afterPlayerState = usePlayerStore.getState().playerState;

    if (!afterPlayerState) {
      return;
    }

    // Feedback is derived from before/after state so engines remain UI-agnostic.
    setEncounterResult(
      createEncounterResult(
        beforePlayerState,
        afterPlayerState,
        boss.rewardIds,
      ),
    );
  }

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Boss Encounter</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  if (!boss) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Boss Not Found</Text>
        <Button
          title="Explore Library"
          onPress={() => {
            console.log(
              `[NAV] invalid boss fallback button pressed intendedRoute=/library bossId=${bossId}`,
            );
            router.replace(LIBRARY_ROUTE);
          }}
        />
      </View>
    );
  }

  if (boss.roomId && !room) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Room Not Found</Text>
        <Text>This boss points to a room that is not available.</Text>
        <Button
          title="Explore Library"
          onPress={() => {
            console.log(
              `[NAV] invalid boss room fallback button pressed intendedRoute=/library bossId=${boss.id} roomId=${boss.roomId}`,
            );
            router.replace(LIBRARY_ROUTE);
          }}
        />
      </View>
    );
  }

  if (!playerState || !bossStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{boss.name}</Text>
        <Text>Begin a Soul Scan before confronting this boss.</Text>
        <Button
          title="Begin Soul Scan"
          onPress={() => {
            router.push("/onboarding");
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Boss Encounter</Text>
      <Text style={styles.title}>{boss.name}</Text>
      <Text style={styles.body}>{boss.description}</Text>
      <Text>Room: {room?.name ?? boss.roomId ?? "Unknown"}</Text>
      {trialDay ? <Text>Initiation Day: {trialDay.day}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Readiness</Text>
        <Text>
          {bossStatus.isDefeated
            ? "Defeated"
            : bossStatus.canConfront
              ? "Ready"
              : "Locked"}
        </Text>
        {bossStatus.lockReasons.map((reason) => (
          <Text key={reason}>Requirement: {reason}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflection Prompt</Text>
        <Text>{boss.reflectionPrompt}</Text>
      </View>

      {encounterResult ? (
        <View style={styles.result}>
          <Text style={styles.sectionTitle}>Encounter Complete</Text>
          <Text>AP Gained: {encounterResult.ascensionPointsGained}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stat Changes</Text>
            {encounterResult.statChanges.length > 0 ? (
              encounterResult.statChanges.map((change) => (
                <Text key={change.statId}>
                  {change.statId}: {change.before} to {change.after}
                </Text>
              ))
            ) : (
              <Text>No stat changes.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards Gained</Text>
            {encounterResult.rewardTitles.length > 0 ? (
              encounterResult.rewardTitles.map((rewardTitle) => (
                <Text key={rewardTitle}>{rewardTitle}</Text>
              ))
            ) : (
              <Text>No named rewards gained.</Text>
            )}
            {encounterResult.unlockedRooms.map((roomId) => (
              <Text key={roomId}>Room unlocked: {roomId}</Text>
            ))}
            {encounterResult.unlockedQuests.map((questId) => (
              <Text key={questId}>Quest unlocked: {questId}</Text>
            ))}
            {encounterResult.sigils.map((sigilId) => (
              <Text key={sigilId}>Sigil gained: {sigilId}</Text>
            ))}
            {encounterResult.titles.map((titleId) => (
              <Text key={titleId}>Title gained: {titleId}</Text>
            ))}
          </View>
        </View>
      ) : null}

      {!encounterResult && bossStatus.canConfront ? (
        <Button
          title="Face the Boss"
          onPress={() => void handleAttemptEncounter()}
        />
      ) : null}

      {!encounterResult && bossStatus.isDefeated ? (
        <Text>This boss has already been defeated.</Text>
      ) : null}

      {!encounterResult &&
      trialDay &&
      !playerState.trialCompleted &&
      trialDay.day !== playerState.currentDay ? (
        <Text>Continue the current initiation day before facing this boss.</Text>
      ) : null}

      <Button
        title={activeReturnLabel}
        onPress={() => {
          console.log(
            activeReturnPath === "/initiation"
              ? `[NAV] return to initiation from boss intendedRoute=/initiation bossId=${boss.id} currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`
              : room
                ? `[NAV] return to room from boss intendedRoute=/library/${room.id} bossId=${boss.id} roomId=${room.id}`
                : `[NAV] return to library from boss intendedRoute=/library bossId=${boss.id}`,
          );
          router.replace(activeReturnPath);
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
  body: {
    fontSize: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  result: {
    borderColor: "#777",
    borderRadius: 6,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
});
