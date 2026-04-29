import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PlayerState } from "@/domain/types";

export type PersistedPlayerState = PlayerState;

const PLAYER_STATE_STORAGE_KEY = "transformJourneyV2.playerState";

export async function savePlayerState(
  playerState: PlayerState,
): Promise<void> {
  await AsyncStorage.setItem(
    PLAYER_STATE_STORAGE_KEY,
    JSON.stringify(playerState),
  );
}

export async function loadPlayerState(): Promise<PlayerState | null> {
  const savedState = await AsyncStorage.getItem(PLAYER_STATE_STORAGE_KEY);

  if (!savedState) {
    return null;
  }

  try {
    return JSON.parse(savedState) as PlayerState;
  } catch {
    return null;
  }
}

export async function clearPlayerState(): Promise<void> {
  await AsyncStorage.removeItem(PLAYER_STATE_STORAGE_KEY);
}
