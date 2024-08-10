import { createDeck, shuffleDeck } from '../../src/utils/deck';

describe('deck.ts', () => {
  describe('createDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should create a deck with 4 suits and 13 ranks', () => {
      const deck = createDeck();
      const suits = ['h', 'd', 'c', 's'];
      const ranks = [
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'T',
        'J',
        'Q',
        'K',
        'A',
      ];

      // check each suit
      suits.forEach((suit) => {
        const suitCards = deck.filter((card) => card.suit === suit);
        expect(suitCards).toHaveLength(13);

        // check each rank
        ranks.forEach((rank) => {
          expect(suitCards).toContainEqual({ suit, rank });
        });
      });
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle the deck and return a random order', () => {
      const deck = createDeck();
      const shuffledDeck = shuffleDeck([...deck]);

      // check that the shuffled deck has the same length as the original
      expect(shuffledDeck).toHaveLength(deck.length);

      // check that the shuffled deck is not in the same order as the original
      const isDifferentOrder = !deck.every(
        (card, index) => card === shuffledDeck[index],
      );
      expect(isDifferentOrder).toBe(true);
    });
  });
});
