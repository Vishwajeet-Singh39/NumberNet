export const calculateBullsAndCows = (secret: string, guess: string): { bulls: number; cows: number } => {
  let bulls = 0;
  let cows = 0;

  if (secret.length !== 4 || guess.length !== 4) {
    return { bulls: 0, cows: 0 };
  }

  const secretFreq: { [key: string]: number } = {};
  const guessFreq: { [key: string]: number } = {};
  
  const secretChars = secret.split('');
  const guessChars = guess.split('');

  // First pass for bulls and frequency counts of non-bulls
  for (let i = 0; i < secretChars.length; i++) {
    if (secretChars[i] === guessChars[i]) {
      bulls++;
    } else {
      secretFreq[secretChars[i]] = (secretFreq[secretChars[i]] || 0) + 1;
      guessFreq[guessChars[i]] = (guessFreq[guessChars[i]] || 0) + 1;
    }
  }

  // Second pass for cows
  for (const digit in guessFreq) {
    if (secretFreq[digit]) {
      cows += Math.min(guessFreq[digit], secretFreq[digit]);
    }
  }

  return { bulls, cows };
};
