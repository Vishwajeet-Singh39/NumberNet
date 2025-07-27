
import type { DigitFeedback } from "./types";

export const calculateBullsAndCows = (secret: string, guess: string): { bulls: number; cows: number; feedback: DigitFeedback[] } => {
  let bulls = 0;
  let cows = 0;
  const numDigits = secret.length;
  const feedback: DigitFeedback[] = Array(numDigits).fill('absent');

  if (guess.length !== numDigits) {
    return { bulls: 0, cows: 0, feedback: [] };
  }

  const secretFreq: { [key: string]: number } = {};
  const guessChars = guess.split('');
  const secretChars = secret.split('');

  // First pass for bulls (correct digit in correct position)
  for (let i = 0; i < numDigits; i++) {
    if (guessChars[i] === secretChars[i]) {
      bulls++;
      feedback[i] = 'correct';
    } else {
      // Store frequency of non-bull secret digits
      secretFreq[secretChars[i]] = (secretFreq[secretChars[i]] || 0) + 1;
    }
  }

  // Second pass for cows (correct digit in wrong position)
  for (let i = 0; i < numDigits; i++) {
    if (feedback[i] !== 'correct') { // Only check non-bulls
      if (secretFreq[guessChars[i]] && secretFreq[guessChars[i]] > 0) {
        cows++;
        feedback[i] = 'present';
        secretFreq[guessChars[i]]--; // Decrement frequency to avoid double counting
      }
    }
  }

  return { bulls, cows, feedback };
};
