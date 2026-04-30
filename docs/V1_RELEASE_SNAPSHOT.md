# Transform Journey V2 - V1 Release Snapshot

## Architecture Summary

Transform Journey V2 V1 is a local-first Expo, React Native, TypeScript, and Expo Router app built around an engine-driven game architecture.

- `src/domain`: shared TypeScript domain types only.
- `src/content`: static registries for archetypes, rooms, rituals, bosses, quests, and rewards.
- `src/engine`: pure deterministic game logic for Soul Scan, unlocks, rewards, rituals, bosses, quests, progression, and the 7-day trial.
- `src/state`: Zustand player store coordinating engines and persistence.
- `src/storage`: AsyncStorage persistence for local player state.
- `src/services`: future integration boundary, currently only deterministic placeholders.
- `src/app`: thin Expo Router screens that render state and call store actions.

The app is data-driven: new gameplay content should generally be added through content registries, not screen logic.

## Playable Flow

Current V1 flow:

1. Home
2. Soul Scan onboarding
3. Archetype result
4. Day 1 Breath of Arrival ritual
5. 7-Day Initiation
6. Library / Rooms
7. Room rituals
8. Boss encounters
9. Quests
10. Journal

The player can create a local journey, progress through initiation days, unlock rooms, complete rituals, defeat bosses, complete quests, write journal entries, and reload persisted state.

## Core Loops

Primary V1 loop:

```text
Soul Scan -> Archetype -> 7-Day Initiation -> Library -> Room -> Ritual -> Boss -> Reward -> Quest -> Progression
```

Local persistence loop:

```text
Store action -> Engine result -> PlayerState update -> AsyncStorage save -> Reload restores PlayerState
```

Content loop:

```text
Content registry -> Engine evaluation -> Store mutation -> Screen render
```

## Screens Included

- `/`: Home and current objective summary.
- `/onboarding`: Soul Scan entry.
- `/onboarding/questions`: Soul Scan questions.
- `/onboarding/result`: Archetype reveal.
- `/initiation`: 7-day initiation overview and current-day CTA.
- `/ritual/[ritualId]`: Ritual detail, completion, reward feedback.
- `/library`: Room list with locked/unlocked status.
- `/library/[roomId]`: Room detail with ritual and boss actions.
- `/boss/[bossId]`: Boss encounter, readiness, completion feedback.
- `/quests`: Active/available, locked, and completed quests.
- `/journal`: Journal list and manual journal entry creation.

## Engines Included

- `soulScanEngine`: archetype calculation and initial player state creation.
- `unlockEngine`: unlock requirement checks and lock reasons.
- `rewardEngine`: reward application and reward composition.
- `ritualEngine`: ritual session and completion logic.
- `bossEngine`: boss readiness and defeat logic.
- `questEngine`: quest assignment, completion, and static quest selection.
- `trialEngine`: 7-day initiation progression.
- `progressionEngine`: ascension level and progress summaries.

## Persistence Model

Persistence is local-only.

- Player state is stored in AsyncStorage.
- Storage key: `transformJourneyV2.playerState`.
- `savePlayerState`, `loadPlayerState`, and `clearPlayerState` are the persistence boundary.
- Zustand store actions save updated state after gameplay mutations.
- No backend, account system, remote sync, or cloud recovery exists in V1.

## Acceptance Test Coverage

Automated V1 acceptance tests live in:

- `tests/v1-acceptance-tests.cjs`

Covered cases:

- Soul Scan creates a valid player state.
- Completing a trial ritual advances the day.
- Completing a trial boss advances the day.
- Locked rooms block guarded ritual completion.
- Duplicate ritual completion is prevented.
- Quest completion persists rewards.
- Journal entry creation persists.
- Reloaded state remains consistent.

Manual QA checklist:

- `docs/V1_QA_CHECKLIST.md`

## Known Limitations

- UI is intentionally minimal and not release-polished.
- Dynamic route navigation still uses narrow route casts for concrete dynamic paths where Expo Router typed routes expect pattern paths.
- Journal creation is basic text-only.
- Boss encounters are deterministic completion actions, not interactive battles.
- Quest generation is static and registry-based.
- Room completion is currently derived through trial progression and content state rather than a dedicated room completion UI.
- No analytics, crash reporting, onboarding polish, accessibility pass, or app store readiness work has been completed.

## Explicit V1 Non-Goals

- No AI.
- No backend.
- No cloud sync.
- No monetization.
- No multiplayer or social features.
- No app store release polish yet.
