export type Set = {
  reps: number;
  weight: number;
};

export type ExerciseSession = {
  id: string;
  date: string;
  sets: Set[];
};

export type Exercise = {
  id: string;
  name: string;
  category: string;
  sessions: ExerciseSession[];
};

export type WorkoutSession = {
  id: string;
  startTime: string;
  endTime?: string;
  exerciseIds: string[];
  isDwarfWorkout?: boolean;
};

export type WorkoutData = {
  exercises: Exercise[];
  workoutSessions: WorkoutSession[];
};

export type Tab = 'dashboard' | 'exercises' | 'workout';
