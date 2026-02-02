import { useState } from 'react';
import { ChevronRight, Plus, ChevronDown } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import type { WorkoutData, Exercise } from '../types';
import { getCategories, getExercisesByCategory, getExerciseLastSession } from '../utils/stats';

type ExercisesProps = {
  data: WorkoutData;
  onAddExercise: (name: string, category: string) => void;
  onSelectExercise: (exercise: Exercise) => void;
};

export function Exercises({ data, onAddExercise, onSelectExercise }: ExercisesProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);

  const categories = getCategories(data);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAddExercise = () => {
    const category = isNewCategory ? newExerciseCategory : newExerciseCategory;
    if (newExerciseName.trim() && category.trim()) {
      onAddExercise(newExerciseName.trim(), category.trim());
      setShowAddModal(false);
      setNewExerciseName('');
      setNewExerciseCategory('');
      setIsNewCategory(false);
      // Auto-expand the category
      setExpandedCategories(prev => new Set(prev).add(category.trim()));
    }
  };

  const formatLastSession = (exercise: Exercise) => {
    const lastSession = getExerciseLastSession(exercise);
    if (!lastSession) return 'No sessions yet';
    
    const date = new Date(lastSession.date);
    const setCount = lastSession.sets.length;
    const maxWeight = Math.max(...lastSession.sets.map(s => s.weight));
    
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${setCount} sets · ${maxWeight}kg`;
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map(category => {
          const exercises = getExercisesByCategory(data, category);
          const isExpanded = expandedCategories.has(category);

          return (
            <Card key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{category}</span>
                  <span className="text-sm text-gray-400">
                    {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {exercises.map((exercise, idx) => (
                    <button
                      key={exercise.id}
                      onClick={() => onSelectExercise(exercise)}
                      className={`
                        w-full px-4 py-3 flex items-center justify-between text-left
                        hover:bg-gray-50 transition-colors
                        ${idx < exercises.length - 1 ? 'border-b border-gray-50' : ''}
                      `}
                    >
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatLastSession(exercise)}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p>No exercises yet.</p>
          <p className="text-sm mt-1">Add your first exercise to get started!</p>
        </div>
      )}

      {/* Add Exercise Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewExerciseName('');
          setNewExerciseCategory('');
          setIsNewCategory(false);
        }}
        title="Add Exercise"
      >
        <div className="space-y-4">
          <Input
            label="Exercise Name"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="e.g., Bench Press"
          />

          {!isNewCategory && categories.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={newExerciseCategory}
                onChange={(e) => setNewExerciseCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => setIsNewCategory(true)}
                className="text-sm text-black underline text-left mt-1"
              >
                Or create new category
              </button>
            </div>
          ) : (
            <div>
              <Input
                label="Category"
                value={newExerciseCategory}
                onChange={(e) => setNewExerciseCategory(e.target.value)}
                placeholder="e.g., Chest"
              />
              {categories.length > 0 && (
                <button
                  onClick={() => {
                    setIsNewCategory(false);
                    setNewExerciseCategory('');
                  }}
                  className="text-sm text-black underline mt-2"
                >
                  Choose existing category
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddExercise}
              disabled={!newExerciseName.trim() || !newExerciseCategory.trim()}
            >
              Add Exercise
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
