import React from 'react';
import { useGameStore } from '../store/gameStore';
import { rarityColors, rarityBgColors } from '../lib/utils';
import { Coins, X, Sword, Shield, FlaskConical, Store } from 'lucide-react';

export const ShopUI = () => {
  const { inShop, setShop, stats, inventory } = useGameStore();

  if (!inShop) return null;

  const handleBuy = (item: any, price: number) => {
    if (stats.gold >= price) {
      // Need a way to reduce gold, let's implement a buyItem action later or just update stats here:
      useGameStore.setState(state => ({
        stats: { ...state.stats, gold: state.stats.gold - price },
        inventory: [...state.inventory, { ...item, id: Math.random().toString(36).substring(7) }]
      }));
    } else {
      alert("Not enough gold!");
    }
  };

  const handleSell = (item: any, index: number) => {
    const sellPrice = item.rarity === 'legendary' ? 50 : item.rarity === 'epic' ? 25 : item.rarity === 'rare' ? 10 : item.rarity === 'uncommon' ? 5 : 2;
    useGameStore.setState(state => ({
      stats: { ...state.stats, gold: state.stats.gold + sellPrice },
      inventory: state.inventory.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pixel-font">
      <div className="w-full max-w-4xl bg-stone-900 border-4 border-yellow-600 rounded flex flex-col md:flex-row h-[80vh] text-stone-200 relative">
        <button onClick={() => setShop(null)} className="absolute top-4 right-4 text-white hover:text-red-500 z-10">
          <X size={32} />
        </button>

        {/* Merchant Inventory */}
        <div className="w-full md:w-1/2 border-r-4 border-yellow-600 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2 text-yellow-500 flex items-center gap-2">
            <Store size={24} /> {inShop.name}
          </h2>
          <p className="text-sm text-stone-400 mb-6 border-b border-stone-700 pb-2">"Got some rare things on sale, stranger!"</p>

          <div className="flex flex-col gap-2">
            {inShop.inventory.map((merch, i) => (
              <div key={i} className={`flex items-center justify-between p-3 border ${rarityColors[merch.item.rarity]} ${rarityBgColors[merch.item.rarity]} hover:brightness-125 transition-all`}>
                <div className="flex items-center gap-3">
                  {merch.item.type === 'weapon' ? <Sword size={24} /> : 
                   merch.item.type === 'armor' ? <Shield size={24} /> : 
                   <FlaskConical size={24} />}
                  <div>
                    <div className="font-bold">{merch.item.name}</div>
                    <div className="text-xs text-stone-300">
                      {merch.item.stats?.attack && `ATK +${merch.item.stats.attack} `}
                      {merch.item.stats?.defense && `DEF +${merch.item.stats.defense} `}
                      {merch.item.stats?.health && `Heeds +${merch.item.stats.health} HP `}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleBuy(merch.item, merch.price)}
                  disabled={stats.gold < merch.price}
                  className="bg-yellow-700 hover:bg-yellow-600 disabled:bg-stone-700 disabled:text-stone-500 text-white px-3 py-1 rounded flex items-center gap-1 border-2 border-yellow-500 disabled:border-stone-600 transition-colors"
                >
                  {merch.price} <Coins size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Player Inventory (Sell) */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-stone-800">
          <div className="flex justify-between items-center mb-6 border-b border-stone-600 pb-2">
            <h2 className="text-xl font-bold text-amber-500">Your Inventory</h2>
            <div className="flex items-center gap-2 text-yellow-400 font-bold bg-black px-3 py-1 rounded border border-yellow-600 shadow-inner">
              {stats.gold} <Coins size={16} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {inventory.map((item, i) => {
              const sellPrice = item.rarity === 'legendary' ? 50 : item.rarity === 'epic' ? 25 : item.rarity === 'rare' ? 10 : item.rarity === 'uncommon' ? 5 : 2;
              return (
              <div 
                key={i}
                className={`aspect-square border-2 ${rarityColors[item.rarity]} bg-stone-900 flex flex-col items-center justify-center relative group p-2 mb-2 hover:bg-red-900/50 cursor-pointer transition-all`}
                onClick={() => handleSell(item, i)}
              >
                {item.type === 'weapon' ? <Sword size={24} /> : 
                 item.type === 'armor' ? <Shield size={24} /> : 
                 <FlaskConical size={24} />}
                <div className="text-[10px] text-center mt-1 truncate w-full">{item.name}</div>
                
                {/* Sell Overlay Hover */}
                <div className="absolute inset-0 bg-red-900/80 hidden group-hover:flex items-center justify-center font-bold">
                  SELL for {sellPrice}
                </div>
              </div>
            )})}
            {inventory.length === 0 && (
              <div className="col-span-3 text-center text-stone-500 py-8">Your bag is empty.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
