
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Guess } from '@/lib/types';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
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
      <div className="flex items-center justify-center h-full min-h-[100px] rounded-lg bg-muted/30 border border-dashed">
        <p className="text-sm text-muted-foreground">Your guess history will appear here.</p>
      </div>
    );
  }

  const reversedGuesses = [...guesses].reverse();

  return (
    <ScrollArea className="h-full max-h-80 md:max-h-96 w-full rounded-md border whitespace-nowrap">
      <div className="relative">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead className="min-w-[150px]">Guess</TableHead>
              <TableHead className="w-[50px] text-center">Bulls</TableHead>
              <TableHead className="w-[50px] text-center">Cows</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reversedGuesses.map((g, index) => (
              <TableRow key={index} className={index === 0 ? "animate-in fade-in-20 slide-in-from-bottom-2 duration-500" : ""}>
                <TableCell className="font-medium text-center">{guesses.length - index}</TableCell>
                <TableCell>
                  <div className="flex flex-nowrap gap-1 md:gap-2 font-mono tracking-widest">
                    {g.guess.split('').map((digit, i) => (
                      <span 
                        key={i} 
                        className={cn(
                          "flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-md border text-base md:text-lg font-bold shrink-0",
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
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
