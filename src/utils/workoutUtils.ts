const orthodoxMap: Record<string, string> = {
  '1': 'Jab',
  '2': 'Cross',
  '3': 'Left Hook',
  '4': 'Right Hook',
  '5': 'Left Upper',
  '6': 'Right Upper'
};

const southpawMap: Record<string, string> = {
  '1': 'Jab',
  '2': 'Cross',
  '3': 'Right Hook',
  '4': 'Left Hook',
  '5': 'Right Upper',
  '6': 'Left Upper'
};

/**
 * Translates a combination string from number format to text format,
 * considering the user's stance (Orthodox or Southpaw).
 */
export function translateCombination(combo: string, stance: 'orthodox' | 'southpaw' = 'orthodox'): string {
  if (!combo) return '';
  
  const map = stance === 'southpaw' ? southpawMap : orthodoxMap;
  
  // Use a regex to find numbers 1-6 possibly followed by 'b' and replace them
  // \b([1-6])(b?)\b matches "1", "1b", "2", "2b" etc. as whole words
  return combo.replace(/\b([1-6])(b?)\b/g, (_, num, body) => {
    const punch = map[num] || num;
    return body ? `${punch} Body` : punch;
  });
}

/**
 * Calculates dynamic punch estimates based on pace and workout structure.
 */
export function calculateDynamicPunches(workout: any, pace: number): number {
  if (!workout || !workout.combinations || workout.combinations.length === 0) return 0;
  
  // Calculate average punches per combination in the workout
  const totalPunchesInCombos = workout.combinations.reduce((sum: number, combo: string) => {
    // Count individual punches (digits 1-6)
    const matches = combo.match(/[1-6]/g);
    return sum + (matches ? matches.length : 0);
  }, 0);
  
  const avgPunchesPerCombo = totalPunchesInCombos / workout.combinations.length;
  
  // Total work seconds
  const totalWorkSeconds = workout.rounds * workout.roundLength;
  
  // Total combinations triggered
  const totalCombos = totalWorkSeconds / pace;
  
  return Math.round(totalCombos * avgPunchesPerCombo);
}

/**
 * Checks if a workout should be considered a warmup,
 * which disables features like randomization and burnout.
 */
export function isWarmup(workout: any): boolean {
  if (!workout) return false;
  return workout.focus === 'Warmup' || workout.type === 'Warming up';
}

/**
 * Returns the user's boxing rank based on total estimated punches thrown.
 */
export function getUserRank(punches: number): { 
  title: string; 
  nextTitle: string | null; 
  nextTierAt: number | null; 
  progress: number 
} {
  if (punches < 5000) return { title: 'Rookie', nextTitle: 'Amateur', nextTierAt: 5000, progress: punches / 5000 };
  if (punches < 15000) return { title: 'Amateur', nextTitle: 'Contender', nextTierAt: 15000, progress: (punches - 5000) / 10000 };
  if (punches < 30000) return { title: 'Contender', nextTitle: 'Professional', nextTierAt: 30000, progress: (punches - 15000) / 15000 };
  if (punches < 100000) return { title: 'Professional', nextTitle: 'Champion', nextTierAt: 100000, progress: (punches - 30000) / 70000 };
  if (punches < 250000) return { title: 'Champion', nextTitle: 'Hall of Famer', nextTierAt: 250000, progress: (punches - 100000) / 150000 };
  return { title: 'Hall of Famer', nextTitle: null, nextTierAt: null, progress: 1 };
}
