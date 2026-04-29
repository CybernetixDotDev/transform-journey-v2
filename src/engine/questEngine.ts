import { quests } from "@/content/quests";
import { rewards as rewardRegistry } from "@/content/rewards";
import type {
  BossId,
  PlayerState,
  Quest,
  QuestId,
  Reward,
  RewardId,
  RoomId,
} from "@/domain/types";
import { applyReward, combineRewards } from "@/engine/rewardEngine";
import { getLockReasons } from "@/engine/unlockEngine";

function findQuest(questId: QuestId): Quest | undefined {
  return quests.find((quest) => quest.id === questId);
}

function findRewardsByIds(rewardIds: readonly RewardId[]): readonly Reward[] {
  return rewardIds
    .map((rewardId) =>
      rewardRegistry.find((reward) => reward.id === rewardId),
    )
    .filter((reward): reward is Reward => reward !== undefined);
}

function createQuestReward(quest: Quest): Reward {
  return combineRewards(findRewardsByIds(quest.rewardIds));
}

function isQuestAvailable(playerState: PlayerState, quest: Quest): boolean {
  return (
    !playerState.activeQuests.includes(quest.id) &&
    !playerState.completedQuests.includes(quest.id) &&
    getLockReasons(playerState, quest.unlockRequirements).length === 0
  );
}

export function getActiveQuests(playerState: PlayerState): readonly Quest[] {
  return playerState.activeQuests
    .map(findQuest)
    .filter((quest): quest is Quest => quest !== undefined);
}

export function assignQuest(
  playerState: PlayerState,
  questId: QuestId,
): PlayerState {
  const quest = findQuest(questId);

  if (
    !quest ||
    playerState.activeQuests.includes(questId) ||
    playerState.completedQuests.includes(questId)
  ) {
    return playerState;
  }

  return {
    ...playerState,
    activeQuests: [...playerState.activeQuests, questId],
  };
}

export function completeQuest(
  playerState: PlayerState,
  questId: QuestId,
): PlayerState {
  const quest = findQuest(questId);

  if (!quest || playerState.completedQuests.includes(questId)) {
    return playerState;
  }

  const updatedPlayerState: PlayerState = {
    ...playerState,
    activeQuests: playerState.activeQuests.filter(
      (activeQuestId) => activeQuestId !== questId,
    ),
    completedQuests: [...playerState.completedQuests, questId],
  };

  return applyReward(updatedPlayerState, createQuestReward(quest));
}

export function generateDailyQuest(
  playerState: PlayerState,
): Quest | undefined {
  return quests.find(
    (quest) => quest.type === "daily" && isQuestAvailable(playerState, quest),
  );
}

export function generateRoomQuest(
  playerState: PlayerState,
  roomId: RoomId,
): Quest | undefined {
  return quests.find(
    (quest) =>
      quest.type === "room" &&
      quest.roomId === roomId &&
      isQuestAvailable(playerState, quest),
  );
}

export function generateBossIntegrationQuest(
  playerState: PlayerState,
  bossId: BossId,
): Quest | undefined {
  return quests.find(
    (quest) =>
      quest.bossId === bossId && isQuestAvailable(playerState, quest),
  );
}

export const questEngine = {
  getActiveQuests,
  assignQuest,
  completeQuest,
  generateDailyQuest,
  generateRoomQuest,
  generateBossIntegrationQuest,
};
