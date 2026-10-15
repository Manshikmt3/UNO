import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Card } from '@uno-arena/shared';
import { UnoCard } from '../components/game/UnoCard';
import { UnoButton } from '../components/game/UnoButton';
import { ColorPickerModal } from '../components/game/ColorPickerModal';
import { ChallengeModal } from '../components/game/ChallengeModal';

describe('Client UI Components', () => {
  it('renders UnoCard with color and number', () => {
    const card: Card = { id: 'r7', type: 'number', color: 'red', value: 7 };
    render(<UnoCard card={card} isPlayable={true} />);

    expect(screen.getAllByText('7')).toHaveLength(3); // 2 corners + 1 center
  });

  it('renders Wild UnoCard with WILD label', () => {
    const card: Card = { id: 'w1', type: 'wild' };
    render(<UnoCard card={card} isPlayable={true} />);

    expect(screen.getByText('WILD')).toBeInTheDocument();
  });

  it('UnoButton triggers callUno callback when clicked', () => {
    const onCallUno = vi.fn();
    render(<UnoButton canCallUno={true} onCallUno={onCallUno} />);

    const button = screen.getByRole('button', { name: /call uno/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onCallUno).toHaveBeenCalledTimes(1);
  });

  it('ColorPickerModal allows picking a color', () => {
    const onSelect = vi.fn();
    render(<ColorPickerModal isOpen={true} onSelectColor={onSelect} />);

    expect(screen.getByText(/choose active color/i)).toBeInTheDocument();
    const greenBtn = screen.getByRole('button', { name: /green/i });
    fireEvent.click(greenBtn);

    expect(onSelect).toHaveBeenCalledWith('green');
  });

  it('ChallengeModal triggers accept and challenge decisions', () => {
    const onDecision = vi.fn();
    render(
      <ChallengeModal
        isOpen={true}
        onDecision={onDecision}
        offenderName="CyberAce"
      />
    );

    expect(screen.getByText(/cyberace/i)).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptBtn);
    expect(onDecision).toHaveBeenCalledWith(false);

    const challengeBtn = screen.getByRole('button', { name: /challenge/i });
    fireEvent.click(challengeBtn);
    expect(onDecision).toHaveBeenCalledWith(true);
  });
});
