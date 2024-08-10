import { Action, ACTIONS } from '../types';
import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github/lib/utils';
import { getGameState, resetGameState, saveGameState } from './file';
import {
  addActionToHistory,
  addEventToLastAction,
  determineEarlyWinner,
  determineWinner,
  drawCard,
  initialize,
  revealHoleCard,
  setGameFinished,
} from './game';
import { updateReadmeContent } from './readme';
import { calculateHandValue } from './hand';
import { getActor } from './github';

export const parseAction = (title: string): Action | null => {
  const prefix = 'Blackjack:';

  if (title.startsWith(prefix)) {
    const action = title.slice(prefix.length).trim() as Action;

    // make it impossible to pass "Finished" as manual action via title
    if (ACTIONS.includes(action) && action !== 'Finished') {
      return action;
    }
  }

  return null;
};

export const handleStandAction = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
) => {
  const gameState = await getGameState();
  if (!gameState) {
    throw new Error('Unexpected error');
  }

  // add action to history
  addActionToHistory(gameState, 'Stand', getActor());

  // determine if the dealer also draws a card
  let handValueDealer = calculateHandValue(gameState.dealer);
  while (handValueDealer <= 16) {
    drawCard(gameState, false);
    handValueDealer = calculateHandValue(gameState.dealer);
  }
  revealHoleCard(gameState);

  const playerHandValue = calculateHandValue(gameState.player);
  const dealerHandValue = calculateHandValue(gameState.dealer);
  const gameResults = determineWinner(
    gameState,
    playerHandValue,
    dealerHandValue,
  );

  let body = '';
  if (gameResults.winner === 'Player' || gameResults.winner === 'Dealer') {
    body = `The ${gameResults.winner} won the game.`;
  } else {
    body = `The game was a ${gameResults.winner}`;
  }

  const issueComment = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.issue!.number,
    body: body,
  };

  setGameFinished(gameState);
  await saveGameState(gameState);
  addEventToLastAction(gameState, 'Game Finished: Thank you for playing!');
  await updateReadmeContent(gameState);
  await octokit.rest.issues.createComment(issueComment);
};

export const handleHitAction = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
) => {
  const gameState = await getGameState();
  if (!gameState) {
    throw new Error('Unexpected error');
  }

  // add action to history
  addActionToHistory(gameState, 'Hit', getActor());

  // draw card for player
  drawCard(gameState, true);

  // determine if the dealer also draws a card
  const handValueDealer = calculateHandValue(gameState.dealer);
  if (handValueDealer <= 16) {
    drawCard(gameState, false);
    //revealHoleCard(gameState); only reveal it on stand for now
  }

  const playerHandValue = calculateHandValue(gameState.player);
  const dealerHandValue = calculateHandValue(gameState.dealer);
  const gameResults = determineEarlyWinner(
    gameState,
    playerHandValue,
    dealerHandValue,
  );
  let issueComment;

  if (gameResults) {
    let body: string;
    if (gameResults.winner === 'Player' || gameResults.winner === 'Dealer') {
      body = `The ${gameResults.winner} won the game.`;
    } else {
      body = `The game was a ${gameResults.winner}`;
    }

    issueComment = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.issue!.number,
      body: body,
    };

    revealHoleCard(gameState);
    setGameFinished(gameState);
    addEventToLastAction(gameState, 'Game Finished: Thank you for playing!');
  } else {
    issueComment = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.issue!.number,
      body: `Player got a new card.`,
    };
  }

  await saveGameState(gameState);
  await updateReadmeContent(gameState);
  await octokit.rest.issues.createComment(issueComment);
};

export const handleNewGameAction = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
) => {
  await resetGameState();
  const gameState = initialize();
  await saveGameState(gameState);
  await updateReadmeContent(gameState);

  const issueComment = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.issue!.number,
    body: `A new game has been started.`,
  };

  await octokit.rest.issues.createComment(issueComment);
};

export const handleUnknownAction = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
) => {
  const issueComment = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.issue!.number,
    body: `The action specified in the issue title is not recognized. Please use one of the following actions: ${ACTIONS.join('", "')}.`,
  };

  await octokit.rest.issues.createComment(issueComment);
};

export const handleGameFinishedAction = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
) => {
  const issueComment = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.issue!.number,
    body: `The Game has already finished: You need to start a new Game.`,
  };

  await octokit.rest.issues.createComment(issueComment);
};
