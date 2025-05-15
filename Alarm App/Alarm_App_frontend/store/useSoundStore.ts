import { create } from 'zustand';
import { SoundOption } from '../types';

// Default sounds
const DEFAULT_SOUNDS: SoundOption[] = [
  { id: 'default', name: 'Radar', file: 'radar.mp3' },
  { id: 'beacon', name: 'Beacon', file: 'beacon.mp3' },
  { id: 'chimes', name: 'Chimes', file: 'chimes.mp3' },
  { id: 'signal', name: 'Signal', file: 'signal.mp3' },
  { id: 'waves', name: 'Waves', file: 'waves.mp3' },
];

interface SoundState {
  sounds: SoundOption[];
  currentSoundId: string | null;
  isPlaying: boolean;
  
  // Actions
  getSounds: () => SoundOption[];
  getSoundById: (id: string) => SoundOption | undefined;
  playSound: (id: string) => Promise<void>;
  stopSound: () => void;
}

const useSoundStore = create<SoundState>((set, get) => ({
  sounds: DEFAULT_SOUNDS,
  currentSoundId: null,
  isPlaying: false,
  
  // Get all available sounds
  getSounds: () => {
    return get().sounds;
  },
  
  // Get a sound by ID
  getSoundById: (id) => {
    return get().sounds.find(sound => sound.id === id);
  },
  
  // Play a sound (placeholder for actual implementation)
  playSound: async (id) => {
    // In a real implementation, use expo-av to play sounds
    // For now, we'll just update the state
    set({ currentSoundId: id, isPlaying: true });
    
    // Simulate playing for 2 seconds
    setTimeout(() => {
      if (get().currentSoundId === id) {
        set({ isPlaying: false });
      }
    }, 2000);
  },
  
  // Stop playing sound
  stopSound: () => {
    // In a real implementation, use expo-av to stop sounds
    set({ isPlaying: false });
  },
}));

export default useSoundStore;