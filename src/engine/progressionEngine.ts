import type { ArchetypeId, PlayerState, StatId } from "@/domain/types";

export type ProgressSummary = {
  readonly ascensionLevel: number;
  readonly ascensionPoints: number;
  readonly nextLevelRequirement: number;
  readonly primaryStat: StatId;
  readonly completedRoomsCount: number;
  readonly completedRitualsCount: number;
  readonly defeatedBossesCount: number;
  readonly completedQuestsCount: number;
  readonly trialCompleted: boolean;
  readonly premiumUnlocked: boolean;
};

const PRIMARY_STAT_BY_ARCHETYPE: Readonly<Record<ArchetypeId, StatId>> = {
  alchemist: "emotionalRegulation",
  architect: "discipline",
  creator: "creativity",
  healer: "compassion",
  seer: "intuition",
  warrior: "courage",
};

const DEFAULT_PRIMARY_STAT: StatId = "presence";
const LEVEL_STEP_AP = 25;

export function getAscensionLevel(playerState: PlayerState): number {
  return Math.floor(playerState.ascensionPoints / LEVEL_STEP_AP) + 1;
}

export function getNextLevelRequirement(playerState: PlayerState): number {
  return getAscensionLevel(playerState) * LEVEL_STEP_AP;
}

export function getPrimaryStat(playerState: PlayerState): StatId {
  return playerState.archetypeId
    ? PRIMARY_STAT_BY_ARCHETYPE[playerState.archetypeId]
    : DEFAULT_PRIMARY_STAT;
}

export function getProgressSummary(
  playerState: PlayerState,
): ProgressSummary {
  return {
    ascensionLevel: getAscensionLevel(playerState),
    ascensionPoints: playerState.ascensionPoints,
    nextLevelRequirement: getNextLevelRequirement(playerState),
    primaryStat: getPrimaryStat(playerState),
    completedRoomsCount: playerState.completedRooms.length,
    completedRitualsCount: playerState.completedRituals.length,
    defeatedBossesCount: playerState.defeatedBosses.length,
    completedQuestsCount: playerState.completedQuests.length,
    trialCompleted: playerState.trialCompleted,
    premiumUnlocked: playerState.premiumUnlocked,
  };
}

export const progressionEngine = {
  getAscensionLevel,
  getNextLevelRequirement,
  getProgressSummary,
  getPrimaryStat,
};
