import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Backpack, CloudRain, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';

export const MainUIInfo = () => {
  const { stats, timeOfDay, weather, showInventory, setShowInventory, getTotalStats } = useGameStore();

  const hour = timeOfDay.getHours();
  const isNight = hour < 6 || hour > 19;
  const totalStats = getTotalStats();

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-[400] flex justify-between items-start pixel-font">
      {/* Top Left: Stats */}
      <div className="bg-black/70 border-2 border-stone-500 p-2 text-white pointer-events-auto rounded">
        <div className="font-bold text-amber-500 mb-1">LVL {stats.level}</div>
        <div className="w-32 h-3 bg-red-900 border border-stone-700">
          <div className="h-full bg-red-500" style={{ width: `${(stats.hp / totalStats.maxHp) * 100}%` }} />
        </div>
        <div className="text-[10px] mt-1">{stats.hp}/{totalStats.maxHp} HP</div>
        <div className="w-32 h-2 bg-blue-900 border border-stone-700 mt-1">
          <div className="h-full bg-blue-500" style={{ width: `${(stats.exp / stats.expToNext) * 100}%` }} />
        </div>
        <div className="text-[10px] mt-1">EXP</div>
      </div>

      {/* Top Right: Time/Weather & Inventory Toggle */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-black/70 border-2 border-stone-500 p-2 text-white rounded flex items-center gap-3">
          <div className="flex flex-col items-center">
            {weather === 'rain' ? <CloudRain size={16} className="text-blue-400" /> :
             isNight ? <Moon size={16} className="text-stone-300" /> : 
             <Sun size={16} className="text-yellow-400" />}
            <span className="text-[10px] uppercase mt-1">{weather}</span>
          </div>
          <div className="text-lg font-bold border-l-2 border-stone-600 pl-3">
            {format(timeOfDay, 'HH:mm')}
          </div>
        </div>

        <button 
          onClick={() => setShowInventory(!showInventory)}
          className="bg-amber-900 hover:bg-amber-700 border-2 border-amber-500 text-white p-3 rounded shadow-lg transition-colors flex items-center gap-2 mt-2"
        >
          <Backpack />
          <span className="font-bold hidden sm:inline">BAG</span>
        </button>
      </div>
    </div>
  );
};
