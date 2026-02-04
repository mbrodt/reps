import type { WorkoutData, WorkoutSession, Exercise } from '../types';

export function getUniqueWorkoutDates(data: WorkoutData): string[] {
  const dates = new Set<string>();
  
  // Get dates from exercise sessions
  for (const exercise of data.exercises) {
    for (const session of exercise.sessions) {
      dates.add(session.date.split('T')[0]);
    }
  }
  
  // Get dates from Dwarf workouts (they don't have exercise sessions)
  for (const session of data.workoutSessions) {
    if (session.isDwarfWorkout && session.endTime) {
      dates.add(session.startTime.split('T')[0]);
    }
  }
  
  return Array.from(dates).sort();
}

export function getTotalWorkouts(data: WorkoutData): number {
  return getUniqueWorkoutDates(data).length;
}

export function getTotalTimeMinutes(data: WorkoutData): number {
  let total = 0;
  for (const session of data.workoutSessions) {
    if (session.endTime) {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      total += (end - start) / 1000 / 60;
    }
  }
  return Math.round(total);
}

export function getWorkoutsThisWeek(data: WorkoutData): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const dates = getUniqueWorkoutDates(data);
  return dates.filter(dateStr => {
    const date = new Date(dateStr);
    return date >= startOfWeek;
  }).length;
}

// Helper to get the start of a week (Monday) for a given date
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // Adjust to Monday (day 0 = Sunday, so Monday = 1)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// Get week string for comparison (YYYY-WW format)
function getWeekKey(date: Date): string {
  const weekStart = getWeekStart(date);
  return weekStart.toISOString().split('T')[0];
}

export function getCurrentStreak(data: WorkoutData): number {
  const dates = getUniqueWorkoutDates(data);
  if (dates.length === 0) return 0;
  
  // Get unique weeks that have at least one workout
  const weeksWithWorkouts = new Set<string>();
  for (const dateStr of dates) {
    weeksWithWorkouts.add(getWeekKey(new Date(dateStr)));
  }
  
  let streak = 0;
  const today = new Date();
  
  // Check current week and go backwards
  let checkDate = new Date(today);
  
  for (let i = 0; i < 52; i++) { // Check up to a year of weeks
    const weekKey = getWeekKey(checkDate);
    
    if (weeksWithWorkouts.has(weekKey)) {
      streak++;
    } else if (i === 0) {
      // Current week doesn't have a workout yet, that's okay - check previous weeks
    } else {
      // Found a week without workout, streak is broken
      break;
    }
    
    // Move to previous week
    checkDate.setDate(checkDate.getDate() - 7);
  }
  
  return streak;
}

export function getLastWorkoutDate(data: WorkoutData): string | null {
  const dates = getUniqueWorkoutDates(data);
  if (dates.length === 0) return null;
  return dates[dates.length - 1];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatDuration(startTime: string, endTime?: string): string {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const minutes = Math.round((end - start) / 1000 / 60);
  return formatTime(minutes);
}

export function getCategories(data: WorkoutData): string[] {
  const categories = new Set<string>();
  for (const exercise of data.exercises) {
    categories.add(exercise.category);
  }
  return Array.from(categories).sort();
}

export function getExercisesByCategory(data: WorkoutData, category: string): Exercise[] {
  return data.exercises.filter(e => e.category === category);
}

export function getActiveWorkoutSession(data: WorkoutData): WorkoutSession | null {
  return data.workoutSessions.find(s => !s.endTime) || null;
}

export function getExerciseMaxWeight(exercise: Exercise): number {
  let max = 0;
  for (const session of exercise.sessions) {
    for (const set of session.sets) {
      if (set.weight > max) {
        max = set.weight;
      }
    }
  }
  return max;
}

export function getExerciseLastSession(exercise: Exercise) {
  if (exercise.sessions.length === 0) return null;
  return exercise.sessions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

// Get the previous session (excluding today)
export function getExercisePreviousSession(exercise: Exercise) {
  const todayDateStr = new Date().toISOString().split('T')[0];
  const sorted = exercise.sessions
    .filter(s => s.date.split('T')[0] !== todayDateStr)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted[0] || null;
}
