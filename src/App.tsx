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
  
  const {
    data,
    addExercise,
    deleteExercise,
    addSetToExercise,
    startWorkoutSession,
    endWorkoutSession,
    deleteWorkoutSession,
    addExerciseToWorkoutSession,
    replaceData,
    deleteSessionsFromDate,
  } = useWorkoutData();

  const hasActiveWorkout = !!getActiveWorkoutSession(data);

  // If viewing exercise detail
  if (selectedExercise && activeTab === 'exercises') {
    // Get fresh exercise data
    const exercise = data.exercises.find(e => e.id === selectedExercise.id);
    if (!exercise) {
      setSelectedExercise(null);
      return null;
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ExerciseDetail
          exercise={exercise}
          onBack={() => setSelectedExercise(null)}
          onDelete={() => {
            deleteExercise(exercise.id);
            setSelectedExercise(null);
          }}
        />
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedExercise(null);
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
          onStartWorkout={startWorkoutSession}
          onEndWorkout={endWorkoutSession}
          onDeleteWorkoutSession={deleteWorkoutSession}
          onAddSet={addSetToExercise}
          onAddExerciseToSession={addExerciseToWorkoutSession}
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
