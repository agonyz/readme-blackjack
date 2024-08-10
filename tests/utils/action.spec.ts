import { ACTIONS, GameState } from '../../src/types';
import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github/lib/utils';
import {
  getGameState,
  resetGameState,
  saveGameState,
} from '../../src/utils/file';
import {
  determineEarlyWinner,
  determineWinner,
  drawCard,
  initialize,
  revealHoleCard,
  setGameFinished,
} from '../../src/utils/game';
import { updateReadmeContent } from '../../src/utils/readme';
import { calculateHandValue } from '../../src/utils/hand';
import {
  parseAction,
  handleStandAction,
  handleHitAction,
  handleNewGameAction,
  handleUnknownAction,
  handleGameFinishedAction,
} from '../../src/utils/action';

// mock dependencies
jest.mock('@actions/github');
jest.mock('../../src/utils/file');
jest.mock('../../src/utils/game');
jest.mock('../../src/utils/readme');
jest.mock('../../src/utils/hand');

// constants
const owner = 'agonyz';
const repo = 'readme-blackjack';
const issueNumber = 1;

describe('action.ts', () => {
  const mockContext: Partial<Context> = {
    repo: {
      owner: owner,
      repo: repo,
    },
    payload: {
      issue: {
        number: issueNumber,
      },
    },
  };

  const mockOctokit = {
    rest: {
      issues: {
        createComment: jest.fn(),
      },
    },
  } as unknown as jest.Mocked<InstanceType<typeof GitHub>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseAction', () => {
    it('should parse valid action: New Game', () => {
      const result = parseAction('Blackjack: New Game');
      expect(result).toBe('New Game');
    });

    it('should parse valid action: Stand', () => {
      const result = parseAction('Blackjack: Stand');
      expect(result).toBe('Stand');
    });

    it('should parse valid action: Hit', () => {
      const result = parseAction('Blackjack: Hit');
      expect(result).toBe('Hit');
    });

    it('should return null for action: Finished', () => {
      const result = parseAction('Blackjack: Finished');
      expect(result).toBeNull();
    });

    it('should return null for invalid action', () => {
      const result = parseAction('Blackjack Invalid Action');
      expect(result).toBeNull();
    });
  });

  describe('handleStandAction', () => {
    const mockedGameState: Partial<GameState> = { isFinished: false };

    beforeEach(() => {
      jest.clearAllMocks();

      (drawCard as jest.Mock).mockImplementation(() => {});
      (revealHoleCard as jest.Mock).mockImplementation(() => {});
      (setGameFinished as jest.Mock).mockImplementation(() => {});
    });

    it('player should win by choosing stand', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(15) // mock dealer's hand value
        .mockReturnValueOnce(20); // mock player's hand value
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (determineWinner as jest.Mock).mockReturnValue({ winner: 'Player' });

      await handleStandAction(mockOctokit, mockContext as Context);

      // ensure getGameState was called
      expect(getGameState).toHaveBeenCalled();

      // ensure drawCard is only called if dealer's hand value is <= 16
      expect(drawCard).toHaveBeenCalledWith(mockedGameState, false);

      // ensure the hole card of the dealer is revealed
      expect(revealHoleCard).toHaveBeenCalled();

      // ensure the game ends after the player chose to stand
      expect(setGameFinished).toHaveBeenCalled();

      // ensure the game state is saved
      expect(saveGameState).toHaveBeenCalled();

      // ensure the readme is updated
      expect(updateReadmeContent).toHaveBeenCalled();

      // ensure the winning comment is created
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'The Player won the game.',
      });
    });

    it('player should lose by choosing stand', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(19) // mock dealer's hand value
        .mockReturnValueOnce(18); // mock player's hand value
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (determineWinner as jest.Mock).mockReturnValue({ winner: 'Dealer' });

      await handleStandAction(mockOctokit, mockContext as Context);

      // ensure getGameState was called
      expect(getGameState).toHaveBeenCalled();

      // ensure drawCard is only called if dealer's hand value is <= 16
      expect(drawCard).not.toHaveBeenCalledWith(mockedGameState, false);

      // ensure the hole card of the dealer is revealed
      expect(revealHoleCard).toHaveBeenCalled();

      // ensure the game ends after the player chose to stand
      expect(setGameFinished).toHaveBeenCalled();

      // ensure the game state is saved
      expect(saveGameState).toHaveBeenCalled();

      // ensure the readme is updated
      expect(updateReadmeContent).toHaveBeenCalled();

      // ensure the winning comment is created
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'The Dealer won the game.',
      });
    });

    it('player should get a tie by choosing stand', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(20) // mock dealer's hand value
        .mockReturnValueOnce(20); // mock player's hand value
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (determineWinner as jest.Mock).mockReturnValue({ winner: 'Tie' });

      await handleStandAction(mockOctokit, mockContext as Context);

      // ensure getGameState was called
      expect(getGameState).toHaveBeenCalled();

      // ensure drawCard is only called if dealer's hand value is <= 16
      expect(drawCard).not.toHaveBeenCalledWith(mockedGameState, false);

      // ensure the hole card of the dealer is revealed
      expect(revealHoleCard).toHaveBeenCalled();

      // ensure the game ends after the player chose to stand
      expect(setGameFinished).toHaveBeenCalled();

      // ensure the game state is saved
      expect(saveGameState).toHaveBeenCalled();

      // ensure the readme is updated
      expect(updateReadmeContent).toHaveBeenCalled();

      // ensure the winning comment is created
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'The game was a Tie',
      });
    });

    it('should throw an error if game state is not available', async () => {
      (getGameState as jest.Mock).mockResolvedValue(null);

      await expect(
        handleStandAction(mockOctokit, mockContext as Context),
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('handleHitAction', () => {
    const mockedGameState: Partial<GameState> = { isFinished: false };

    beforeEach(() => {
      jest.clearAllMocks();

      (drawCard as jest.Mock).mockImplementation(() => {});
      (revealHoleCard as jest.Mock).mockImplementation(() => {});
      (setGameFinished as jest.Mock).mockImplementation(() => {});
    });

    it('player should have an early win', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(22) // mock dealer's hand value
        .mockReturnValueOnce(16); // mock player's hand value
      (determineEarlyWinner as jest.Mock).mockReturnValue({ winner: 'Player' });

      await handleHitAction(mockOctokit, mockContext as Context);

      expect(getGameState).toHaveBeenCalled();
      expect(drawCard).toHaveBeenCalled();
      expect(revealHoleCard).toHaveBeenCalled();
      expect(saveGameState).toHaveBeenCalled();
      expect(updateReadmeContent).toHaveBeenCalled();
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'The Player won the game.',
      });
    });

    it('dealer should have an early win', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(16) // mock dealer's hand value
        .mockReturnValueOnce(22); // mock player's hand value
      (determineEarlyWinner as jest.Mock).mockReturnValue({ winner: 'Dealer' });

      await handleHitAction(mockOctokit, mockContext as Context);

      expect(getGameState).toHaveBeenCalled();
      expect(drawCard).toHaveBeenCalled();
      expect(revealHoleCard).toHaveBeenCalled();
      expect(saveGameState).toHaveBeenCalled();
      expect(updateReadmeContent).toHaveBeenCalled();
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'The Dealer won the game.',
      });
    });

    it('it should be an early tie', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(22) // mock dealer's hand value
        .mockReturnValueOnce(22); // mock player's hand value
      (determineEarlyWinner as jest.Mock).mockReturnValue({ winner: 'Tie' });

      await handleHitAction(mockOctokit, mockContext as Context);

      expect(getGameState).toHaveBeenCalled();
      expect(drawCard).toHaveBeenCalled();
      expect(revealHoleCard).toHaveBeenCalled();
      expect(saveGameState).toHaveBeenCalled();
      expect(updateReadmeContent).toHaveBeenCalled();
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'The game was a Tie',
      });
    });

    it('it should not be an early win', async () => {
      (getGameState as jest.Mock).mockResolvedValue(mockedGameState);
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);
      (calculateHandValue as jest.Mock)
        .mockReturnValueOnce(18) // mock dealer's hand value
        .mockReturnValueOnce(15); // mock player's hand value
      (determineEarlyWinner as jest.Mock).mockReturnValue(null);

      await handleHitAction(mockOctokit, mockContext as Context);

      expect(drawCard).toHaveBeenCalled();
      expect(saveGameState).toHaveBeenCalled();
      expect(updateReadmeContent).toHaveBeenCalled();
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'Player got a new card.',
      });
    });

    it('should throw an error if game state is not available', async () => {
      (getGameState as jest.Mock).mockResolvedValue(null);

      await expect(
        handleHitAction(mockOctokit, mockContext as Context),
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('handleNewGameAction', () => {
    it('should start a new game', async () => {
      (initialize as jest.Mock).mockReturnValue({ player: [], dealer: [] });
      (resetGameState as jest.Mock).mockResolvedValue(null);
      (saveGameState as jest.Mock).mockResolvedValue(null);
      (updateReadmeContent as jest.Mock).mockResolvedValue(null);

      await handleNewGameAction(mockOctokit, mockContext as Context);

      expect(resetGameState).toHaveBeenCalled();
      expect(initialize).toHaveBeenCalled();
      expect(saveGameState).toHaveBeenCalled();
      expect(updateReadmeContent).toHaveBeenCalled();
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: 'A new game has been started.',
      });
    });
  });

  describe('handleUnknownAction', () => {
    it('should handle an unknown action', async () => {
      await handleUnknownAction(mockOctokit, mockContext as Context);

      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: `The action specified in the issue title is not recognized. Please use one of the following actions: ${ACTIONS.join('", "')}.`,
      });
    });
  });

  describe('handleGameFinishedAction', () => {
    it('should handle a finished game', async () => {
      await handleGameFinishedAction(mockOctokit, mockContext as Context);

      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: `The Game has already finished: You need to start a new Game.`,
      });
    });
  });
});
