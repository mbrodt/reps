import { useState } from 'react';
import { Play, Square, Plus, ChevronRight, ChevronDown, Trash2, Clock, Users } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import type { WorkoutData, WorkoutSession, Exercise, Set } from '../types';
import { useTimer } from '../hooks/useTimer';
import { getActiveWorkoutSession, formatDate } from '../utils/stats';
import { SetLogger } from './SetLogger';
import { WorkoutDetail } from './WorkoutDetail';

type WorkoutProps = {
  data: WorkoutData;
  initialExerciseId?: string | null;
  onClearInitialExercise?: () => void;
  onStartWorkout: () => WorkoutSession;
  onEndWorkout: (sessionId: string) => void;
  onDeleteWorkoutSession: (sessionId: string) => void;
  onAddSet: (exerciseId: string, set: Set) => void;
  onDeleteSet: (exerciseId: string, sessionId: string, setIndex: number) => void;
  onUpdateSet: (exerciseId: string, sessionId: string, setIndex: number, set: Set) => void;
  onAddExerciseToSession: (sessionId: string, exerciseId: string) => void;
  onUpdateNote: (exerciseId: string, sessionDate: string, note: string) => void;
  onViewExercise?: (exercise: Exercise) => void;
};

export function Workout({
  data,
  initialExerciseId,
  onClearInitialExercise,
  onStartWorkout,
  onEndWorkout,
  onDeleteWorkoutSession,
  onAddSet,
  onDeleteSet,
  onUpdateSet,
  onAddExerciseToSession,
  onUpdateNote,
  onViewExercise,
}: WorkoutProps) {
  const [_selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedPastWorkoutId, setSelectedPastWorkoutId] = useState<string | null>(null);
  const [isPastWorkoutsOpen, setIsPastWorkoutsOpen] = useState(false);

  // Use initialExerciseId if provided (returning from ExerciseDetail), otherwise local state
  const selectedExerciseId = initialExerciseId ?? _selectedExerciseId;
  
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
      if (selectedPastWorkoutId === sessionId) {
        setSelectedPastWorkoutId(null);
      }
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

  // Render a past workout session card
  const renderPastSessionCard = (session: WorkoutSession) => {
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
                onClick={(e) => { e.stopPropagation(); handleDeleteWorkoutSession(session.id); }}
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
      <button
        key={session.id}
        onClick={() => setSelectedPastWorkoutId(session.id)}
        className="w-full text-left"
      >
        <Card className="hover:bg-gray-50 transition-colors">
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
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteWorkoutSession(session.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </button>
    );
  };

  // Render past workouts list
  const renderPastWorkouts = (limit: number = 20) => {
    if (pastSessions.length === 0) return null;

    return (
      <div>
        <h2 className="font-semibold mb-3 text-gray-500 text-sm uppercase tracking-wide">
          Past Workouts
        </h2>
        <div className="space-y-2">
          {pastSessions.slice(0, limit).map(renderPastSessionCard)}
        </div>
      </div>
    );
  };

  // If viewing a past workout detail
  const selectedPastWorkout = selectedPastWorkoutId
    ? pastSessions.find(s => s.id === selectedPastWorkoutId) || null
    : null;

  if (selectedPastWorkout) {
    return (
      <WorkoutDetail
        workoutSession={selectedPastWorkout}
        exercises={data.exercises}
        allWorkoutSessions={data.workoutSessions}
        onBack={() => setSelectedPastWorkoutId(null)}
        onDeleteSet={onDeleteSet}
        onUpdateSet={onUpdateSet}
        onDelete={() => handleDeleteWorkoutSession(selectedPastWorkout.id)}
      />
    );
  }

  // If an exercise is selected, show the set logger
  if (selectedExercise) {
    return (
      <SetLogger
        exercise={selectedExercise}
        onBack={() => { setSelectedExerciseId(null); onClearInitialExercise?.(); }}
        onAddSet={handleAddSet}
        onUpdateNote={(note) => onUpdateNote(selectedExercise.id, new Date().toISOString(), note)}
        onViewExercise={onViewExercise ? () => onViewExercise(selectedExercise) : undefined}
        workoutSessions={data.workoutSessions}
        allExercises={data.exercises}
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

        {renderPastWorkouts()}
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

      {/* Past Workouts - Collapsible during active workout */}
      {pastSessions.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setIsPastWorkoutsOpen(!isPastWorkoutsOpen)}
            className="flex items-center gap-2 w-full mb-3"
          >
            <h2 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
              Past Workouts
            </h2>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${isPastWorkoutsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isPastWorkoutsOpen && (
            <div className="space-y-2">
              {pastSessions.slice(0, 10).map(renderPastSessionCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
