import { promises as fs } from 'fs';
import { GameState } from '../types';
import path from 'node:path';

const gameStateFile = path.join(
  __dirname,
  '..',
  '..',
  'data/game_state_blackjack.json',
);

export const getGameState = async (): Promise<GameState | null> => {
  try {
    const data = await fs.readFile(gameStateFile, 'utf-8');
    const trimmedData = data.trim();

    if (trimmedData === '' || trimmedData === '{}') {
      // file is empty
      return null;
    }

    return JSON.parse(data) as GameState;
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      // file not found
      return null;
    }
    if (err instanceof SyntaxError) {
      return null;
    }
    throw err;
  }
};

export const saveGameState = async (gameState: GameState): Promise<void> => {
  await fs.writeFile(gameStateFile, JSON.stringify(gameState, null, 2));
};

export const resetGameState = async (): Promise<void> => {
  await fs.writeFile(gameStateFile, JSON.stringify({}, null, 2));
};
