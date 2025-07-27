
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGame, joinGame, makeGuess, setSecret, resetGame } from '@/lib/game-service';
import type { Game, Player, Guess } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link, Clipboard, User, KeyRound, Target, Hourglass, Trophy, BrainCircuit, RotateCw } from 'lucide-react';

function GuessHistory({ guesses }: { guesses: Guess[] }) {
    if (guesses.length === 0) {
        return <p className="text-sm text-muted-foreground text-center mt-4">No guesses yet.</p>;
    }
    return (
        <div className="space-y-2 mt-4">
            {guesses.map((g, i) => (
                <div key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                    <p className="font-mono">{g.guess}</p>
                    <div className="flex gap-2">
                        <span className="font-bold text-primary">Bulls: {g.bulls}</span>
                        <span className="font-bold text-accent">Cows: {g.cows}</span>
                    </div>
                </div>
            )).reverse()}
        </div>
    );
}

export default function GamePage() {
    const { gameId } = useParams() as { gameId: string };
    const router = useRouter();
    const { toast } = useToast();

    const [game, setGame] = useState<Game | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const id = localStorage.getItem(`player_id_for_${gameId}`);
        setPlayerId(id);
    }, [gameId]);

    useEffect(() => {
        if (!gameId) return;

        const interval = setInterval(async () => {
            const updatedGame = await getGame(gameId);
            if (updatedGame) {
                setGame(updatedGame);
                 if (updatedGame.status !== 'waiting') {
                    setIsLoading(false);
                }
            } else {
                 toast({ title: "Error", description: "Game not found.", variant: 'destructive' });
                 router.push('/');
                 clearInterval(interval);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [gameId, router, toast]);

    const me = useMemo(() => game?.players.find(p => p.id === playerId), [game, playerId]);
    const opponent = useMemo(() => game?.players.find(p => p.id !== playerId), [game, playerId]);

    const handleJoinGame = async () => {
        if (!inputValue.trim()) {
            toast({ title: 'Error', description: 'Please enter your name.', variant: 'destructive' });
            return;
        }
        const result = await joinGame(gameId, inputValue);
        if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            localStorage.setItem(`player_id_for_${gameId}`, result.playerId);
            setPlayerId(result.playerId);
            setGame(result.game);
        }
        setInputValue('');
    };

    const handleSetSecret = async () => {
        if (!playerId || !game) return;
        if (inputValue.length !== game.difficulty || !/^\d+$/.test(inputValue)) {
             toast({ title: 'Error', description: `Secret must be a ${game.difficulty}-digit number.`, variant: 'destructive' });
             return;
        }
        const result = await setSecret(gameId, playerId, inputValue);
        if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            setGame(result);
        }
        setInputValue('');
    };
    
    const handleMakeGuess = async () => {
        if (!playerId || !game) return;
        if (inputValue.length !== game.difficulty || !/^\d+$/.test(inputValue)) {
             toast({ title: 'Error', description: `Guess must be a ${game.difficulty}-digit number.`, variant: 'destructive' });
             return;
        }
        const result = await makeGuess(gameId, playerId, inputValue);
         if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            setGame(result);
        }
        setInputValue('');
    }
    
    const handleResetGame = async () => {
        const result = await resetGame(gameId);
        if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            setGame(result);
        }
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Copied!', description: 'Invite link copied to clipboard.' });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold mt-4">Loading Game...</h1>
                <p className="text-muted-foreground">Please wait a moment.</p>
            </div>
        )
    }

    if (!me) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User />Join Game</CardTitle>
                        <CardDescription>You've been invited to play NumberNet!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                         <Input
                            type="text"
                            placeholder="Enter your name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={12}
                        />
                        <Button onClick={handleJoinGame}>Join Game</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (game?.status === 'waiting') {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                 <Hourglass className="h-12 w-12 text-primary animate-spin" />
                <h1 className="text-2xl md:text-3xl font-bold mt-4">Waiting for Player 2 to Join...</h1>
                <p className="text-muted-foreground mt-2">Share this link with a friend to start the game.</p>
                 <Card className="mt-6 w-full max-w-lg">
                    <CardContent className="p-4 flex items-center gap-2">
                        <Link className="h-5 w-5 text-muted-foreground" />
                        <Input type="text" readOnly value={window.location.href} className="flex-grow bg-muted border-none" />
                        <Button variant="outline" size="icon" onClick={copyInviteLink}>
                            <Clipboard className="h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
            <header className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
                        NumberNet
                    </h1>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/')}>New Game</Button>
            </header>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                {/* Player's Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span><User className="inline-block mr-2" />{me.name} (You)</span>
                            {game?.turn === me.id && game.status === 'playing' && <span className="text-sm font-medium text-primary">Your Turn</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!me.secretNumber ? (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><KeyRound/>Set your {game?.difficulty}-digit secret number.</p>
                                <div className="flex gap-2">
                                    <Input type="password" value={inputValue} onChange={e => setInputValue(e.target.value)} maxLength={game?.difficulty} />
                                    <Button onClick={handleSetSecret}>Set Secret</Button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col gap-4">
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-2"><Target />Your Guesses</p>
                                    <GuessHistory guesses={me.guesses} />
                                </div>
                                {game?.turn === me.id && game.status === 'playing' && opponent?.secretNumber && (
                                     <div className="flex gap-2">
                                        <Input placeholder={`Guess ${opponent.name}'s number...`} value={inputValue} onChange={e => setInputValue(e.target.value)} maxLength={game?.difficulty} />
                                        <Button onClick={handleMakeGuess}>Guess</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Opponent's Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                             <span><User className="inline-block mr-2" />{opponent?.name || 'Waiting...'}</span>
                              {game?.turn === opponent?.id && game.status === 'playing' && <span className="text-sm font-medium text-accent animate-pulse">Opponent's Turn</span>}
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        {!opponent?.secretNumber ? (
                             <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-md"><Hourglass className="animate-spin" />Waiting for {opponent?.name} to set their secret...</p>
                        ) : (
                             <div>
                                <p className="text-sm font-medium flex items-center gap-2"><Target />{opponent.name}'s Guesses</p>
                                <GuessHistory guesses={opponent.guesses} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={game?.status === 'finished'}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><Trophy className="text-accent" />Game Over!</AlertDialogTitle>
                        <AlertDialogDescription>
                            {game?.winnerId === me.id ? "You are the winner!" : `${opponent?.name} has won the game.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => router.push('/')}>New Game</Button>
                        <AlertDialogAction onClick={handleResetGame}> <RotateCw /> Play Again </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}

