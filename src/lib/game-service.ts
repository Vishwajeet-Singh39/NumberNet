
'use server';

import { Game, Player } from './types';
import { randomUUID } from 'crypto';
import { calculateBullsAndCows } from './game-logic';

// In-memory store for all games
const games = new Map<string, Game>();

// Simple function to create a unique ID for players
const createPlayerId = () => `player_${randomUUID()}`;
const createGameId = () => `game_${randomUUID()}`;

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
  game.status = 'playing'; // Game starts when player 2 joins
  
  games.set(gameId, game);

  return { game, playerId: newPlayerId };
}

export async function getGame(gameId: string): Promise<Game | undefined> {
  return games.get(gameId);
}

export async function setSecret(gameId: string, playerId: string, secret: string): Promise<Game | { error: string }> {
  const game = games.get(gameId);
  if (!game) return { error: 'Game not found' };

  const player = game.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };

  player.secretNumber = secret;

  // If both players have set their secrets, the game is truly on.
  const allSecretsSet = game.players.every(p => p.secretNumber);
  if (allSecretsSet) {
    game.status = 'playing';
  }
  
  games.set(gameId, game);
  return game;
}

export async function makeGuess(gameId: string, playerId: string, guess: string): Promise<Game | { error: string }> {
    const game = games.get(gameId);
    if (!game) return { error: 'Game not found' };

    if (game.status !== 'playing') return { error: 'Game is not active.' };
    if (game.turn !== playerId) return { error: "It's not your turn." };

    const currentPlayer = game.players.find(p => p.id === playerId);
    const opponent = game.players.find(p => p.id !== playerId);

    if (!currentPlayer || !opponent) return { error: 'Player not found.' };
    if (!opponent.secretNumber) return { error: 'Opponent has not set their secret number yet.' };

    const { bulls, cows, feedback } = calculateBullsAndCows(opponent.secretNumber, guess);
    currentPlayer.guesses.push({ playerId, guess, bulls, cows, feedback });
    
    if (bulls === game.difficulty) {
        game.status = 'finished';
        game.winnerId = playerId;
        currentPlayer.score += 1; // Increment winner's score
    } else {
        game.turn = opponent.id; // Switch turns
    }

    games.set(gameId, game);
    return game;
}

export async function resetGame(gameId: string): Promise<Game | {error: string}> {
  const game = games.get(gameId);
  if (!game) return { error: "Game not found" };

  // Reset secrets, guesses, and winner for a new round
  game.players.forEach(p => {
    p.secretNumber = undefined;
    p.guesses = [];
  });
  game.status = 'playing';
  game.winnerId = undefined;
  // Let player 1 start the new round
  game.turn = game.players[0].id; 
  
  games.set(gameId, game);
  return game;
}
