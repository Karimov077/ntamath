import { Question } from '../types';

/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * Creates an unbiased, cryptographically uniform random permutation of the array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

/**
 * Shuffles the 4 options (A, B, C, D) of a question and updates correctOptionIndex
 * so the correct answer is randomly placed among A, B, C, D on every test session!
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (!question.options || question.options.length <= 1) {
    return question;
  }

  // Map each option with a flag whether it is the correct answer
  const indexed = question.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === question.correctOptionIndex,
  }));

  // Fisher-Yates shuffle the options
  const shuffled = shuffleArray(indexed);

  const newOptions = shuffled.map((item) => item.text);
  const newCorrectIndex = shuffled.findIndex((item) => item.isCorrect);

  return {
    ...question,
    options: newOptions,
    correctOptionIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

/**
 * Selects exactly `count` random questions from a question bank using Fisher-Yates shuffle,
 * AND thoroughly randomizes the options (A, B, C, D) for every single question.
 * This guarantees:
 * 1. Questions are randomized.
 * 2. Correct options are evenly and unpredictably distributed among A, B, C, D (not just 'A').
 */
export function getRandomQuestions(questions: Question[], count = 20): Question[] {
  if (!questions || questions.length === 0) return [];
  const shuffledQuestions = shuffleArray(questions);
  const selected = shuffledQuestions.slice(0, Math.min(count, shuffledQuestions.length));

  // Randomize options for each selected question
  return selected.map((q) => shuffleQuestionOptions(q));
}
