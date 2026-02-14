import type { Exercise, WorkoutSession } from '../../types';
import { getMuscleGroupOrder, ordinal } from '../../utils/stats';

type MuscleGroupBadgeProps = {
  exerciseId: string;
  category: string;
  sessionDate: string;
  workoutSessions: WorkoutSession[];
  allExercises: Exercise[];
};

export function MuscleGroupBadge({
  exerciseId,
  category,
  sessionDate,
  workoutSessions,
  allExercises,
}: MuscleGroupBadgeProps) {
  const order = getMuscleGroupOrder(exerciseId, category, sessionDate, workoutSessions, allExercises);
  if (order === null) return null;

  return (
    <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
      {ordinal(order)} {category.toLowerCase()}
    </span>
  );
}
