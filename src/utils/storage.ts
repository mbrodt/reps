import type { WorkoutData } from '../types';
import { bootstrapData } from '../data/bootstrap';

const STORAGE_KEY = 'workout_tracker_data';

export function loadData(): WorkoutData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
  }
  // Return bootstrap data on first load
  saveData(bootstrapData);
  return bootstrapData;
}

export function saveData(data: WorkoutData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
}

export function exportData(data: WorkoutData): void {
  const json = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert('Data copied to clipboard!');
  }).catch(() => {
    // Fallback: create a download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function importData(json: string): WorkoutData | null {
  try {
    const data = JSON.parse(json);
    // Basic validation
    if (data && Array.isArray(data.exercises)) {
      return data as WorkoutData;
    }
  } catch (e) {
    console.error('Failed to parse import data:', e);
  }
  return null;
}

// Clean up orphaned exercise sessions that don't have corresponding workout sessions
export function cleanOrphanedSessions(data: WorkoutData): WorkoutData {
  // Get all dates that have valid (completed) workout sessions
  const validWorkoutDates = new Set<string>();
  for (const session of data.workoutSessions) {
    if (session.endTime) {
      validWorkoutDates.add(session.startTime.split('T')[0]);
    }
  }

  // If there are no workout sessions at all, keep all exercise sessions
  // (this handles the bootstrap data case)
  if (data.workoutSessions.length === 0) {
    return data;
  }

  // Remove exercise sessions that don't have a corresponding workout session date
  const cleanedExercises = data.exercises.map(exercise => ({
    ...exercise,
    sessions: exercise.sessions.filter(session => {
      const sessionDate = session.date.split('T')[0];
      return validWorkoutDates.has(sessionDate);
    }),
  }));

  return {
    ...data,
    exercises: cleanedExercises,
  };
}

// Remove all exercise sessions from a specific date
export function removeSessionsFromDate(data: WorkoutData, dateStr: string): WorkoutData {
  const targetDate = dateStr.split('T')[0]; // Normalize to just date part
  
  const cleanedExercises = data.exercises.map(exercise => ({
    ...exercise,
    sessions: exercise.sessions.filter(session => {
      const sessionDate = session.date.split('T')[0];
      return sessionDate !== targetDate;
    }),
  }));

  return {
    ...data,
    exercises: cleanedExercises,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
