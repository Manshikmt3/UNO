import { Card } from '@uno-arena/shared';

/**
 * Calculates point value for a single card based on official UNO tournament rules:
 * - Number cards: Face value (0-9)
 * - Draw Two, Reverse, Skip: 20 points each
 * - Wild, Wild Draw Four: 50 points each
 */
export function calculateCardScore(card: Card): number {
  if (card.type === 'number') {
    return card.value ?? 0;
  }
  if (card.type === 'skip' || card.type === 'reverse' || card.type === 'draw2') {
    return 20;
  }
  if (card.type === 'wild' || card.type === 'wild4') {
    return 50;
  }
  return 0;
}

/**
 * Calculates the total score of an entire hand.
 */
export function calculateHandScore(hand: Card[]): number {
  return hand.reduce((sum, card) => sum + calculateCardScore(card), 0);
}

/**
 * Calculates round victory points.
 * Winner receives the sum of point values of all remaining cards in all opponents' hands.
 */
export function calculateRoundScores(
  winnerId: string,
  hands: Record<string, Card[]>,
  currentScores: Record<string, number> = {}
): {
  roundScore: number;
  newScores: Record<string, number>;
  handScores: Record<string, number>;
} {
  let roundScore = 0;
  const handScores: Record<string, number> = {};

  for (const [playerId, hand] of Object.entries(hands)) {
    const score = calculateHandScore(hand);
    handScores[playerId] = score;
    if (playerId !== winnerId) {
      roundScore += score;
    }
  }

  const newScores: Record<string, number> = { ...currentScores };
  newScores[winnerId] = (newScores[winnerId] || 0) + roundScore;

  return {
    roundScore,
    newScores,
    handScores,
  };
}
