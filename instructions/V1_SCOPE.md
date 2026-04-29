# V1 SCOPE — TRANSFORM JOURNEY V2

## Goal

Build a **fully playable foundation** of the game without AI.

The user must be able to:

- Complete onboarding
- Play through the 7-day initiation
- Enter rooms
- Complete rituals
- Defeat a boss
- Earn rewards
- Progress through the library

---

## Included in V1

### 1. Onboarding

- Soul Scan (basic version)
- Archetype assignment
- Initial stat setup

---

### 2. 7 Day Initiation

Each day includes:

- Entry screen
- Ritual
- Stat gain
- Micro quest
- Unlock

Days:

1. Threshold (Arrival)
2. Pattern (Awareness)
3. Origin (Compassion)
4. Shadow (Courage)
5. Archetype Activation
6. First Boss
7. Breakthrough + Library Unlock

---

### 3. Library (Basic)

- List of rooms (no advanced visuals)
- Locked / unlocked state
- Simple navigation

---

### 4. Rooms (Minimal)

Each room includes:

- Description
- Ritual
- Optional boss
- Reward

---

### 5. Ritual System

- Script display
- Journal input
- Completion trigger
- Reward

---

### 6. Journal System

- Save entries locally
- Link to rituals/rooms

---

### 7. Boss System (Basic)

- Boss description
- Reflection prompt
- Completion → reward

---

### 8. Rewards

- Stats
- Ascension Points (AP)
- Unlocks

---

### 9. Quest System (Simple)

- Daily quest
- Room quest
- Completion tracking

---

### 10. Persistence

- Local storage (AsyncStorage)
- Save/load player state

---

## Excluded from V1

- AI Guide
- AI reflections
- AI-generated quests
- Complex animations
- Social features
- Monetization logic
- Cloud sync

---

## Success Criteria

V1 is complete when:

- User can go from **start → Day 7 → Library**
- User can **enter rooms and complete rituals**
- User can **earn rewards and progress**
- System is **stable and extendable**

---

## Engineering Priority

1. State
2. Engines
3. Content
4. Screens
5. Polish

---

## Guiding Rule

> If it doesn’t affect the core loop, it’s not V1.
