import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { rarityColors } from '../lib/utils';
import { referCheck } from '../lib/narratorUtils';
import { Sword, Skull } from 'lucide-react';
import { motion } from 'motion/react';

export const EncounterUI = () => {
  const { inEncounter, setEncounter, stats, damagePlayer, gainExp, removeEnemy, addNarratorLog, playerProfile, setPlayerProfile, addDroppedLoot, getTotalStats } = useGameStore();
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerAnim, setPlayerAnim] = useState('');
  const [enemyAnim, setEnemyAnim] = useState('');

  useEffect(() => {
    if (inEncounter) {
      setEnemyHp(inEncounter.level * 20);
      const enemyName = inEncounter.name;
      const refCheck = referCheck(true, enemyName, inEncounter.isNamed, inEncounter.isDescribed);
      addNarratorLog(`${refCheck ? refCheck + ' ' : ''}${enemyName} draws near!`);
      setPlayerAnim('');
      setEnemyAnim('');
    }
  }, [inEncounter, addNarratorLog]);

  if (!inEncounter) return null;

  const totalStats = getTotalStats();

  const handleAttack = () => {
    setPlayerAnim('translate-x-12 rotate-12');
    setTimeout(() => setPlayerAnim(''), 200);

    const damage = totalStats.attack + Math.floor(Math.random() * 5);
    const newEnemyHp = Math.max(0, enemyHp - damage);
    
    setTimeout(() => {
      setEnemyHp(newEnemyHp);
      addNarratorLog(`You hit ${inEncounter.name} for ${damage} damage!`);

      if (newEnemyHp <= 0) {
        handleVictory();
        return;
      }

      // Check if enemy flees
      const levelDiff = stats.level - inEncounter.level;
      if (levelDiff >= 5) {
         let fleeChance = Math.min((levelDiff - 4) * 0.1, 0.5);
         if (Math.random() < fleeChance) {
             const coins = Math.floor((inEncounter.level * 5) / 2);
             const refCheck = referCheck(true, inEncounter.name, inEncounter.isNamed, inEncounter.isDescribed);
             addNarratorLog(`${refCheck ? refCheck + ' ' : ''}${inEncounter.name} flees dropping ${coins} coins!`);
             useGameStore.setState(s => ({ stats: { ...s.stats, gold: s.stats.gold + coins } }));
             removeEnemy(inEncounter.id);
             setEncounter(null);
             return;
         }
      }

      setTimeout(handleEnemyAttack, 500);
    }, 200);
  };

  const handleEnemyAttack = () => {
    setEnemyAnim('-translate-x-12 -rotate-12');
    setTimeout(() => setEnemyAnim(''), 200);

    setTimeout(() => {
      const isCrit = Math.random() < 0.1;
      let enemyDmgRaw = Math.max(1, (inEncounter.level * 4) - totalStats.defense + Math.floor(Math.random() * 3));
      
      const refCheck = referCheck(true, inEncounter.name, inEncounter.isNamed, inEncounter.isDescribed);

      if (isCrit) {
          enemyDmgRaw = Math.floor(enemyDmgRaw * 1.5);
          addNarratorLog(`${refCheck ? refCheck + ' ' : ''}${inEncounter.name} lands a critical strike for ${enemyDmgRaw} damage!!!`);
      } else {
          addNarratorLog(`${refCheck ? refCheck + ' ' : ''}${inEncounter.name} strikes you for ${enemyDmgRaw} damage!`);
      }

      damagePlayer(enemyDmgRaw);
      
      if (stats.hp - enemyDmgRaw <= 0) {
         handlePlayerDeath();
      }
    }, 200);
  };

  const handleVictory = () => {
    const expGained = inEncounter.level * 25;
    gainExp(expGained);
    
    // Loot logic
    const willDropItem = Math.random() > 0.6 || inEncounter.rarity !== 'common';
    let dropItems = [];
    if (willDropItem) {
        dropItems.push({
            id: Math.random().toString(36).substring(7),
            name: `${inEncounter.rarity} ${Math.random() > 0.5 ? 'Sword' : 'Shield'}`,
            type: Math.random() > 0.5 ? 'weapon' : 'armor' as any,
            rarity: inEncounter.rarity,
            stats: { attack: inEncounter.level * 2, defense: inEncounter.level * 2 },
            icon: 'Sword'
        });
    }
    
    const coins = inEncounter.level * (Math.floor(Math.random() * 5) + 2);
    
    const refCheckObj = referCheck(false, inEncounter.name, inEncounter.isNamed, inEncounter.isDescribed);
    let logStr = `You have slain ${refCheckObj ? refCheckObj + ' ' : ''}${inEncounter.name}!`;

    if (dropItems.length > 0) {
        logStr += ` A ${dropItems[0].rarity} ${dropItems[0].name.split(' ')[1]} can be seen and you found ${coins} coins.`;
        addDroppedLoot({
            id: Math.random().toString(36).substring(7),
            enemyName: inEncounter.name,
            lat: inEncounter.lat,
            lng: inEncounter.lng,
            items: dropItems,
            coins: coins,
            timestamp: Date.now()
        });
    } else {
        logStr += ` You found ${coins} coins.`;
        useGameStore.setState(s => ({ stats: { ...s.stats, gold: s.stats.gold + coins } }));
    }

    addNarratorLog(logStr);
    
    removeEnemy(inEncounter.id);
    setTimeout(() => {
        setEncounter(null);
    }, 1000);
  };

  const handlePlayerDeath = () => {
    addNarratorLog(`Alas, ${playerProfile?.name} has fallen...`);
    
    // Loss logic
    useGameStore.setState(s => {
       const newGold = Math.floor(s.stats.gold / 2);
       const newInv = s.inventory.filter(i => Math.random() > 0.1); 
       return { 
           stats: { ...s.stats, gold: newGold, hp: s.stats.maxHp },
           inventory: newInv
       };
    });
    
    setEncounter(null);
  };

  const handleFlee = () => {
    addNarratorLog(`You fled from ${inEncounter.name}!`);
    setTimeout(() => {
      setEncounter(null);
    }, 1000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 pixel-font">
      <div className={`w-full max-w-2xl border-4 ${rarityColors[inEncounter.rarity]} bg-stone-900 rounded-lg p-6 flex flex-col text-stone-200`}>
        
        <h2 className={`text-3xl font-bold text-center mb-6 ${rarityColors[inEncounter.rarity].replace('border-', '')}`}>
          {inEncounter.rarity === 'legendary' || inEncounter.rarity === 'epic' ? '🗡️ BOSS ENCOUNTER 🗡️' : 'Battle!'}
        </h2>

        <div className="flex justify-between items-center mb-8 px-4">
          {/* Player Side */}
          <div className="flex flex-col items-center">
            <span className={`text-4xl mb-2 transition-transform duration-200 ${playerAnim}`}>🧑‍🦯</span>
            <span className="font-bold">Player Lv {stats.level}</span>
            <div className="w-32 h-4 bg-red-900 mt-2 border border-stone-600">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${(stats.hp / totalStats.maxHp) * 100}%` }} />
            </div>
            <span className="text-xs mt-1">{stats.hp}/{totalStats.maxHp} HP</span>
          </div>

          <div className="text-2xl animate-pulse text-red-500">VS</div>

          {/* Enemy Side */}
          <div className="flex flex-col items-center">
            <span className={`text-4xl mb-2 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] transition-transform duration-200 ${enemyAnim}`}>
              {inEncounter.type === 'dragon' ? '🐉' : 
               inEncounter.type === 'skeleton' ? '💀' : 
               inEncounter.type === 'goblin' ? '👺' : '🦠'}
            </span>
            <span className={`font-bold ${rarityColors[inEncounter.rarity].replace('border-', '')}`}>
              {inEncounter.name} Lv {inEncounter.level}
            </span>
            <div className="w-32 h-4 bg-red-900 mt-2 border border-stone-600">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${(enemyHp / (inEncounter.level * 20)) * 100}%` }} />
            </div>
            <span className="text-xs mt-1">{enemyHp}/{inEncounter.level * 20} HP</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={handleAttack}
            disabled={enemyHp <= 0 || stats.hp <= 0}
            className="flex-1 bg-red-900 hover:bg-red-700 text-white font-bold py-4 rounded border-2 border-red-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Sword /> ATTACK
          </button>
          <button 
            onClick={handleFlee}
            disabled={enemyHp <= 0 || stats.hp <= 0}
            className="flex-1 bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 rounded border-2 border-stone-500 transition-colors disabled:opacity-50"
          >
            FLEE
          </button>
        </div>
      </div>
    </div>
  );
};
