import fs from 'fs/promises';
import path from 'path';
import { GameState, HandCard, HistoryEntry } from '../types';
import { calculateHandValue, cardValue, getAceDisplayValue } from './hand';
import { getGameResult } from './game';

const readmePath = path.join(__dirname, '..', '..', 'README.md');

export const generateCardTableMarkdown = (
  cards: HandCard[],
  result?: 'win' | 'loss' | 'tie',
): string => {
  const cardHeaders = cards
    .map((_, index) => `Card #${index + 1}`)
    .join('</th><th>');

  const cardImages = cards
    .map((card) => {
      const cardFilename = card.hidden
        ? 'RED_BACK'
        : `${card.rank}${card.suit}`;
      const cardAlt = card.hidden ? 'Hidden Card' : `${card.rank}${card.suit}`;
      return `<img width="75" src="assets/cards/${cardFilename.toUpperCase()}.svg" alt="${cardAlt}">`;
    })
    .join('</td><td>');

  const visibleHandValue = calculateHandValue(cards, true);

  let aceCount = 0;
  const cardValues = cards
    .map((card, index) => {
      if (card.hidden) {
        return '?';
      } else if (card.rank === 'A') {
        aceCount++;
        return getAceDisplayValue(cards, aceCount - 1);
      } else {
        return cardValue(card);
      }
    })
    .join('</td><td align="center">');

  let resultSymbol = '';
  switch (result) {
    case 'win':
      resultSymbol = '✔️';
      break;
    case 'loss':
      resultSymbol = '❌';
      break;
    case 'tie':
      resultSymbol = '🤝';
      break;
    default:
      resultSymbol = '';
  }

  return `
<table>
  <tr>
    <th></th>
    <th>${cardHeaders}</th>
    <th>Summary</th>
  </tr>
  <tr>
    <td><strong>Cards</strong></td>
    <td align="center">${cardImages}</td>
    <td align="center">${resultSymbol}</td>
  </tr>
  <tr>
    <td><strong>Values</strong></td>
    <td align="center">${cardValues}</td>
    <td align="center">${visibleHandValue}</td>
  </tr>
</table>
  `;
};

export const generateHistoryMarkdown = (history: HistoryEntry[]): string => {
  return history
    .map(({ action, events, actor, cardsInPlay }) => {
      const actionActorUrl =
        actor === 'Dealer'
          ? "<a href='https://github.com/agonyz'>Dealer</a>"
          : `<a href='https://github.com/${actor}'>${actor}</a>`;
      const actionRow = `| ${action} || ${actionActorUrl} |`;
      const eventsRows = events
        ? events
            .map(({ step, cardsInPlay }) => {
              return `| ↳ | ${step} ||`;
            })
            .join('\n')
        : '';
      return eventsRows ? `${actionRow}\n${eventsRows}` : actionRow;
    })
    .join('\n');
};

export const updateReadmeContent = async (
  gameState: GameState,
): Promise<void> => {
  try {
    const dealerResult = getGameResult(gameState.winner, false);
    const playerResult = getGameResult(gameState.winner, true);

    const dealerCardsMarkdown = generateCardTableMarkdown(
      gameState.dealer,
      dealerResult,
    );

    const playerCardsMarkdown = generateCardTableMarkdown(
      gameState.player,
      playerResult,
    );

    const historyMarkdown = generateHistoryMarkdown(gameState.history);
    let readmeContent = await fs.readFile(readmePath, 'utf-8');
    const newContent = `
## Dealer
<div>
${dealerCardsMarkdown}
</div>

## Player
<div>
${playerCardsMarkdown}
</div>

## Game History
| Action | Events | Actor |
| ------ | ------ | ----- |
${historyMarkdown}
`;

    const startMarker = '<!-- blackjack-area -->';
    const endMarker = '<!-- /blackjack-area -->';
    const startIndex = readmeContent.indexOf(startMarker) + startMarker.length;
    const endIndex = readmeContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      console.error('Markers not found in README.md');
      return;
    }
    readmeContent = `${readmeContent.substring(0, startIndex)}\n${newContent}\n${readmeContent.substring(endIndex)}`;

    await fs.writeFile(readmePath, readmeContent, 'utf-8');
  } catch (error) {
    console.error('Error updating README:', error);
  }
};
