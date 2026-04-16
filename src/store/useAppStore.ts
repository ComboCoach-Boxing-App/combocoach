import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { capacitorStorage } from '../utils/storage'
import { Preferences } from '@capacitor/preferences'
import type { Workout } from '../data/workouts'
import {
  pushUserSettings,
  pushActivity,
  pushUserStats,
  pushCustomWorkout,
  deleteCustomWorkoutCloud,
  fetchUserDataFromCloud
} from '../utils/sync'

export interface ActivityItem {
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
  userId: string; // Keep this for legacy local id
  supabaseUserId: string | null;
  setSupabaseUser: (userId: string | null) => Promise<void>;
  proSignature: string | null;
  isPro: boolean;
  togglePro: () => Promise<void>;
  verifyProStatus: () => Promise<void>;
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
      stance: 'orthodox',
      workoutPace: 30,
      userId: crypto.randomUUID(),
      supabaseUserId: null,
      setSupabaseUser: async (userId) => {
        if (!userId) {
          set({ supabaseUserId: null });
          return;
        }
        
        set({ supabaseUserId: userId });
        
        // Fetch cloud data and overwrite local state if present
        const cloudData = await fetchUserDataFromCloud(userId);
        if (cloudData) {
          const updates: Partial<AppState> = {};
          
          if (cloudData.profile) {
            // Note: Since verifyProStatus will run on boot and reset pro to false if no local signature is found,
            // we should trust the cloud's response on login for Cross-Platform sync.
            updates.isPro = cloudData.profile.is_pro === true;
          }

          if (cloudData.settings) {
            updates.hapticsEnabled = cloudData.settings.haptics_enabled ?? true;
            updates.voiceCommandsEnabled = cloudData.settings.voice_commands_enabled ?? true;
            updates.soundEnabled = cloudData.settings.sound_enabled ?? true;
            updates.burnoutMode = cloudData.settings.burnout_mode ?? true;
            updates.visualRhythm = cloudData.settings.visual_rhythm ?? true;
            updates.randomizedCombos = cloudData.settings.randomized_combos ?? false;
            updates.stance = cloudData.settings.stance || 'orthodox';
            updates.combinationMode = cloudData.settings.combination_mode || 'text';
            updates.workoutPace = cloudData.settings.workout_pace || 30;
          }
          
          if (cloudData.stats) {
            updates.totalWorkoutsCompleted = cloudData.stats.total_workouts || 0;
            updates.punchesThrownEst = cloudData.stats.total_punches || 0;
          }
          
          if (cloudData.activities && cloudData.activities.length > 0) {
            updates.activities = cloudData.activities.map((a: any) => ({
              id: a.id,
              type: a.type,
              title: a.title,
              punches: a.punches,
              duration: a.duration_seconds,
              timestamp: a.completed_at
            }));
          }
          
          if (cloudData.workouts && cloudData.workouts.length > 0) {
            updates.customWorkouts = cloudData.workouts.map((w: any) => ({
              id: w.id,
              title: w.title,
              difficulty: w.difficulty || 'Beginner',
              focus: w.focus || 'Technique',
              duration: w.duration || 15,
              type: w.type || 'Solo Bag',
              rounds: w.rounds || 4,
              roundLength: w.round_length_seconds || 180,
              restBetweenRounds: w.rest_seconds || 60,
              combinations: w.combinations || [],
              roundCombinations: w.round_combinations,
              isCustom: true
            }));
          }
          
          set(updates);
        }
      },
      proSignature: null,
      isPro: false,
      togglePro: async () => {
        const { isPro, userId } = useAppStore.getState();
        const nextPro = !isPro;
        const { signEntitlement } = await import('../utils/entitlements');
        const signature = nextPro ? await signEntitlement(userId) : null;
        set({ isPro: nextPro, proSignature: signature });
      },
      verifyProStatus: async () => {
        const { isPro, userId, proSignature } = useAppStore.getState();
        if (!isPro) return;
        const { verifyEntitlement } = await import('../utils/entitlements');
        const isValid = await verifyEntitlement(userId, proSignature);
        if (!isValid) {
          console.warn('Pro status verification failed. Reverting to free tier.');
          set({ isPro: false, proSignature: null });
        }
      },
      isProModalOpen: false,
      setProModalOpen: (open) => set({ isProModalOpen: open }),
      selectedMusicProvider: 'none',
      setMusicProvider: (provider) => set({ selectedMusicProvider: provider }),
      customWorkouts: [],
      addCustomWorkout: (workout) => {
        set((state) => {
          const newState = { customWorkouts: [...state.customWorkouts, workout] };
          if (state.supabaseUserId) pushCustomWorkout(state.supabaseUserId, workout);
          return newState;
        });
      },
      removeCustomWorkout: (id) => {
        set((state) => {
          const newState = { customWorkouts: state.customWorkouts.filter((w) => w.id !== id) };
          if (state.supabaseUserId) deleteCustomWorkoutCloud(state.supabaseUserId, id);
          return newState;
        });
      },
      updateCustomWorkout: (id, workout) => {
        set((state) => {
          const updatedWorkouts = state.customWorkouts.map((w) => w.id === id ? { ...w, ...workout, id } as Workout : w);
          if (state.supabaseUserId) {
            const updated = updatedWorkouts.find(w => w.id === id);
            if (updated) pushCustomWorkout(state.supabaseUserId, updated);
          }
          return { customWorkouts: updatedWorkouts };
        });
      },
      incrementWorkout: (punches, workoutId, title) => 
        set((state) => {
          const newActivity: ActivityItem = {
            id: crypto.randomUUID(),
            type: 'workout',
            title: title || 'ComboCoach Training Session',
            punches: punches,
            timestamp: new Date().toISOString()
          };
          const safePunches = Math.max(0, isNaN(punches) ? 0 : punches);
          const totalWk = state.totalWorkoutsCompleted + 1;
          const totalP = (state.punchesThrownEst || 0) + safePunches;

          if (state.supabaseUserId) {
            pushActivity(state.supabaseUserId, newActivity);
            pushUserStats(state.supabaseUserId, totalWk, totalP);
          }

          return { 
            totalWorkoutsCompleted: totalWk,
            punchesThrownEst: totalP,
            completedDates: [...state.completedDates, newActivity.timestamp],
            activities: [newActivity, ...state.activities].slice(0, 50),
            ...(workoutId ? { lastWorkoutId: workoutId } : {})
          };
        }),
      addManualActivity: (punches) => 
        set((state) => {
          const newActivity: ActivityItem = {
            id: crypto.randomUUID(),
            type: 'manual',
            title: 'Manual Entry',
            punches: punches,
            timestamp: new Date().toISOString()
          };
          const safePunches = Math.max(0, isNaN(punches) ? 0 : punches);
          const totalP = (state.punchesThrownEst || 0) + safePunches;

          if (state.supabaseUserId) {
            pushActivity(state.supabaseUserId, newActivity);
            pushUserStats(state.supabaseUserId, state.totalWorkoutsCompleted, totalP);
          }

          return {
            punchesThrownEst: totalP,
            activities: [newActivity, ...state.activities].slice(0, 50)
          };
        }),
      setAiWorkout: (workout) => set({ aiWorkout: workout }),
      
      // Settings wrapper
      setWorkoutPace: (pace) => set((state) => {
        const newState = { workoutPace: pace };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleHaptics: () => set((state) => {
        const newState = { hapticsEnabled: !state.hapticsEnabled };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleVoiceCommands: () => set((state) => {
        const newState = { voiceCommandsEnabled: !state.voiceCommandsEnabled };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleSound: () => set((state) => {
        const newState = { soundEnabled: !state.soundEnabled };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleRandomizedCombos: () => set((state) => {
        const newState = { randomizedCombos: !state.randomizedCombos };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleBurnoutMode: () => set((state) => {
        const newState = { burnoutMode: !state.burnoutMode };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleVisualRhythm: () => set((state) => {
        const newState = { visualRhythm: !state.visualRhythm };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleCombinationMode: () => set((state) => {
        const newState = { combinationMode: state.combinationMode === 'numbers' ? 'text' : 'numbers' as any };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
      toggleStance: () => set((state) => {
        const newState = { stance: state.stance === 'orthodox' ? 'southpaw' : 'orthodox' as any };
        if (state.supabaseUserId) pushUserSettings(state.supabaseUserId, { ...state, ...newState });
        return newState;
      }),
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
          proSignature: null,
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



