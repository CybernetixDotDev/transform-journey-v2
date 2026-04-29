import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

import type { ArchetypeId } from "@/domain/types";
import {
  calculateArchetype,
  type SoulScanAnswer,
} from "@/engine/soulScanEngine";
import { usePlayerStore } from "@/state/usePlayerStore";

type SoulScanOption = {
  readonly label: string;
  readonly archetypeScores: Partial<Record<ArchetypeId, number>>;
};

type SoulScanQuestion = {
  readonly prompt: string;
  readonly options: readonly SoulScanOption[];
};

const QUESTIONS: readonly SoulScanQuestion[] = [
  {
    prompt: "When life feels uncertain, what do you reach for first?",
    options: [
      {
        label: "A clear plan",
        archetypeScores: { architect: 3, warrior: 1 },
      },
      {
        label: "A deeper meaning",
        archetypeScores: { seer: 3, alchemist: 1 },
      },
      {
        label: "A compassionate pause",
        archetypeScores: { healer: 3, alchemist: 1 },
      },
      {
        label: "A creative response",
        archetypeScores: { creator: 3, alchemist: 1 },
      },
    ],
  },
  {
    prompt: "Which inner strength feels most alive in you right now?",
    options: [
      {
        label: "Turning pain into wisdom",
        archetypeScores: { alchemist: 3, seer: 1 },
      },
      {
        label: "Protecting what matters",
        archetypeScores: { warrior: 3, architect: 1 },
      },
      {
        label: "Restoring what is wounded",
        archetypeScores: { healer: 3, alchemist: 1 },
      },
      {
        label: "Making something new",
        archetypeScores: { creator: 3, seer: 1 },
      },
    ],
  },
  {
    prompt: "What kind of breakthrough are you seeking?",
    options: [
      {
        label: "More discipline and structure",
        archetypeScores: { architect: 3, warrior: 1 },
      },
      {
        label: "More intuition and clarity",
        archetypeScores: { seer: 3, healer: 1 },
      },
      {
        label: "More courage and boundaries",
        archetypeScores: { warrior: 3, architect: 1 },
      },
      {
        label: "More expression and vitality",
        archetypeScores: { creator: 3, alchemist: 1 },
      },
    ],
  },
];

export default function OnboardingQuestions() {
  const router = useRouter();
  const startNewJourney = usePlayerStore((state) => state.startNewJourney);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SoulScanAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<SoulScanOption | null>(
    null,
  );

  const question = QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;

  async function handleNext() {
    if (!selectedOption) {
      return;
    }

    const nextAnswers = [...answers, selectedOption];

    if (isLastQuestion) {
      const archetypeId = calculateArchetype(nextAnswers);

      await startNewJourney(archetypeId);
      router.replace("./result");
      return;
    }

    setAnswers(nextAnswers);
    setSelectedOption(null);
    setQuestionIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.step}>
        Question {questionIndex + 1} of {QUESTIONS.length}
      </Text>
      <Text style={styles.title}>{question.prompt}</Text>

      <View style={styles.options}>
        {question.options.map((option) => {
          const isSelected = selectedOption?.label === option.label;

          return (
            <Pressable
              key={option.label}
              onPress={() => {
                setSelectedOption(option);
              }}
              style={[styles.option, isSelected && styles.selectedOption]}
            >
              <Text>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={isLastQuestion ? "Finish" : "Next"}
        disabled={!selectedOption}
        onPress={() => {
          void handleNext();
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
  step: {
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  options: {
    gap: 10,
  },
  option: {
    borderColor: "#999",
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
  },
  selectedOption: {
    backgroundColor: "#e8eefc",
    borderColor: "#3454d1",
  },
});
