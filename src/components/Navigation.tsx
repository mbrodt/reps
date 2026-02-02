import { LayoutDashboard, Dumbbell, Play } from 'lucide-react';
import type { Tab } from '../types';

type NavigationProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasActiveWorkout: boolean;
};

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell },
  { id: 'workout', label: 'Workout', icon: Play },
];

export function Navigation({ activeTab, onTabChange, hasActiveWorkout }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const showIndicator = id === 'workout' && hasActiveWorkout;
          
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 h-full
                transition-colors relative
                ${isActive ? 'text-black' : 'text-gray-400'}
              `}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {showIndicator && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
                )}
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
