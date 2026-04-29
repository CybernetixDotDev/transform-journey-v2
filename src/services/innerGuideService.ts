import type { ArchetypeId, JournalEntry, PlayerState } from "@/domain/types";

const ARCHETYPE_MESSAGES: Readonly<Record<ArchetypeId, string>> = {
  alchemist:
    "Alchemist, today asks you to turn one charged feeling into one clear choice.",
  architect:
    "Architect, today asks for one small structure that makes your future easier to inhabit.",
  creator:
    "Creator, today asks you to give one honest spark a visible form.",
  healer:
    "Healer, today asks you to include yourself in the care you offer so freely.",
  seer: "Seer, today asks you to trust the truth you already sense beneath the noise.",
  warrior:
    "Warrior, today asks for one brave boundary in service of the self you are becoming.",
};

const DEFAULT_DAILY_MESSAGE =
  "Today asks for one honest action that makes the journey real.";

export function getDailyArchetypeMessage(playerState: PlayerState): string {
  return playerState.archetypeId
    ? ARCHETYPE_MESSAGES[playerState.archetypeId]
    : DEFAULT_DAILY_MESSAGE;
}

export function reflectOnJournalPlaceholder(
  journalEntry: JournalEntry,
): string {
  return `Placeholder reflection: your response to "${journalEntry.prompt}" has been recorded. Notice one truth in it and choose one small action that honors it.`;
}

export function generateMicroQuestPlaceholder(
  playerState: PlayerState,
): string {
  const archetypeMessage = getDailyArchetypeMessage(playerState);

  return `${archetypeMessage} Micro quest: take five quiet minutes, name the next true step, and write it down.`;
}

export const innerGuideService = {
  getDailyArchetypeMessage,
  reflectOnJournalPlaceholder,
  generateMicroQuestPlaceholder,
};
