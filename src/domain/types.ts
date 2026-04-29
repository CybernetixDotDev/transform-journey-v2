export type ArchetypeId =
  | "alchemist"
  | "architect"
  | "creator"
  | "healer"
  | "seer"
  | "warrior";

export type StatId =
  | "clarity"
  | "courage"
  | "selfWorth"
  | "boundaries"
  | "emotionalRegulation"
  | "compassion"
  | "creativity"
  | "discipline"
  | "intuition"
  | "presence";

export type Stats = Record<StatId, number>;

export type RoomId = string;
export type RitualId = string;
export type BossId = string;
export type QuestId = string;
export type RewardId = string;
export type SigilId = string;
export type TitleId = string;
export type JournalEntryId = string;

export type Reward = {
  readonly id: RewardId;
  readonly title: string;
  readonly description?: string;
  readonly statIncreases?: Partial<Stats>;
  readonly ascensionPoints?: number;
  readonly unlockRoomIds?: readonly RoomId[];
  readonly sigilIds?: readonly SigilId[];
  readonly titleIds?: readonly TitleId[];
  readonly unlockQuestIds?: readonly QuestId[];
};

export type UnlockRequirement =
  | {
      readonly type: "statMinimum";
      readonly statId: StatId;
      readonly minimum: number;
    }
  | {
      readonly type: "ascensionPointsMinimum";
      readonly minimum: number;
    }
  | {
      readonly type: "completedRitual";
      readonly ritualId: RitualId;
    }
  | {
      readonly type: "completedRoom";
      readonly roomId: RoomId;
    }
  | {
      readonly type: "defeatedBoss";
      readonly bossId: BossId;
    }
  | {
      readonly type: "trialDayMinimum";
      readonly day: number;
    }
  | {
      readonly type: "premiumRequired";
    };

export type Archetype = {
  readonly id: ArchetypeId;
  readonly name: string;
  readonly description: string;
  readonly coreWound?: string;
  readonly coreGift?: string;
  readonly startingStats: Stats;
};

export type Room = {
  readonly id: RoomId;
  readonly name: string;
  readonly description: string;
  readonly ritualIds: readonly RitualId[];
  readonly bossIds: readonly BossId[];
  readonly rewardIds: readonly RewardId[];
  readonly unlockRequirements: readonly UnlockRequirement[];
};

export type Ritual = {
  readonly id: RitualId;
  readonly title: string;
  readonly description: string;
  readonly roomId?: RoomId;
  readonly script: readonly string[];
  readonly journalPrompt: string;
  readonly rewardIds: readonly RewardId[];
};

export type Boss = {
  readonly id: BossId;
  readonly name: string;
  readonly description: string;
  readonly roomId?: RoomId;
  readonly reflectionPrompt: string;
  readonly rewardIds: readonly RewardId[];
  readonly unlockRequirements?: readonly UnlockRequirement[];
};

export type Quest = {
  readonly id: QuestId;
  readonly title: string;
  readonly description: string;
  readonly type: "daily" | "room" | "trial";
  readonly roomId?: RoomId;
  readonly ritualId?: RitualId;
  readonly bossId?: BossId;
  readonly rewardIds: readonly RewardId[];
  readonly unlockRequirements?: readonly UnlockRequirement[];
};

export type JournalEntry = {
  readonly id: JournalEntryId;
  readonly prompt: string;
  readonly response: string;
  readonly createdAt: string;
  readonly ritualId?: RitualId;
  readonly roomId?: RoomId;
  readonly bossId?: BossId;
  readonly questId?: QuestId;
};

export type TrialDay = {
  readonly day: number;
  readonly title: string;
  readonly theme: string;
  readonly description: string;
  readonly ritualId: RitualId;
  readonly questId?: QuestId;
  readonly bossId?: BossId;
  readonly rewardIds: readonly RewardId[];
  readonly unlockRoomIds?: readonly RoomId[];
};

export type GameEvent =
  | {
      readonly type: "archetypeAssigned";
      readonly archetypeId: ArchetypeId;
    }
  | {
      readonly type: "trialDayCompleted";
      readonly day: number;
    }
  | {
      readonly type: "roomUnlocked";
      readonly roomId: RoomId;
    }
  | {
      readonly type: "roomCompleted";
      readonly roomId: RoomId;
    }
  | {
      readonly type: "ritualCompleted";
      readonly ritualId: RitualId;
    }
  | {
      readonly type: "bossDefeated";
      readonly bossId: BossId;
    }
  | {
      readonly type: "questCompleted";
      readonly questId: QuestId;
    }
  | {
      readonly type: "journalEntryCreated";
      readonly journalEntryId: JournalEntryId;
    }
  | {
      readonly type: "rewardGranted";
      readonly rewardId: RewardId;
    };

export type PlayerState = {
  readonly archetypeId?: ArchetypeId;
  readonly currentDay: number;
  readonly stats: Stats;
  readonly ascensionPoints: number;
  readonly unlockedRooms: readonly RoomId[];
  readonly completedRooms: readonly RoomId[];
  readonly completedRituals: readonly RitualId[];
  readonly defeatedBosses: readonly BossId[];
  readonly completedQuests: readonly QuestId[];
  readonly activeQuests: readonly QuestId[];
  readonly journalEntries: readonly JournalEntry[];
  readonly sigils: readonly SigilId[];
  readonly titles: readonly TitleId[];
  readonly trialCompleted: boolean;
  readonly premiumUnlocked: boolean;
};
