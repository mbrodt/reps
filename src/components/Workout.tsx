import { useState } from 'react';
import { Play, Square, Plus, ChevronRight, Trash2, Clock, Users } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import type { WorkoutData, WorkoutSession, Exercise, Set } from '../types';
import { useTimer } from '../hooks/useTimer';
import { getActiveWorkoutSession, formatDate } from '../utils/stats';
import { SetLogger } from './SetLogger';

type WorkoutProps = {
  data: WorkoutData;
  onStartWorkout: () => WorkoutSession;
  onEndWorkout: (sessionId: string) => void;
  onDeleteWorkoutSession: (sessionId: string) => void;
  onAddSet: (exerciseId: string, set: Set) => void;
  onAddExerciseToSession: (sessionId: string, exerciseId: string) => void;
};

export function Workout({
  data,
  onStartWorkout,
  onEndWorkout,
  onDeleteWorkoutSession,
  onAddSet,
  onAddExerciseToSession,
}: WorkoutProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  
  const activeSession = getActiveWorkoutSession(data);
  const { formatElapsed } = useTimer(activeSession?.startTime || null);

  // Get fresh exercise data from state (fixes real-time update issue)
  const selectedExercise = selectedExerciseId 
    ? data.exercises.find(e => e.id === selectedExerciseId) || null
    : null;

  const handleStartWorkout = () => {
    onStartWorkout();
  };

  const handleEndWorkout = () => {
    if (activeSession && confirm('End this workout session?')) {
      onEndWorkout(activeSession.id);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExerciseId(exercise.id);
    if (activeSession) {
      onAddExerciseToSession(activeSession.id, exercise.id);
    }
  };

  const handleAddSet = (set: Set) => {
    if (selectedExercise) {
      onAddSet(selectedExercise.id, set);
    }
  };

  const handleDeleteWorkoutSession = (sessionId: string) => {
    if (confirm('Delete this workout session?')) {
      onDeleteWorkoutSession(sessionId);
    }
  };

  // Get past workout sessions (completed ones, sorted by most recent)
  const pastSessions = data.workoutSessions
    .filter(s => s.endTime)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Format duration
  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const minutes = Math.round((end - start) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // If an exercise is selected, show the set logger
  if (selectedExercise) {
    return (
      <SetLogger
        exercise={selectedExercise}
        onBack={() => setSelectedExerciseId(null)}
        onAddSet={handleAddSet}
      />
    );
  }

  // No active session - show start button and past sessions
  if (!activeSession) {
    return (
      <div className="p-4 pb-24">
        <div className="flex flex-col items-center justify-center py-12 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Ready to train?</h1>
            <p className="text-gray-500">Start a workout to begin logging sets</p>
          </div>
          <Button size="lg" onClick={handleStartWorkout}>
            <Play size={20} />
            Start Workout
          </Button>
        </div>

        {/* Past Workout Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3 text-gray-500 text-sm uppercase tracking-wide">
              Past Workouts
            </h2>
            <div className="space-y-2">
              {pastSessions.slice(0, 20).map(session => {
                const sessionDateStr = session.startTime.split('T')[0];
                
                // Dwarf workout - show simplified view
                if (session.isDwarfWorkout) {
                  return (
                    <Card key={session.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-purple-500" />
                              <p className="font-medium">Dwarf Workout</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock size={14} />
                              <span>{formatDuration(session.startTime, session.endTime!)}</span>
                              <span className="text-gray-300">•</span>
                              <span>{formatDate(session.startTime)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWorkoutSession(session.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                
                // Only include exercises that have sets logged on this session's date
                const exercisesWithSets = session.exerciseIds
                  .map(id => data.exercises.find(e => e.id === id))
                  .filter((exercise): exercise is Exercise => {
                    if (!exercise) return false;
                    const sessionData = exercise.sessions.find(s => s.date.split('T')[0] === sessionDateStr);
                    return !!sessionData && sessionData.sets.length > 0;
                  });
                
                const exerciseNames = exercisesWithSets
                  .map(e => e.name)
                  .slice(0, 3);
                
                const exerciseCount = exercisesWithSets.length;
                
                return (
                  <Card key={session.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {formatDate(session.startTime)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Clock size={14} />
                            <span>{formatDuration(session.startTime, session.endTime!)}</span>
                            <span className="text-gray-300">•</span>
                            <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
                          </div>
                          {exerciseNames.length > 0 && (
                            <p className="text-sm text-gray-400 mt-1">
                              {exerciseNames.join(', ')}
                              {exerciseCount > 3 && ` +${exerciseCount - 3} more`}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteWorkoutSession(session.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active session - show exercise picker
  const todayDateStr = new Date().toISOString().split('T')[0];
  const exercisedToday = activeSession.exerciseIds
    .map(id => data.exercises.find(e => e.id === id))
    .filter((exercise): exercise is Exercise => {
      if (!exercise) return false;
      const todaySession = exercise.sessions.find(s => s.date.split('T')[0] === todayDateStr);
      return !!todaySession && todaySession.sets.length > 0;
    });

  // Group exercises by category
  const categories = [...new Set(data.exercises.map(e => e.category))].sort();

  return (
    <div className="p-4 pb-24">
      {/* Active Workout Header */}
      <div className="mb-6 bg-black text-white rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Workout in progress</p>
          <p className="text-3xl font-bold font-mono text-white">{formatElapsed()}</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={handleEndWorkout}
        >
          <Square size={16} />
          End
        </Button>
      </div>

      {/* Today's Exercises */}
      {exercisedToday.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-3 text-gray-500 text-sm uppercase tracking-wide">
            Today's Exercises
          </h2>
          <div className="space-y-2">
            {exercisedToday.map(exercise => {
              const todaySession = exercise.sessions.find(
                s => s.date.split('T')[0] === new Date().toISOString().split('T')[0]
              );
              const setCount = todaySession?.sets.length || 0;
              
              return (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise)}
                  className="w-full text-left"
                >
                  <Card className="hover:bg-gray-50 transition-colors">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-gray-500">
                          {setCount} set{setCount !== 1 ? 's' : ''} logged
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Exercise */}
      <h2 className="font-semibold mb-3 text-gray-500 text-sm uppercase tracking-wide">
        {exercisedToday.length > 0 ? 'Add More Exercises' : 'Select Exercise'}
      </h2>
      <div className="space-y-2">
        {categories.map(category => {
          const exercises = data.exercises.filter(e => e.category === category);
          return (
            <Card key={category}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">{category}</p>
              </div>
              {exercises.map((exercise, idx) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise)}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between text-left
                    hover:bg-gray-50 transition-colors
                    ${idx < exercises.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  <span className="font-medium">{exercise.name}</span>
                  <Plus size={18} className="text-gray-400" />
                </button>
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
