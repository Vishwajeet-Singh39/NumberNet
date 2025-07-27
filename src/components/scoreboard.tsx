
'use client';

import { Card, CardContent } from '@/components/ui/card';

interface ScoreboardProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
}

export function Scoreboard({ player1Name, player2Name, player1Score, player2Score }: ScoreboardProps) {
  return (
    <Card className="min-w-[200px] border-2">
      <CardContent className="p-2">
        <div className="flex justify-around items-center text-center">
          <div className="w-1/2">
            <p className="font-semibold text-sm truncate" title={player1Name}>{player1Name}</p>
            <p className="text-2xl font-bold text-primary">{player1Score}</p>
          </div>
          <div className="text-xl font-bold text-muted-foreground">-</div>
          <div className="w-1/2">
            <p className="font-semibold text-sm truncate" title={player2Name}>{player2Name}</p>
            <p className="text-2xl font-bold text-primary">{player2Score}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
