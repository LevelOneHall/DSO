import React from 'react';
import { useGameStore } from '../store/gameStore';
import { rarityBgColors, rarityColors } from '../lib/utils';
import { Shield, Sword, Heart, X, Hand, FlaskConical } from 'lucide-react';

export const InventoryUI = () => {
  const { inventory, equipped, equipItem, unequipItem, showInventory, setShowInventory, stats, getTotalStats } = useGameStore();

  if (!showInventory) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pixel-font">
      <div className="w-full max-w-4xl bg-stone-900 border-4 border-stone-600 rounded flex flex-col md:flex-row h-[80vh] text-stone-200">
        <button onClick={() => setShowInventory(false)} className="absolute top-6 right-6 text-white hover:text-red-500">
          <X size={32} />
        </button>

        {/* Character Sheet */}
        <div className="w-full md:w-1/3 border-r-4 border-stone-600 p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-amber-500">Player Stats</h2>
          
          <div className="w-32 h-32 bg-stone-800 border-2 border-stone-700 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
            <span className="text-6xl absolute z-10 transition-transform duration-300">🧑‍🦯</span>
            {equipped.weapon && (
              <span className={`text-3xl absolute right-2 bottom-2 z-20 ${rarityColors[equipped.weapon.rarity].replace('border-', '')}`}>
                ⚔️
              </span>
            )}
            {equipped.armor && (
              <span className={`text-3xl absolute inset-0 m-auto z-20 opacity-50 filter drop-shadow-[0_0_5px_currentColor] ${rarityColors[equipped.armor.rarity].replace('border-', '')}`}>
                🛡️
              </span>
            )}
            {/* Background color based on highest rarity item */}
            <div className={`absolute inset-0 opacity-20 ${equipped.weapon?.rarity === 'legendary' || equipped.armor?.rarity === 'legendary' ? 'bg-orange-500' : equipped.weapon?.rarity === 'epic' || equipped.armor?.rarity === 'epic' ? 'bg-purple-500' : ''}`} />
          </div>

          <div className="w-full space-y-2 mb-6 bg-stone-800 p-4 rounded border-2 border-stone-700">
            <div className="flex justify-between"><span>Level:</span> <span>{stats.level}</span></div>
            <div className="flex justify-between"><span>HP:</span> <span>{stats.hp} / {getTotalStats().maxHp}</span></div>
            <div className="flex justify-between">
              <span>Attack:</span> 
              <span>{getTotalStats().attack} {equipped.weapon && <span className="text-green-400 text-xs">(+{equipped.weapon.stats?.attack})</span>}</span>
            </div>
            <div className="flex justify-between">
              <span>Defense:</span> 
              <span>{getTotalStats().defense} {equipped.armor && <span className="text-green-400 text-xs">(+{equipped.armor.stats?.defense})</span>}</span>
            </div>
            <div className="flex justify-between"><span>EXP:</span> <span>{stats.exp} / {stats.expToNext}</span></div>
          </div>

          <h3 className="text-xl font-bold mb-2">Equipped</h3>
          <div className="flex gap-4 w-full">
            <div 
              className={`w-1/2 aspect-square border-2 ${equipped.weapon ? rarityColors[equipped.weapon.rarity] : 'border-stone-600'} bg-stone-800 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-700`}
              onClick={() => equipped.weapon && unequipItem('weapon')}
            >
              <Sword className="mb-2 opacity-50" />
              <div className="text-xs text-center px-1">
                {equipped.weapon ? equipped.weapon.name : 'No Weapon'}
              </div>
            </div>
            <div 
              className={`w-1/2 aspect-square border-2 ${equipped.armor ? rarityColors[equipped.armor.rarity] : 'border-stone-600'} bg-stone-800 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-700`}
              onClick={() => equipped.armor && unequipItem('armor')}
            >
              <Shield className="mb-2 opacity-50" />
              <div className="text-xs text-center px-1">
                {equipped.armor ? equipped.armor.name : 'No Armor'}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="w-full md:w-2/3 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-amber-500">Inventory</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {inventory.map((item, i) => (
              <div 
                key={`${item.id}-${i}`}
                className={`aspect-square border-2 ${rarityColors[item.rarity]} ${rarityBgColors[item.rarity]} flex flex-col items-center justify-center cursor-pointer hover:brightness-125 transition-all relative group`}
                onClick={() => equipItem(item)}
              >
                {item.type === 'weapon' ? <Sword size={24} /> : 
                 item.type === 'armor' ? <Shield size={24} /> : 
                 <FlaskConical size={24} />}
                
                {/* Tooltip */}
                <div className="absolute hidden group-hover:block bottom-full mb-2 bg-black text-white text-xs p-2 rounded w-32 z-10 border border-stone-500 pointer-events-none">
                  <div className={`font-bold ${rarityColors[item.rarity].replace('border', '')}`}>{item.name}</div>
                  <div>Type: {item.type}</div>
                  {item.stats?.attack && <div>ATK: +{item.stats.attack}</div>}
                  {item.stats?.defense && <div>DEF: +{item.stats.defense}</div>}
                  {item.stats?.health && <div>Heal: +{item.stats.health}</div>}
                </div>
              </div>
            ))}
            {/* Empty Slots for aesthetic */}
            {Array.from({ length: Math.max(0, 30 - inventory.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-2 border-stone-700 bg-stone-800/50" />
            ))}
          </div>
          <p className="mt-4 text-sm text-stone-400 text-center">Click an item to equip / use it. Click an equipped item to unequip.</p>
        </div>
      </div>
    </div>
  );
};
