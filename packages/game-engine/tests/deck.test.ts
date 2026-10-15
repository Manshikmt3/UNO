import { describe, expect, it } from 'vitest';
import { CARD_COLORS } from '@uno-arena/shared';
import { createStandardDeck, dealCards, shuffleDeck } from '../src/deck/deck';

describe('Deck Engine', () => {
  it('creates a standard 108-card UNO deck with correct composition', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(108);

    // 4 colors
    for (const color of CARD_COLORS) {
      const colorCards = deck.filter((c) => c.color === color);
      // 1 zero + 18 numbers (1-9 x 2) + 6 action (2 skip, 2 rev, 2 draw2) = 25 cards
      expect(colorCards).toHaveLength(25);

      const zeros = colorCards.filter((c) => c.type === 'number' && c.value === 0);
      expect(zeros).toHaveLength(1);

      for (let v = 1; v <= 9; v++) {
        const numbers = colorCards.filter((c) => c.type === 'number' && c.value === v);
        expect(numbers).toHaveLength(2);
      }

      expect(colorCards.filter((c) => c.type === 'skip')).toHaveLength(2);
      expect(colorCards.filter((c) => c.type === 'reverse')).toHaveLength(2);
      expect(colorCards.filter((c) => c.type === 'draw2')).toHaveLength(2);
    }

    // Wilds
    const wilds = deck.filter((c) => c.type === 'wild');
    expect(wilds).toHaveLength(4);

    const wild4s = deck.filter((c) => c.type === 'wild4');
    expect(wild4s).toHaveLength(4);
  });

  it('shuffles deck preserving all 108 cards', () => {
    const original = createStandardDeck();
    const shuffled = shuffleDeck(original);

    expect(shuffled).toHaveLength(108);
    const originalIds = original.map((c) => c.id).sort();
    const shuffledIds = shuffled.map((c) => c.id).sort();
    expect(shuffledIds).toEqual(originalIds);
  });

  it('deals correct number of cards and reduces remaining deck', () => {
    const deck = createStandardDeck();
    const { dealt, remaining } = dealCards(deck, 7);

    expect(dealt).toHaveLength(7);
    expect(remaining).toHaveLength(101);
  });
});
