import { useAppStore } from '../store/useAppStore';
import type { Workout } from '../data/workouts';

interface Combo {
  id: number;
  combination: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: 'Speed' | 'Power' | 'Defence' | 'Conditioning' | 'Footwork' | 'Technique';
  stance_advice: 'Orthodox' | 'Southpaw';
}

interface AIWorkoutParams {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progressiveDifficulty: boolean;
  rounds: number;
  roundLength: number;
  restPeriod: number;
  focus: 'Speed' | 'Power' | 'Defense' | 'Conditioning' | 'Footwork' | 'Technique';
}

// Extends Workout type with roundCombinations
export interface ComboCoachWorkout extends Workout {
  roundCombinations?: string[][]; // array of combination arrays per round
}

export const generateComboCoachWorkout = async (params: AIWorkoutParams): Promise<ComboCoachWorkout> => {
  const { stance, workoutPace } = useAppStore.getState();
  
  // 1. Fetch combinations.json
  const response = await fetch('/assets/combinations.json');
  if (!response.ok) {
    throw new Error('Failed to load combination data.');
  }
  const raw: unknown[] = await response.json();

  // Runtime shape guard — rejects malformed or tampered entries (CWE-20)
  const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;
  const VALID_FOCUSES = ['Speed', 'Power', 'Defence', 'Conditioning', 'Footwork', 'Technique'] as const;
  const VALID_STANCES = ['Orthodox', 'Southpaw'] as const;

  const isValidCombo = (c: unknown): c is Combo =>
    typeof c === 'object' && c !== null &&
    typeof (c as any).id === 'number' &&
    typeof (c as any).combination === 'string' &&
    (c as any).combination.length > 0 &&
    VALID_DIFFICULTIES.includes((c as any).difficulty) &&
    VALID_FOCUSES.includes((c as any).focus) &&
    VALID_STANCES.includes((c as any).stance_advice);

  const combinations: Combo[] = raw.filter(isValidCombo);

  if (combinations.length === 0) {
    throw new Error('No valid combination data found.');
  }


  // 2. Map Focus ('Defense' -> 'Defence' to match JSON)
  const mappedFocus = params.focus === 'Defense' ? 'Defence' : params.focus;
  
  // 3. Map Stance ('orthodox' -> 'Orthodox')
  const mappedStance = stance === 'orthodox' ? 'Orthodox' : 'Southpaw';

  // 4. Base filtering (Stance)
  const stanceFiltered = combinations.filter(c => c.stance_advice === mappedStance);

  // Helper to get combinations matching a logic criteria
  const getCombos = (targetDifficulty: string, targetFocus: string) => {
    let pool = stanceFiltered.filter(c => 
      c.difficulty === targetDifficulty && 
      c.focus === targetFocus
    );
    
    // Fallback 1: Ignore Focus, keep Difficulty
    if (pool.length === 0) {
      pool = stanceFiltered.filter(c => c.difficulty === targetDifficulty);
    }
    
    // Fallback 2: Keep Focus, ignore Difficulty
    if (pool.length === 0) {
      pool = stanceFiltered.filter(c => c.focus === targetFocus);
    }
    
    // Fallback 3: Anything from Stance
    if (pool.length === 0) {
      pool = stanceFiltered;
    }
    
    return pool;
  };

  const usedComboIds = new Set<number>();
  const roundCombinations: string[][] = [];
  
  // Combos needed per round (roughly based on pace)
  // Give it a healthy buffer of 10-15 combinations minimal to keep it varied
  const combosNeededPerRound = Math.max(10, Math.ceil(params.roundLength / workoutPace) + 5);

  for (let r = 0; r < params.rounds; r++) {
    // Determine Target Difficulty for this round
    let roundDifficulty = params.difficulty;
    
    if (params.progressiveDifficulty) {
      if (params.difficulty === 'Intermediate') {
        // Starts Beginner, progresses to Intermediate
        // If 1 round, just Intermediate. If >1 round, divide it up.
        if (params.rounds > 1) {
          const midpoint = Math.floor(params.rounds / 2);
          roundDifficulty = r < midpoint ? 'Beginner' : 'Intermediate';
        }
      } else if (params.difficulty === 'Advanced') {
        // Starts Beginner -> Intermediate -> Advanced
        if (params.rounds === 1) {
          // If only 1 round, go straight to advanced (or intermediate depending on preference, we'll do advanced)
          roundDifficulty = 'Advanced';
        } else if (params.rounds === 2) {
          // 2 rounds: Beginner/Intermediate mix (default to Beginner) then Advanced
          roundDifficulty = r === 0 ? 'Beginner' : 'Advanced';
        } else {
          // 3 or more rounds: split as evenly as possible
          const tierSize = params.rounds / 3;
          if (r < tierSize) roundDifficulty = 'Beginner';
          else if (r < tierSize * 2) roundDifficulty = 'Intermediate';
          else roundDifficulty = 'Advanced';
        }
      }
    }

    const availablePool = getCombos(roundDifficulty, mappedFocus).filter(c => !usedComboIds.has(c.id));
    
    // If we run out of unique combinations entirely, just fall back to any ignoring used IDs
    const finalPool = availablePool.length >= combosNeededPerRound ? availablePool : getCombos(roundDifficulty, mappedFocus);
    
    const selectedStringsForRound: string[] = [];
    
    // Shuffle the final pool
    const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < combosNeededPerRound; i++) {
        const combo = shuffled[i % shuffled.length]; // Loop over if we need more than available
        selectedStringsForRound.push(combo.combination);
        usedComboIds.add(combo.id);
    }
    
    roundCombinations.push(selectedStringsForRound);
  }

  const aiWorkout: ComboCoachWorkout = {
    id: 'ai-generated',
    title: `ComboCoach: ${params.focus}`,
    difficulty: params.difficulty,
    focus: params.focus,
    duration: Math.ceil((params.rounds * params.roundLength) / 60), 
    type: 'Solo Bag',
    rounds: params.rounds,
    roundLength: params.roundLength,
    restBetweenRounds: params.restPeriod,
    punchesEst: (params.rounds * params.roundLength) / workoutPace * 3, // rough estimate of 3 punches per combo
    combinations: roundCombinations[0] || ['1 - 2'], // Fallback for legacy components that might peek at index 0
    roundCombinations: roundCombinations,
  };

  return aiWorkout;
};
