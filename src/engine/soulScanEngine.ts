import type { ArchetypeId, PlayerState, Stats } from "@/domain/types";

export type SoulScanAnswer = {
  readonly archetypeScores: Partial<Record<ArchetypeId, number>>;
};

const ARCHETYPE_TIE_BREAK_ORDER: readonly ArchetypeId[] = [
  "alchemist",
  "architect",
  "creator",
  "healer",
  "seer",
  "warrior",
];

const PRIMARY_STAT_BY_ARCHETYPE: Readonly<Record<ArchetypeId, keyof Stats>> = {
  alchemist: "emotionalRegulation",
  architect: "discipline",
  creator: "creativity",
  healer: "compassion",
  seer: "intuition",
  warrior: "courage",
};

const BASE_STATS: Stats = {
  clarity: 1,
  courage: 1,
  selfWorth: 1,
  boundaries: 1,
  emotionalRegulation: 1,
  compassion: 1,
  creativity: 1,
  discipline: 1,
  intuition: 1,
  presence: 1,
};

export function calculateArchetype(
  answers: readonly SoulScanAnswer[],
): ArchetypeId {
  const totals: Record<ArchetypeId, number> = {
    alchemist: 0,
    architect: 0,
    creator: 0,
    healer: 0,
    seer: 0,
    warrior: 0,
  };

  for (const answer of answers) {
    for (const archetypeId of ARCHETYPE_TIE_BREAK_ORDER) {
      totals[archetypeId] += answer.archetypeScores[archetypeId] ?? 0;
    }
  }

  return ARCHETYPE_TIE_BREAK_ORDER.reduce<ArchetypeId>(
    (highestArchetypeId, archetypeId) =>
      totals[archetypeId] > totals[highestArchetypeId]
        ? archetypeId
        : highestArchetypeId,
    ARCHETYPE_TIE_BREAK_ORDER[0],
  );
}

export function createInitialPlayerState(
  archetypeId: ArchetypeId,
): PlayerState {
  const primaryStat = PRIMARY_STAT_BY_ARCHETYPE[archetypeId];

  return {
    archetypeId,
    currentDay: 1,
    stats: {
      ...BASE_STATS,
      [primaryStat]: BASE_STATS[primaryStat] + 2,
    },
    ascensionPoints: 0,
    unlockedRooms: ["threshold-chamber"],
    completedRooms: [],
    completedRituals: [],
    defeatedBosses: [],
    completedQuests: [],
    activeQuests: [],
    journalEntries: [],
    sigils: [],
    titles: [],
    trialCompleted: false,
    premiumUnlocked: false,
  };
}

export const soulScanEngine = {
  calculateArchetype,
  createInitialPlayerState,
};
