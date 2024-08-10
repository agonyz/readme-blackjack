import { promises as fs } from 'fs';
import { GameState } from '../../src/types';
import {
  getGameState,
  saveGameState,
  resetGameState,
} from '../../src/utils/file';
import path from 'node:path';

const gameStateFile = path.join(
  __dirname,
  '..',
  '..',
  'data/game_state_blackjack.json',
);

// mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('File operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGameState', () => {
    it('should return null if file is empty', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('');

      const result = await getGameState();
      expect(result).toBeNull();
    });

    it('should return null if file contains only "{}"', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('{}');

      const result = await getGameState();
      expect(result).toBeNull();
    });

    it('should parse and return game state from file', async () => {
      const mockGameState: GameState = {
        deck: [],
        player: [],
        dealer: [],
        isFinished: false,
        history: [],
      };
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify(mockGameState),
      );

      const result = await getGameState();
      expect(result).toEqual(mockGameState);
    });

    it('should return null if there is a file parsing error', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(
        new SyntaxError('Unexpected token'),
      );

      const result = await getGameState();
      expect(result).toBeNull();
    });

    it('should return null if file is not found', async () => {
      // simulate a file not found error with the correct code
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      const result = await getGameState();
      expect(result).toBeNull();
    });

    it('should rethrow unexpected errors', async () => {
      // simulate an unexpected error
      const unexpectedError = new Error('Unexpected error');
      (fs.readFile as jest.Mock).mockRejectedValue(unexpectedError);

      await expect(getGameState()).rejects.toThrow('Unexpected error');
    });
  });

  describe('saveGameState', () => {
    it('should write game state to file', async () => {
      const mockGameState: GameState = {
        deck: [],
        player: [],
        dealer: [],
        isFinished: false,
        history: [],
      };

      await saveGameState(mockGameState);

      expect(fs.writeFile).toHaveBeenCalledWith(
        gameStateFile,
        JSON.stringify(mockGameState, null, 2),
      );
    });
  });

  describe('resetGameState', () => {
    it('should reset game state file to empty object', async () => {
      await resetGameState();

      expect(fs.writeFile).toHaveBeenCalledWith(
        gameStateFile,
        JSON.stringify({}, null, 2),
      );
    });
  });
});
