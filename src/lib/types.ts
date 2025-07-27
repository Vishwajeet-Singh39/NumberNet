export type DigitFeedback = 'correct' | 'present' | 'absent';

export interface Guess {
  guess: string;
  bulls: number;
  cows: number;
  feedback: DigitFeedback[];
}
