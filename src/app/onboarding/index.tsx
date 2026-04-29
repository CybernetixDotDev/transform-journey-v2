import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function OnboardingIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Begin Your Journey</Text>
      <Text style={styles.body}>
        Take a short Soul Scan to reveal your starting archetype.
      </Text>
      <Button
        title="Start Soul Scan"
        onPress={() => {
          router.push("./questions");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
  },
});
