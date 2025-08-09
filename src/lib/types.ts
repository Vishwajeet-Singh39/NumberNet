
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
  score: number;
}

export interface Game {
  id:string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished' | 'ready';
  winnerId?: string;
  turn: string; // Player ID of the current turn
  difficulty: number;
  resetRequestedBy?: string | null; // ID of player who requested a reset mid-game
  lastActivity: number;
  turnExpiresAt: number;
}
