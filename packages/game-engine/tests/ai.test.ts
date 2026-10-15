import { describe, expect, it } from 'vitest';
import { Card, PlayerInfo } from '@uno-arena/shared';
import { chooseAIMove } from '../src/ai/ai';
import { isValidMove } from '../src/rules/rules';
import { createInitialGameState, projectPublicGameState } from '../src/state/state';

describe('AI Decision Engine', () => {
  const players: PlayerInfo[] = [
    { id: 'human', name: 'Human', avatar: 'cat', isHost: true, isReady: true, isConnected: true, isAi: false },
    { id: 'ai1', name: 'Bot Alice', avatar: 'robot', isHost: false, isReady: true, isConnected: true, isAi: true, aiDifficulty: 'medium' },
  ];

  it('only selects legal moves from hand', () => {
    const state = createInitialGameState(players);
    state.topDiscard = { id: 'd0', type: 'number', color: 'blue', value: 3 };
    state.activeColor = 'blue';

    const aiHand: Card[] = [
      { id: 'c1', type: 'number', color: 'red', value: 7 }, // illegal
      { id: 'c2', type: 'number', color: 'blue', value: 9 }, // legal (blue)
      { id: 'c3', type: 'number', color: 'green', value: 3 }, // legal (number 3)
      { id: 'c4', type: 'wild' }, // legal (wild)
    ];

    const publicState = projectPublicGameState(state);

    // Test across all difficulty levels
    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const decision = chooseAIMove(publicState, 'ai1', aiHand, diff);
      expect(decision.type).toBe('play');
      expect(decision.cardId).toBeDefined();

      const playedCard = aiHand.find((c) => c.id === decision.cardId)!;
      const valid = isValidMove(playedCard, state.topDiscard, state.activeColor);
      expect(valid.valid).toBe(true);
    }
  });

  it('draws a card when no legal moves are in hand', () => {
    const state = createInitialGameState(players);
    state.topDiscard = { id: 'd0', type: 'number', color: 'blue', value: 3 };
    state.activeColor = 'blue';

    const aiHand: Card[] = [
      { id: 'c1', type: 'number', color: 'red', value: 7 },
      { id: 'c2', type: 'number', color: 'green', value: 8 },
      { id: 'c3', type: 'number', color: 'yellow', value: 0 },
    ];

    const publicState = projectPublicGameState(state);
    const decision = chooseAIMove(publicState, 'ai1', aiHand, 'hard');
    expect(decision.type).toBe('draw');
  });

  it('picks dominant color for wild color selection', () => {
    const state = createInitialGameState(players);
    state.pendingAction = {
      type: 'color_selection',
      playerId: 'ai1',
    };

    // AI has 3 green cards and 1 yellow card
    const aiHand: Card[] = [
      { id: 'g1', type: 'number', color: 'green', value: 1 },
      { id: 'g2', type: 'number', color: 'green', value: 2 },
      { id: 'g3', type: 'number', color: 'green', value: 3 },
      { id: 'y1', type: 'number', color: 'yellow', value: 4 },
    ];

    const publicState = projectPublicGameState(state);
    const decision = chooseAIMove(publicState, 'ai1', aiHand, 'hard');
    expect(decision.type).toBe('color');
    expect(decision.chosenColor).toBe('green');
  });

  it('Hard AI prioritizes attack cards when human opponent has 1 card left', () => {
    const state = createInitialGameState(players);
    state.currentTurnIndex = 1; // AI turn
    state.direction = 1;
    state.topDiscard = { id: 'd0', type: 'number', color: 'red', value: 2 };
    state.activeColor = 'red';

    // Human player has only 1 card left and already called UNO!
    state.hands['human'] = [{ id: 'h1', type: 'number', color: 'blue', value: 5 }];
    state.players[0].cardCount = 1;
    state.players[0].hasCalledUno = true;

    const aiHand: Card[] = [
      { id: 'num', type: 'number', color: 'red', value: 8 },
      { id: 'd2', type: 'draw2', color: 'red' }, // attack card!
    ];

    const publicState = projectPublicGameState(state);
    const decision = chooseAIMove(publicState, 'ai1', aiHand, 'hard');
    expect(decision.type).toBe('play');
    expect(decision.cardId).toBe('d2'); // Hard AI should play Draw 2 to stop opponent!
  });

  it('catches opponent when opponent forgot to call UNO', () => {
    const state = createInitialGameState(players);
    state.hands['human'] = [{ id: 'solo', type: 'number', color: 'red', value: 5 }];
    state.players[0].cardCount = 1;
    state.players[0].hasCalledUno = false; // Forgot UNO!

    const aiHand: Card[] = [{ id: 'c1', type: 'number', color: 'red', value: 1 }];
    const publicState = projectPublicGameState(state);

    const decision = chooseAIMove(publicState, 'ai1', aiHand, 'hard');
    expect(decision.type).toBe('catch_uno');
    expect(decision.targetPlayerId).toBe('human');
  });
});
