
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, User, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGame } from '@/lib/game-service';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('4');
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
      const { gameId, playerId } = await createGame(playerName, parseInt(difficulty, 10));
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
              <PlusSquare /> Create a New Game
            </CardTitle>
            <CardDescription>Enter your name and choose a difficulty to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGame} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                 <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  maxLength={12}
                />
              </div>

               <div className="flex flex-col gap-2">
                <Label>Difficulty (Number Length)</Label>
                 <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 11 }, (_, i) => i + 2).map((level) => (
                            <SelectItem key={level} value={String(level)}>
                                {level} Digits
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isCreating}>
                <User />
                {isCreating ? 'Creating Game...' : 'Create & Join Game'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
