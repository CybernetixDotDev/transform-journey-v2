# V1 QA Checklist

Use this checklist for manual Expo Go testing before calling V1 stable.

## New Player Full Onboarding

- Launch the app with no saved journey.
- Confirm Home shows "Begin your first Soul Scan."
- Tap "Begin Soul Scan."
- Complete all Soul Scan questions.
- Confirm the result screen shows an archetype.
- Tap Continue.
- Confirm the app opens the Breath of Arrival ritual.

## 7-Day Initiation Progression

- Complete Day 1 Breath of Arrival.
- Confirm completion feedback shows AP, stat changes, rewards, and next day.
- Return to Initiation.
- Confirm Day 1 is completed and Day 2 is unlocked.
- Continue through Days 2-5 using the current ritual CTA.
- On Day 6, confirm the current boss CTA appears.
- Defeat the Day 6 boss and confirm Day 7 unlocks.
- Complete Day 7 and confirm the initiation shows complete.

## Room Lock/Unlock Behavior

- Open Library early in the journey.
- Confirm locked rooms show lock reasons.
- Confirm only unlocked rooms have Enter Room actions.
- Try entering an unlocked room and starting an available ritual.
- Confirm direct locked-room rituals cannot be completed.
- After rewards unlock rooms, reload the app and confirm the room status remains.

## Boss Defeat Behavior

- Open a room with a boss before requirements are met.
- Confirm the boss shows Locked and lists requirements.
- Complete the required ritual.
- Return to the room and confirm Start Boss Encounter appears.
- Attempt the encounter.
- Confirm AP, rewards, stat changes, and unlocks are shown.
- Reload the app and confirm the boss remains defeated.

## Quest Completion

- Open Quests.
- Confirm active/available, locked, and completed sections render.
- Complete an available quest.
- Confirm reward/progression feedback appears.
- Confirm the quest moves to Completed.
- Reload the app and confirm quest completion and rewards persist.

## Journal Creation

- Open Journal.
- Confirm empty state appears when there are no entries.
- Add a manual journal entry.
- Confirm the entry appears at the top of the list.
- Reload the app and confirm the entry persists.

## App Reload Persistence

- Complete at least one ritual, one boss, one quest, and one journal entry.
- Fully close and reopen Expo Go.
- Confirm Home shows the same day, AP, rooms, rituals, bosses, quests, and journal counts.
- Reopen Initiation, Library, Quests, and Journal.
- Confirm all completed and locked states match the saved journey.
