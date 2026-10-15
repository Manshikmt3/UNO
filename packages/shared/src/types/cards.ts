export type CardColor = 'red' | 'blue' | 'green' | 'yellow';

export type CardType =
  | 'number'
  | 'skip'
  | 'reverse'
  | 'draw2'
  | 'wild'
  | 'wild4';

export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Card {
  id: string;
  type: CardType;
  color?: CardColor;
  value?: CardValue;
}

export const CARD_COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export const COLOR_HEX_MAP: Record<CardColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
};

export const COLOR_LABEL_MAP: Record<CardColor, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
};
