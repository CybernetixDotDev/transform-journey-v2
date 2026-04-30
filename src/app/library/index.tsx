import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { rooms } from "@/content/rooms";
import { getProgressSummary } from "@/engine/progressionEngine";
import { canEnterRoom, getLockReasons } from "@/engine/unlockEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

export default function LibraryScreen() {
  const router = useRouter();
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );

  useEffect(() => {
    if (!hasHydrated) {
      void initializeFromStorage();
    }
  }, [hasHydrated, initializeFromStorage]);

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Library</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  if (!playerState) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Library</Text>
        <Text>Begin a Soul Scan before entering the Library.</Text>
        <Button
          title="Begin Soul Scan"
          onPress={() => {
            router.push("/onboarding");
          }}
        />
      </View>
    );
  }

  const progressSummary = getProgressSummary(playerState);
  const unlockedRooms = rooms.filter(
    (room) =>
      playerState.unlockedRooms.includes(room.id) ||
      canEnterRoom(playerState, room),
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Akashic Library</Text>
      <Text style={styles.title}>Rooms</Text>

      <View style={styles.summary}>
        <Text>Ascension Level: {progressSummary.ascensionLevel}</Text>
        <Text>AP: {progressSummary.ascensionPoints}</Text>
        <Text>Current Day: {playerState.currentDay}</Text>
        <Text>Completed Rooms: {progressSummary.completedRoomsCount}</Text>
        <Text>Available now: {unlockedRooms.length} rooms</Text>
      </View>

      {unlockedRooms.length === 0 ? (
        <Text>No rooms are currently unlocked. Continue the initiation.</Text>
      ) : (
        <Text>Choose an unlocked room to continue rituals or boss work.</Text>
      )}

      <View style={styles.rooms}>
        {rooms.map((room) => {
          const isUnlocked =
            playerState.unlockedRooms.includes(room.id) ||
            canEnterRoom(playerState, room);
          const isCompleted = playerState.completedRooms.includes(room.id);
          const lockReasons = isUnlocked
            ? []
            : getLockReasons(playerState, room.unlockRequirements);

          return (
            <View
              key={room.id}
              style={[
                styles.roomCard,
                isUnlocked ? styles.availableCard : styles.lockedCard,
                isCompleted ? styles.completedCard : null,
              ]}
            >
              <Text
                style={[
                  styles.roomStatus,
                  isUnlocked ? styles.availableStatus : styles.lockedStatus,
                  isCompleted ? styles.completedStatus : null,
                ]}
              >
                {isCompleted ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}
              </Text>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text>{room.description}</Text>

              {lockReasons.map((reason) => (
                <Text key={reason}>Lock: {reason}</Text>
              ))}

              {isUnlocked ? (
                <Button
                  title="Explore Room"
                  onPress={() => {
                    console.log(
                      `[UI] enter room button pressed intendedRoute=/library/${room.id} roomId=${room.id} currentDay=${playerState.currentDay} AP=${playerState.ascensionPoints}`,
                    );
                    router.push(`/library/${room.id}` as Href);
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <Button
        title="Continue Home"
        onPress={() => {
          router.replace("/");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 18,
    padding: 24,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  summary: {
    backgroundColor: "#f8f8f8",
    borderColor: "#aaa",
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  rooms: {
    gap: 14,
  },
  roomCard: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  availableCard: {
    backgroundColor: "#f6fbf7",
    borderColor: "#4f8f64",
  },
  completedCard: {
    backgroundColor: "#f7f7f7",
    borderColor: "#777",
  },
  lockedCard: {
    backgroundColor: "#fafafa",
    borderColor: "#ccc",
  },
  roomStatus: {
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  availableStatus: {
    color: "#2e6f40",
  },
  completedStatus: {
    color: "#555",
  },
  lockedStatus: {
    color: "#777",
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
});
