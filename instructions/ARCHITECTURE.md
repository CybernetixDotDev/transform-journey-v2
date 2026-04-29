# ARCHITECTURE — TRANSFORM JOURNEY V2

## High Level Structure

```
Content → State → Engines → Screens
```

---

## Folder Structure

```
src/
  domain/
    types.ts

  content/
    archetypes.ts
    rooms.ts
    rituals.ts
    bosses.ts
    quests.ts
    rewards.ts
    index.ts

  engine/
    soulScanEngine.ts
    unlockEngine.ts
    ritualEngine.ts
    bossEngine.ts
    questEngine.ts
    rewardEngine.ts
    progressionEngine.ts
    trialEngine.ts

  state/
    usePlayerStore.ts

  storage/
    persistence.ts

  services/
    innerGuideService.ts (stub)
    shareService.ts (optional)

  app/
    (expo router screens)
```

---

## 1. Domain Layer

Defines core types:

```ts
Archetype;
Room;
Ritual;
Boss;
Quest;
Reward;
PlayerState;
```

No logic here.

---

## 2. Content Layer

Static data only.

Example:

```ts
export const rooms = [
  {
    id: "threshold-chamber",
    ritualId: "breath-of-arrival",
    bossIds: [],
    unlockRequirements: [],
  },
];
```

No functions. No React.

---

## 3. State Layer

Global player state (Zustand recommended):

```ts
{
  archetypeId;
  currentDay;
  stats;
  unlockedRooms;
  completedRituals;
  defeatedBosses;
  quests;
  journalEntries;
}
```

---

## 4. Engine Layer

All logic lives here.

### Examples:

#### soulScanEngine

- calculates archetype

#### unlockEngine

- determines access

#### ritualEngine

- handles ritual flow

#### bossEngine

- handles boss completion

#### rewardEngine

- calculates rewards

#### progressionEngine

- manages leveling/stats

#### trialEngine

- controls 7-day flow

---

## 5. Storage Layer

Handles persistence:

```ts
savePlayerState();
loadPlayerState();
```

Use:

- AsyncStorage (mobile)

---

## 6. Service Layer

External or future systems:

- AI Guide (stubbed for now)
- Share/viral system

---

## 7. UI Layer (Expo Router)

Screens should:

- Read state
- Call engines
- Render UI

Never contain core logic.

---

## Data Flow

```
User Action
   ↓
Screen
   ↓
Engine
   ↓
State Update
   ↓
UI Re-render
```

---

## Key Rules

### 1. No Logic in Screens

Screens = UI only

### 2. No State in Content

Content = static

### 3. Engines Are Pure

Engines should be testable

### 4. Everything Goes Through State

No hidden side effects

---

## Example Flow

```
User completes ritual
→ ritualEngine.complete()
→ rewardEngine.apply()
→ state updates
→ UI reflects reward
```

---

## Future Extensions

- AI Guide plugs into service layer
- Multiplayer plugs into state layer
- Backend sync plugs into storage layer

---

## Final Principle

> Build systems that scale with complexity — not screens that break under it.
