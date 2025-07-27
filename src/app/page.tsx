'use client';

import { useState } from 'react';
import { BrainCircuit, RotateCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GamePanel } from '@/components/game-panel';
import { calculateBullsAndCows } from '@/lib/game-logic';
import type { Guess } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Home() {
  const [gameId, setGameId] = useState(1);
  const [player1Secret, setPlayer1Secret] = useState<string | null>(null);
  const [player2Secret, setPlayer2Secret] = useState<string | null>(null);
  const [player1Guesses, setPlayer1Guesses] = useState<Guess[]>([]);
  const [player2Guesses, setPlayer2Guesses] = useState<Guess[]>([]);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const handleNewGame = () => {
    setPlayer1Secret(null);
    setPlayer2Secret(null);
    setPlayer1Guesses([]);
    setPlayer2Guesses([]);
    setWinner(null);
    setGameId(prevId => prevId + 1);
  };

  const handleP1Guess = (guess: string) => {
    if (!player2Secret) return;
    const { bulls, cows } = calculateBullsAndCows(player2Secret, guess);
    setPlayer1Guesses(prev => [...prev, { guess, bulls, cows }]);
    if (bulls === 4) {
      setWinner(1);
    }
  };

  const handleP2Guess = (guess: string) => {
    if (!player1Secret) return;
    const { bulls, cows } = calculateBullsAndCows(player1Secret, guess);
    setPlayer2Guesses(prev => [...prev, { guess, bulls, cows }]);
    if (bulls === 4) {
      setWinner(2);
    }
  };
  
  return (
    <>
      <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
              NumberNet
            </h1>
          </div>
          <Button variant="outline" onClick={handleNewGame}>
            <RotateCw />
            New Game
          </Button>
        </header>

        <div className="flex-grow grid md:grid-cols-2 gap-8" key={gameId}>
          <GamePanel
            playerNumber={1}
            opponentPlayerNumber={2}
            onSetSecret={setPlayer1Secret}
            onGuess={handleP1Guess}
            mySecret={player1Secret}
            opponentSecretSet={!!player2Secret}
            guesses={player1Guesses}
            isGameOver={!!winner}
          />
          <GamePanel
            playerNumber={2}
            opponentPlayerNumber={1}
            onSetSecret={setPlayer2Secret}
            onGuess={handleP2Guess}
            mySecret={player2Secret}
            opponentSecretSet={!!player1Secret}
            guesses={player2Guesses}
            isGameOver={!!winner}
          />
        </div>
      </main>

       <AlertDialog open={!!winner}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trophy className="text-accent" />
              We have a winner!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Congratulations to Player {winner} for guessing the secret number!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNewGame}>
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
