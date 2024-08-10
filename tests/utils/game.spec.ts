import { createDeck, shuffleDeck } from '../../src/utils/deck';
import {
  GameResult,
  GameState,
  HandCard,
  HistoryEntry,
  Step,
} from '../../src/types';
import {
  initialize,
  drawCard,
  revealHoleCard,
  setGameFinished,
  isGameFinished,
  determineWinner,
  determineEarlyWinner,
  getGameResult,
  addActionToHistory,
  addEventToLastAction,
} from '../../src/utils/game';

const createDefaultGameState = (
  customizations: Partial<GameState> = {},
): GameState => ({
  deck: [],
  player: [],
  dealer: [],
  isFinished: false,
  history: [
    {
      action: 'New Game',
      actor: 'agonyz',
      cardsInPlay: [
        { owner: 'Dealer', cards: [] },
        { owner: 'Player', cards: [] },
      ],
      events: [],
    },
  ],
  ...customizations,
});

// mock deck functions
jest.mock('../../src/utils/deck', () => ({
  createDeck: jest.fn(),
  shuffleDeck: jest.fn(),
}));

describe('game.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize a new game with a shuffled deck', () => {
      const mockDeck = [
        { suit: 'h', rank: '2' },
        { suit: 'd', rank: '3' },
        { suit: 'c', rank: '4' },
        { suit: 's', rank: '5' },
        // ... more cards aren't needed for testing :)
      ] as HandCard[];
      (createDeck as jest.Mock).mockReturnValue(mockDeck);
      (shuffleDeck as jest.Mock).mockReturnValue(mockDeck);

      const result = initialize();

      expect(result.deck).toEqual(mockDeck.slice(4)); // remove first 4 cards for player and dealer
      expect(result.player).toHaveLength(2);
      expect(result.dealer).toHaveLength(2);
      expect(result.isFinished).toBe(false);
    });
  });

  describe('drawCard', () => {
    it('should draw a card for the player', () => {
      const gameState = createDefaultGameState({
        deck: [{ suit: 'h', rank: '2' }] as HandCard[],
      });
      drawCard(gameState, true);

      expect(gameState.player).toHaveLength(1);
      expect(gameState.deck).toHaveLength(0);
    });

    it('should draw a card for the dealer', () => {
      const gameState = createDefaultGameState({
        deck: [{ suit: 'h', rank: '2' }] as HandCard[],
      });

      drawCard(gameState, false);

      expect(gameState.dealer).toHaveLength(1);
      expect(gameState.deck).toHaveLength(0);
    });

    it('should throw an error if no more cards in the deck', () => {
      const gameState = createDefaultGameState();

      expect(() => drawCard(gameState, true)).toThrow(
        'No more cards in the deck',
      );
    });
  });

  describe('revealHoleCard', () => {
    it("should reveal the dealer's hole card", () => {
      const gameState = createDefaultGameState({
        dealer: [
          { suit: 'h', rank: '2', hidden: true },
          { suit: 'd', rank: '3', hidden: false },
        ],
      });
      revealHoleCard(gameState);

      expect(gameState.dealer[0].hidden).toBe(false);
    });
  });

  describe('setGameFinished', () => {
    it('should set the game as finished', () => {
      const gameState = createDefaultGameState();
      setGameFinished(gameState);

      expect(gameState.isFinished).toBe(true);
    });
  });

  describe('isGameFinished', () => {
    it('should return true if the game is finished', () => {
      const gameState = createDefaultGameState({ isFinished: true });
      expect(isGameFinished(gameState)).toBe(true);
    });

    it('should return false if the game is not finished', () => {
      const gameState = createDefaultGameState();
      expect(isGameFinished(gameState)).toBe(false);
    });

    it('should return false if gameState is null', () => {
      expect(isGameFinished(null)).toBe(false);
    });
  });

  describe('determineWinner', () => {
    it('should determine the winner correctly', () => {
      const gameState = createDefaultGameState();
      const result: GameResult = determineWinner(gameState, 20, 19);

      expect(result).toEqual({
        winner: 'Player',
        playerHandValue: 20,
        dealerHandValue: 19,
      });
    });

    it('should handle a tie', () => {
      const gameState = createDefaultGameState();
      const result: GameResult = determineWinner(gameState, 20, 20);

      expect(result).toEqual({
        winner: 'Tie',
        playerHandValue: 20,
        dealerHandValue: 20,
      });
    });

    it('should handle player bust', () => {
      const gameState = createDefaultGameState();
      const result: GameResult = determineWinner(gameState, 22, 20);

      expect(result).toEqual({
        winner: 'Dealer',
        playerHandValue: 22,
        dealerHandValue: 20,
      });
    });

    it('should handle dealer bust', () => {
      const gameState = createDefaultGameState();
      const result: GameResult = determineWinner(gameState, 20, 22);

      expect(result).toEqual({
        winner: 'Player',
        playerHandValue: 20,
        dealerHandValue: 22,
      });
    });

    it('should handle dealer and player bust', () => {
      const gameState = createDefaultGameState();
      const result: GameResult = determineWinner(gameState, 22, 22);

      expect(result).toEqual({
        winner: 'Tie',
        playerHandValue: 22,
        dealerHandValue: 22,
      });
    });

    it('should handle dealer winning by better cards', () => {
      const gameState = createDefaultGameState();
      const result: GameResult = determineWinner(gameState, 20, 21);

      expect(result).toEqual({
        winner: 'Dealer',
        playerHandValue: 20,
        dealerHandValue: 21,
      });
    });
  });

  describe('determineEarlyWinner', () => {
    it('should return null if no early winner', () => {
      const gameState = createDefaultGameState();
      const result: GameResult | null = determineEarlyWinner(gameState, 20, 17);

      expect(gameState.winner).toBeUndefined();
      expect(result).toBeNull();
    });

    it('should handle a tie', () => {
      const gameState = createDefaultGameState();
      const result: GameResult | null = determineEarlyWinner(gameState, 22, 22);

      expect(gameState.winner).toBe('Tie');
      expect(result).toEqual({
        winner: 'Tie',
        playerHandValue: 22,
        dealerHandValue: 22,
      });
    });

    it('should handle player bust', () => {
      const gameState = createDefaultGameState();
      const result: GameResult | null = determineEarlyWinner(gameState, 22, 20);

      expect(gameState.winner).toBe('Dealer');
      expect(result).toEqual({
        winner: 'Dealer',
        playerHandValue: 22,
        dealerHandValue: 20,
      });
    });

    it('should handle dealer bust', () => {
      const gameState = createDefaultGameState();
      const result: GameResult | null = determineEarlyWinner(gameState, 20, 22);

      expect(gameState.winner).toBe('Player');
      expect(result).toEqual({
        winner: 'Player',
        playerHandValue: 20,
        dealerHandValue: 22,
      });
    });
  });

  describe('getGameResult', () => {
    it('should return win for Winner: Player as Player', () => {
      expect(getGameResult('Player', true)).toBe('win');
    });

    it('should return loss for Winner: Dealer as Player', () => {
      expect(getGameResult('Dealer', true)).toBe('loss');
    });

    it('should return tie for Winner: Tie as Player', () => {
      expect(getGameResult('Tie', true)).toBe('tie');
    });

    it('should return win for Winner: Dealer as Dealer', () => {
      expect(getGameResult('Dealer', false)).toBe('win');
    });

    it('should return loss for Winner: Player as Dealer', () => {
      expect(getGameResult('Player', false)).toBe('loss');
    });

    it('should return tie for Winner: Tie as Dealer', () => {
      expect(getGameResult('Tie', false)).toBe('tie');
    });

    it('should return undefined for Winner: undefined as Player', () => {
      expect(getGameResult(undefined, true)).toBe(undefined);
    });

    it('should return undefined for Winner: undefined as Dealer', () => {
      expect(getGameResult(undefined, false)).toBe(undefined);
    });
  });

  describe('addActionToHistory', () => {
    it('should add an action to the history', () => {
      const gameState = createDefaultGameState();
      const newAction = 'New Game';
      const newActor = 'agonyz';

      addActionToHistory(gameState, newAction, newActor);
      const expectedEntry: HistoryEntry = {
        action: newAction,
        actor: newActor,
        cardsInPlay: [
          {
            owner: 'Dealer',
            cards: [
              { rank: 'K', suit: 's', hidden: true },
              { rank: 'K', suit: 'd', hidden: false },
            ],
          },
          {
            owner: 'Player',
            cards: [
              { rank: 'A', suit: 's', hidden: false },
              { rank: 'A', suit: 'd', hidden: false },
            ],
          },
        ],
      };
      expect(gameState.history.length).toBeGreaterThan(0);
      const lastEntry = gameState.history[0];
      expect(lastEntry.action).toBe(newAction);
      expect(lastEntry.actor).toBe(newActor);
    });
  });

  describe('addEventToLastAction', () => {
    it('should add an event to the last action in history', () => {
      const gameState = createDefaultGameState({
        history: [
          {
            action: 'New Game',
            actor: 'agonyz',
            cardsInPlay: [],
            events: [],
          },
        ],
      });
      const step: Step = 'Player: Draw Card';
      addEventToLastAction(gameState, step);
      const expectedEvent = {
        step,
        cardsInPlay: [
          { owner: 'Dealer', cards: gameState.dealer },
          { owner: 'Player', cards: gameState.player },
        ],
      };
      expect(gameState.history.length).toBeGreaterThan(0);

      const lastEntry = gameState.history[0];
      expect(lastEntry.events!.length).toBeGreaterThan(0);

      const lastEvent = lastEntry.events![0];
      expect(lastEvent.step).toBe(step);
      expect(lastEvent.cardsInPlay).toEqual(expectedEvent.cardsInPlay);
    });

    it('should initialize the events array if it does not exist', () => {
      const gameState = createDefaultGameState({
        history: [
          {
            action: 'New Game',
            actor: 'agonyz',
            cardsInPlay: [],
            events: undefined,
          },
        ],
      });
      const step: Step = 'Dealer: Draw Card';
      addEventToLastAction(gameState, step);
      const expectedEvent = {
        step,
        cardsInPlay: [
          { owner: 'Dealer', cards: gameState.dealer },
          { owner: 'Player', cards: gameState.player },
        ],
      };

      expect(gameState.history.length).toBeGreaterThan(0);
      const lastEntry = gameState.history[0];
      expect(lastEntry.events!.length).toBeGreaterThan(0);
      const lastEvent = lastEntry.events![0];
      expect(lastEvent.step).toBe(step);
      expect(lastEvent.cardsInPlay).toEqual(expectedEvent.cardsInPlay);
    });
  });
});
