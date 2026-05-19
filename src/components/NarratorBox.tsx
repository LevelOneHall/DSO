import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const NarratorBox = () => {
  const narratorLogs = useGameStore(s => s.narratorLogs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narratorLogs]);

  // Don't show box if profile not created yet
  const profile = useGameStore(s => s.playerProfile);
  if (!profile) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 bg-stone-900 border-t-4 border-amber-900 z-40 p-4 font-serif text-amber-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 via-black to-black pointer-events-none"></div>
      <div 
        ref={scrollRef}
        className="w-full h-full overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-stone-800"
      >
        {narratorLogs.map((log, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-left-4 duration-300">
            {log}
          </div>
        ))}
        {narratorLogs.length === 0 && (
          <div className="text-stone-500 italic">Silence fills the air...</div>
        )}
      </div>
    </div>
  );
};
