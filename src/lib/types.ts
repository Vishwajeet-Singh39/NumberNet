
export type DigitFeedback = 'correct' | 'present' | 'absent';

export interface Guess {
  playerId: string;
  guess: string;
  bulls: number;
  cows: number;
  feedback: DigitFeedback[];
}

export interface Player {
  id: string;
  name: string;
  secretNumber?: string;
  guesses: Guess[];
}

export interface Game {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  winnerId?: string;
  turn: string; // Player ID of the current turn
  difficulty: number;
}
