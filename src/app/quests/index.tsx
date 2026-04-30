import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { quests } from "@/content/quests";
import { rewards } from "@/content/rewards";
import type { PlayerState, Quest, StatId } from "@/domain/types";
import { getProgressSummary } from "@/engine/progressionEngine";
import { getLockReasons } from "@/engine/unlockEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

type StatChange = {
  readonly statId: StatId;
  readonly before: number;
  readonly after: number;
};

type QuestCompletionResult = {
  readonly questTitle: string;
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

function createQuestCompletionResult(
  quest: Quest,
  beforePlayerState: PlayerState,
  afterPlayerState: PlayerState,
): QuestCompletionResult {
  const rewardTitles = quest.rewardIds
    .map((rewardId) => rewards.find((reward) => reward.id === rewardId)?.title)
    .filter((title): title is string => title !== undefined);

  return {
    questTitle: quest.title,
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

function QuestCard({
  canComplete,
  lockReasons,
  onComplete,
  quest,
  status,
}: {
  readonly canComplete: boolean;
  readonly lockReasons: readonly string[];
  readonly onComplete: (quest: Quest) => void;
  readonly quest: Quest;
  readonly status: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardStatus}>{status}</Text>
      <Text style={styles.cardTitle}>{quest.title}</Text>
      <Text>{quest.description}</Text>
      <Text>Type: {quest.type}</Text>
      {lockReasons.map((reason) => (
        <Text key={reason}>Requirement: {reason}</Text>
      ))}
      {canComplete ? (
        <Button
          title="Complete Quest"
          onPress={() => {
            onComplete(quest);
          }}
        />
      ) : null}
    </View>
  );
}

export default function QuestsScreen() {
  const router = useRouter();
  const [completionResult, setCompletionResult] =
    useState<QuestCompletionResult | null>(null);
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );
  const completeQuest = usePlayerStore((state) => state.completeQuest);

  useEffect(() => {
    if (!hasHydrated) {
      void initializeFromStorage();
    }
  }, [hasHydrated, initializeFromStorage]);

  async function handleCompleteQuest(quest: Quest) {
    if (!playerState) {
      return;
    }

    const beforePlayerState = playerState;

    await completeQuest(quest.id);

    const afterPlayerState = usePlayerStore.getState().playerState;

    if (!afterPlayerState) {
      return;
    }

    setCompletionResult(
      createQuestCompletionResult(quest, beforePlayerState, afterPlayerState),
    );
  }

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quests</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  if (!playerState) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quests</Text>
        <Text>Begin a Soul Scan before viewing quests.</Text>
        <Button
          title="Begin Soul Scan"
          onPress={() => {
            router.push("/onboarding");
          }}
        />
      </View>
    );
  }

  const progressSummary = getProgressSummary(playerState);
  const activeQuests = quests.filter(
    (quest) =>
      playerState.activeQuests.includes(quest.id) &&
      !playerState.completedQuests.includes(quest.id),
  );
  const completedQuests = quests.filter((quest) =>
    playerState.completedQuests.includes(quest.id),
  );
  const inactiveAvailableQuests = quests.filter(
    (quest) =>
      !playerState.activeQuests.includes(quest.id) &&
      !playerState.completedQuests.includes(quest.id) &&
      getLockReasons(playerState, quest.unlockRequirements).length === 0,
  );
  const lockedQuests = quests.filter(
    (quest) =>
      !playerState.activeQuests.includes(quest.id) &&
      !playerState.completedQuests.includes(quest.id) &&
      getLockReasons(playerState, quest.unlockRequirements).length > 0,
  );
  const availableQuestCount = activeQuests.length + inactiveAvailableQuests.length;
  const nextQuestText =
    availableQuestCount > 0
      ? `Next step: Complete one of ${availableQuestCount} available quests.`
      : completedQuests.length === quests.length
        ? "All registered quests are complete."
        : "No quest is available right now. Continue rituals, bosses, or initiation progress.";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Akashic Library</Text>
      <Text style={styles.title}>Quests</Text>

      <View style={styles.summary}>
        <Text>Ascension Level: {progressSummary.ascensionLevel}</Text>
        <Text>AP: {progressSummary.ascensionPoints}</Text>
        <Text>Completed Quests: {progressSummary.completedQuestsCount}</Text>
      </View>
      <Text>{nextQuestText}</Text>

      {completionResult ? (
        <View style={styles.result}>
          <Text style={styles.sectionTitle}>Quest Complete</Text>
          <Text>{completionResult.questTitle}</Text>
          <Text>AP Gained: {completionResult.ascensionPointsGained}</Text>
          {completionResult.statChanges.map((change) => (
            <Text key={change.statId}>
              {change.statId}: {change.before} to {change.after}
            </Text>
          ))}
          {completionResult.rewardTitles.map((rewardTitle) => (
            <Text key={rewardTitle}>Reward: {rewardTitle}</Text>
          ))}
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
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active</Text>
        {[...activeQuests, ...inactiveAvailableQuests].length > 0 ? (
          [...activeQuests, ...inactiveAvailableQuests].map((quest) => (
            <QuestCard
              key={quest.id}
              canComplete
              lockReasons={[]}
              onComplete={(selectedQuest) => {
                void handleCompleteQuest(selectedQuest);
              }}
              quest={quest}
              status={
                activeQuests.includes(quest) ? "Active" : "Available"
              }
            />
          ))
        ) : (
          <Text>No active quests.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locked</Text>
        {lockedQuests.length > 0 ? (
          lockedQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              canComplete={false}
              lockReasons={getLockReasons(
                playerState,
                quest.unlockRequirements,
              )}
              onComplete={() => undefined}
              quest={quest}
              status="Locked"
            />
          ))
        ) : (
          <Text>No locked quests.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed</Text>
        {completedQuests.length > 0 ? (
          completedQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              canComplete={false}
              lockReasons={[]}
              onComplete={() => undefined}
              quest={quest}
              status="Completed"
            />
          ))
        ) : (
          <Text>No completed quests.</Text>
        )}
      </View>

      <Button
        title="Return Home"
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
  summary: {
    borderColor: "#bbb",
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  result: {
    borderColor: "#777",
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  cardStatus: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
