import type {
  Boss,
  PlayerState,
  Ritual,
  Room,
  UnlockRequirement,
} from "@/domain/types";

type UnlockableRitual = Ritual & {
  readonly unlockRequirements?: readonly UnlockRequirement[];
};

export function meetsUnlockRequirement(
  playerState: PlayerState,
  requirement: UnlockRequirement,
): boolean {
  switch (requirement.type) {
    case "statMinimum":
      return playerState.stats[requirement.statId] >= requirement.minimum;
    case "ascensionPointsMinimum":
      return playerState.ascensionPoints >= requirement.minimum;
    case "completedRitual":
      return playerState.completedRituals.includes(requirement.ritualId);
    case "completedRoom":
      return playerState.completedRooms.includes(requirement.roomId);
    case "defeatedBoss":
      return playerState.defeatedBosses.includes(requirement.bossId);
    case "trialDayMinimum":
      return playerState.currentDay >= requirement.day;
    case "premiumRequired":
      return playerState.premiumUnlocked;
  }
}

export function getUnlockRequirementReason(
  requirement: UnlockRequirement,
): string {
  switch (requirement.type) {
    case "statMinimum":
      return `Requires ${requirement.statId} ${requirement.minimum} or higher.`;
    case "ascensionPointsMinimum":
      return `Requires at least ${requirement.minimum} ascension points.`;
    case "completedRitual":
      return `Requires completing ritual: ${requirement.ritualId}.`;
    case "completedRoom":
      return `Requires completing room: ${requirement.roomId}.`;
    case "defeatedBoss":
      return `Requires defeating boss: ${requirement.bossId}.`;
    case "trialDayMinimum":
      return `Requires reaching trial day ${requirement.day}.`;
    case "premiumRequired":
      return "Requires premium unlock.";
  }
}

export function getLockReasons(
  playerState: PlayerState,
  requirements: readonly UnlockRequirement[] = [],
): readonly string[] {
  return requirements
    .filter((requirement) => !meetsUnlockRequirement(playerState, requirement))
    .map(getUnlockRequirementReason);
}

export function canEnterRoom(
  playerState: PlayerState,
  room: Room,
): boolean {
  return getLockReasons(playerState, room.unlockRequirements).length === 0;
}

export function canStartRitual(
  playerState: PlayerState,
  ritual: UnlockableRitual,
): boolean {
  return getLockReasons(playerState, ritual.unlockRequirements).length === 0;
}

export function canFightBoss(
  playerState: PlayerState,
  boss: Boss,
): boolean {
  return getLockReasons(playerState, boss.unlockRequirements).length === 0;
}

export const unlockEngine = {
  meetsUnlockRequirement,
  getUnlockRequirementReason,
  getLockReasons,
  canEnterRoom,
  canStartRitual,
  canFightBoss,
};
