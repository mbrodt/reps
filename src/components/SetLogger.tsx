import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Check, Copy, StickyNote, BarChart3 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { MuscleGroupBadge } from './ui/MuscleGroupBadge';
import type { Exercise, Set, WorkoutSession } from '../types';
import { getExercisePreviousSessions, formatDate } from '../utils/stats';

function formatWeight(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

type SetLoggerProps = {
  exercise: Exercise;
  onBack: () => void;
  onAddSet: (set: Set) => void;
  onUpdateNote?: (note: string) => void;
  onViewExercise?: () => void;
  workoutSessions?: WorkoutSession[];
  allExercises?: Exercise[];
};

export function SetLogger({ exercise, onBack, onAddSet, onUpdateNote, onViewExercise, workoutSessions, allExercises }: SetLoggerProps) {
  const previousSessions = getExercisePreviousSessions(exercise, 3);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySession = exercise.sessions.find(
    s => s.date.split('T')[0] === todayDateStr
  );

  // Get the best pre-fill values: today's last set > previous session's last set
  const getPreFillValues = (): { reps: number; weight: number } | null => {
    if (todaySession && todaySession.sets.length > 0) {
      const lastSet = todaySession.sets[todaySession.sets.length - 1];
      return { reps: lastSet.reps, weight: lastSet.weight };
    }
    if (previousSessions.length > 0 && previousSessions[0].sets.length > 0) {
      const lastSet = previousSessions[0].sets[previousSessions[0].sets.length - 1];
      return { reps: lastSet.reps, weight: lastSet.weight };
    }
    return null;
  };

  const initialPreFill = getPreFillValues();
  const [reps, setReps] = useState(() => initialPreFill?.reps ?? 10);
  const [weight, setWeight] = useState(() => initialPreFill?.weight ?? 0);
  const [weightDisplay, setWeightDisplay] = useState(() => formatWeight(initialPreFill?.weight ?? 0));
  const [justAdded, setJustAdded] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const handleAddSet = () => {
    onAddSet({ reps, weight });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const adjustReps = (delta: number) => {
    setReps(prev => Math.max(1, prev + delta));
  };

  const adjustWeight = (delta: number) => {
    setWeight(prev => {
      const next = Math.max(0, +(prev + delta).toFixed(1));
      setWeightDisplay(formatWeight(next));
      return next;
    });
  };

  const handleWeightChange = (value: string) => {
    // Allow commas as decimal separator
    const normalized = value.replace(',', '.');
    setWeightDisplay(value);
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed) && parsed >= 0) {
      setWeight(parsed);
    } else if (value === '' || value === '0') {
      setWeight(0);
    }
  };

  const handleWeightBlur = () => {
    // Clean up display on blur
    setWeightDisplay(formatWeight(weight));
  };

  const handleRepeatLastSet = () => {
    if (todaySession && todaySession.sets.length > 0) {
      const lastSet = todaySession.sets[todaySession.sets.length - 1];
      onAddSet({ reps: lastSet.reps, weight: lastSet.weight });
    } else if (previousSessions.length > 0 && previousSessions[0].sets.length > 0) {
      const lastSet = previousSessions[0].sets[0];
      onAddSet({ reps: lastSet.reps, weight: lastSet.weight });
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const hasRepeatableSet = !!(todaySession?.sets.length || previousSessions[0]?.sets.length);

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{exercise.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{exercise.category}</p>
            {workoutSessions && allExercises && (
              <MuscleGroupBadge
                exerciseId={exercise.id}
                category={exercise.category}
                sessionDate={todayDateStr}
                workoutSessions={workoutSessions}
                allExercises={allExercises}
              />
            )}
          </div>
        </div>
        {onViewExercise && (
          <button
            onClick={onViewExercise}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="View exercise history"
          >
            <BarChart3 size={22} />
          </button>
        )}
      </div>

      {/* Input Section - Compact for mobile */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          {/* Reps Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 w-16">Reps</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustReps(-1)}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={reps}
                onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center text-2xl font-bold py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                min={1}
              />
              <button
                onClick={() => adjustReps(1)}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Weight Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 w-16">kg</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustWeight(-2.5)}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <Minus size={18} />
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={weightDisplay}
                onChange={(e) => handleWeightChange(e.target.value)}
                onBlur={handleWeightBlur}
                className="w-16 text-center text-2xl font-bold py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={() => adjustWeight(2.5)}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Log + Repeat Buttons */}
          <div className="flex gap-2 mt-2">
            {hasRepeatableSet && (
              <Button
                variant="secondary"
                size="lg"
                className="flex-shrink-0"
                onClick={handleRepeatLastSet}
              >
                <Copy size={18} />
              </Button>
            )}
            <Button 
              className="flex-1" 
              size="lg" 
              onClick={handleAddSet}
            >
              {justAdded ? <Check size={20} /> : <Plus size={20} />}
              {justAdded ? 'Added!' : 'Log Set'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Sets */}
      {todaySession && todaySession.sets.length > 0 && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Today ({todaySession.sets.length} set{todaySession.sets.length !== 1 ? 's' : ''})
            </p>
            <div className="space-y-1">
              {todaySession.sets.map((set, idx) => (
                <div key={idx} className="text-sm flex justify-between">
                  <span className="text-gray-500">Set {idx + 1}</span>
                  <span className="font-medium">{set.reps} x {set.weight}kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note Section */}
      {onUpdateNote && (
        <div className="mb-4">
          {isNoteOpen || todaySession?.note ? (
            <Card>
              <CardContent className="py-3">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Note</p>
                <textarea
                  value={todaySession?.note ?? ''}
                  onChange={(e) => onUpdateNote(e.target.value)}
                  placeholder="e.g. 3x20 crunches, 45s plank, 30 Russian twists..."
                  className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>
          ) : (
            <button
              onClick={() => setIsNoteOpen(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <StickyNote size={16} />
              Add note
            </button>
          )}
        </div>
      )}

      {/* Previous Sessions Reference - show last 3 */}
      {previousSessions.length > 0 && (
        <div className="space-y-3">
          {previousSessions.map((session) => (
              <Card key={session.id} className="bg-gray-50">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {formatDate(session.date)}
                    </p>
                    {workoutSessions && allExercises && (
                      <MuscleGroupBadge
                        exerciseId={exercise.id}
                        category={exercise.category}
                        sessionDate={session.date}
                        workoutSessions={workoutSessions}
                        allExercises={allExercises}
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    {session.sets.map((set, idx) => (
                      <div key={idx} className="text-sm flex justify-between">
                        <span className="text-gray-500">Set {idx + 1}</span>
                        <span className="font-medium">{set.reps} x {set.weight}kg</span>
                      </div>
                    ))}
                  </div>
                  {session.note && (
                    <p className="text-xs text-gray-400 mt-2 italic">{session.note}</p>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
