import * as github from '@actions/github';
import * as core from '@actions/core';
import {
  handleGameFinishedAction,
  handleHitAction,
  handleNewGameAction,
  handleStandAction,
  handleUnknownAction,
  parseAction,
} from '../src/utils/action';
import { closeTicket } from '../src/utils/github';
import { run } from '../src/main';
import { getGameState } from '../src/utils/file';
import { isGameFinished } from '../src/utils/game';

// mock all dependencies
jest.mock('@actions/github');
jest.mock('@actions/core');
jest.mock('../src/utils/action');
jest.mock('../src/utils/file');
jest.mock('../src/utils/game');
jest.mock('../src/utils/github');

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    delete process.env.GITHUB_TOKEN;
    delete process.env.PREVIOUS_JOB;
  });

  it('should return early if GITHUB_TOKEN is not set', async () => {
    await run();

    expect(core.info).toHaveBeenCalledWith('Missing token.');
    expect(github.getOctokit).not.toHaveBeenCalled();
  });

  it('should return early if PREVIOUS_JOB is set', async () => {
    process.env.GITHUB_TOKEN = 'fake-token';
    process.env.PREVIOUS_JOB = 'true';
    await run();

    expect(core.info).toHaveBeenCalledWith('Previous job is already running.');
    expect(github.getOctokit).not.toHaveBeenCalled();
  });

  it('should handle New Game action', async () => {
    process.env.GITHUB_TOKEN = 'fake-token';
    (github.context as any) = {
      payload: {
        issue: {
          title: 'Blackjack: New Game',
        },
      },
    };
    (parseAction as jest.Mock).mockReturnValue('New Game');
    (handleNewGameAction as jest.Mock).mockResolvedValue(null);

    await run();

    expect(parseAction).toHaveBeenCalledWith('Blackjack: New Game');
    expect(handleNewGameAction).toHaveBeenCalled();
    expect(closeTicket).toHaveBeenCalled();
  });

  it('should handle Stand action', async () => {
    process.env.GITHUB_TOKEN = 'fake-token';
    (github.context as any) = {
      payload: {
        issue: {
          title: 'Blackjack: Stand',
        },
      },
    };
    (parseAction as jest.Mock).mockReturnValue('Stand');
    (handleStandAction as jest.Mock).mockResolvedValue(null);

    await run();

    expect(parseAction).toHaveBeenCalledWith('Blackjack: Stand');
    expect(handleStandAction).toHaveBeenCalled();
    expect(closeTicket).toHaveBeenCalled();
  });

  it('should handle Hit action', async () => {
    process.env.GITHUB_TOKEN = 'fake-token';
    (github.context as any) = {
      payload: {
        issue: {
          title: 'Blackjack: Hit',
        },
      },
    };
    (parseAction as jest.Mock).mockReturnValue('Hit');
    (handleHitAction as jest.Mock).mockResolvedValue(null);

    await run();

    expect(parseAction).toHaveBeenCalledWith('Blackjack: Hit');
    expect(handleHitAction).toHaveBeenCalled();
    expect(closeTicket).toHaveBeenCalled();
  });

  it('should handle Finished action', async () => {
    process.env.GITHUB_TOKEN = 'fake-token';
    (github.context as any) = {
      payload: {
        issue: {
          title: 'Blackjack: Hit',
        },
      },
    };
    (parseAction as jest.Mock).mockReturnValue('Finished');
    (handleGameFinishedAction as jest.Mock).mockResolvedValue(null);
    (getGameState as jest.Mock).mockResolvedValue({ isFinished: true });
    (isGameFinished as jest.Mock).mockReturnValue(true);

    await run();

    expect(parseAction).toHaveBeenCalledWith('Blackjack: Hit');
    expect(handleGameFinishedAction).toHaveBeenCalled();
    expect(closeTicket).toHaveBeenCalled();
  });

  it('should handle Unknown action', async () => {
    process.env.GITHUB_TOKEN = 'fake-token';
    (github.context as any) = {
      payload: {
        issue: {
          title: 'Blackjack: Invalid Action',
        },
      },
    };
    (parseAction as jest.Mock).mockReturnValue(null);
    (handleUnknownAction as jest.Mock).mockResolvedValue(null);
    (isGameFinished as jest.Mock).mockReturnValue(false);

    await run();

    expect(parseAction).toHaveBeenCalledWith('Blackjack: Invalid Action');
    expect(handleUnknownAction).toHaveBeenCalled();
    expect(closeTicket).toHaveBeenCalled();
  });
});
