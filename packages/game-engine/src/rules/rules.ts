import { Card, CardColor } from '@uno-arena/shared';

export interface MoveValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Checks if a specific card can be legally played on top of the current discard/active color.
 *
 * @param card - The card the player wants to play.
 * @param topDiscard - The current top card on the discard pile.
 * @param activeColor - The current active color (which may differ from topDiscard if a Wild was played).
 * @param hand - Optional full hand of the player, required for strict Wild Draw Four challenge check.
 * @param strictWd4Rule - If true, rejects WD4 if player holds matching activeColor. Standard rules allow playing it at risk of challenge.
 */
export function isValidMove(
  card: Card,
  topDiscard: Card,
  activeColor: CardColor,
  hand?: Card[],
  strictWd4Rule: boolean = false
): MoveValidationResult {
  // 1. Wild cards are always legal to play from hand
  if (card.type === 'wild') {
    return { valid: true };
  }

  // 2. Wild Draw Four:
  if (card.type === 'wild4') {
    if (strictWd4Rule && hand) {
      const hasMatchingColor = hand.some(
        (c) => c.id !== card.id && c.color === activeColor
      );
      if (hasMatchingColor) {
        return {
          valid: false,
          reason: 'Wild Draw 4 can only be played when you hold no cards matching the active color.',
        };
      }
    }
    return { valid: true };
  }

  // 3. Color matching: card color matches active color
  if (card.color === activeColor) {
    return { valid: true };
  }

  // 4. Number cards: match number value
  if (
    card.type === 'number' &&
    topDiscard.type === 'number' &&
    card.value !== undefined &&
    topDiscard.value !== undefined &&
    card.value === topDiscard.value
  ) {
    return { valid: true };
  }

  // 5. Action cards: match symbol/type (e.g. skip on skip, reverse on reverse, draw2 on draw2)
  if (card.type === topDiscard.type && card.type !== 'number') {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Card (${card.color || ''} ${card.type}${card.value !== undefined ? ' ' + card.value : ''}) does not match active color (${activeColor}) or top discard symbol (${topDiscard.type}).`,
  };
}

/**
 * Verifies if player has at least one legal card in hand.
 */
export function hasPlayableCard(
  hand: Card[],
  topDiscard: Card,
  activeColor: CardColor
): boolean {
  return hand.some((card) => isValidMove(card, topDiscard, activeColor).valid);
}

/**
 * Returns all playable cards in the player's hand.
 */
export function getPlayableCards(
  hand: Card[],
  topDiscard: Card,
  activeColor: CardColor
): Card[] {
  return hand.filter((card) => isValidMove(card, topDiscard, activeColor).valid);
}

/**
 * Checks if a player legally played Wild Draw Four.
 * Returns true if legal (the player had NO cards matching activeColor in hand BEFORE the WD4 was played).
 */
export function isWildDrawFourPlayLegal(
  handExcludingWd4: Card[],
  activeColor: CardColor
): boolean {
  return !handExcludingWd4.some((c) => c.color === activeColor);
}
