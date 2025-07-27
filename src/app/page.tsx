
'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, RotateCcw, RotateCw, Trophy, User, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GamePanel } from '@/components/game-panel';
import { calculateBullsAndCows } from '@/lib/game-logic';
import type { Guess } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Scoreboard } from '@/components/scoreboard';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
  const [gameId, setGameId] = useState(1);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [namesSet, setNamesSet] = useState(false);
  const [digitCount, setDigitCount] = useState(4);
  const [player1Secret, setPlayer1Secret] = useState<string | null>(null);
  const [player2Secret, setPlayer2Secret] = useState<string | null>(null);
  const [player1Guesses, setPlayer1Guesses] = useState<Guess[]>([]);
  const [player2Guesses, setPlayer2Guesses] = useState<Guess[]>([]);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);

  useEffect(() => {
    if (winner === 1) {
      setPlayer1Score(prev => prev + 1);
    } else if (winner === 2) {
      setPlayer2Score(prev => prev + 1);
    }
  }, [winner]);

  const resetRound = () => {
    setPlayer1Secret(null);
    setPlayer2Secret(null);
    setPlayer1Guesses([]);
    setPlayer2Guesses([]);
    setWinner(null);
    setGameId(prevId => prevId + 1);
    setCurrentPlayer(1);
  };
  
  const handleNewGame = () => {
    resetRound();
    setNamesSet(false);
    setPlayer1Name('');
    setPlayer2Name('');
    setPlayer1Score(0);
    setPlayer2Score(0);
  };
  
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (player1Name && player2Name) {
      setNamesSet(true);
    }
  }

  const handleP1Guess = (guess: string) => {
    if (!player2Secret) return;
    const { bulls, cows, feedback } = calculateBullsAndCows(player2Secret, guess);
    setPlayer1Guesses(prev => [...prev, { guess, bulls, cows, feedback }]);
    if (bulls === digitCount) {
      setWinner(1);
    } else {
      setCurrentPlayer(2);
    }
  };

  const handleP2Guess = (guess: string) => {
    if (!player1Secret) return;
    const { bulls, cows, feedback } = calculateBullsAndCows(player1Secret, guess);
    setPlayer2Guesses(prev => [...prev, { guess, bulls, cows, feedback }]);
    if (bulls === digitCount) {
      setWinner(2);
    } else {
      setCurrentPlayer(1);
    }
  };
  
  const renderNameInput = () => (
    <div className="flex justify-center items-center flex-grow">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl"><User />Enter Player Names</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStartGame} className="flex flex-col items-center gap-4">
            <Input 
              type="text"
              placeholder="Player 1 Name" 
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              required
              className="flex-grow"
            />
            <Input 
              type="text"
              placeholder="Player 2 Name" 
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              required
              className="flex-grow"
            />
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="difficulty">Difficulty (Number Length)</Label>
               <Select value={String(digitCount)} onValueChange={(value) => setDigitCount(Number(value))}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => i + 4).map(num => (
                    <SelectItem key={num} value={String(num)}>{num} Digits</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Start Game</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <>
      <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
        <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
              NumberNet
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetRound} disabled={!namesSet} size="sm">
              <RotateCcw />
              <span className="hidden md:inline">Reset Round</span>
            </Button>
            <Button variant="outline" onClick={handleNewGame} size="sm">
              <PlusSquare />
              <span className="hidden md:inline">New Game</span>
            </Button>
          </div>
        </header>

        { !namesSet ? renderNameInput() : (
          <>
            <Scoreboard 
              player1Name={player1Name} 
              player2Name={player2Name}
              player1Score={player1Score}
              player2Score={player2Score}
            />
            <div className="flex-grow grid md:grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-8" key={gameId}>
              <GamePanel
                playerNumber={1}
                playerName={player1Name}
                opponentPlayerName={player2Name}
                onSetSecret={setPlayer1Secret}
                onGuess={handleP1Guess}
                mySecret={player1Secret}
                opponentSecretSet={!!player2Secret}
                guesses={player1Guesses}
                isMyTurn={currentPlayer === 1}
                isGameOver={!!winner}
                digitCount={digitCount}
              />
              <GamePanel
                playerNumber={2}
                playerName={player2Name}
                opponentPlayerName={player1Name}
                onSetSecret={setPlayer2Secret}
                onGuess={handleP2Guess}
                mySecret={player2Secret}
                opponentSecretSet={!!player1Secret}
                guesses={player2Guesses}
                isMyTurn={currentPlayer === 2}
                isGameOver={!!winner}
                digitCount={digitCount}
              />
            </div>
          </>
        )}
      </main>

       <AlertDialog open={!!winner}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trophy className="text-accent" />
              We have a winner!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Congratulations to {winner === 1 ? player1Name : winner === 2 ? player2Name : ''} for guessing the secret number: {winner === 1 ? player2Secret : player1Secret}!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleNewGame} className="w-full sm:w-auto">New Game</Button>
            <AlertDialogAction onClick={resetRound} className="w-full sm:w-auto">
              <RotateCw />
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
