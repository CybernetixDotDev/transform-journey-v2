# AGENTS.md — Transform Journey V2

## Purpose

This file defines how AI agents (Codex) must operate in this repository.

The goal is to ensure:

- Consistent architecture
- Safe incremental changes
- No uncontrolled generation of UI or logic
- Alignment between engine, content, and experience design

---

## 📌 REQUIRED CONTEXT

Before making any changes, ALWAYS read:

- instructions/PROJECT_CONTEXT.md
- instructions/V1_SCOPE.md
- instructions/ARCHITECTURE.md
- docs/DEPTH_DESIGN.md

Do not proceed if these are not understood.

---

## 🧠 PROJECT TYPE

This is NOT a standard app.

This is a:

> **Game engine for a cinematic self-transformation system**

The system is:

- Data-driven
- Engine-driven
- Local-first (no backend dependency)
- Modular and extensible

---

## 🏗 ARCHITECTURE RULES (STRICT)

### Folder Responsibilities

- `src/domain`
  - Types only
  - No logic
  - No React

- `src/content`
  - Static data only
  - No functions (except exports)
  - No React

- `src/engine`
  - Pure logic only
  - No React
  - No side effects
  - No storage access

- `src/state`
  - Zustand store only
  - Coordinates engines
  - No heavy logic duplication

- `src/storage`
  - Persistence layer only
  - AsyncStorage usage

- `src/services`
  - External integrations (AI, sharing)
  - Can be stubbed in V1

- `src/app`
  - Expo Router screens only
  - No business logic

---

## 🚫 HARD CONSTRAINTS

DO NOT:

- Add UI unless explicitly requested
- Add animations or styling systems
- Add backend / APIs / cloud sync
- Add AI logic (only stubs allowed)
- Mix responsibilities between folders
- Put logic inside screens
- Mutate state inside engines

---

## ✅ DEVELOPMENT ORDER (MANDATORY)

Always build in this sequence:

1. Domain types
2. Content registries
3. Engine logic
4. State store
5. Persistence
6. Test harness (basic screen)
7. UI (only when requested)
8. AI (post-V1)

---

## 🔧 CODING RULES

### General

- Use TypeScript strictly
- Prefer pure functions
- Avoid side effects
- Keep functions small and focused

### Engines

- Must be deterministic
- Must not depend on React
- Must not directly modify state
- Must return new values

### State

- Use Zustand
- All mutations go through store actions
- Store calls engines for logic

---

## 🧪 VALIDATION BEFORE COMPLETION

Before finishing any task:

1. Ensure TypeScript compiles
2. Ensure no architecture rules are violated
3. Ensure no unintended files were modified
4. Ensure scope is minimal and focused

---

## 📦 CHANGE BEHAVIOR

When making changes:

- Only modify what is explicitly requested
- Do not refactor unrelated code
- Do not introduce new abstractions unless necessary
- Prefer extending existing structure

---

## 🧾 RESPONSE FORMAT

After completing a task, ALWAYS:

1. List files changed
2. Briefly explain what was implemented
3. Confirm adherence to architecture rules

---

## 🧭 V1 SCOPE REMINDER

V1 must support:

- Soul Scan
- 7-day initiation
- Rooms
- Rituals
- Bosses
- Rewards
- Quests
- Progression

WITHOUT:

- AI
- Backend
- Social features

---

## 🔮 FUTURE (DO NOT IMPLEMENT NOW)

Planned but not part of V1:

- AI Inner Guide
- Dynamic quests
- Monetization
- Multiplayer
- Cloud sync

---

## ⚠️ FAILURE CONDITIONS

If any of the following occur, STOP and ask for clarification:

- Task requires UI but UI was not requested
- Task conflicts with architecture
- Task introduces backend or AI unexpectedly
- Task requires changing multiple unrelated systems

---

## 🧠 FINAL PRINCIPLE

> Build systems that scale. Not screens that break.

This project succeeds if:

- The engine is solid
- The systems are reusable
- The structure remains clean

Everything else comes later.

---

# 🎭 CONTENT & DESIGN CONSTRAINTS

All new features and content must follow `DEPTH_DESIGN.md`.

Rules:

- Do not invent new archetypes without mapping to existing system
- Do not create rituals without psychological purpose
- Do not create bosses as enemies; they are symbolic loops
- Do not introduce random progression mechanics
- Preserve the 7-day initiation arc structure
- Keep all content deterministic in V1/V1.1

When unsure:

- Prefer simplicity over expansion
- Prefer meaning over features

---

## 🧾 CONTENT IMPLEMENTATION RULES

When implementing or updating content:

- All narrative must come from `DEPTH_DESIGN.md`
- Map narrative → content files:
  - `rituals.ts` → scripts + prompts
  - `bosses.ts` → descriptions + confrontation prompts
  - `rooms.ts` → symbolic meaning + structure
  - `archetypes.ts` → identity + stats + tone
  - `quests.ts` → real-world micro-actions

Do not:

- Invent new IDs unless necessary
- Break existing routes or references
- Place narrative directly in UI screens

Always:

- Keep content deterministic
- Keep content concise and in-app appropriate
- Ensure content matches psychological purpose

---

## 🧭 NAVIGATION & FLOW RULES

Navigation must follow established gameplay loops:

- Trial rituals → `/initiation`
- Trial boss → `/initiation`
- Room rituals → `/library/[roomId]`
- Boss encounters → `/library/[roomId]`

After any action:

- Always provide a clear **Next Recommended Action**
- Maintain a single primary CTA

Do not:

- Introduce new navigation patterns
- Break existing loops
- Create ambiguous progression paths

Flow consistency is critical.

---

## ⚖️ CONTENT VS ENGINE BOUNDARY

- Engines define WHAT happens (logic, progression, rewards)
- Content defines WHY it matters (meaning, narrative, prompts)

Rules:

- Do not move logic into content
- Do not move narrative into engines
- Do not make engines depend on narrative text
- Do not make content depend on runtime state

Content must remain:

- Static
- Declarative
- Replaceable without breaking systems

This ensures safe future AI integration.

---

## 🧠 FINAL SYSTEM PRINCIPLE

> The engine drives progression.  
> The content gives it meaning.  
> The UI guides the player.

All three must remain cleanly separated.
