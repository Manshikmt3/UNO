import { describe, expect, it } from 'vitest';
import { Card } from '@uno-arena/shared';
import { calculateCardScore, calculateHandScore, calculateRoundScores } from '../src/scoring/scoring';

describe('Scoring Engine', () => {
  it('calculates individual card point values correctly', () => {
    expect(calculateCardScore({ id: '1', type: 'number', value: 0 })).toBe(0);
    expect(calculateCardScore({ id: '2', type: 'number', value: 7 })).toBe(7);
    expect(calculateCardScore({ id: '3', type: 'skip', color: 'red' })).toBe(20);
    expect(calculateCardScore({ id: '4', type: 'reverse', color: 'blue' })).toBe(20);
    expect(calculateCardScore({ id: '5', type: 'draw2', color: 'green' })).toBe(20);
    expect(calculateCardScore({ id: '6', type: 'wild' })).toBe(50);
    expect(calculateCardScore({ id: '7', type: 'wild4' })).toBe(50);
  });

  it('calculates hand score correctly', () => {
    const hand: Card[] = [
      { id: '1', type: 'number', value: 5 },
      { id: '2', type: 'skip', color: 'red' }, // 20
      { id: '3', type: 'wild' }, // 50
    ];
    expect(calculateHandScore(hand)).toBe(75);
  });

  it('calculates round scores and updates totals', () => {
    const hands: Record<string, Card[]> = {
      winner: [],
      loser1: [
        { id: '1', type: 'number', value: 8 },
        { id: '2', type: 'draw2', color: 'yellow' }, // 20 -> 28
      ],
      loser2: [
        { id: '3', type: 'wild4' }, // 50
      ],
    };

    const initialScores = { winner: 100, loser1: 20 };
    const { roundScore, newScores } = calculateRoundScores('winner', hands, initialScores);

    // Total opponent points: 28 + 50 = 78
    expect(roundScore).toBe(78);
    expect(newScores.winner).toBe(178);
    expect(newScores.loser1).toBe(20);
  });
});
