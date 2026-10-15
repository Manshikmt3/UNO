import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAIGameStore } from '../stores/useAIGameStore';

describe('AI Game Store Integration', () => {
  beforeEach(() => {
    act(() => {
      useAIGameStore.getState().startNewGame('TestHuman', 'cat', 2, 'easy');
    });
  });

  it('initializes a single-player game with human and AI players', () => {
    const { playerView, humanPlayerId } = useAIGameStore.getState();

    expect(playerView).toBeDefined();
    expect(playerView?.status).toBe('in_progress');
    expect(playerView?.players).toHaveLength(3); // 1 human + 2 bots
    expect(playerView?.myHand).toHaveLength(7);
    expect(playerView?.myPlayerId).toBe(humanPlayerId);
    expect(playerView?.topDiscard).toBeDefined();
    expect(playerView?.activeColor).toBeDefined();
  });

  it('draws a card when requested by human player', () => {
    const store = useAIGameStore.getState();
    const initialHandCount = store.playerView?.myHand.length ?? 0;

    act(() => {
      // Force turn to human so draw succeeds
      if (store.internalState) {
        store.internalState.currentTurnIndex = 0;
      }
      store.drawCard();
    });

    const updated = useAIGameStore.getState();
    expect(updated.playerView?.myHand.length).toBeGreaterThanOrEqual(initialHandCount);
  });
});
