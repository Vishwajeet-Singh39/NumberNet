
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, User, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createGame } from '@/lib/game-service';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name.',
        variant: 'destructive',
      });
      return;
    }
    setIsCreating(true);
    try {
      const { gameId, playerId } = await createGame(playerName);
      // Store player ID to identify the user in the game room
      localStorage.setItem(`player_id_for_${gameId}`, playerId);
      router.push(`/game/${gameId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create game. Please try again.',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col justify-center items-center">
      <header className="absolute top-4 left-4 flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          NumberNet
        </h1>
      </header>
      <div className="flex justify-center items-center flex-grow w-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <User /> Create a New Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGame} className="flex flex-col items-center gap-4">
              <Input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                maxLength={12}
                className="flex-grow"
              />
              <Button type="submit" className="w-full" disabled={isCreating}>
                <PlusSquare />
                {isCreating ? 'Creating Game...' : 'Create Game'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
