
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface ScoreboardProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
}

export function Scoreboard({ player1Name, player2Name, player1Score, player2Score }: ScoreboardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="p-4">
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-around items-center text-center">
          <div className="w-1/2">
            <p className="font-semibold text-lg truncate">{player1Name}</p>
            <p className="text-3xl font-bold text-primary">{player1Score}</p>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">-</div>
          <div className="w-1/2">
            <p className="font-semibold text-lg truncate">{player2Name}</p>
            <p className="text-3xl font-bold text-primary">{player2Score}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
