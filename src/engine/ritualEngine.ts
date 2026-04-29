import { rituals } from "@/content/rituals";
import type { JournalEntry, PlayerState, RitualId } from "@/domain/types";
import { applyReward, createRitualReward } from "@/engine/rewardEngine";

export type RitualSession = {
  readonly ritualId: RitualId;
  readonly status: "notFound" | "ready" | "completed";
  readonly isCompleted: boolean;
  readonly canComplete: boolean;
};

export type RitualProgress = {
  readonly ritualId: RitualId;
  readonly isCompleted: boolean;
  readonly canComplete: boolean;
};

function findRitual(ritualId: RitualId) {
  return rituals.find((ritual) => ritual.id === ritualId);
}

function createJournalEntry(
  playerState: PlayerState,
  ritualId: RitualId,
  journalText: string,
): JournalEntry {
  const ritual = findRitual(ritualId);
  const entryNumber = playerState.journalEntries.length + 1;

  return {
    id: `${ritualId}-journal-${entryNumber}`,
    ritualId,
    roomId: ritual?.roomId,
    prompt: ritual?.journalPrompt ?? "",
    response: journalText,
    createdAt: `entry-${entryNumber}`,
  };
}

export function startRitual(
  playerState: PlayerState,
  ritualId: RitualId,
): RitualSession {
  const ritual = findRitual(ritualId);
  const isCompleted = playerState.completedRituals.includes(ritualId);

  if (!ritual) {
    return {
      ritualId,
      status: "notFound",
      isCompleted,
      canComplete: false,
    };
  }

  return {
    ritualId,
    status: isCompleted ? "completed" : "ready",
    isCompleted,
    canComplete: !isCompleted,
  };
}

export function completeRitual(
  playerState: PlayerState,
  ritualId: RitualId,
  journalText?: string,
): PlayerState {
  const ritual = findRitual(ritualId);
  const isCompleted = playerState.completedRituals.includes(ritualId);

  if (!ritual || isCompleted) {
    return playerState;
  }

  const journalEntries =
    journalText && journalText.trim().length > 0
      ? [
          ...playerState.journalEntries,
          createJournalEntry(playerState, ritualId, journalText),
        ]
      : playerState.journalEntries;

  const updatedPlayerState: PlayerState = {
    ...playerState,
    completedRituals: [...playerState.completedRituals, ritualId],
    journalEntries,
  };

  return applyReward(updatedPlayerState, createRitualReward(ritualId));
}

export function getRitualProgress(
  playerState: PlayerState,
  ritualId: RitualId,
): RitualProgress {
  const isCompleted = playerState.completedRituals.includes(ritualId);

  return {
    ritualId,
    isCompleted,
    canComplete: findRitual(ritualId) !== undefined && !isCompleted,
  };
}

export const ritualEngine = {
  startRitual,
  completeRitual,
  getRitualProgress,
};
