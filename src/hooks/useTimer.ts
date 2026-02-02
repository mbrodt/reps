import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(startTime: string | null) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    updateElapsed();
    intervalRef.current = window.setInterval(updateElapsed, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime]);

  const formatElapsed = useCallback(() => {
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsed]);

  return { elapsed, formatElapsed };
}
