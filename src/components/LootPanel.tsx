import React from 'react';
import { useGameStore } from '../store/gameStore';
import { rarityColors } from '../lib/utils';
import { X, Sword, Shield, FlaskConical, Coins } from 'lucide-react';

export const LootPanel = () => {
  const { droppedLoot, viewingLootId, setViewLoot, addToInventory, updateDroppedLoot, removeDroppedLoot } = useGameStore();

  const loot = droppedLoot.find(l => l.id === viewingLootId);

  if (!loot) return null;

  const handleLootAll = () => {
    // Add all items to inventory
    loot.items.forEach(item => addToInventory(item));
    // Add coins
    useGameStore.setState(s => ({ stats: { ...s.stats, gold: s.stats.gold + loot.coins } }));
    
    // Remove the dropped loot from the map
    removeDroppedLoot(loot.id);
    setViewLoot(null);
  };

  const handleLootItem = (item: any) => {
    addToInventory(item);
    const newItems = loot.items.filter(i => i.id !== item.id);
    if (newItems.length === 0 && loot.coins === 0) {
       removeDroppedLoot(loot.id);
       setViewLoot(null);
    } else {
       updateDroppedLoot(loot.id, newItems, loot.coins);
    }
  };

  const handleLootCoins = () => {
    useGameStore.setState(s => ({ stats: { ...s.stats, gold: s.stats.gold + loot.coins } }));
    if (loot.items.length === 0) {
       removeDroppedLoot(loot.id);
       setViewLoot(null);
    } else {
       updateDroppedLoot(loot.id, loot.items, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-stone-900 border-4 border-stone-600 rounded p-4 max-w-sm w-full shadow-2xl relative pixel-font">
        <button 
          onClick={() => setViewLoot(null)} 
          className="absolute top-2 right-2 text-stone-500 hover:text-white"
        >
          <X />
        </button>
        
        <h3 className="text-xl text-stone-300 font-bold mb-4 text-center border-b border-stone-700 pb-2">
          {loot.enemyName} lies dead
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {loot.coins > 0 && (
             <div 
                onClick={handleLootCoins}
                className="col-span-2 cursor-pointer bg-black/50 border border-yellow-700 p-2 text-yellow-500 flex items-center justify-between hover:bg-yellow-900/30"
             >
                <div className="flex items-center gap-2">
                    <Coins size={16} />
                    <span>{loot.coins} Coins</span>
                </div>
                <span className="text-xs uppercase tracking-widest text-stone-400">Loot</span>
             </div>
          )}

          {loot.items.map(item => (
             <div 
                key={item.id}
                onClick={() => handleLootItem(item)}
                className={`cursor-pointer ${rarityColors[item.rarity]} border-2 bg-black/50 p-2 flex flex-col items-center justify-center hover:bg-white/10 transition-colors`}
             >
                {item.type === 'weapon' && <Sword className="mb-2" />}
                {item.type === 'armor' && <Shield className="mb-2" />}
                {item.type === 'potion' && <FlaskConical className="mb-2" />}
                <span className="text-xs text-center text-stone-300">{item.name}</span>
             </div>
          ))}

          {loot.items.length === 0 && loot.coins === 0 && (
             <div className="col-span-2 text-center text-stone-500 py-4 italic">Empty...</div>
          )}
        </div>

        <button 
           onClick={handleLootAll}
           disabled={loot.items.length === 0 && loot.coins === 0}
           className="w-full bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-white font-bold py-3 uppercase tracking-widest text-sm rounded border border-stone-500"
        >
           Loot All
        </button>
      </div>
    </div>
  );
}
