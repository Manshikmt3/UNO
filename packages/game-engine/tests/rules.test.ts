import { describe, expect, it } from 'vitest';
import { Card } from '@uno-arena/shared';
import { getPlayableCards, hasPlayableCard, isValidMove, isWildDrawFourPlayLegal } from '../src/rules/rules';

describe('Rules Engine', () => {
  const red5: Card = { id: 'r5', type: 'number', color: 'red', value: 5 };
  const redSkip: Card = { id: 'r_skip', type: 'skip', color: 'red' };
  const blue5: Card = { id: 'b5', type: 'number', color: 'blue', value: 5 };
  const blueSkip: Card = { id: 'b_skip', type: 'skip', color: 'blue' };
  const green9: Card = { id: 'g9', type: 'number', color: 'green', value: 9 };
  const wild: Card = { id: 'w1', type: 'wild' };
  const wild4: Card = { id: 'w4_1', type: 'wild4' };

  it('allows matching color plays', () => {
    const res = isValidMove(redSkip, red5, 'red');
    expect(res.valid).toBe(true);
  });

  it('allows matching number plays across different colors', () => {
    const res = isValidMove(blue5, red5, 'red');
    expect(res.valid).toBe(true);
  });

  it('allows matching action symbol across different colors', () => {
    const res = isValidMove(blueSkip, redSkip, 'red');
    expect(res.valid).toBe(true);
  });

  it('allows wild and wild draw 4 plays unconditionally from hand', () => {
    expect(isValidMove(wild, red5, 'red').valid).toBe(true);
    expect(isValidMove(wild4, red5, 'red').valid).toBe(true);
  });

  it('rejects cards that do not match color, number, or symbol', () => {
    const res = isValidMove(green9, red5, 'red');
    expect(res.valid).toBe(false);
    expect(res.reason).toBeDefined();
  });

  it('verifies playable cards in hand', () => {
    const hand = [green9, blue5, wild];
    expect(hasPlayableCard(hand, red5, 'red')).toBe(true);

    const playable = getPlayableCards(hand, red5, 'red');
    expect(playable).toHaveLength(2); // blue5 (number 5 match) and wild
    expect(playable.map((c) => c.id)).toContain('b5');
    expect(playable.map((c) => c.id)).toContain('w1');
  });

  it('evaluates WD4 challenge legality', () => {
    // If player hand has a card matching activeColor, WD4 play was illegal!
    const handWithRed = [red5, blueSkip];
    expect(isWildDrawFourPlayLegal(handWithRed, 'red')).toBe(false);

    // If player hand has no cards matching activeColor, WD4 play was legal!
    const handWithoutRed = [green9, blueSkip];
    expect(isWildDrawFourPlayLegal(handWithoutRed, 'red')).toBe(true);
  });
});
