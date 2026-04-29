import { rewards as rewardRegistry } from "@/content/rewards";
import type {
  BossId,
  PlayerState,
  Quest,
  Reward,
  RewardId,
  RitualId,
  RoomId,
  TrialDay,
} from "@/domain/types";
import {
  assignQuest,
  generateBossIntegrationQuest,
  generateDailyQuest,
  generateRoomQuest,
} from "@/engine/questEngine";
import { applyReward, combineRewards } from "@/engine/rewardEngine";

type TrialDayDefinition = Omit<TrialDay, "ritualId"> & {
  readonly roomId?: RoomId;
  readonly ritualId?: RitualId;
  readonly bossId?: BossId;
};

const TRIAL_DAYS: readonly TrialDayDefinition[] = [
  {
    day: 1,
    title: "Threshold",
    theme: "Arrival",
    description: "Cross the threshold and choose the journey.",
    roomId: "threshold-chamber",
    ritualId: "breath-of-arrival",
    rewardIds: ["arrival-spark"],
    unlockRoomIds: ["threshold-chamber", "hall-of-echoes"],
  },
  {
    day: 2,
    title: "Pattern",
    theme: "Awareness",
    description: "Name the loop that keeps repeating.",
    roomId: "hall-of-echoes",
    ritualId: "pattern-naming",
    rewardIds: ["pattern-sight"],
    unlockRoomIds: ["hall-of-echoes", "childhood-room"],
  },
  {
    day: 3,
    title: "Origin",
    theme: "Compassion",
    description: "Meet the memory beneath the pattern.",
    roomId: "childhood-room",
    ritualId: "first-memory",
    rewardIds: ["origin-compassion"],
    unlockRoomIds: ["childhood-room", "ancestral-chamber"],
  },
  {
    day: 4,
    title: "Shadow",
    theme: "Courage",
    description: "Face the avoided part with honesty.",
    roomId: "shadow-mirror-hall",
    ritualId: "shadow-dialogue",
    rewardIds: ["shadow-courage"],
    unlockRoomIds: ["shadow-mirror-hall", "archetype-chamber"],
  },
  {
    day: 5,
    title: "Archetype Activation",
    theme: "Embodiment",
    description: "Activate the chosen archetype through action.",
    roomId: "archetype-chamber",
    ritualId: "archetype-activation",
    rewardIds: ["archetype-sigil"],
    unlockRoomIds: ["archetype-chamber"],
  },
  {
    day: 6,
    title: "First Boss Encounter",
    theme: "Confrontation",
    description: "Meet the first guardian and claim its lesson.",
    roomId: "archetype-chamber",
    bossId: "ghost",
    rewardIds: ["thread-cutter"],
    unlockRoomIds: ["hall-of-masks"],
  },
  {
    day: 7,
    title: "Breakthrough",
    theme: "Library Unlock",
    description: "Cut the thread and open the wider Akashic Library.",
    roomId: "ancestral-chamber",
    ritualId: "cutting-the-thread",
    rewardIds: ["library-key"],
    unlockRoomIds: [
      "hall-of-masks",
      "chamber-of-boundaries",
      "scarcity-vault",
      "relationship-atrium",
      "future-self-chamber",
      "integration-sanctuary",
    ],
  },
];

function uniqueValues<T extends string>(
  currentValues: readonly T[],
  addedValues: readonly T[] = [],
): readonly T[] {
  return Array.from(new Set([...currentValues, ...addedValues]));
}

function findRewardsByIds(rewardIds: readonly RewardId[]): readonly Reward[] {
  return rewardIds
    .map((rewardId) =>
      rewardRegistry.find((reward) => reward.id === rewardId),
    )
    .filter((reward): reward is Reward => reward !== undefined);
}

function applyTrialRewards(
  playerState: PlayerState,
  rewardIds: readonly RewardId[],
): PlayerState {
  return applyReward(playerState, combineRewards(findRewardsByIds(rewardIds)));
}

function assignSuitableQuest(
  playerState: PlayerState,
  trialDay: TrialDayDefinition,
): PlayerState {
  const quest: Quest | undefined =
    (trialDay.roomId
      ? generateRoomQuest(playerState, trialDay.roomId)
      : undefined) ??
    generateDailyQuest(playerState) ??
    (trialDay.bossId
      ? generateBossIntegrationQuest(playerState, trialDay.bossId)
      : undefined);

  return quest ? assignQuest(playerState, quest.id) : playerState;
}

export function getTrialDay(
  dayNumber: number,
): TrialDayDefinition | undefined {
  return TRIAL_DAYS.find((trialDay) => trialDay.day === dayNumber);
}

export function getCurrentTrialDay(
  playerState: PlayerState,
): TrialDayDefinition | undefined {
  return playerState.trialCompleted
    ? undefined
    : getTrialDay(playerState.currentDay);
}

export function completeTrialDay(
  playerState: PlayerState,
  dayNumber: number,
): PlayerState {
  const trialDay = getTrialDay(dayNumber);

  if (
    !trialDay ||
    playerState.trialCompleted ||
    dayNumber !== playerState.currentDay
  ) {
    return playerState;
  }

  const roomUnlocks = trialDay.roomId
    ? [trialDay.roomId, ...(trialDay.unlockRoomIds ?? [])]
    : trialDay.unlockRoomIds;

  const progressedPlayerState: PlayerState = {
    ...playerState,
    currentDay: dayNumber >= 7 ? 7 : dayNumber + 1,
    unlockedRooms: uniqueValues<RoomId>(
      playerState.unlockedRooms,
      roomUnlocks,
    ),
    completedRooms: trialDay.roomId
      ? uniqueValues<RoomId>(playerState.completedRooms, [trialDay.roomId])
      : playerState.completedRooms,
    completedRituals: trialDay.ritualId
      ? uniqueValues<RitualId>(playerState.completedRituals, [
          trialDay.ritualId,
        ])
      : playerState.completedRituals,
    defeatedBosses: trialDay.bossId
      ? uniqueValues<BossId>(playerState.defeatedBosses, [trialDay.bossId])
      : playerState.defeatedBosses,
    trialCompleted: dayNumber === 7,
  };

  const rewardedPlayerState = applyTrialRewards(
    progressedPlayerState,
    trialDay.rewardIds,
  );

  return assignSuitableQuest(rewardedPlayerState, trialDay);
}

export function isTrialComplete(playerState: PlayerState): boolean {
  return playerState.trialCompleted;
}

export const trialEngine = {
  getTrialDay,
  getCurrentTrialDay,
  completeTrialDay,
  isTrialComplete,
};
