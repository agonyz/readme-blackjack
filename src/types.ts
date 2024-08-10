export type Card = {
  suit: string;
  rank: string;
};

export type HandCard = Card & {
  hidden: boolean;
};

export type CardOwner = 'Player' | 'Dealer';

export type CardsInPlay = {
  owner: CardOwner;
  cards: HandCard[];
}[];

export type Event = {
  step: Step;
  cardsInPlay: CardsInPlay;
};

export interface HistoryEntry {
  action: Action;
  events?: Event[];
  actor: string;
  cardsInPlay: CardsInPlay;
}

export type GameState = {
  deck: Card[];
  player: HandCard[];
  dealer: HandCard[];
  isFinished: boolean;
  winner?: Winner;
  history: HistoryEntry[];
};

export type GameResult = {
  playerHandValue: number;
  dealerHandValue: number;
  winner: Winner;
};

export type Winner = 'Player' | 'Dealer' | 'Tie';
export type Action = 'Stand' | 'Hit' | 'New Game' | 'Finished';

export type Step =
  | 'Player: Draw Card'
  | 'Dealer: Draw Card'
  | 'Dealer: Reveal Hole Card'
  | 'Tie: Both parties busted'
  | 'Dealer won: Player busted'
  | 'Player won: Dealer busted'
  | 'Player won: Is closer to 21'
  | 'Dealer won: Is closer to 21'
  | 'Tie: Both parties are equally close to 21'
  | 'Game Finished: Thank you for playing!';

export const ACTIONS: Action[] = ['Stand', 'Hit', 'New Game'];
export type Result = 'win' | 'loss' | 'tie' | undefined;
