import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { User, Skull } from 'lucide-react';

export const CharacterCreation = () => {
  const { playerProfile, setPlayerProfile, addNarratorLog } = useGameStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  if (playerProfile) return null;

  const handleCreate = () => {
    if (name.trim()) {
      setPlayerProfile({ name: name.trim(), gender });
      addNarratorLog(`Here are recorded the deeds of ${name.trim()}.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-stone-900 border-4 border-amber-900 rounded p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10"><Skull size={100} /></div>
        
        <h2 className="text-3xl font-serif text-amber-500 mb-6 text-center border-b border-amber-900/50 pb-2 flex justify-center items-center gap-2">
          <User className="text-amber-700" />
          Who goes there?
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-amber-700/80 mb-1 text-sm font-bold uppercase tracking-wider">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border-2 border-stone-700 p-2 text-amber-500 outline-none focus:border-amber-600 font-serif"
              placeholder="Enter your name..."
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-amber-700/80 mb-1 text-sm font-bold uppercase tracking-wider">Gender</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setGender('Male')}
                className={`flex-1 p-2 border-2 transition-colors font-bold uppercase tracking-wider text-sm ${gender === 'Male' ? 'bg-amber-900 border-amber-500 text-amber-100' : 'bg-black/50 border-stone-700 text-stone-500 hover:border-amber-900'}`}
              >
                Male
              </button>
              <button 
                onClick={() => setGender('Female')}
                className={`flex-1 p-2 border-2 transition-colors font-bold uppercase tracking-wider text-sm ${gender === 'Female' ? 'bg-amber-900 border-amber-500 text-amber-100' : 'bg-black/50 border-stone-700 text-stone-500 hover:border-amber-900'}`}
              >
                Female
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full mt-6 bg-green-900 hover:bg-green-700 disabled:bg-stone-800 disabled:text-stone-600 disabled:border-stone-700 text-white font-bold py-3 px-4 rounded border-2 border-green-500 transition-colors uppercase tracking-widest shadow-lg"
          >
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
};
