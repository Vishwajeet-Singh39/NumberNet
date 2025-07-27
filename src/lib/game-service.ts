
'use server';

import { Game, Player } from './types';
import { calculateBullsAndCows } from './game-logic';

const games = new Map<string, Game>();
const GAME_LIFETIME = 1000 * 60 * 60; // 1 hour in milliseconds
const CLEANUP_INTERVAL = 1000 * 60 * 5; // 5 minutes in milliseconds

const createId = () => Math.random().toString(36).substring(2, 9);
const createPlayerId = () => `player_${createId()}`;
const createGameId = () => `game_${createId()}`;


// --- Game Management Functions ---

export async function createGame(player1Name: string, difficulty: number): Promise<{ gameId: string; playerId: string }> {
  const gameId = createGameId();
  const playerId = createPlayerId();

  const player1: Player = {
    id: playerId,
    name: player1Name,
    guesses: [],
    score: 0,
  };

  const newGame: Game = {
    id: gameId,
    players: [player1],
    status: 'waiting',
    turn: player1.id,
    difficulty: difficulty,
    resetRequestedBy: null,
    lastActivity: Date.now(),
  };

  games.set(gameId, newGame);

  return { gameId, playerId };
}

export async function joinGame(gameId: string, playerName: string): Promise<{ game: Game; playerId: string } | { error: string }> {
  const game = games.get(gameId);

  if (!game) {
    return { error: 'Game not found.' };
  }

  if (game.players.length >= 2) {
    return { error: 'Game is already full.' };
  }

  if (game.status !== 'waiting') {
    return { error: 'Game has already started.' };
  }
  
  const newPlayerId = createPlayerId();
  const player2: Player = {
    id: newPlayerId,
    name: playerName,
    guesses: [],
    score: 0,
  };

  game.players.push(player2);
  game.status = 'playing';
  game.lastActivity = Date.now();
  
  games.set(gameId, game);

  return { game, playerId: newPlayerId };
}

export async function getGame(gameId: string): Promise<Game | undefined> {
  const game = games.get(gameId);
  if (game) {
      game.lastActivity = Date.now();
      games.set(gameId, game);
  }
  return game;
}

export async function setSecret(gameId: string, playerId: string, secret: string): Promise<Game | { error: string }> {
  const game = games.get(gameId);
  if (!game) return { error: 'Game not found' };

  const player = game.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };

  if (game.difficulty !== secret.length || !/^\d+$/.test(secret)) {
    return { error: `Secret must be a ${game.difficulty}-digit number.` };
  }

  player.secretNumber = secret;

  const allSecretsSet = game.players.every(p => p.secretNumber);
  if (allSecretsSet) {
    game.status = 'playing';
  }
  
  game.lastActivity = Date.now();
  games.set(gameId, game);
  return game;
}

export async function makeGuess(gameId: string, playerId: string, guess: string): Promise<Game | { error: string }> {
    const game = games.get(gameId);
    if (!game) return { error: 'Game not found' };

    if (game.status !== 'playing') return { error: 'Game is not active.' };
    if (game.turn !== playerId) return { error: "It's not your turn." };
    if (guess.length !== game.difficulty || !/^\d+$/.test(guess)) {
      return { error: `Guess must be a ${game.difficulty}-digit number.` };
    }

    const currentPlayer = game.players.find(p => p.id === playerId);
    const opponent = game.players.find(p => p.id !== playerId);

    if (!currentPlayer || !opponent) return { error: 'Player not found.' };
    if (!opponent.secretNumber) return { error: 'Opponent has not set their secret number yet.' };

    const { bulls, cows, feedback } = calculateBullsAndCows(opponent.secretNumber, guess);
    currentPlayer.guesses.push({ playerId, guess, bulls, cows, feedback });
    
    if (bulls === game.difficulty) {
        game.status = 'finished';
        game.winnerId = playerId;
        currentPlayer.score += 1;
    } else {
        game.turn = opponent.id;
    }

    game.lastActivity = Date.now();
    games.set(gameId, game);
    return game;
}

export async function requestReset(gameId: string, playerId: string): Promise<Game | {error: string}> {
  const game = games.get(gameId);
  if (!game) return { error: "Game not found" };

  const isHost = game.players[0].id === playerId;
  if(isHost) {
     return { error: "Host cannot request a reset, they can reset directly."}
  }

  game.resetRequestedBy = playerId;
  game.lastActivity = Date.now();
  games.set(gameId, game);
  return game;
}

const performRoundReset = (game: Game): Game => {
    game.players.forEach(p => {
        p.secretNumber = undefined;
        p.guesses = [];
    });
    game.status = 'playing';
    game.winnerId = undefined;
    game.resetRequestedBy = null;
    game.turn = game.players[0].id; 
    game.lastActivity = Date.now();
    return game;
}

export async function resolveResetRequest(gameId: string, accept: boolean): Promise<Game | {error: string}> {
    const game = games.get(gameId);
    if (!game) return { error: "Game not found" };
    if (!game.resetRequestedBy) return { error: "No reset has been requested." };

    if(accept) {
        const newGame = performRoundReset(game);
        games.set(gameId, newGame);
        return newGame;
    } else {
        game.resetRequestedBy = null;
        game.lastActivity = Date.now();
        games.set(gameId, game);
        return game;
    }
}


export async function resetGame(gameId: string, playerId: string): Promise<Game | {error: string}> {
  const game = games.get(gameId);
  if (!game) return { error: "Game not found" };
  
  const iAmRequesting = game.resetRequestedBy === playerId;
  const opponentHasRequested = game.resetRequestedBy && game.resetRequestedBy !== playerId;

  if (game.status !== 'finished' && !opponentHasRequested) {
      return { error: 'Game is not finished yet.' };
  }
  
  if(opponentHasRequested) {
    const newGame = performRoundReset(game);
    games.set(gameId, newGame);
    return newGame;
  }
  
  game.resetRequestedBy = playerId;
  game.lastActivity = Date.now();
  games.set(gameId, game);
  return game;
}

export async function deleteGame(gameId: string): Promise<{ success: boolean }> {
    if (games.has(gameId)) {
        games.delete(gameId);
        return { success: true };
    }
    return { success: false };
}

function cleanupInactiveGames() {
    const now = Date.now();
    for (const [gameId, game] of games.entries()) {
        if (now - game.lastActivity > GAME_LIFETIME) {
            games.delete(gameId);
            console.log(`Cleaned up inactive game: ${gameId}`);
        }
    }
}

if (typeof setInterval !== 'undefined') {
    setInterval(cleanupInactiveGames, CLEANUP_INTERVAL);
}
