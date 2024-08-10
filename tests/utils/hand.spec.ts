import { HandCard } from '../../src/types';
import { calculateHandValue, getAceDisplayValue } from '../../src/utils/hand';
import { getActor } from '../../src/utils/github';

describe('hand.ts', () => {
  describe('calculateHandValue', () => {
    it('should calculate the value of a hand with no aces', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: '2', hidden: false },
        { suit: 'd', rank: 'K', hidden: false },
        { suit: 's', rank: '7', hidden: false },
      ];
      expect(calculateHandValue(hand)).toBe(19); // 2 + 10 + 7
    });

    it('should calculate the value of a hand with one ace as 11', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: 'A', hidden: false },
        { suit: 'd', rank: '7', hidden: false },
      ];
      expect(calculateHandValue(hand)).toBe(18); // 11 + 7
    });

    it('should calculate the value of a hand with one ace as 1 if counting as 11 would bust', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: 'A', hidden: false },
        { suit: 'd', rank: 'K', hidden: false },
        { suit: 's', rank: '9', hidden: false },
      ];
      expect(calculateHandValue(hand)).toBe(20); // 1 (A) + 10 (K) + 9
    });

    it('should calculate the value of a hand with multiple aces', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: 'A', hidden: false },
        { suit: 'd', rank: 'A', hidden: false },
        { suit: 's', rank: '9', hidden: false },
      ];
      expect(calculateHandValue(hand)).toBe(21); // 1 (A) + 10 (A + 9)
    });

    it('should calculate the value of a hand with multiple aces, some counted as 11 and some as 1', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: 'A', hidden: false },
        { suit: 'd', rank: 'A', hidden: false },
        { suit: 'c', rank: 'A', hidden: false },
        { suit: 's', rank: '9', hidden: false },
      ];
      expect(calculateHandValue(hand)).toBe(12); // 1 (A) + 1 (A) + 1 (A) + 9
    });

    it('should calculate the value of a hand with face cards', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: 'K', hidden: false },
        { suit: 'd', rank: 'Q', hidden: false },
        { suit: 's', rank: 'J', hidden: false },
      ];
      expect(calculateHandValue(hand)).toBe(30); // 10 (K) + 10 (Q) + 10 (J)
    });

    it('should skip hidden cards when calculating the value with option onlyVisible', () => {
      const hand: HandCard[] = [
        { suit: 'h', rank: 'A', hidden: true },
        { suit: 'd', rank: 'K', hidden: false },
        { suit: 's', rank: '9', hidden: false },
      ];
      expect(calculateHandValue(hand, true)).toBe(19); // (?) + 10 (K) + 9
    });
  });

  describe('getAceDisplayValue', () => {
    it('should return 11 for a single ace when total value is under 21', () => {
      expect(
        getAceDisplayValue(
          [
            { rank: 'A', suit: 's', hidden: false },
            { rank: 'K', suit: 's', hidden: false },
          ],
          0,
        ),
      ).toBe(11);
    });

    it('should return 1 for the first ace when total value exceeds 21', () => {
      expect(
        getAceDisplayValue(
          [
            { rank: 'A', suit: 's', hidden: false },
            { rank: 'A', suit: 'd', hidden: false },
            { rank: 'K', suit: 'h', hidden: false },
          ],
          0,
        ),
      ).toBe(1);
    });

    it('should return 1 for the second ace when total value exceeds 21', () => {
      expect(
        getAceDisplayValue(
          [
            { rank: 'A', suit: 's', hidden: false },
            { rank: 'A', suit: 'd', hidden: false },
            { rank: 'K', suit: 'h', hidden: false },
          ],
          1,
        ),
      ).toBe(1);
    });

    it('should return 11 for an ace that does not need to be adjusted', () => {
      expect(
        getAceDisplayValue(
          [
            { rank: 'A', suit: 's', hidden: false },
            { rank: 'K', suit: 's', hidden: false },
          ],
          0,
        ),
      ).toBe(11);
    });

    it('should handle hidden aces correctly', () => {
      expect(
        getAceDisplayValue(
          [
            { rank: 'A', suit: 's', hidden: true },
            { rank: 'A', suit: 'd', hidden: false },
            { rank: 'K', suit: 'h', hidden: false },
          ],
          1,
        ),
      ).toBe(11);
    });
  });
});
