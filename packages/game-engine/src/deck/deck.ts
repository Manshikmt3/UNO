import { Card, CardColor, CARD_COLORS, CardType, CardValue } from '@uno-arena/shared';

/**
 * Generates a full standard 108-card UNO-style deck.
 */
export function createStandardDeck(): Card[] {
  const cards: Card[] = [];
  let idCounter = 1;

  for (const color of CARD_COLORS) {
    // 1x Zero card per color
    cards.push({
      id: `c_${color}_0_${idCounter++}`,
      type: 'number',
      color,
      value: 0,
    });

    // 2x 1-9 per color
    for (let v = 1; v <= 9; v++) {
      for (let copy = 1; copy <= 2; copy++) {
        cards.push({
          id: `c_${color}_${v}_${copy}_${idCounter++}`,
          type: 'number',
          color,
          value: v as CardValue,
        });
      }
    }

    // 2x Action cards per color (Skip, Reverse, Draw Two)
    const actionTypes: CardType[] = ['skip', 'reverse', 'draw2'];
    for (const actionType of actionTypes) {
      for (let copy = 1; copy <= 2; copy++) {
        cards.push({
          id: `c_${color}_${actionType}_${copy}_${idCounter++}`,
          type: actionType,
          color,
        });
      }
    }
  }

  // 4x Wild cards
  for (let i = 1; i <= 4; i++) {
    cards.push({
      id: `c_wild_${i}_${idCounter++}`,
      type: 'wild',
    });
  }

  // 4x Wild Draw Four cards
  for (let i = 1; i <= 4; i++) {
    cards.push({
      id: `c_wild4_${i}_${idCounter++}`,
      type: 'wild4',
    });
  }

  return cards;
}

/**
 * Fisher-Yates (Knuth) in-place/copy shuffle algorithm.
 */
export function shuffleDeck(deck: readonly Card[], rng: () => number = Math.random): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Deals N cards from top of deck.
 */
export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
}
