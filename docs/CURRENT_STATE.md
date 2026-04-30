# Transform Journey V2 - Current State

## Current Branch

`v1.1-polish`

## Latest Completed Milestones

- V1 engine scaffold completed across domain, content, engine, state, storage, and service layers.
- Static content registries implemented for archetypes, rooms, rituals, bosses, quests, and rewards.
- Core pure TypeScript engines implemented for Soul Scan, unlocks, rituals, bosses, quests, rewards, progression, and the 7-day trial.
- Local persistence implemented with AsyncStorage.
- Zustand player store implemented as the state coordination layer.
- Minimal playable Expo Router UI implemented for onboarding, initiation, rooms, rituals, bosses, quests, and journal.
- V1 acceptance tests and QA checklist added.
- V1 release snapshot added.
- V1.1 polish pass completed for navigation clarity, next recommended actions, copy/tone, and visual hierarchy.

## Playable Flow

The current app supports this local-first flow:

1. Begin Soul Scan.
2. Answer onboarding questions.
3. Receive archetype assignment.
4. Begin Day 1 ritual.
5. Continue through the 7-day initiation.
6. Complete trial rituals and the Day 6 boss encounter.
7. Complete Day 7 and unlock the wider Library.
8. Explore unlocked rooms.
9. Begin room rituals.
10. Face available bosses.
11. Complete quests.
12. Create journal entries.
13. Reload the app and continue from persisted local state.

## Screens Included

- `src/app/index.tsx` - Home and current objective summary.
- `src/app/onboarding/index.tsx` - Soul Scan entry.
- `src/app/onboarding/questions.tsx` - Soul Scan question flow.
- `src/app/onboarding/result.tsx` - Archetype result.
- `src/app/initiation/index.tsx` - 7-day initiation overview and current day CTA.
- `src/app/ritual/[ritualId].tsx` - Ritual detail, completion, and reward feedback.
- `src/app/library/index.tsx` - Library room list with locked/unlocked state.
- `src/app/library/[roomId].tsx` - Room detail with rituals and bosses.
- `src/app/boss/[bossId].tsx` - Boss encounter and completion feedback.
- `src/app/quests/index.tsx` - Active, locked, and completed quests.
- `src/app/journal/index.tsx` - Journal entry creation and journal list.

## Engines Included

- `src/engine/soulScanEngine.ts` - Archetype calculation and initial player state.
- `src/engine/unlockEngine.ts` - Unlock requirement evaluation and lock reasons.
- `src/engine/rewardEngine.ts` - Reward application and reward lookup helpers.
- `src/engine/ritualEngine.ts` - Ritual start, completion, and progress.
- `src/engine/bossEngine.ts` - Boss readiness, defeat, and status.
- `src/engine/questEngine.ts` - Quest assignment, completion, and static quest selection.
- `src/engine/trialEngine.ts` - 7-day initiation progression.
- `src/engine/progressionEngine.ts` - Ascension level, primary stat, and progress summary.

## Persistence Model

- Player progress is local-first.
- `src/storage/persistence.ts` stores and loads `PlayerState` through AsyncStorage.
- The Zustand store hydrates from local persistence on app startup.
- Store actions call engines, update `playerState`, and save the updated state.
- There is no backend, cloud sync, account system, or remote persistence in V1/V1.1.

## Navigation Rules

- New users begin at Home and are routed to Soul Scan onboarding.
- Completed onboarding creates a player state and routes into the Day 1 ritual.
- Trial rituals return players to initiation progress.
- Trial boss completion returns players to initiation progress.
- Library routes use `/library` and `/library/[roomId]`.
- Invalid room, ritual, and boss routes recover through safe fallback navigation.
- Direct URL access is guarded by hydration and missing-content checks.
- Screens use one clear primary navigation path where possible.

## Current UX Improvements

- Home shows a next recommended action based on current player state.
- Initiation highlights the current available day with a primary CTA.
- Trial completion screens guide players toward the next step.
- Copy now uses more consistent action language: Begin, Continue, Face, Explore.
- Initiation completion uses the clearer message: "Your initiation is complete."
- Completion feedback boxes are more prominent.
- Locked, available, and completed states are visually easier to distinguish.
- Spacing, headings, and card readability were improved across the V1 screens.

## Known Limitations

- UI is still intentionally minimal and not final product polish.
- Buttons use basic React Native `Button` components.
- No shared design system or reusable screen layout exists yet.
- Ritual and boss reflection inputs are not fully developed.
- Rewards are shown in simple text form.
- Quest selection is static and deterministic, not personalized by AI.
- Content is placeholder-quality and needs narrative expansion.
- Journal entries are simple local text entries.
- No onboarding skip/restart UX beyond reset journey.

## Open Risks

- Dynamic routes require continued care as more rooms, rituals, and bosses are added.
- Copy and content scale may become inconsistent without content guidelines.
- Screen-level reward summaries duplicate some presentation patterns and may benefit from shared UI components later.
- Local-only persistence means deleting app data removes progress.
- Acceptance tests cover core flows but do not yet exercise rendered UI interactions.
- Expo Go compatibility should be rechecked when SDK or dependencies change.

## Recommended Next Development Options

1. Add a small shared UI component layer for buttons, section headers, cards, state badges, and completion boxes.
2. Expand manual QA with Expo Go screenshots and direct-route recovery checks.
3. Improve ritual and boss reflection UX while keeping all game logic in engines and store actions.
4. Add more acceptance coverage for navigation-adjacent state cases.
5. Expand placeholder content into stronger V1 narrative content.
6. Add lightweight UI tests after the screen structure stabilizes.
7. Prepare an AI integration plan for the future Inner Guide service without implementing AI yet.
