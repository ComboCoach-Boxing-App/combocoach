import { supabase } from './supabase';
import type { Workout } from '../data/workouts';
import type { ActivityItem } from '../store/useAppStore'; // We will export this type

export const pushUserSettings = async (userId: string, settings: any) => {
  try {
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      haptics_enabled: settings.hapticsEnabled,
      voice_commands_enabled: settings.voiceCommandsEnabled,
      sound_enabled: settings.soundEnabled,
      burnout_mode: settings.burnoutMode,
      visual_rhythm: settings.visualRhythm,
      randomized_combos: settings.randomizedCombos,
      stance: settings.stance,
      combination_mode: settings.combinationMode,
      workout_pace: settings.workoutPace,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Error pushing settings to cloud:', error);
  } catch (err) {
    console.error('Offline - Failed to push settings', err);
  }
};

export const pushActivity = async (userId: string, activity: ActivityItem) => {
  try {
    const { error } = await supabase.from('activities').insert({
      id: activity.id,
      user_id: userId,
      type: activity.type,
      title: activity.title,
      punches: activity.punches,
      duration_seconds: activity.duration,
      completed_at: activity.timestamp
    });
    if (error) console.error('Error pushing activity to cloud:', error);
  } catch (err) {
    console.error('Offline - Failed to push activity', err);
  }
};

export const pushUserStats = async (userId: string, totalWorkouts: number, totalPunches: number) => {
  try {
    const { error } = await supabase.from('user_stats').upsert({
      user_id: userId,
      total_workouts: totalWorkouts,
      total_punches: totalPunches,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Error pushing stats to cloud:', error);
  } catch (err) {
    console.error('Offline - Failed to push stats', err);
  }
};

export const pushCustomWorkout = async (userId: string, workout: Workout) => {
  try {
    const { error } = await supabase.from('custom_workouts').upsert({
      id: workout.id,
      user_id: userId,
      title: workout.title,
      difficulty: workout.difficulty,
      focus: workout.focus,
      duration: workout.duration,
      type: workout.type,
      rounds: workout.rounds,
      round_length_seconds: workout.roundLength,
      rest_seconds: workout.restBetweenRounds,
      combinations: workout.combinations,
      round_combinations: workout.roundCombinations,
      is_custom: true,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Error pushing Custom Workout to cloud:', error);
  } catch (err) {
    console.error('Offline - Failed to push custom workout', err);
  }
};

export const deleteCustomWorkoutCloud = async (userId: string, workoutId: string) => {
  try {
    const { error } = await supabase.from('custom_workouts').delete().match({ id: workoutId, user_id: userId });
    if (error) console.error('Error deleting Custom Workout in cloud:', error);
  } catch (err) {
    console.error('Offline - Failed to delete custom workout', err);
  }
};

// Fetch all data for initialization
export const fetchUserDataFromCloud = async (userId: string) => {
  try {
    const [userProfileRes, settingsRes, activitiesRes, statsRes, workoutsRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
      supabase.from('activities').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(50),
      supabase.from('user_stats').select('*').eq('user_id', userId).single(),
      supabase.from('custom_workouts').select('*').eq('user_id', userId)
    ]);

    return {
      profile: userProfileRes.data,
      settings: settingsRes.data,
      activities: activitiesRes.data || [],
      stats: statsRes.data,
      workouts: workoutsRes.data || []
    };
  } catch (err) {
    console.error('Error fetching cloud data', err);
    return null;
  }
};
