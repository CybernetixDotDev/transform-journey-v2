# Transform Journey V2 - V1.1 Polish Notes

## What Changed From V1

V1.1 keeps the V1 local-first engine foundation intact and improves how the playable flow is presented to the player. The update focuses on navigation clarity, player guidance, copy consistency, and basic visual hierarchy across the current Expo Router screens.

The core loop remains:

Soul Scan -> 7-day initiation -> Library -> Rooms -> Rituals -> Bosses -> Quests -> Journal.

## Navigation Clarity Improvements

- Home now points players toward the next major area instead of acting only as a dev summary.
- Initiation, ritual, boss, room, library, quest, and journal screens use clearer primary navigation labels.
- Invalid or completed routes continue to recover through the existing safe fallbacks.
- Trial ritual and trial boss completion now guide the player back toward initiation progress.
- Library and room navigation uses clearer "Explore" language.

## Next Recommended Action Layer

- Home shows the player's current day and the next recommended action.
- Initiation highlights the current available day with a primary "Begin Day X" action.
- Trial ritual completion guides the player toward the next initiation day.
- Trial boss completion guides the player to continue the journey.
- Room screens use clearer primary actions for available rituals and bosses.

## Copy And Tone Pass

- Action language was normalized around "Begin", "Continue", "Face", and "Explore".
- Generic labels such as "Start" and "Return" were replaced where they affected player-facing flow.
- Initiation completion now uses the clearer message: "Your initiation is complete."
- Navigation labels were adjusted to feel more intentional while staying minimal.

## Visual Hierarchy Pass

- Primary CTAs are more visually prominent.
- Completion feedback boxes are clearer.
- Locked, available, and completed states are easier to distinguish.
- Section spacing and readability were improved across core screens.
- Section headings are more consistent across the V1 surface.

## What Did Not Change

- No engine logic changed.
- No domain types changed.
- No content registries changed.
- No Zustand store behavior changed.
- No persistence behavior changed.
- No AI was added.
- No backend, API calls, cloud sync, monetization, or social features were added.
- No new dependencies were added.
- No major redesign or animation system was introduced.

## Remaining Polish Ideas

- Replace plain React Native buttons with a small shared button component when the design system is ready.
- Add a shared screen layout component for consistent headers and spacing.
- Add clearer reward summaries with grouped stat, AP, unlock, sigil, and title sections.
- Add optional journal prompts to ritual and boss completion screens.
- Improve empty states with more specific next-step guidance.
- Add lightweight visual assets once the V1.1 flow is stable.
- Add screenshot-based manual QA notes for Expo Go mobile testing.
