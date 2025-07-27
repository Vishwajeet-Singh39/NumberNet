
// This component is not used in the online multiplayer version.
// It is kept in the codebase for reference or potential future use in a local mode.
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Target, Hourglass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GuessHistory } from '@/components/guess-history';
import { createNumberSchema, type NumberSchema } from '@/lib/schema';
import type { Guess } from '@/lib/types';

interface GamePanelProps {
  playerNumber: 1 | 2;
  playerName: string;
  opponentPlayerName: string;
  onSetSecret: (secret: string) => void;
  onGuess: (guess: string) => void;
  mySecret: string | null;
  opponentSecretSet: boolean;
  guesses: Guess[];
  isMyTurn: boolean;
  isGameOver: boolean;
  digitCount: number;
}

export function GamePanel({
  playerNumber,
  playerName,
  opponentPlayerName,
  onSetSecret,
  onGuess,
  mySecret,
  opponentSecretSet,
  guesses,
  isMyTurn,
  isGameOver,
  digitCount,
}: GamePanelProps) {
  
  const numberSchema = createNumberSchema(digitCount);
  
  const form = useForm<NumberSchema>({
    resolver: zodResolver(numberSchema),
    defaultValues: {
      number: '',
    },
  });

  const onSubmitSecret = (data: NumberSchema) => {
    onSetSecret(data.number);
    form.reset();
  };

  const onSubmitGuess = (data: NumberSchema) => {
    onGuess(data.number);
    form.reset();
  };
  
  const canPlay = isMyTurn && !isGameOver && opponentSecretSet;

  const renderSetSecret = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <KeyRound className="text-primary" />
          {playerName}: Set Your Secret
        </CardTitle>
        <CardDescription>Enter a {digitCount}-digit secret number for {opponentPlayerName} to guess.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitSecret)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="sr-only">Secret Number</FormLabel>
                  <FormControl>
                    <Input placeholder={"".padStart(digitCount, '•')} {...field} maxLength={digitCount} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Set Secret</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
  
  const renderWaitingMessage = () => {
    let message = `Waiting for ${opponentPlayerName} to set their secret number...`;
    if(isGameOver) {
        message = "Game Over! A winner has been decided.";
    } else if (opponentSecretSet && !isMyTurn) {
        message = `Waiting for ${opponentPlayerName} to make a guess...`;
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center bg-muted/50 rounded-md p-4 text-center min-h-[100px]">
            <Hourglass className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-muted-foreground">{message}</p>
        </div>
    );
  }

  const renderGuessing = () => (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Target className="text-primary"/>
          {playerName}: {isMyTurn ? "Your Turn!" : "Waiting..."}
        </CardTitle>
        <CardDescription>
          Your secret is set. Now, guess {opponentPlayerName}'s {digitCount}-digit number.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        {!canPlay ? (
          renderWaitingMessage()
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitGuess)} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Your Guess</FormLabel>
                    <FormControl>
                      <Input placeholder="Your guess..." {...field} maxLength={digitCount} disabled={!canPlay}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!canPlay}>Guess</Button>
            </form>
          </Form>
        )}
        <div className="flex-grow">
            <GuessHistory guesses={guesses} />
        </div>
      </CardContent>
    </Card>
  );

  return mySecret ? renderGuessing() : renderSetSecret();
}
