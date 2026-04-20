import { useState } from 'react';
import { ArrowLeft, Trash2, Pencil, Check, X, Plus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { MuscleGroupBadge } from './ui/MuscleGroupBadge';
import type { WorkoutSession, Exercise, Set } from '../types';
import { formatDate } from '../utils/stats';

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type WorkoutDetailProps = {
  workoutSession: WorkoutSession;
  exercises: Exercise[];
  allWorkoutSessions: WorkoutSession[];
  onBack: () => void;
  onDeleteSet: (exerciseId: string, sessionId: string, setIndex: number) => void;
  onUpdateSet: (exerciseId: string, sessionId: string, setIndex: number, set: Set) => void;
  onAddSet: (exerciseId: string, set: Set, date: Date) => void;
  onDelete: () => void;
  onUpdateWorkoutSession?: (sessionId: string, updates: { startTime?: string; endTime?: string }) => void;
};

function formatWeight(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

type EditingSet = {
  exerciseId: string;
  sessionId: string;
  setIndex: number;
  reps: number;
  weight: string;
};

export function WorkoutDetail({
  workoutSession,
  exercises,
  allWorkoutSessions,
  onBack,
  onDeleteSet,
  onUpdateSet,
  onAddSet,
  onDelete,
  onUpdateWorkoutSession,
}: WorkoutDetailProps) {
  const [editingSet, setEditingSet] = useState<EditingSet | null>(null);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [addingSetForExerciseId, setAddingSetForExerciseId] = useState<string | null>(null);
  const [newReps, setNewReps] = useState(10);
  const [newWeight, setNewWeight] = useState('0');

  const handleOpenEditMeta = () => {
    setEditStart(toDatetimeLocal(workoutSession.startTime));
    setEditEnd(workoutSession.endTime ? toDatetimeLocal(workoutSession.endTime) : '');
    setIsEditingMeta(true);
  };

  const handleSaveEditMeta = () => {
    if (!editStart) return;
    onUpdateWorkoutSession?.(workoutSession.id, {
      startTime: new Date(editStart).toISOString(),
      ...(editEnd ? { endTime: new Date(editEnd).toISOString() } : {}),
    });
    setIsEditingMeta(false);
  };

  const sessionDateStr = workoutSession.startTime.split('T')[0];

  // Format duration
  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In progress';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const minutes = Math.round((end - start) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get exercises that were part of this workout with their session data
  const exercisesWithSessions = workoutSession.exerciseIds
    .map(id => {
      const exercise = exercises.find(e => e.id === id);
      if (!exercise) return null;
      const session = exercise.sessions.find(
        s => s.date.split('T')[0] === sessionDateStr
      );
      if (!session || session.sets.length === 0) return null;
      return { exercise, session };
    })
    .filter((item): item is { exercise: Exercise; session: Exercise['sessions'][0] } => item !== null);

  const handleStartEdit = (exerciseId: string, sessionId: string, setIndex: number, set: Set) => {
    setEditingSet({
      exerciseId,
      sessionId,
      setIndex,
      reps: set.reps,
      weight: formatWeight(set.weight),
    });
  };

  const handleSaveEdit = () => {
    if (!editingSet) return;
    const weightNum = parseFloat(editingSet.weight.replace(',', '.'));
    if (isNaN(weightNum) || weightNum < 0 || editingSet.reps < 1) return;
    onUpdateSet(editingSet.exerciseId, editingSet.sessionId, editingSet.setIndex, {
      reps: editingSet.reps,
      weight: weightNum,
    });
    setEditingSet(null);
  };

  const handleDeleteSet = (exerciseId: string, sessionId: string, setIndex: number) => {
    if (confirm('Delete this set?')) {
      onDeleteSet(exerciseId, sessionId, setIndex);
    }
  };

  const handleOpenAddSet = (exercise: Exercise, session: Exercise['sessions'][0]) => {
    const lastSet = session.sets[session.sets.length - 1];
    setNewReps(lastSet.reps);
    setNewWeight(formatWeight(lastSet.weight));
    setAddingSetForExerciseId(exercise.id);
  };

  const handleSaveNewSet = (exerciseId: string) => {
    const weightNum = parseFloat(newWeight.replace(',', '.'));
    if (isNaN(weightNum) || weightNum < 0 || newReps < 1) return;
    onAddSet(exerciseId, { reps: newReps, weight: weightNum }, new Date(workoutSession.startTime));
    setAddingSetForExerciseId(null);
  };

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{formatDate(workoutSession.startTime)}</h1>
          <p className="text-sm text-gray-500">
            {formatDuration(workoutSession.startTime, workoutSession.endTime)}
            {' • '}
            {exercisesWithSessions.length} exercise{exercisesWithSessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenEditMeta}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Edit date/time */}
      {isEditingMeta && (
        <Card className="mb-4">
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Start</label>
              <input
                type="datetime-local"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">End</label>
              <input
                type="datetime-local"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEditMeta} className="flex-1">Save</Button>
              <Button variant="secondary" onClick={() => setIsEditingMeta(false)} className="flex-1">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {exercisesWithSessions.map(({ exercise, session }) => (
          <Card key={exercise.id}>
            <CardContent>
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-semibold">{exercise.name}</p>
                <div className="flex items-center gap-2">
                  <MuscleGroupBadge
                    exerciseId={exercise.id}
                    category={exercise.category}
                    sessionDate={workoutSession.startTime}
                    workoutSessions={allWorkoutSessions}
                    allExercises={exercises}
                  />
                  <span className="text-xs text-gray-400">{exercise.category}</span>
                </div>
              </div>
              <div className="space-y-1">
                {session.sets.map((set, idx) => {
                  const isEditing = editingSet?.exerciseId === exercise.id
                    && editingSet?.sessionId === session.id
                    && editingSet?.setIndex === idx;

                  if (isEditing) {
                    return (
                      <div key={idx} className="flex items-center gap-2 py-1">
                        <span className="text-gray-500 text-sm w-12">Set {idx + 1}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={editingSet.reps}
                          onChange={(e) => setEditingSet({ ...editingSet, reps: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-14 text-center text-sm font-medium border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <span className="text-xs text-gray-400">reps x</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editingSet.weight}
                          onChange={(e) => setEditingSet({ ...editingSet, weight: e.target.value })}
                          className="w-14 text-center text-sm font-medium border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <span className="text-xs text-gray-400">kg</span>
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingSet(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="flex items-center justify-between py-1 text-sm group">
                      <span className="text-gray-500">Set {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{set.reps} reps x {set.weight}kg</span>
                        <button
                          onClick={() => handleStartEdit(exercise.id, session.id, idx, set)}
                          className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSet(exercise.id, session.id, idx)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Add set */}
              {addingSetForExerciseId === exercise.id ? (
                <div className="flex items-center gap-2 py-1 mt-1">
                  <span className="text-gray-500 text-sm w-12">Set {session.sets.length + 1}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newReps}
                    onChange={(e) => setNewReps(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 text-center text-sm font-medium border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <span className="text-xs text-gray-400">reps x</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-14 text-center text-sm font-medium border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <span className="text-xs text-gray-400">kg</span>
                  <button
                    onClick={() => handleSaveNewSet(exercise.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setAddingSetForExerciseId(null)}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenAddSet(exercise, session)}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus size={13} />
                  Add set
                </button>
              )}
              {/* Note section */}
              {session.note && (
                <p className="text-xs text-gray-400 mt-2 italic">{session.note}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {exercisesWithSessions.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No exercises recorded in this workout.</p>
        </div>
      )}
    </div>
  );
}
