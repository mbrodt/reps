import { useState, useEffect, useCallback } from 'react';
import type { WorkoutData, Exercise, ExerciseSession, Set, WorkoutSession } from '../types';
import { loadData, saveData, generateId, removeSessionsFromDate } from '../utils/storage';

export function useWorkoutData() {
  const [data, setData] = useState<WorkoutData>(() => loadData());

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  const addCategory = useCallback((_name: string) => {
    // Categories are implicit - we just need at least one exercise with that category
    // This function is a no-op but kept for potential future use
  }, []);

  const addExercise = useCallback((name: string, category: string) => {
    const newExercise: Exercise = {
      id: generateId(),
      name,
      category,
      sessions: [],
    };
    setData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
    return newExercise;
  }, []);

  const deleteExercise = useCallback((exerciseId: string) => {
    setData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId),
    }));
  }, []);

  const addSetToExercise = useCallback((exerciseId: string, set: Set, date?: Date) => {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString();
    const datePart = dateStr.split('T')[0];

    setData(prev => {
      const exercises = prev.exercises.map(exercise => {
        if (exercise.id !== exerciseId) return exercise;

        // Find existing session for today or create new one
        const existingSessionIndex = exercise.sessions.findIndex(
          s => s.date.split('T')[0] === datePart
        );

        if (existingSessionIndex >= 0) {
          // Add set to existing session
          const sessions = [...exercise.sessions];
          sessions[existingSessionIndex] = {
            ...sessions[existingSessionIndex],
            sets: [...sessions[existingSessionIndex].sets, set],
          };
          return { ...exercise, sessions };
        } else {
          // Create new session
          const newSession: ExerciseSession = {
            id: generateId(),
            date: dateStr,
            sets: [set],
          };
          return {
            ...exercise,
            sessions: [...exercise.sessions, newSession],
          };
        }
      });

      return { ...prev, exercises };
    });
  }, []);

  const deleteSet = useCallback((exerciseId: string, sessionId: string, setIndex: number) => {
    setData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sessions: exercise.sessions.map(session => {
            if (session.id !== sessionId) return session;
            const newSets = session.sets.filter((_, i) => i !== setIndex);
            return { ...session, sets: newSets };
          }).filter(session => session.sets.length > 0),
        };
      }),
    }));
  }, []);

  const startWorkoutSession = useCallback(() => {
    const newSession: WorkoutSession = {
      id: generateId(),
      startTime: new Date().toISOString(),
      exerciseIds: [],
    };
    setData(prev => ({
      ...prev,
      workoutSessions: [...prev.workoutSessions, newSession],
    }));
    return newSession;
  }, []);

  const endWorkoutSession = useCallback((sessionId: string) => {
    setData(prev => ({
      ...prev,
      workoutSessions: prev.workoutSessions.map(session =>
        session.id === sessionId
          ? { ...session, endTime: new Date().toISOString() }
          : session
      ),
    }));
  }, []);

  const deleteWorkoutSession = useCallback((sessionId: string) => {
    setData(prev => {
      // Find the workout session to delete
      const sessionToDelete = prev.workoutSessions.find(s => s.id === sessionId);
      if (!sessionToDelete) return prev;

      // Get the date of the workout session (just the date part)
      const sessionDate = sessionToDelete.startTime.split('T')[0];
      
      // Get the exercise IDs that were part of this workout
      const exerciseIdsInSession = sessionToDelete.exerciseIds;

      // Remove the exercise sessions (sets) logged on that date for those exercises
      const updatedExercises = prev.exercises.map(exercise => {
        // Only remove sessions for exercises that were part of this workout
        if (!exerciseIdsInSession.includes(exercise.id)) {
          return exercise;
        }
        
        // Remove exercise sessions from that date
        return {
          ...exercise,
          sessions: exercise.sessions.filter(
            es => es.date.split('T')[0] !== sessionDate
          ),
        };
      });

      return {
        ...prev,
        exercises: updatedExercises,
        workoutSessions: prev.workoutSessions.filter(s => s.id !== sessionId),
      };
    });
  }, []);

  const addExerciseToWorkoutSession = useCallback((sessionId: string, exerciseId: string) => {
    setData(prev => ({
      ...prev,
      workoutSessions: prev.workoutSessions.map(session =>
        session.id === sessionId && !session.exerciseIds.includes(exerciseId)
          ? { ...session, exerciseIds: [...session.exerciseIds, exerciseId] }
          : session
      ),
    }));
  }, []);

  const replaceData = useCallback((newData: WorkoutData) => {
    setData(newData);
  }, []);

  const deleteSessionsFromDate = useCallback((dateStr: string) => {
    setData(prev => removeSessionsFromDate(prev, dateStr));
  }, []);

  return {
    data,
    addCategory,
    addExercise,
    deleteExercise,
    addSetToExercise,
    deleteSet,
    startWorkoutSession,
    endWorkoutSession,
    deleteWorkoutSession,
    addExerciseToWorkoutSession,
    replaceData,
    deleteSessionsFromDate,
  };
}
