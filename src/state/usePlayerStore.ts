import { create } from "zustand";

import type {
  ArchetypeId,
  BossId,
  JournalEntry,
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
  readonly createJournalEntry: (response: string, prompt?: string) => Promise<void>;
  readonly resetJourney: () => Promise<void>;
};

async function persistAndSet(
  set: (state: Partial<PlayerStore>) => void,
  playerState: PlayerState,
): Promise<void> {
  // All gameplay mutations persist through this single local storage boundary.
  set({ playerState });
  await savePlayerState(playerState);
}

function logStoreAction(actionName: string, playerState: PlayerState | null) {
  if (!playerState) {
    console.log(`[STORE] ${actionName} -> Journey reset`);
    return;
  }

  console.log(
    `[STORE] ${actionName} -> Day: ${playerState.currentDay}, AP: ${playerState.ascensionPoints}, Rituals: ${playerState.completedRituals.length}, Bosses: ${playerState.defeatedBosses.length}, Quests: ${playerState.completedQuests.length}`,
  );
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
    console.log(`[STORE] startNewJourney requested archetypeId=${archetypeId}`);
    const playerState = createInitialPlayerState(archetypeId);

    await persistAndSet(set, playerState);
    logStoreAction("startNewJourney", playerState);
  },

  completeRitual: async (ritualId, journalText) => {
    console.log(`[STORE] completeRitual requested ritualId=${ritualId}`);
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    const playerState = completeRitualWithEngine(
      currentPlayerState,
      ritualId,
      journalText,
    );

    await persistAndSet(set, playerState);
    logStoreAction("completeRitual", playerState);
  },

  defeatBoss: async (bossId, journalText) => {
    console.log(`[STORE] defeatBoss requested bossId=${bossId}`);
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    const playerState = defeatBossWithEngine(
      currentPlayerState,
      bossId,
      journalText,
    );

    await persistAndSet(set, playerState);
    logStoreAction("defeatBoss", playerState);
  },

  completeQuest: async (questId) => {
    console.log(`[STORE] completeQuest requested questId=${questId}`);
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    const playerState = completeQuestWithEngine(currentPlayerState, questId);

    await persistAndSet(set, playerState);
    logStoreAction("completeQuest", playerState);
  },

  completeTrialDay: async (dayNumber) => {
    console.log(`[STORE] completeTrialDay requested day=${dayNumber}`);
    const currentPlayerState = get().playerState;

    if (!currentPlayerState) {
      return;
    }

    const playerState = completeTrialDayWithEngine(
      currentPlayerState,
      dayNumber,
    );

    await persistAndSet(set, playerState);
    logStoreAction("completeTrialDay", playerState);
  },

  createJournalEntry: async (response, prompt = "Manual journal entry") => {
    console.log("[STORE] createJournalEntry requested");
    const currentPlayerState = get().playerState;
    const trimmedResponse = response.trim();

    if (!currentPlayerState || trimmedResponse.length === 0) {
      return;
    }

    const entryNumber = currentPlayerState.journalEntries.length + 1;
    const journalEntry: JournalEntry = {
      id: `manual-journal-${entryNumber}`,
      prompt,
      response: trimmedResponse,
      createdAt: new Date().toISOString(),
    };
    const playerState: PlayerState = {
      ...currentPlayerState,
      journalEntries: [...currentPlayerState.journalEntries, journalEntry],
    };

    await persistAndSet(set, playerState);
  },

  resetJourney: async () => {
    console.log("[STORE] resetJourney requested");
    set({ playerState: null });
    await clearPlayerState();
    logStoreAction("resetJourney", null);
  },
}));
