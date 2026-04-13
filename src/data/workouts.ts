export interface Workout {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: 'Speed' | 'Power' | 'Defense' | 'Conditioning' | 'Footwork' | 'Technique' | 'Warmup';
  duration: number; // total estimated in minutes
  type: 'Warming up' | 'Solo Bag' | 'Solo Shadowboxing' | 'Pads Training';
  rounds: number;
  roundLength: number; // in seconds
  restBetweenRounds: number; // in seconds
  punchesEst: number;
  combinations: string[]; // List of combos to cycle through (1=Jab, 2=Cross, 3=Lead Hook, 4=Rear Hook, 5=Lead Upper, 6=Rear Upper)
  roundCombinations?: string[][];
  isCustom?: boolean;
}

const UNSORTED_WORKOUTS: Workout[] = [
  // WARMUPS
  {
    id: 'warm-1',
    title: 'Dynamic Boxing Warmup',
    difficulty: 'Beginner',
    focus: 'Warmup',
    duration: 5,
    type: 'Warming up',
    rounds: 1,
    roundLength: 300, // 5 minutes
    restBetweenRounds: 0,
    punchesEst: 100,
    combinations: ['1', '1 - 2', '1 - 2 - 1', '1 - 1', '5 - 6', '1 - 2 - 5'], // Replaced strings with simple numbers
  },
  {
    id: 'warm-2',
    title: 'Pure Muscle Activation',
    difficulty: 'Beginner',
    focus: 'Warmup',
    duration: 10,
    type: 'Warming up',
    rounds: 1,
    roundLength: 600, // 10 minutes
    restBetweenRounds: 0,
    punchesEst: 0,
    combinations: [
      'Neck Rotations',
      'Arm Circles',
      'Torso Twists',
      'Hip Circles',
      'Jumping Jacks',
      'High Knees',
      'Butt Kicks',
      'Shoulder Shrugs',
      'Wrist Rotations',
      'Ankle Rotations'
    ],
  },
  
  // BAG WORK
  {
    id: 'bag-beg-1',
    title: 'Bag Basics: Straight Punches',
    difficulty: 'Beginner',
    focus: 'Technique',
    duration: 15,
    type: 'Solo Bag',
    rounds: 4,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 400,
    combinations: ['1', '1 - 2', '1 - 1 - 2', '1 - 2 - 1 - 2'],
  },
  {
    id: 'bag-beg-2',
    title: 'Bag Basics: Intro to Hooks',
    difficulty: 'Beginner',
    focus: 'Technique',
    duration: 15,
    type: 'Solo Bag',
    rounds: 4,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 350,
    combinations: ['1 - 2 - 3', '1 - 4', '3 - 2', '1 - 1 - 4'],
  },
  {
    id: 'bag-int-2',
    title: 'Precision & Flow',
    difficulty: 'Intermediate',
    focus: 'Speed',
    duration: 24,
    type: 'Solo Bag',
    rounds: 6,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 900,
    combinations: ['1 - 2 - 3 - 2', '1 - 2 - 5 - 2', '1 - 6 - 3 - 2', '1 - 2 - Roll Right - 2'],
  },
  {
    id: 'bag-adv-2',
    title: 'Championship Rounds',
    difficulty: 'Advanced',
    focus: 'Power',
    duration: 45,
    type: 'Solo Bag',
    rounds: 12,
    roundLength: 180,
    restBetweenRounds: 45,
    punchesEst: 1800,
    combinations: ['1 - 2 - 3 - 2 - 5 - 2', '1 - Roll - 2 - 3 - 4', '5 - 6 - 3 - 2 - Skip - 2', '1 - 1 - 2 - Step - 2'],
  },
  
  // SHADOWBOXING
  {
    id: 'shadow-beg-1',
    title: 'Shadowbox: Stance & Jab',
    difficulty: 'Beginner',
    focus: 'Technique',
    duration: 15,
    type: 'Solo Shadowboxing',
    rounds: 4,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 300,
    combinations: ['1', '1 - 1', '1 - Step', 'Stance Check'],
  },
  {
    id: 'shadow-beg-2',
    title: 'Shadowbox: Basic Movement',
    difficulty: 'Beginner',
    focus: 'Footwork',
    duration: 15,
    type: 'Solo Shadowboxing',
    rounds: 4,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 250,
    combinations: ['Step Forward - 1', 'Step Back - 1 - 2', 'Step Left - 1', 'Step Right - 2'],
  },
  {
    id: 'shadow-adv-2',
    title: 'The Ghost in the Ring',
    difficulty: 'Advanced',
    focus: 'Defense',
    duration: 36,
    type: 'Solo Shadowboxing',
    rounds: 10,
    roundLength: 180,
    restBetweenRounds: 30,
    punchesEst: 1500,
    combinations: ['Slip - 2 - 3 - Roll - 2', '1 - Pull - 2 - 3 - Slip', 'Pivot - 2 - 3 - 2 - Pivot', '1 - 2 - 1 - 2 - Duck - 5'],
  },

  // PADS/MITT WORK
  {
    id: 'pads-beg-1',
    title: 'Mitt Fundamentals',
    difficulty: 'Beginner',
    focus: 'Technique',
    duration: 15,
    type: 'Pads Training',
    rounds: 4,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 400,
    combinations: ['1 - 2', '1 - 1 - 2', '1 - 2 - 3', '2 - 3'],
  },
  {
    id: 'pads-beg-2',
    title: 'Responsive Drills',
    difficulty: 'Beginner',
    focus: 'Speed',
    duration: 15,
    type: 'Pads Training',
    rounds: 4,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 500,
    combinations: ['1 - 2 - 1 - 2', '3 - 4', '1 - Catch - 2', '1 - Slip - 2'],
  },
  {
    id: 'pads-int-2',
    title: 'Counter Control',
    difficulty: 'Intermediate',
    focus: 'Conditioning',
    duration: 30,
    type: 'Pads Training',
    rounds: 8,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 1200,
    combinations: ['1 - 2 - Duck - 2 - 3', '3 - 2 - 3 - Roll - 4', '1 - 2 - 3 - 2 - Skip', '1 - 1 - 2 - 1 - 2'],
  },
  {
    id: 'pads-adv-1',
    title: 'Professional Patterns',
    difficulty: 'Advanced',
    focus: 'Speed',
    duration: 36,
    type: 'Pads Training',
    rounds: 10,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 1400,
    combinations: ['1 - 2 - 3 - 2 - Slip - 2', '6 - 3 - 2 - Roll - 3', '1 - Pull - 2 - 3 - 2', '1 - 2 - 1 - 2 - 3 - 4'],
  },
  {
    id: 'pads-adv-2',
    title: 'The Crucible',
    difficulty: 'Advanced',
    focus: 'Power',
    duration: 45,
    type: 'Pads Training',
    rounds: 12,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 2000,
    combinations: ['2 - 3 - 2 - Roll - 2', '1 - 2 - 3 - 4 - 5 - 6', 'Roll - 4 - 3 - 2 - 3', '1 - 2 - Slip - Slip - 2'],
  },

  // PRE-EXISTING WORKOUTS
  // CONDITIONING
  {
    id: 'cond-1',
    title: 'Heavy Bag Sprints (Tabata)',
    difficulty: 'Advanced',
    focus: 'Conditioning',
    duration: 15,
    type: 'Solo Bag',
    rounds: 10,
    roundLength: 60, // 1 min rounds (e.g. 20s work, 10s rest inside the round conceptually)
    restBetweenRounds: 30, // 30s rest
    punchesEst: 1500,
    combinations: ['1 - 2 - 1 - 2', '1 - 2 - 3 - 2', '3 - 4 - 3 - 4', '5 - 6 - 5 - 6'], // High volume
  },

  // BAG WORK
  {
    id: 'solo-1',
    title: 'Heavy Bag Power',
    difficulty: 'Intermediate',
    focus: 'Power',
    duration: 31,
    type: 'Solo Bag',
    rounds: 8,
    roundLength: 180, // 3 mins
    restBetweenRounds: 60,
    punchesEst: 800,
    combinations: ['1 - 2', '1 - 1 - 2', '1 - 2 - 3', '2 - 3 - 2', '1 - 2 - 3 - 4', '5 - 6 - 3 - 2'], // Focus on sitting down on punches
  },
  
  // DEFENSE
  {
    id: 'def-1',
    title: 'Head Movement & Counters',
    difficulty: 'Intermediate',
    focus: 'Defense',
    duration: 24,
    type: 'Solo Shadowboxing',
    rounds: 6,
    roundLength: 180, // 3 mins
    restBetweenRounds: 60,
    punchesEst: 600,
    combinations: ['1 - Slip Right - 2', '1 - 2 - Roll Right - 3', 'Slip Left - 3 - 2', 'Roll Left - 5 - 4', '1 - Pull - 2'], // Defensive maneuvers first
  },

  // SPEED & FLOW
  {
    id: 'shadow-1',
    title: 'Speed & Flow',
    difficulty: 'Advanced',
    focus: 'Speed',
    duration: 23,
    type: 'Solo Shadowboxing',
    rounds: 6,
    roundLength: 180, // 3 mins
    restBetweenRounds: 60, // standardized to 60s
    punchesEst: 1200,
    combinations: ['1 - 2 - Slip Right - 2', '3 - 2 - 3', '1 - 1 - 2', '1 - 2 - 5 - 2', '1 - 2 - 1 - 2 - 3'], 
  },

  // FOOTWORK
  {
    id: 'foot-1',
    title: 'In and Out, Angles',
    difficulty: 'Intermediate',
    focus: 'Footwork',
    duration: 24,
    type: 'Solo Shadowboxing',
    rounds: 6,
    roundLength: 180, // 3 mins
    restBetweenRounds: 60,
    punchesEst: 900,
    combinations: ['Step In - 1 - 2 - Step Out', '1 - 2 - Pivot - 3', 'Step In - 2 - 3 - Pivot', '1 - Step Right - 2'], 
  },
  
  // PADS/MITT WORK
  {
    id: 'pads-1',
    title: 'Counter-Punching Drills',
    difficulty: 'Intermediate',
    focus: 'Technique',
    duration: 39,
    type: 'Pads Training',
    rounds: 10,
    roundLength: 180, // 3 mins
    restBetweenRounds: 60,
    punchesEst: 1500,
    combinations: ['Slip Right - 2 - 3 - 2', 'Catch - 2 - 3', 'Roll Right - 2 - 3 - 4', '3 - 2 - 1 - 1'], 
  },

  // COACH ADDED WORKOUTS
  {
    id: 'peek-a-boo-1',
    title: 'The Peek-a-Boo Flow',
    difficulty: 'Advanced',
    focus: 'Defense',
    duration: 31,
    type: 'Solo Shadowboxing',
    rounds: 8,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 1000,
    combinations: [
      'Slip Left - 5 - 4',
      'Slip Right - 6 - 3 - 2',
      'Roll Left - 3 - 2 - Roll Right',
      '1 - Slip Left - 5 - Pull'
    ],
  },
  {
    id: 'outboxer-1',
    title: 'The Outboxer Rhythm',
    difficulty: 'Intermediate',
    focus: 'Footwork',
    duration: 23,
    type: 'Solo Shadowboxing',
    rounds: 6,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 800,
    combinations: [
      'Step Back - 1 - 1',
      '1 - Pull - 2',
      'Pivot Left - 3',
      '1 - 2 - Step Right - 2'
    ],
  },
  {
    id: 'body-snatcher-1',
    title: 'Body Snatcher Drills',
    difficulty: 'Advanced',
    focus: 'Power',
    duration: 31,
    type: 'Solo Bag',
    rounds: 8,
    roundLength: 180,
    restBetweenRounds: 60,
    punchesEst: 1100,
    combinations: [
      '1 - 2 - 3b',
      'Slip Right - 4b - 3',
      '1 - 3b - 3',
      '2 - Duck - 1b - 2'
    ],
  },
  {
    id: 'tabata-HIIT-1',
    title: 'True Tabata Sprints',
    difficulty: 'Advanced',
    focus: 'Conditioning',
    duration: 4,
    type: 'Solo Bag',
    rounds: 8,
    roundLength: 20, // 20s work
    restBetweenRounds: 10, // 10s rest
    punchesEst: 400,
    combinations: ['1 - 2 - 1 - 2', '3 - 4 - 3 - 4', '5 - 6 - 5 - 6', '1 - 2 - 3 - 4 - 5 - 6'],
  }
];

const difficultyOrder: Record<Workout['difficulty'], number> = {
  'Beginner': 0,
  'Intermediate': 1,
  'Advanced': 2
};

export const WORKOUTS: Workout[] = [...UNSORTED_WORKOUTS].sort((a, b) => 
  difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
);

export const getWOD = (isPro: boolean = true): Workout => {
  const day = new Date().getDate();
  const availableWorkouts = isPro 
    ? WORKOUTS 
    : WORKOUTS.filter(w => w.difficulty !== 'Advanced');
  
  return availableWorkouts[day % availableWorkouts.length];
};
