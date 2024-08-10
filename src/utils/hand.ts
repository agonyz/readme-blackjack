import { HandCard } from '../types';

export const cardValue = (card: HandCard): number => {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J', 'T'].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
};

export const calculateHandValue = (
  cards: HandCard[],
  onlyVisible: boolean = false,
): number => {
  let totalValue = 0;
  let aceCount = 0;

  for (const card of cards) {
    if (onlyVisible && card.hidden) {
      continue;
    }
    totalValue += cardValue(card);
    if (card.rank === 'A') aceCount++;
  }

  while (totalValue > 21 && aceCount > 0) {
    totalValue -= 10; // counting ace as 1 instead of 11
    aceCount--;
  }

  return totalValue;
};

// todo: simplify both methods by using utils
export const getAceDisplayValue = (
  cards: HandCard[],
  index: number,
): number => {
  let totalValue = 0;

  for (const card of cards) {
    if (!card.hidden) {
      totalValue += cardValue(card);
    }
  }

  let currentAceIndex = 0;
  for (const card of cards) {
    if (card.rank === 'A' && !card.hidden) {
      if (currentAceIndex === index) {
        if (totalValue > 21) {
          return 1;
        }
        return 11;
      }
      currentAceIndex++;
    }
  }

  return 11;
};
