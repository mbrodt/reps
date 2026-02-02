import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import type { Exercise, Set } from '../types';
import { getExercisePreviousSession, formatDate } from '../utils/stats';

type SetLoggerProps = {
  exercise: Exercise;
  onBack: () => void;
  onAddSet: (set: Set) => void;
};

export function SetLogger({ exercise, onBack, onAddSet }: SetLoggerProps) {
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const previousSession = getExercisePreviousSession(exercise);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySession = exercise.sessions.find(
    s => s.date.split('T')[0] === todayDateStr
  );

  // Initialize weight from previous session (only on first mount)
  useEffect(() => {
    if (previousSession && previousSession.sets.length > 0) {
      const lastSet = previousSession.sets[previousSession.sets.length - 1];
      setWeight(lastSet.weight);
      setReps(lastSet.reps);
    }
  }, []); // Empty deps - only run once

  const handleAddSet = () => {
    onAddSet({ reps, weight });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const adjustReps = (delta: number) => {
    setReps(prev => Math.max(1, prev + delta));
  };

  const adjustWeight = (delta: number) => {
    setWeight(prev => Math.max(0, +(prev + delta).toFixed(1)));
  };

  const handleRepeatLastSet = () => {
    if (todaySession && todaySession.sets.length > 0) {
      const lastSet = todaySession.sets[todaySession.sets.length - 1];
      onAddSet({ reps: lastSet.reps, weight: lastSet.weight });
    } else if (previousSession && previousSession.sets.length > 0) {
      const lastSet = previousSession.sets[0];
      onAddSet({ reps: lastSet.reps, weight: lastSet.weight });
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

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
        <div>
          <h1 className="text-lg font-bold">{exercise.name}</h1>
          <p className="text-sm text-gray-500">{exercise.category}</p>
        </div>
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
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-16 text-center text-2xl font-bold py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                min={0}
                step={0.5}
              />
              <button
                onClick={() => adjustWeight(2.5)}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Log Button - inline */}
          <Button 
            className="w-full mt-2" 
            size="lg" 
            onClick={handleAddSet}
          >
            {justAdded ? <Check size={20} /> : <Plus size={20} />}
            {justAdded ? 'Added!' : 'Log Set'}
          </Button>
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
                  <span className="font-medium">{set.reps} × {set.weight}kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Session Reference - always show if exists */}
      {previousSession && (
        <Card className="mb-4 bg-gray-50">
          <CardContent className="py-3">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Last: {formatDate(previousSession.date)}
            </p>
            <div className="space-y-1">
              {previousSession.sets.map((set, idx) => (
                <div key={idx} className="text-sm flex justify-between">
                  <span className="text-gray-500">Set {idx + 1}</span>
                  <span className="font-medium">{set.reps} × {set.weight}kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repeat Last Set Button */}
      {(todaySession?.sets.length || previousSession?.sets.length) ? (
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleRepeatLastSet}
        >
          Repeat Last Set
        </Button>
      ) : null}
    </div>
  );
}
