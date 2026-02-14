import { useMemo } from 'react';
import { ArrowLeft, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { MuscleGroupBadge } from './ui/MuscleGroupBadge';
import type { Exercise, WorkoutSession } from '../types';
import { formatDate, getExerciseMaxWeight } from '../utils/stats';

type ExerciseDetailProps = {
  exercise: Exercise;
  workoutSessions: WorkoutSession[];
  allExercises: Exercise[];
  onBack: () => void;
  onDelete: () => void;
};

export function ExerciseDetail({ exercise, workoutSessions, allExercises, onBack, onDelete }: ExerciseDetailProps) {
  const sortedSessions = useMemo(() => {
    return [...exercise.sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [exercise.sessions]);

  const chartData = useMemo(() => {
    // Get max weight and total volume per session for the charts
    return [...exercise.sessions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10) // Last 10 sessions
      .map(session => ({
        date: session.date,
        maxWeight: Math.max(...session.sets.map(s => s.weight)),
        totalVolume: session.sets.reduce((sum, s) => sum + s.reps * s.weight, 0),
      }));
  }, [exercise.sessions]);

  const maxWeight = getExerciseMaxWeight(exercise);
  const maxChartWeight = Math.max(...chartData.map(d => d.maxWeight), 1);
  const maxChartVolume = Math.max(...chartData.map(d => d.totalVolume), 1);

  const handleDelete = () => {
    if (confirm(`Delete "${exercise.name}"? This will remove all history for this exercise.`)) {
      onDelete();
    }
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
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-gray-500">{exercise.category}</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* PR Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Personal Best</p>
            <p className="text-xl font-bold">{maxWeight} kg</p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Charts */}
      {chartData.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold">Progress</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Max Weight Chart */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Max Weight</p>
                <span className="text-xs text-gray-400">{maxChartWeight}kg</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {chartData.map((point) => {
                  const height = (point.maxWeight / maxChartWeight) * 100;
                  return (
                    <div
                      key={point.date}
                      className="flex-1 bg-black rounded-t"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Volume Chart */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Volume</p>
                <span className="text-xs text-gray-400">{maxChartVolume >= 1000 ? `${(maxChartVolume / 1000).toFixed(1)}k` : maxChartVolume}</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {chartData.map((point) => {
                  const height = (point.totalVolume / maxChartVolume) * 100;
                  return (
                    <div
                      key={point.date}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* X-axis dates */}
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatDate(chartData[0]?.date)}</span>
              <span>{formatDate(chartData[chartData.length - 1]?.date)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <h2 className="font-semibold mb-3">History</h2>
      <div className="space-y-3">
        {sortedSessions.map(session => (
          <Card key={session.id}>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium text-sm text-gray-500">
                  {formatDate(session.date)}
                </p>
                <MuscleGroupBadge
                  exerciseId={exercise.id}
                  category={exercise.category}
                  sessionDate={session.date}
                  workoutSessions={workoutSessions}
                  allExercises={allExercises}
                />
              </div>
              <div className="space-y-1">
                {session.sets.map((set, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span className="text-gray-500">Set {idx + 1}</span>
                    <span className="font-medium">
                      {set.reps} reps x {set.weight} kg
                    </span>
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

      {sortedSessions.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No sessions recorded yet.</p>
          <p className="text-sm mt-1">Start a workout to log sets!</p>
        </div>
      )}
    </div>
  );
}
