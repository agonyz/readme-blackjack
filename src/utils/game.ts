import { createDeck, shuffleDeck } from './deck';
import {
  Action,
  GameResult,
  GameState,
  HandCard,
  HistoryEntry,
  Result,
  Step,
  Winner,
} from '../types';
import { getActor } from './github';

export const initialize = () => {
  const deck = shuffleDeck(createDeck());
  const playerCards: HandCard[] = [
    { ...deck.pop()!, hidden: false },
    { ...deck.pop()!, hidden: false },
  ];
  const dealerCards: HandCard[] = [
    { ...deck.pop()!, hidden: true },
    { ...deck.pop()!, hidden: false },
  ];
  const history: HistoryEntry[] = [
    {
      action: 'New Game',
      actor: getActor(),
      cardsInPlay: [
        { owner: 'Dealer', cards: dealerCards },
        { owner: 'Player', cards: playerCards },
      ],
    },
  ];

  return {
    deck,
    player: playerCards,
    dealer: dealerCards,
    isFinished: false,
    history,
  };
};

export const drawCard = (gameState: GameState, forPlayer: boolean) => {
  const card = gameState.deck.pop();
  if (!card) {
    throw new Error('No more cards in the deck');
  }
  const handCard = { ...card, hidden: false };
  if (forPlayer) {
    gameState.player.push(handCard);
    addEventToLastAction(gameState, 'Player: Draw Card');
  } else {
    gameState.dealer.push(handCard);
    addEventToLastAction(gameState, 'Dealer: Draw Card');
  }
};

export const revealHoleCard = (gameState: GameState) => {
  if (gameState.dealer[0].hidden) {
    gameState.dealer[0].hidden = false;
    addEventToLastAction(gameState, 'Dealer: Reveal Hole Card');
  }
};

export const setGameFinished = (gameState: GameState) => {
  gameState.isFinished = true;
};

export const isGameFinished = (gameState: GameState | null) => {
  return !!(gameState && gameState.isFinished);
};

export const determineWinner = (
  gameState: GameState,
  playerHandValue: number,
  dealerHandValue: number,
): GameResult => {
  let winner: Winner;

  const playerBust = playerHandValue > 21;
  const dealerBust = dealerHandValue > 21;

  if (playerBust && dealerBust) {
    winner = 'Tie';
    addEventToLastAction(gameState, `Tie: Both parties busted`);
  } else if (playerBust) {
    winner = 'Dealer';
    addEventToLastAction(gameState, `Dealer won: Player busted`);
  } else if (dealerBust) {
    winner = 'Player';
    addEventToLastAction(gameState, `Player won: Dealer busted`);
  } else if (playerHandValue > dealerHandValue) {
    winner = 'Player';
    addEventToLastAction(gameState, `Player won: Is closer to 21`);
  } else if (dealerHandValue > playerHandValue) {
    winner = 'Dealer';
    addEventToLastAction(gameState, `Dealer won: Is closer to 21`);
  } else {
    winner = 'Tie';
    addEventToLastAction(
      gameState,
      `Tie: Both parties are equally close to 21`,
    );
  }

  gameState.winner = winner;
  return {
    winner,
    playerHandValue,
    dealerHandValue,
  };
};

export const determineEarlyWinner = (
  gameState: GameState,
  playerHandValue: number,
  dealerHandValue: number,
): GameResult | null => {
  let winner: Winner;

  const playerBust = playerHandValue > 21;
  const dealerBust = dealerHandValue > 21;

  if (playerBust && dealerBust) {
    winner = 'Tie';
    addEventToLastAction(gameState, 'Tie: Both parties busted');
  } else if (playerBust) {
    winner = 'Dealer';
    addEventToLastAction(gameState, `Dealer won: Player busted`);
  } else if (dealerBust) {
    winner = 'Player';
    addEventToLastAction(gameState, `Player won: Dealer busted`);
  } else {
    return null;
  }

  gameState.winner = winner;
  return {
    winner,
    playerHandValue,
    dealerHandValue,
  };
};

export const getGameResult = (
  winner: Winner | undefined,
  isPlayer: boolean,
): Result => {
  if (winner === undefined) return undefined;
  if (winner === 'Player') return isPlayer ? 'win' : 'loss';
  if (winner === 'Dealer') return isPlayer ? 'loss' : 'win';
  if (winner === 'Tie') return 'tie';
};

export const addActionToHistory = (
  gameState: GameState,
  action: Action,
  actor: string,
): void => {
  gameState.history.push({
    action,
    actor,
    cardsInPlay: [
      { owner: 'Dealer', cards: gameState.dealer },
      { owner: 'Player', cards: gameState.player },
    ],
  });
};

export const addEventToLastAction = (
  gameState: GameState,
  step: Step,
): void => {
  const lastEntry = gameState.history[gameState.history.length - 1];

  if (!lastEntry.events) {
    lastEntry.events = [];
  }

  lastEntry.events.push({
    step,
    cardsInPlay: [
      { owner: 'Dealer', cards: gameState.dealer },
      { owner: 'Player', cards: gameState.player },
    ],
  });
};
