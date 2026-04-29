# PROJECT CONTEXT — TRANSFORM JOURNEY V2

## Overview

Transform Journey V2 is a **cinematic self-transformation game** built using:

- React Native (Expo)
- TypeScript
- Expo Router
- Local-first architecture (AI added later)

The system is designed as a **modular game engine**, not a collection of screens.

---

## Core Concept

The user progresses through an inner world called the **Akashic Library**, where they:

- Discover their **Archetype**
- Explore symbolic **Rooms**
- Complete guided **Rituals**
- Confront emotional **Bosses**
- Earn **Stats, Rewards, and Progression**

---

## Core Loop

```
Soul Scan → Archetype → 7 Day Initiation → Library →
Room → Ritual → Boss → Reward → Quest → Repeat
```

After Day 7:

```
Room → AI Guide → Ritual → Reflection → Boss → Insight → Progression
```

---

## Design Philosophy

### 1. Engine First

- All logic lives in reusable engines
- UI only renders state

### 2. Data Driven

- All content comes from registries (no hardcoding)
- Adding new rooms/rituals = adding data, not logic

### 3. Modular Systems

- Archetypes, Rooms, Rituals, Bosses, Quests are independent systems
- Systems communicate via shared state

### 4. Local First

- App works fully without backend
- AI is an enhancement, not a dependency

---

## Key Systems

- Archetype System
- Room System
- Ritual System
- Boss System
- Quest System
- Reward System
- Progression System
- Trial (7-day) System
- AI Guide System (post-MVP)

---

## Non Goals (V1)

- No multiplayer
- No real-time sync
- No complex animations
- No heavy backend
- No AI dependency in core loop

---

## Long Term Vision

- AI Inner Guide
- Dynamic quests
- Personalized journeys
- Expansion packs (rooms, rituals, archetypes)
- Social + viral loops

---

## Guiding Principle

> “The engine must work before the experience becomes beautiful.”

This project is not a UI project.
It is a **game engine for transformation**.
