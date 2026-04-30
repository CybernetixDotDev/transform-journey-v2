import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { bosses } from "@/content/bosses";
import { rituals } from "@/content/rituals";
import { rooms } from "@/content/rooms";
import { getBossStatus } from "@/engine/bossEngine";
import { canEnterRoom, getLockReasons } from "@/engine/unlockEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

export default function RoomDetailScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const playerState = usePlayerStore((state) => state.playerState);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);
  const initializeFromStorage = usePlayerStore(
    (state) => state.initializeFromStorage,
  );
  const room = rooms.find((candidate) => candidate.id === roomId);

  useEffect(() => {
    if (!hasHydrated) {
      void initializeFromStorage();
    }
  }, [hasHydrated, initializeFromStorage]);

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Room</Text>
        <Text>Loading saved journey...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Room Not Found</Text>
        <Button
          title="Return to Library"
          onPress={() => {
            router.replace("/library/index");
          }}
        />
      </View>
    );
  }

  if (!playerState) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{room.name}</Text>
        <Text>Begin a Soul Scan before entering this room.</Text>
        <Button
          title="Begin Soul Scan"
          onPress={() => {
            router.push("/onboarding");
          }}
        />
      </View>
    );
  }

  const isUnlocked =
    playerState.unlockedRooms.includes(room.id) || canEnterRoom(playerState, room);
  const lockReasons = isUnlocked
    ? []
    : getLockReasons(playerState, room.unlockRequirements);
  const roomRituals = room.ritualIds
    .map((ritualId) => rituals.find((ritual) => ritual.id === ritualId))
    .filter((ritual): ritual is (typeof rituals)[number] => ritual !== undefined);
  const roomBosses = room.bossIds
    .map((bossId) => bosses.find((boss) => boss.id === bossId))
    .filter((boss): boss is (typeof bosses)[number] => boss !== undefined);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Library Room</Text>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.body}>{room.description}</Text>

      {!isUnlocked ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locked</Text>
          {lockReasons.map((reason) => (
            <Text key={reason}>Lock: {reason}</Text>
          ))}
          <Button
            title="Return to Library"
            onPress={() => {
              router.replace("/library/index");
            }}
          />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rituals</Text>
            {roomRituals.length > 0 ? (
              roomRituals.map((ritual) => {
                const isCompleted = playerState.completedRituals.includes(
                  ritual.id,
                );

                return (
                  <View key={ritual.id} style={styles.actionCard}>
                    <Text style={styles.actionTitle}>{ritual.title}</Text>
                    <Text>{ritual.description}</Text>
                    <Text>{isCompleted ? "Completed" : "Available"}</Text>
                    {!isCompleted ? (
                      <Button
                        title="Start Ritual"
                        onPress={() => {
                          router.push(`/ritual/${ritual.id}` as Href);
                        }}
                      />
                    ) : null}
                  </View>
                );
              })
            ) : (
              <Text>No rituals are registered for this room.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bosses</Text>
            {roomBosses.length > 0 ? (
              roomBosses.map((boss) => {
                const bossStatus = getBossStatus(playerState, boss.id);

                return (
                  <View key={boss.id} style={styles.actionCard}>
                    <Text style={styles.actionTitle}>{boss.name}</Text>
                    <Text>{boss.description}</Text>
                    <Text>
                      {bossStatus.isDefeated
                        ? "Defeated"
                        : bossStatus.canConfront
                          ? "Available"
                          : "Locked"}
                    </Text>
                    {bossStatus.lockReasons.map((reason) => (
                      <Text key={reason}>Requirement: {reason}</Text>
                    ))}
                    {bossStatus.canConfront ? (
                      <Button
                        title="Start Boss Encounter"
                        onPress={() => {
                          router.push(`/boss/${boss.id}` as Href);
                        }}
                      />
                    ) : null}
                  </View>
                );
              })
            ) : (
              <Text>No bosses are registered for this room.</Text>
            )}
          </View>

          <Button
            title="Return to Library"
            onPress={() => {
              router.replace("/library/index");
            }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
  },
  eyebrow: {
    fontSize: 14,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  actionCard: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
