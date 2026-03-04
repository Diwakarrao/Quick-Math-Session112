export type Operation = "+" | "-" | "×" | "÷";
export type Difficulty = "easy" | "medium" | "hard";

export interface QuizCard {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: Difficulty;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getOperands(difficulty: Difficulty, op: Operation): [number, number] {
  if (op === "÷") {
    if (difficulty === "easy") {
      const b = randInt(2, 9);
      const a = b * randInt(1, 9);
      return [a, b];
    } else if (difficulty === "medium") {
      const b = randInt(2, 9);
      const a = b * randInt(10, 19);
      return [a, b];
    } else {
      const b = randInt(2, 12);
      const a = b * randInt(10, 29);
      return [a, b];
    }
  }

  if (difficulty === "easy") {
    return [randInt(1, 9), randInt(1, 9)];
  } else if (difficulty === "medium") {
    return [randInt(10, 99), randInt(1, 9)];
  } else {
    return [randInt(10, 99), randInt(10, 99)];
  }
}

function compute(a: number, b: number, op: Operation): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return a / b;
  }
}

function generateDistractors(correct: number, count: number): number[] {
  const distractors = new Set<number>();
  let attempts = 0;
  while (distractors.size < count && attempts < 200) {
    attempts++;
    const delta = randInt(1, 10);
    const candidate = correct + (Math.random() < 0.5 ? delta : -delta);
    if (candidate !== correct && candidate >= 0 && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
  }
  while (distractors.size < count) {
    const fallback = correct + distractors.size + 1;
    distractors.add(fallback);
  }
  return Array.from(distractors);
}

const operations: Operation[] = ["+", "-", "×", "÷"];
const letterLabels = ["A", "B", "C", "D"];

export function generateQuizCard(difficulty: Difficulty = "easy"): QuizCard {
  const op = operations[randInt(0, 3)];
  const [a, b] = getOperands(difficulty, op);
  const correct = compute(a, b, op);
  const distractors = generateDistractors(correct, 3);

  const allOptions = [correct, ...distractors];
  const shuffled = allOptions.sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(correct);

  return {
    question: `${a} ${op} ${b} = ?`,
    options: shuffled.map((v, i) => `${letterLabels[i]}. ${v}`),
    correctIndex,
    difficulty,
  };
}

export function adaptDifficulty(
  current: Difficulty,
  responseTimeMs: number,
  wasCorrect: boolean
): Difficulty {
  if (wasCorrect && responseTimeMs < 8000) {
    if (current === "easy") return "medium";
    if (current === "medium") return "hard";
    return "hard";
  }
  if (!wasCorrect || responseTimeMs > 12000) {
    if (current === "hard") return "medium";
    if (current === "medium") return "easy";
    return "easy";
  }
  return current;
}
