import {
  generateCardTableMarkdown,
  generateHistoryMarkdown,
  updateReadmeContent,
} from '../../src/utils/readme';
import { GameState, HandCard, HistoryEntry } from '../../src/types';
import fs from 'fs/promises';

jest.mock('fs/promises');

describe('readme.ts', () => {
  describe('generateCardTableMarkdown', () => {
    it('should generate card headers', () => {
      const cards: HandCard[] = [
        { rank: 'A', suit: 's', hidden: false },
        { rank: 'K', suit: 'd', hidden: false },
      ];
      const result = generateCardTableMarkdown(cards);
      expect(result).toContain('<th>Card #1</th><th>Card #2</th>');
    });

    it('should generate card images', () => {
      const cards: HandCard[] = [
        { rank: 'A', suit: 's', hidden: false },
        { rank: 'K', suit: 'd', hidden: true },
      ];
      const result = generateCardTableMarkdown(cards);
      expect(result).toContain(
        '<img width="75" src="assets/cards/AS.svg" alt="As">',
      );
      expect(result).toContain(
        '<img width="75" src="assets/cards/RED_BACK.svg" alt="Hidden Card">',
      );
    });

    it('should generate summary symbols', () => {
      const cards: HandCard[] = [
        { rank: 'A', suit: 's', hidden: false },
        { rank: 'K', suit: 'd', hidden: true },
      ];
      const result = generateCardTableMarkdown(cards, 'tie');
      expect(result).toContain('🤝');
    });
  });

  describe('generateHistoryMarkdown', () => {
    it('should generate history rows', () => {
      const history: HistoryEntry[] = [
        { action: 'Hit', actor: 'agonyz', events: [], cardsInPlay: [] },
      ];
      const result = generateHistoryMarkdown(history);
      expect(result).toContain(
        "| Hit || <a href='https://github.com/agonyz'>agonyz</a> |",
      );
    });

    it('should generate markdown for Dealer', () => {
      const history: HistoryEntry[] = [
        {
          action: 'Hit',
          events: [{ step: 'Dealer: Draw Card', cardsInPlay: [] }],
          actor: 'Dealer',
          cardsInPlay: [],
        },
      ];

      const expectedMarkdown = `
| Hit || <a href='https://github.com/agonyz'>Dealer</a> |
| ↳ | Dealer: Draw Card ||`.trim();

      const result = generateHistoryMarkdown(history);
      expect(result).toBe(expectedMarkdown);
    });

    it('should generate history rows with events', () => {
      const history: HistoryEntry[] = [
        {
          action: 'Hit',
          actor: 'agonyz',
          events: [
            { step: 'Player: Draw Card', cardsInPlay: [] },
            { step: 'Dealer: Draw Card', cardsInPlay: [] },
          ],
          cardsInPlay: [],
        },
      ];
      const result = generateHistoryMarkdown(history);
      expect(result).toContain(
        "| Hit || <a href='https://github.com/agonyz'>agonyz</a> |",
      );

      expect(result).toContain('| ↳ | Player: Draw Card ||');
      expect(result).toContain('| ↳ | Dealer: Draw Card ||');
    });

    it('should generate markdown correctly when events are undefined', () => {
      const history: HistoryEntry[] = [
        {
          action: 'Hit',
          actor: 'agonyz',
          cardsInPlay: [],
        },
      ];

      const expectedMarkdown = `
| Hit || <a href='https://github.com/agonyz'>agonyz</a> |`.trim();

      const result = generateHistoryMarkdown(history);
      expect(result).toBe(expectedMarkdown);
    });
  });

  describe('updateReadmeContent', () => {
    it('should update README content', async () => {
      const gameState: GameState = {
        dealer: [{ rank: 'A', suit: 's', hidden: false }],
        player: [{ rank: 'K', suit: 'd', hidden: false }],
        history: [],
        winner: 'Player',
        isFinished: false,
        deck: [],
      };
      const fakeReadmeContent =
        '## Introduction\n<!-- blackjack-area -->\nOld content\n<!-- /blackjack-area -->\n## Footer';

      (fs.readFile as jest.Mock).mockResolvedValue(fakeReadmeContent);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      await updateReadmeContent(gameState);

      const expectedNewContent = expect.stringContaining('## Dealer');
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        expectedNewContent,
        'utf-8',
      );
    });

    it('should handle missing markers in README', async () => {
      const gameState: GameState = {
        dealer: [],
        player: [],
        history: [],
        winner: 'Player',
        isFinished: false,
        deck: [],
      };
      const fakeReadmeContent = '## Introduction\nSome content\n## Footer';

      (fs.readFile as jest.Mock).mockResolvedValue(fakeReadmeContent);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateReadmeContent(gameState);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Markers not found in README.md',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should log an error if reading the README fails', async () => {
      const gameState: GameState = {
        dealer: [],
        player: [],
        history: [],
        winner: 'Player',
        isFinished: false,
        deck: [],
      };
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('Read error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateReadmeContent(gameState);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating README:',
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
