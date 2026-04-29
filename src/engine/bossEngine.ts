import { bosses } from "@/content/bosses";
import type { BossId, JournalEntry, PlayerState } from "@/domain/types";
import { applyReward, createBossReward } from "@/engine/rewardEngine";
import { canFightBoss, getLockReasons } from "@/engine/unlockEngine";

export type BossStatus = {
  readonly bossId: BossId;
  readonly isDefeated: boolean;
  readonly canConfront: boolean;
  readonly lockReasons: readonly string[];
};

function findBoss(bossId: BossId) {
  return bosses.find((boss) => boss.id === bossId);
}

function createJournalEntry(
  playerState: PlayerState,
  bossId: BossId,
  journalText: string,
): JournalEntry {
  const boss = findBoss(bossId);
  const entryNumber = playerState.journalEntries.length + 1;

  return {
    id: `${bossId}-journal-${entryNumber}`,
    bossId,
    roomId: boss?.roomId,
    prompt: boss?.reflectionPrompt ?? "",
    response: journalText,
    createdAt: `entry-${entryNumber}`,
  };
}

export function canConfrontBoss(
  playerState: PlayerState,
  bossId: BossId,
): boolean {
  const boss = findBoss(bossId);

  if (!boss || playerState.defeatedBosses.includes(bossId)) {
    return false;
  }

  return canFightBoss(playerState, boss);
}

export function defeatBoss(
  playerState: PlayerState,
  bossId: BossId,
  journalText?: string,
): PlayerState {
  const boss = findBoss(bossId);

  if (
    !boss ||
    playerState.defeatedBosses.includes(bossId) ||
    !canFightBoss(playerState, boss)
  ) {
    return playerState;
  }

  const journalEntries =
    journalText && journalText.trim().length > 0
      ? [
          ...playerState.journalEntries,
          createJournalEntry(playerState, bossId, journalText),
        ]
      : playerState.journalEntries;

  const updatedPlayerState: PlayerState = {
    ...playerState,
    defeatedBosses: [...playerState.defeatedBosses, bossId],
    journalEntries,
  };

  return applyReward(updatedPlayerState, createBossReward(bossId));
}

export function getBossStatus(
  playerState: PlayerState,
  bossId: BossId,
): BossStatus {
  const boss = findBoss(bossId);
  const isDefeated = playerState.defeatedBosses.includes(bossId);
  const lockReasons = boss
    ? getLockReasons(playerState, boss.unlockRequirements)
    : [`Boss not found: ${bossId}.`];

  return {
    bossId,
    isDefeated,
    canConfront: Boolean(boss) && !isDefeated && lockReasons.length === 0,
    lockReasons,
  };
}

export const bossEngine = {
  canConfrontBoss,
  defeatBoss,
  getBossStatus,
};
