'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Guess } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface GuessHistoryProps {
  guesses: Guess[];
}

const feedbackStyles = {
  correct: 'bg-green-500 text-white border-green-600',
  present: 'bg-yellow-500 text-white border-yellow-600',
  absent: 'bg-muted text-muted-foreground border-border',
};


export function GuessHistory({ guesses }: GuessHistoryProps) {
  if (guesses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg bg-muted/30 border border-dashed">
        <p className="text-sm text-muted-foreground">Your guess history will appear here.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full max-h-96 w-full rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Guess</TableHead>
            <TableHead className="text-center">Bulls</TableHead>
            <TableHead className="text-center">Cows</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guesses.map((g, index) => (
            <TableRow key={index} className={index === guesses.length - 1 ? "animate-in fade-in-20 slide-in-from-bottom-2 duration-500" : ""}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex gap-2 font-mono tracking-widest">
                  {g.guess.split('').map((digit, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-md border text-lg font-bold",
                        g.feedback && g.feedback[i] ? feedbackStyles[g.feedback[i]] : 'bg-muted'
                      )}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="default" className="w-6 justify-center bg-primary hover:bg-primary">
                  {g.bulls}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="w-6 justify-center bg-accent hover:bg-accent text-accent-foreground">
                  {g.cows}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
