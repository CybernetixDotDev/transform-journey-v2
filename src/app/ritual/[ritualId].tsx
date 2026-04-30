import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { rewards } from "@/content/rewards";
import { rituals } from "@/content/rituals";
import { rooms } from "@/content/rooms";
import type { PlayerState, StatId } from "@/domain/types";
import { getTrialDay } from "@/engine/trialEngine";
import { canEnterRoom, getLockReasons } from "@/engine/unlockEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

const TRIAL_DAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

type StatChange = {
  readonly statId: StatId;
  readonly before: number;
  readonly after: number;
};

type CompletionResult = {
  readonly completedDay?: number;
  readonly nextDay?: number;
  readonly statChanges: readonly StatChange[];
  readonly ascensionPointsGained: number;
  readonly rewardTitles: readonly string[];
  readonly unlockedRooms: readonly string[];
  readonly unlockedQuests: readonly string[];
  readonly sigils: readonly string[];
  readonly titles: readonly string[];
};

function findTrialDayForRitual(ritualId: string) {
  return TRIAL_DAY_NUMBERS.map((dayNumber) => getTrialDay(dayNumber)).find(
    (trialDay) => trialDay?.ritualId === ritualId,
  );
}

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

function createCompletionResult(
  beforePlayerState: PlayerState,
  afterPlayerState: PlayerState,
  rewardIds: readonly string[],
  completedDay?: number,
): CompletionResult {
  const rewardTitles = rewardIds
    .map((rewardId) => rewards.find((reward) => reward.id === rewardId)?.title)
    .filter((title): title is string => title !== undefined);

  return {
    completedDay,
    nextDay: afterPlayerState.trialCompleted
      ? undefined
      : afterPlayerState.currentDay,
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

export default function RitualScreen() {
  const router = useRouter();
  const { ritualId } = useLocalSearchParams<{ ritualId: string }>();
  const [completionResult, setCompletionResult] =
    useState<CompletionResult | null>(null);
  const playerState = usePlayerStore((state) => state.playerState);
  const completeRitual = usePlayerStore((state) => state.completeRitual);
  const completeTrialDay = usePlayerStore((state) => state.completeTrialDay);
  const ritual = rituals.find((candidate) => candidate.id === ritualId);
  const room = ritual?.roomId
    ? rooms.find((candidate) => candidate.id === ritual.roomId)
    : undefined;
  const trialDay = ritual ? findTrialDayForRitual(ritual.id) : undefined;
  const isRoomUnlocked =
    !room ||
    !playerState ||
    playerState.unlockedRooms.includes(room.id) ||
    canEnterRoom(playerState, room);
  const roomLockReasons =
    playerState && room && !isRoomUnlocked
      ? getLockReasons(playerState, room.unlockRequirements)
      : [];
  const isCompleted = ritual
    ? playerState?.completedRituals.includes(ritual.id) ?? false
    : false;
  const isCurrentTrialRitual =
    !!playerState &&
    !!trialDay &&
    !playerState.trialCompleted &&
    trialDay.day === playerState.currentDay;
  const isLockedTrialRitual =
    !!playerState &&
    !!trialDay &&
    !playerState.trialCompleted &&
    trialDay.day !== playerState.currentDay;
  const canComplete =
    !!playerState &&
    !!ritual &&
    isRoomUnlocked &&
    !isCompleted &&
    !isLockedTrialRitual;

  async function handleCompleteRitual() {
    if (!canComplete || !playerState || !ritual) {
      return;
    }

    const beforePlayerState = playerState;

    if (isCurrentTrialRitual && trialDay) {
      await completeTrialDay(trialDay.day);
    } else {
      await completeRitual(ritual.id);
    }

    const afterPlayerState = usePlayerStore.getState().playerState;

    if (!afterPlayerState) {
      return;
    }

    setCompletionResult(
      createCompletionResult(
        beforePlayerState,
        afterPlayerState,
        trialDay?.rewardIds ?? ritual.rewardIds,
        isCurrentTrialRitual ? trialDay?.day : undefined,
      ),
    );
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
      <Text style={styles.eyebrow}>
        {trialDay ? `Day ${trialDay.day} Ritual` : "Ritual"}
      </Text>
      <Text style={styles.title}>{ritual.title}</Text>
      <Text style={styles.body}>{ritual.description}</Text>

      <View style={styles.script}>
        {ritual.script.map((line, index) => (
          <Text key={line} style={styles.scriptLine}>
            {index + 1}. {line}
          </Text>
        ))}
      </View>

      {isLockedTrialRitual ? (
        <Text>Complete the current initiation day before this ritual.</Text>
      ) : null}

      {!isRoomUnlocked ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Locked</Text>
          {roomLockReasons.map((reason) => (
            <Text key={reason}>Requirement: {reason}</Text>
          ))}
        </View>
      ) : null}

      {isCompleted && !completionResult ? (
        <Text>This ritual has already been completed.</Text>
      ) : null}

      {completionResult ? (
        <View style={styles.completion}>
          <Text style={styles.title}>
            {completionResult.completedDay
              ? `Day ${completionResult.completedDay} Complete`
              : "Ritual Complete"}
          </Text>

          <Text>
            AP Gained: {completionResult.ascensionPointsGained}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stat Changes</Text>
            {completionResult.statChanges.length > 0 ? (
              completionResult.statChanges.map((change) => (
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
            {completionResult.rewardTitles.length > 0 ? (
              completionResult.rewardTitles.map((rewardTitle) => (
                <Text key={rewardTitle}>{rewardTitle}</Text>
              ))
            ) : (
              <Text>No named rewards gained.</Text>
            )}
            {completionResult.unlockedRooms.map((roomId) => (
              <Text key={roomId}>Room unlocked: {roomId}</Text>
            ))}
            {completionResult.unlockedQuests.map((questId) => (
              <Text key={questId}>Quest unlocked: {questId}</Text>
            ))}
            {completionResult.sigils.map((sigilId) => (
              <Text key={sigilId}>Sigil gained: {sigilId}</Text>
            ))}
            {completionResult.titles.map((titleId) => (
              <Text key={titleId}>Title gained: {titleId}</Text>
            ))}
          </View>

          <Text>
            {completionResult.nextDay
              ? `Next unlocked day: ${completionResult.nextDay}`
              : "Initiation complete."}
          </Text>

          <Button
            title="Return to Initiation"
            onPress={() => {
              router.replace("/initiation");
            }}
          />
          {room ? (
            <Button
              title="Return to Room"
              onPress={() => {
                router.replace(`/library/${room.id}` as Href);
              }}
            />
          ) : null}
        </View>
      ) : (
        <Button
          title="Complete Ritual"
          disabled={!canComplete}
          onPress={() => void handleCompleteRitual()}
        />
      )}

      <Button
        title={room ? "Return to Room" : "Return Home"}
        onPress={() => {
          if (room) {
            router.replace(`/library/${room.id}` as Href);
            return;
          }

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
  completion: {
    borderColor: "#777",
    borderRadius: 6,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
