import { bosses } from "@/content/bosses";
import { rewards as rewardRegistry } from "@/content/rewards";
import { rituals } from "@/content/rituals";
import { rooms } from "@/content/rooms";
import type {
  BossId,
  PlayerState,
  QuestId,
  Reward,
  RewardId,
  RitualId,
  RoomId,
  SigilId,
  Stats,
  TitleId,
} from "@/domain/types";

const EMPTY_REWARD: Reward = {
  id: "empty-reward",
  title: "No Reward",
};

function uniqueValues<T extends string>(
  currentValues: readonly T[],
  addedValues: readonly T[] = [],
): readonly T[] {
  return Array.from(new Set([...currentValues, ...addedValues]));
}

function combineStatIncreases(
  currentStats: Partial<Stats> = {},
  addedStats: Partial<Stats> = {},
): Partial<Stats> {
  return {
    clarity: (currentStats.clarity ?? 0) + (addedStats.clarity ?? 0),
    courage: (currentStats.courage ?? 0) + (addedStats.courage ?? 0),
    selfWorth: (currentStats.selfWorth ?? 0) + (addedStats.selfWorth ?? 0),
    boundaries: (currentStats.boundaries ?? 0) + (addedStats.boundaries ?? 0),
    emotionalRegulation:
      (currentStats.emotionalRegulation ?? 0) +
      (addedStats.emotionalRegulation ?? 0),
    compassion: (currentStats.compassion ?? 0) + (addedStats.compassion ?? 0),
    creativity: (currentStats.creativity ?? 0) + (addedStats.creativity ?? 0),
    discipline: (currentStats.discipline ?? 0) + (addedStats.discipline ?? 0),
    intuition: (currentStats.intuition ?? 0) + (addedStats.intuition ?? 0),
    presence: (currentStats.presence ?? 0) + (addedStats.presence ?? 0),
  };
}

function applyStatIncreases(
  currentStats: Stats,
  statIncreases: Partial<Stats> = {},
): Stats {
  return {
    clarity: currentStats.clarity + (statIncreases.clarity ?? 0),
    courage: currentStats.courage + (statIncreases.courage ?? 0),
    selfWorth: currentStats.selfWorth + (statIncreases.selfWorth ?? 0),
    boundaries: currentStats.boundaries + (statIncreases.boundaries ?? 0),
    emotionalRegulation:
      currentStats.emotionalRegulation +
      (statIncreases.emotionalRegulation ?? 0),
    compassion: currentStats.compassion + (statIncreases.compassion ?? 0),
    creativity: currentStats.creativity + (statIncreases.creativity ?? 0),
    discipline: currentStats.discipline + (statIncreases.discipline ?? 0),
    intuition: currentStats.intuition + (statIncreases.intuition ?? 0),
    presence: currentStats.presence + (statIncreases.presence ?? 0),
  };
}

function findRewardsByIds(rewardIds: readonly RewardId[]): readonly Reward[] {
  return rewardIds
    .map((rewardId) =>
      rewardRegistry.find((reward) => reward.id === rewardId),
    )
    .filter((reward): reward is Reward => reward !== undefined);
}

export function applyReward(
  playerState: PlayerState,
  reward: Reward,
): PlayerState {
  return {
    ...playerState,
    stats: applyStatIncreases(playerState.stats, reward.statIncreases),
    ascensionPoints:
      playerState.ascensionPoints + (reward.ascensionPoints ?? 0),
    unlockedRooms: uniqueValues<RoomId>(
      playerState.unlockedRooms,
      reward.unlockRoomIds,
    ),
    sigils: uniqueValues<SigilId>(playerState.sigils, reward.sigilIds),
    titles: uniqueValues<TitleId>(playerState.titles, reward.titleIds),
    activeQuests: uniqueValues<QuestId>(
      playerState.activeQuests,
      reward.unlockQuestIds,
    ),
  };
}

export function combineRewards(rewards: readonly Reward[]): Reward {
  if (rewards.length === 0) {
    return EMPTY_REWARD;
  }

  return rewards.reduce<Reward>(
    (combinedReward, reward) => ({
      id: combinedReward.id,
      title: combinedReward.title,
      description: combinedReward.description,
      statIncreases: combineStatIncreases(
        combinedReward.statIncreases,
        reward.statIncreases,
      ),
      ascensionPoints:
        (combinedReward.ascensionPoints ?? 0) + (reward.ascensionPoints ?? 0),
      unlockRoomIds: uniqueValues<RoomId>(
        combinedReward.unlockRoomIds ?? [],
        reward.unlockRoomIds,
      ),
      sigilIds: uniqueValues<SigilId>(
        combinedReward.sigilIds ?? [],
        reward.sigilIds,
      ),
      titleIds: uniqueValues<TitleId>(
        combinedReward.titleIds ?? [],
        reward.titleIds,
      ),
      unlockQuestIds: uniqueValues<QuestId>(
        combinedReward.unlockQuestIds ?? [],
        reward.unlockQuestIds,
      ),
    }),
    {
      id: "combined-reward",
      title: "Combined Reward",
      description: "A merged reward from multiple completed actions.",
    },
  );
}

export function createRitualReward(ritualId: RitualId): Reward {
  const ritual = rituals.find((candidateRitual) => candidateRitual.id === ritualId);

  if (!ritual) {
    return EMPTY_REWARD;
  }

  return combineRewards(findRewardsByIds(ritual.rewardIds));
}

export function createBossReward(bossId: BossId): Reward {
  const boss = bosses.find((candidateBoss) => candidateBoss.id === bossId);

  if (!boss) {
    return EMPTY_REWARD;
  }

  return combineRewards(findRewardsByIds(boss.rewardIds));
}

export function createRoomReward(roomId: RoomId): Reward {
  const room = rooms.find((candidateRoom) => candidateRoom.id === roomId);

  if (!room) {
    return EMPTY_REWARD;
  }

  return combineRewards(findRewardsByIds(room.rewardIds));
}

export const rewardEngine = {
  applyReward,
  combineRewards,
  createRitualReward,
  createBossReward,
  createRoomReward,
};
