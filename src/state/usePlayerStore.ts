import { create } from "zustand";

import type {
  ArchetypeId,
  BossId,
  PlayerState,
  QuestId,
  RitualId,
} from "@/domain/types";
import { defeatBoss as defeatBossWithEngine } from "@/engine/bossEngine";
import { completeQuest as completeQuestWithEngine } from "@/engine/questEngine";
import { completeRitual as completeRitualWithEngine } from "@/engine/ritualEngine";
import { createInitialPlayerState } from "@/engine/soulScanEngine";
import { completeTrialDay as completeTrialDayWithEngine } from "@/engine/trialEngine";
import {
  clearPlayerState,
  loadPlayerState,
  savePlayerState,
} from "@/storage/persistence";

export type PlayerStore = {
  readonly playerState: PlayerState | null;
  readonly hasHydrated: boolean;
  readonly initializeFromStorage: () => Promise<void>;
  readonly startNewJourney: (archetypeId: ArchetypeId) => Promise<void>;
  readonly completeRitual: (
    ritualId: RitualId,
    journalText?: string,
  ) => Promise<void>;
  readonly defeatBoss: (bossId: BossId, journalText?: string) => Promise<void>;
  readonly completeQuest: (questId: QuestId) => Promise<void>;
  readonly completeTrialDay: (dayNumber: number) => Promise<void>;
  readonly resetJourney: () => Promise<void>;
};

async function persistAndSet(
  set: (state: Partial<PlayerStore>) => void,
  playerState: PlayerState,
): Promise<void> {
  set({ playerState });
  await savePlayerState(playerState);
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  playerState: null,
  hasHydrated: false,

  initializeFromStorage: async () => {
    const playerState = await loadPlayerState();

    set({
      playerState,
      hasHydrated: true,
    });
  },

  startNewJourney: async (archetypeId) => {
    const playerState = createInitialPlayerState(archetypeId);

    await persistAndSet(set, playerState);
  },

  completeRitual: async (ritualId, journalText) => {
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    await persistAndSet(
      set,
      completeRitualWithEngine(currentPlayerState, ritualId, journalText),
    );
  },

  defeatBoss: async (bossId, journalText) => {
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    await persistAndSet(
      set,
      defeatBossWithEngine(currentPlayerState, bossId, journalText),
    );
  },

  completeQuest: async (questId) => {
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    await persistAndSet(
      set,
      completeQuestWithEngine(currentPlayerState, questId),
    );
  },

  completeTrialDay: async (dayNumber) => {
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    await persistAndSet(
      set,
      completeTrialDayWithEngine(currentPlayerState, dayNumber),
    );
  },

  resetJourney: async () => {
    set({ playerState: null });
    await clearPlayerState();
  },
}));
