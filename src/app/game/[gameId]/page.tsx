
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGame, joinGame, makeGuess, setSecret, resetGame, requestReset, resolveResetRequest } from '@/lib/game-service';
import type { Game, Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Link, Clipboard, User, KeyRound, Target, Hourglass, Trophy, BrainCircuit, RotateCw, Award, BookOpen, AlertTriangle } from 'lucide-react';
import { GuessHistory } from '@/components/guess-history';
import { Scoreboard } from '@/components/scoreboard';


export default function GamePage() {
    const { gameId } = useParams() as { gameId: string };
    const router = useRouter();
    const { toast } = useToast();

    const [game, setGame] = useState<Game | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [resetRequesterName, setResetRequesterName] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem(`player_id_for_${gameId}`);
        setPlayerId(id);
    }, [gameId]);

    useEffect(() => {
        if (!gameId) return;

        const fetchGame = async () => {
            try {
                const initialGame = await getGame(gameId);
                if (initialGame) {
                    setGame(initialGame);
                } else {
                    toast({ title: "Error", description: "Game not found.", variant: 'destructive' });
                    router.push('/');
                }
            } catch (error) {
                 toast({ title: "Error", description: "Failed to fetch game.", variant: 'destructive' });
                 router.push('/');
            } finally {
                setIsLoading(false);
            }
        };
        fetchGame();

        const interval = setInterval(async () => {
            const updatedGame = await getGame(gameId);
            if (updatedGame) {
                setGame(updatedGame);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [gameId, router, toast]);

    const me = useMemo(() => game?.players.find(p => p.id === playerId), [game, playerId]);
    const opponent = useMemo(() => game?.players.find(p => p.id !== playerId), [game, playerId]);
    const isHost = useMemo(() => game?.players[0]?.id === playerId, [game, playerId]);

     useEffect(() => {
        if (game?.resetRequestedBy && isHost && game.resetRequestedBy !== playerId) {
            const requester = game.players.find(p => p.id === game.resetRequestedBy);
            setResetRequesterName(requester?.name || 'Your opponent');
        } else {
            setResetRequesterName(null);
        }
    }, [game, isHost, playerId]);

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
    
    const handlePlayAgain = async () => {
        if (!playerId) return;
        const result = await resetGame(gameId, playerId);
        if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            setGame(result);
        }
    }

    const handleRequestReset = async () => {
        if(!playerId) return;
        const result = await requestReset(gameId, playerId);
         if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            setGame(result);
            toast({ title: 'Request Sent', description: 'Your request to reset the round has been sent to the host.' });
        }
    }
    
    const handleResolveResetRequest = async (accept: boolean) => {
        const result = await resolveResetRequest(gameId, accept);
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
    
    const renderGameOverContent = () => {
        const waitingForOtherPlayer = game?.resetRequestedBy && game.resetRequestedBy !== playerId;
        const requestedByMe = game?.resetRequestedBy === playerId;

        if (requestedByMe && !waitingForOtherPlayer) {
             return <p className="text-center text-muted-foreground">Waiting for {opponent?.name} to play again...</p>
        }

        return (
             <AlertDialogFooter>
                {isHost && (
                     <Button variant="outline" onClick={() => router.push('/')}>New Game</Button>
                )}
                 <AlertDialogAction onClick={handlePlayAgain}> <RotateCw /> Play Again </AlertDialogAction>
            </AlertDialogFooter>
        );
    }

    return (
        <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
            <header className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
                        NumberNet
                    </h1>
                </div>
                 <div className="flex items-center gap-4">
                     <Dialog open={isScoreboardOpen} onOpenChange={setIsScoreboardOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Award /> Score</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Scoreboard</DialogTitle>
                                <DialogDescription>
                                    Current game scores. The winner of a round gets one point.
                                </DialogDescription>
                            </DialogHeader>
                            {me && opponent && (
                                <Scoreboard 
                                    player1Name={me.name}
                                    player1Score={me.score}
                                    player2Name={opponent.name}
                                    player2Score={opponent.score}
                                />
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                    Close
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><BookOpen /> How to Play</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>How to Play NumberNet</DialogTitle>
                            </DialogHeader>
                             <div className="space-y-4 text-sm text-muted-foreground">
                                <p><strong className="text-foreground">Objective:</strong> Be the first to guess your opponent's secret number!</p>
                                
                                <ol className="list-decimal list-inside space-y-2">
                                    <li><strong>Set Your Secret:</strong> Both players begin by setting a secret number. The length depends on the difficulty you chose.</li>
                                    <li><strong>Take Turns Guessing:</strong> Players take turns guessing the other's secret number.</li>
                                    <li><strong>Use The Feedback:</strong> After each guess, you'll get feedback in two forms:
                                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                                            <li><strong className="text-foreground">Bulls (Correct):</strong> This means you guessed a correct digit in the exact correct position.</li>
                                            <li><strong className="text-foreground">Cows (Present):</strong> This means you guessed a correct digit, but it is in the wrong position.</li>
                                            <li><strong className="text-foreground">Absent:</strong> The digit is not in the secret number at all.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Win the Round:</strong> The first player to guess the opponent's number (getting all "Bulls") wins the round and gets one point!</li>
                                </ol>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button">Got it!</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {isHost ? (
                        <Button variant="outline" size="sm" onClick={() => router.push('/')}>New Game</Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={handleRequestReset}>Request Reset</Button>
                    )}
                </div>
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
                             {game?.winnerId === me.id ? "Congratulations, you are the winner!" : `${opponent?.name || 'Your opponent'} has won the game.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {renderGameOverContent()}
                </AlertDialogContent>
            </AlertDialog>
             <AlertDialog open={!!resetRequesterName}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-accent" />Reset Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            {resetRequesterName} wants to reset the round. Do you agree? This will restart the current round without changing the score.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => handleResolveResetRequest(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleResolveResetRequest(true)}>Reset Round</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
