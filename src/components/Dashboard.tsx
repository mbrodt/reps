import { useState } from 'react';
import { Activity, Clock, Calendar, Flame, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import type { WorkoutData } from '../types';
import {
  getTotalWorkouts,
  getTotalTimeMinutes,
  getWorkoutsThisWeek,
  getCurrentStreak,
  getLastWorkoutDate,
  formatDate,
  formatTime,
} from '../utils/stats';
import { exportData, importData } from '../utils/storage';

type DashboardProps = {
  data: WorkoutData;
  onImport: (data: WorkoutData) => void;
  onDeleteSessionsFromDate: (dateStr: string) => void;
};

export function Dashboard({ data, onImport, onDeleteSessionsFromDate }: DashboardProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [cleanupDate, setCleanupDate] = useState('');

  const totalWorkouts = getTotalWorkouts(data);
  const totalTime = getTotalTimeMinutes(data);
  const workoutsThisWeek = getWorkoutsThisWeek(data);
  const streak = getCurrentStreak(data);
  const lastWorkout = getLastWorkoutDate(data);

  const handleExport = () => {
    exportData(data);
  };

  const handleImport = () => {
    setImportError('');
    const parsed = importData(importText);
    if (parsed) {
      onImport(parsed);
      setShowImportModal(false);
      setImportText('');
    } else {
      setImportError('Invalid JSON data. Please check the format.');
    }
  };

  const handleCleanupDate = () => {
    if (cleanupDate && confirm(`Delete all exercise data from ${cleanupDate}? This cannot be undone.`)) {
      onDeleteSessionsFromDate(cleanupDate);
      setShowCleanupModal(false);
      setCleanupDate('');
    }
  };

  const stats = [
    {
      label: 'Total Workouts',
      value: totalWorkouts.toString(),
      icon: Activity,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Time',
      value: formatTime(totalTime),
      icon: Clock,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'This Week',
      value: workoutsThisWeek.toString(),
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Current Streak',
      value: `${streak} week${streak !== 1 ? 's' : ''}`,
      icon: Flame,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Reps</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Workout */}
      {lastWorkout && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-sm text-gray-500 mb-1">Last Workout</p>
            <p className="font-semibold">{formatDate(lastWorkout)}</p>
          </CardContent>
        </Card>
      )}

      {/* Export/Import */}
      <div className="flex gap-3 mb-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleExport}
        >
          <Download size={18} />
          Export
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => setShowImportModal(true)}
        >
          <Upload size={18} />
          Import
        </Button>
      </div>

      {/* Cleanup */}
      <Button
        variant="secondary"
        className="w-full text-red-600"
        onClick={() => setShowCleanupModal(true)}
      >
        <Trash2 size={18} />
        Delete Data by Date
      </Button>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportText('');
          setImportError('');
        }}
        title="Import Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Paste your exported workout data JSON below. This will replace all current data.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON here..."
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-black"
          />
          {importError && (
            <p className="text-sm text-red-500">{importError}</p>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={!importText.trim()}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cleanup Modal */}
      <Modal
        isOpen={showCleanupModal}
        onClose={() => {
          setShowCleanupModal(false);
          setCleanupDate('');
        }}
        title="Delete Data by Date"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter a date to delete all exercise sessions from that day. This is useful for cleaning up orphaned data.
          </p>
          <input
            type="date"
            value={cleanupDate}
            onChange={(e) => setCleanupDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCleanupModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleCleanupDate}
              disabled={!cleanupDate}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
