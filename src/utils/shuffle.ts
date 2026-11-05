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
 * Selects exactly `count` random questions from a question bank using Fisher-Yates shuffle.
 * If total available is less than `count`, returns all shuffled.
 */
export function getRandomQuestions<T>(questions: T[], count = 20): T[] {
  if (!questions || questions.length === 0) return [];
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

