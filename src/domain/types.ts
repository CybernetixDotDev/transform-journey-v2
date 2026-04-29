export type ArchetypeId = string;
export type RoomId = string;
export type RitualId = string;
export type BossId = string;
export type QuestId = string;
export type RewardId = string;

export type StatKey =
  | "awareness"
  | "compassion"
  | "courage"
  | "clarity"
  | "discipline";

export type PlayerStats = Record<StatKey, number>;

export type Archetype = {
  id: ArchetypeId;
  name: string;
  description: string;
  startingStats: PlayerStats;
};

export type Room = {
  id: RoomId;
  name: string;
  description: string;
  ritualId: RitualId;
  bossIds: BossId[];
  rewardIds: RewardId[];
  unlockRequirements: UnlockRequirement[];
};

export type Ritual = {
  id: RitualId;
  title: string;
  script: string[];
  journalPrompt: string;
  rewardIds: RewardId[];
};

export type Boss = {
  id: BossId;
  name: string;
  description: string;
  reflectionPrompt: string;
  rewardIds: RewardId[];
};

export type Quest = {
  id: QuestId;
  title: string;
  description: string;
  type: "daily" | "room" | "trial";
  rewardIds: RewardId[];
};

export type Reward = {
  id: RewardId;
  title: string;
  statChanges?: Partial<PlayerStats>;
  ascensionPoints?: number;
  unlockRoomIds?: RoomId[];
};

export type UnlockRequirement =
  | {
      type: "ritualCompleted";
      ritualId: RitualId;
    }
  | {
      type: "bossDefeated";
      bossId: BossId;
    }
  | {
      type: "trialDayCompleted";
      day: number;
    };

export type JournalEntry = {
  id: string;
  ritualId?: RitualId;
  roomId?: RoomId;
  bossId?: BossId;
  prompt: string;
  response: string;
  createdAt: string;
};

export type PlayerState = {
  archetypeId?: ArchetypeId;
  currentDay: number;
  stats: PlayerStats;
  ascensionPoints: number;
  unlockedRooms: RoomId[];
  completedRituals: RitualId[];
  defeatedBosses: BossId[];
  completedQuests: QuestId[];
  journalEntries: JournalEntry[];
};
