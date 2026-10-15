import { create } from 'zustand';

interface GameSettingsState {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  playerName: string;
  avatar: string;
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  aiOpponentCount: number;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setPlayerName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setPreferredDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  setAiOpponentCount: (count: number) => void;
}

const getStored = <T>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(`uno_settings_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key: string, value: any) => {
  try {
    localStorage.setItem(`uno_settings_${key}`, JSON.stringify(value));
  } catch {}
};

export const useGameSettingsStore = create<GameSettingsState>((set) => ({
  soundEnabled: getStored('sound', true),
  animationsEnabled: getStored('animations', true),
  playerName: getStored('name', 'Player 1'),
  avatar: getStored('avatar', 'cat'),
  preferredDifficulty: getStored('difficulty', 'medium'),
  aiOpponentCount: getStored('aiCount', 3),

  setSoundEnabled: (enabled) => {
    setStored('sound', enabled);
    set({ soundEnabled: enabled });
  },
  setAnimationsEnabled: (enabled) => {
    setStored('animations', enabled);
    set({ animationsEnabled: enabled });
  },
  setPlayerName: (name) => {
    setStored('name', name);
    set({ playerName: name });
  },
  setAvatar: (avatar) => {
    setStored('avatar', avatar);
    set({ avatar });
  },
  setPreferredDifficulty: (preferredDifficulty) => {
    setStored('difficulty', preferredDifficulty);
    set({ preferredDifficulty });
  },
  setAiOpponentCount: (aiOpponentCount) => {
    setStored('aiCount', aiOpponentCount);
    set({ aiOpponentCount });
  },
}));
