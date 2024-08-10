import * as github from '@actions/github';
import * as core from '@actions/core';
import {
  handleGameFinishedAction,
  handleHitAction,
  handleNewGameAction,
  handleStandAction,
  handleUnknownAction,
  parseAction,
} from './utils/action';
import { getGameState } from './utils/file';
import { isGameFinished } from './utils/game';
import { closeTicket } from './utils/github';

export const run = async () => {
  const context = github.context;
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    core.info('Missing token.');
    return;
  }
  const previousJob = process.env.PREVIOUS_JOB === 'true';
  if (previousJob) {
    core.info('Previous job is already running.');
    return;
  }

  const octokit = github.getOctokit(token);

  if (context.payload.issue) {
    let action = parseAction(context.payload.issue.title);

    if (action !== 'New Game' && isGameFinished(await getGameState())) {
      action = 'Finished';
    }

    switch (action) {
      case 'Stand':
        core.info('Player chose to Stand.');
        await handleStandAction(octokit, context);
        break;
      case 'Hit':
        core.info('Player chose to Hit.');
        await handleHitAction(octokit, context);
        break;
      case 'New Game':
        core.info('Starting a New Game.');
        await handleNewGameAction(octokit, context);
        break;
      case 'Finished':
        core.info('Game is already finished.');
        await handleGameFinishedAction(octokit, context);
        break;
      default:
        core.info('Handling unknown action.');
        await handleUnknownAction(octokit, context);
    }
  }

  await closeTicket(octokit, context);
};
