'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Target, Hourglass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GuessHistory } from '@/components/guess-history';
import { numberSchema, type NumberSchema } from '@/lib/schema';
import type { Guess } from '@/lib/types';

interface GamePanelProps {
  playerNumber: 1 | 2;
  opponentPlayerNumber: 1 | 2;
  onSetSecret: (secret: string) => void;
  onGuess: (guess: string) => void;
  mySecret: string | null;
  opponentSecretSet: boolean;
  guesses: Guess[];
  isGameOver: boolean;
}

export function GamePanel({
  playerNumber,
  opponentPlayerNumber,
  onSetSecret,
  onGuess,
  mySecret,
  opponentSecretSet,
  guesses,
  isGameOver,
}: GamePanelProps) {
  
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

  const renderSetSecret = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="text-primary" />
          Player {playerNumber}: Set Your Secret
        </CardTitle>
        <CardDescription>Enter a 4-digit secret number for Player {opponentPlayerNumber} to guess.</CardDescription>
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
                    <Input placeholder="1234" {...field} maxLength={4} type="password" />
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

  const renderGuessing = () => (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-primary"/>
          Player {playerNumber}: Make a Guess
        </CardTitle>
        <CardDescription>
          Your secret is set. Now, guess Player {opponentPlayerNumber}'s 4-digit number.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        {!opponentSecretSet ? (
          <div className="flex-grow flex flex-col items-center justify-center bg-muted/50 rounded-md p-4 text-center">
            <Hourglass className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-muted-foreground">Waiting for Player {opponentPlayerNumber} to set their secret number...</p>
          </div>
        ) : isGameOver ? (
           <div className="flex-grow flex flex-col items-center justify-center bg-muted/50 rounded-md p-4 text-center">
            <p className="text-lg font-semibold">Game Over!</p>
            <p className="text-muted-foreground">A winner has been decided. Start a new game to play again.</p>
          </div>
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
                      <Input placeholder="Your guess..." {...field} maxLength={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Guess</Button>
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
