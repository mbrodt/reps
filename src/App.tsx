import { useState } from 'react';
import type { Tab, Exercise } from './types';
import { useWorkoutData } from './hooks/useWorkoutData';
import { getActiveWorkoutSession } from './utils/stats';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Exercises } from './components/Exercises';
import { ExerciseDetail } from './components/ExerciseDetail';
import { Workout } from './components/Workout';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [returnToExerciseId, setReturnToExerciseId] = useState<string | null>(null);
  
  const {
    data,
    addExercise,
    deleteExercise,
    addSetToExercise,
    deleteSet,
    updateSet,
    updateExerciseSessionNote,
    startWorkoutSession,
    endWorkoutSession,
    deleteWorkoutSession,
    addExerciseToWorkoutSession,
    logDwarfWorkout,
    replaceData,
    deleteSessionsFromDate,
  } = useWorkoutData();

  const hasActiveWorkout = !!getActiveWorkoutSession(data);

  const handleViewExerciseFromWorkout = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveTab('exercises');
    setReturnToExerciseId(exercise.id);
  };

  // If viewing exercise detail
  if (selectedExercise && activeTab === 'exercises') {
    // Get fresh exercise data
    const exercise = data.exercises.find(e => e.id === selectedExercise.id);
    if (!exercise) {
      setSelectedExercise(null);
      setReturnToExerciseId(null);
      return null;
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ExerciseDetail
          exercise={exercise}
          workoutSessions={data.workoutSessions}
          allExercises={data.exercises}
          onBack={() => {
            setSelectedExercise(null);
            if (returnToExerciseId) {
              setActiveTab('workout');
            }
          }}
          onDelete={() => {
            deleteExercise(exercise.id);
            setSelectedExercise(null);
            setReturnToExerciseId(null);
          }}
        />
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedExercise(null);
            setReturnToExerciseId(null);
          }}
          hasActiveWorkout={hasActiveWorkout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activeTab === 'dashboard' && (
        <Dashboard 
          data={data} 
          onImport={replaceData} 
          onDeleteSessionsFromDate={deleteSessionsFromDate}
          onLogDwarfWorkout={logDwarfWorkout}
        />
      )}
      
      {activeTab === 'exercises' && (
        <Exercises
          data={data}
          onAddExercise={addExercise}
          onSelectExercise={setSelectedExercise}
        />
      )}
      
      {activeTab === 'workout' && (
        <Workout
          data={data}
          initialExerciseId={returnToExerciseId}
          onClearInitialExercise={() => setReturnToExerciseId(null)}
          onStartWorkout={startWorkoutSession}
          onEndWorkout={endWorkoutSession}
          onDeleteWorkoutSession={deleteWorkoutSession}
          onAddSet={addSetToExercise}
          onDeleteSet={deleteSet}
          onUpdateSet={updateSet}
          onAddExerciseToSession={addExerciseToWorkoutSession}
          onUpdateNote={updateExerciseSessionNote}
          onViewExercise={handleViewExerciseFromWorkout}
        />
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveWorkout={hasActiveWorkout}
      />
    </div>
  );
}

export default App;
