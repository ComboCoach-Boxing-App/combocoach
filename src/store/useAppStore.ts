import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { capacitorStorage } from '../utils/storage'
import { Preferences } from '@capacitor/preferences'
import type { Workout } from '../data/workouts'

interface ActivityItem {
  id: string;
  type: 'workout' | 'manual' | 'timer';
  title: string;
  subtitle?: string;
  punches: number;
  timestamp: string;
  duration?: number; // In seconds
}

interface AppState {
  totalWorkoutsCompleted: number;
  punchesThrownEst: number;
  completedDates: string[];
  lastWorkoutId: string | null;
  aiWorkout: Workout | null;
  activities: ActivityItem[];
  hapticsEnabled: boolean;
  voiceCommandsEnabled: boolean;
  soundEnabled: boolean;
  randomizedCombos: boolean;
  burnoutMode: boolean;
  visualRhythm: boolean;
  combinationMode: 'numbers' | 'text';
  stance: 'orthodox' | 'southpaw';
  workoutPace: number; // Seconds per combination
  incrementWorkout: (punches: number, workoutId?: string, title?: string) => void;
  addManualActivity: (punches: number) => void;
  setAiWorkout: (workout: Workout) => void;
  setWorkoutPace: (pace: number) => void;
  selectedMusicProvider: 'none' | 'spotify' | 'apple' | 'youtube';
  setMusicProvider: (provider: 'none' | 'spotify' | 'apple' | 'youtube') => void;
  customWorkouts: Workout[];
  addCustomWorkout: (workout: Workout) => void;
  removeCustomWorkout: (id: string) => void;
  updateCustomWorkout: (id: string, workout: Partial<Workout>) => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
  toggleVoiceCommands: () => void;
  toggleRandomizedCombos: () => void;
  toggleBurnoutMode: () => void;
  toggleVisualRhythm: () => void;
  toggleCombinationMode: () => void;
  toggleStance: () => void;
  hasSeenSettingsTooltip: boolean;
  setHasSeenSettingsTooltip: (value: boolean) => void;
  isPro: boolean;
  togglePro: () => void;
  isProModalOpen: boolean;
  setProModalOpen: (open: boolean) => void;
  resetStats: () => void;
  fullReset: () => Promise<void>;
  seedDummyData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      totalWorkoutsCompleted: 0,
      punchesThrownEst: 0,
      completedDates: [],
      lastWorkoutId: null,
      aiWorkout: null,
      activities: [],
      hapticsEnabled: true,
      voiceCommandsEnabled: true,
      soundEnabled: true,
      randomizedCombos: false,
      burnoutMode: true,
      visualRhythm: true,
      combinationMode: 'text',
      stance: 'orthodox',
      workoutPace: 30,
      isPro: false,
      togglePro: () => set((state) => ({ isPro: !state.isPro })),
      isProModalOpen: false,
      setProModalOpen: (open) => set({ isProModalOpen: open }),
      selectedMusicProvider: 'none',
      setMusicProvider: (provider) => set({ selectedMusicProvider: provider }),
      customWorkouts: [],
      addCustomWorkout: (workout) => set((state) => ({ customWorkouts: [...state.customWorkouts, workout] })),
      removeCustomWorkout: (id) => set((state) => ({ customWorkouts: state.customWorkouts.filter((w) => w.id !== id) })),
      updateCustomWorkout: (id, workout) => set((state) => ({
        customWorkouts: state.customWorkouts.map((w) => w.id === id ? { ...w, ...workout, id } : w)
      })),
      incrementWorkout: (punches, workoutId, title) => 
        set((state) => {
          const newActivity: ActivityItem = {
            id: Math.random().toString(36).substring(7),
            type: 'workout',
            title: title || 'ComboCoach Training Session',
            punches: punches,
            timestamp: new Date().toISOString()
          };
          const safePunches = Math.max(0, isNaN(punches) ? 0 : punches);
          return { 
            totalWorkoutsCompleted: state.totalWorkoutsCompleted + 1,
            punchesThrownEst: (state.punchesThrownEst || 0) + safePunches,
            completedDates: [...state.completedDates, new Date().toISOString()],
            activities: [newActivity, ...state.activities].slice(0, 50), // Keep last 50
            ...(workoutId ? { lastWorkoutId: workoutId } : {})
          };
        }),
      addManualActivity: (punches) => 
        set((state) => {
          const newActivity: ActivityItem = {
            id: Math.random().toString(36).substring(7),
            type: 'manual',
            title: 'Manual Entry',
            punches: punches,
            timestamp: new Date().toISOString()
          };
          const safePunches = Math.max(0, isNaN(punches) ? 0 : punches);
          return {
            punchesThrownEst: (state.punchesThrownEst || 0) + safePunches,
            activities: [newActivity, ...state.activities].slice(0, 50)
          };
        }),
      setAiWorkout: (workout) => set({ aiWorkout: workout }),
      setWorkoutPace: (pace) => set({ workoutPace: pace }),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      toggleVoiceCommands: () => set((state) => ({ voiceCommandsEnabled: !state.voiceCommandsEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleRandomizedCombos: () => set((state) => ({ randomizedCombos: !state.randomizedCombos })),
      toggleBurnoutMode: () => set((state) => ({ burnoutMode: !state.burnoutMode })),
      toggleVisualRhythm: () => set((state) => ({ visualRhythm: !state.visualRhythm })),
      toggleCombinationMode: () => set((state) => ({ 
        combinationMode: state.combinationMode === 'numbers' ? 'text' : 'numbers' 
      })),
      toggleStance: () => set((state) => ({
        stance: state.stance === 'orthodox' ? 'southpaw' : 'orthodox'
      })),
      hasSeenSettingsTooltip: false,
      setHasSeenSettingsTooltip: (value) => set({ hasSeenSettingsTooltip: value }),
      resetStats: () => set({ totalWorkoutsCompleted: 0, punchesThrownEst: 0, completedDates: [], lastWorkoutId: null, activities: [], hasSeenSettingsTooltip: false }),
      fullReset: async () => {
        await Preferences.clear();
        // We also need to reset the local state immediately
        set({ 
          totalWorkoutsCompleted: 0, 
          punchesThrownEst: 0, 
          completedDates: [], 
          lastWorkoutId: null, 
          activities: [], 
          hasSeenSettingsTooltip: false,
          aiWorkout: null,
          hapticsEnabled: true,
          voiceCommandsEnabled: true,
          soundEnabled: true,
          randomizedCombos: false,
          burnoutMode: true,
          visualRhythm: true,
          workoutPace: 30,
          stance: 'orthodox',
          combinationMode: 'text',
          isPro: false,
          isProModalOpen: false,
          selectedMusicProvider: 'none',
          customWorkouts: []
        });
      },
      seedDummyData: () => set({
        totalWorkoutsCompleted: 4,
        punchesThrownEst: 3100,
        completedDates: [
          new Date(Date.now() - 172800000).toISOString(),
          new Date(Date.now() - 86400000).toISOString(),
          new Date(Date.now() - 14400000).toISOString(),
          new Date(Date.now() - 1200000).toISOString()
        ],
        activities: [
          {
            id: 'dummy_4',
            type: 'workout',
            title: 'Speed Drill Session',
            punches: 400,
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            duration: 600
          },
          {
            id: 'dummy_3',
            type: 'workout',
            title: 'AI Generated Power Workout',
            punches: 650,
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            duration: 1200
          },
          {
            id: 'dummy_2',
            type: 'manual',
            title: 'Shadow Boxing',
            punches: 1200,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'dummy_1',
            type: 'workout',
            title: 'Heavy Bag Fundamentals',
            punches: 850,
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            duration: 1800
          }
        ]
      }),
    }),
    {
      name: 'boxing-app-storage',
      storage: createJSONStorage(() => capacitorStorage),
    }
  )
)



