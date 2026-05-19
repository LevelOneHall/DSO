import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateNamedEnemy } from '../lib/narratorUtils';

const PREFIXES = ['bloody', 'cursed', 'ancient', 'toxic', 'savage', 'brutal', 'vile', 'enchanted', 'ruthless', 'wise'];

// Spawns enemies around the player
export const GameEngine = () => {
  const { playerLocation, setTimeOfDay, spawnEnemy, enemies, weather, setWeather, spawnMerchant, merchants } = useGameStore();

  useEffect(() => {
    if (!playerLocation || merchants.length > 0) return;

    // Spawn 2 merchants nearby
    for (let i = 0; i < 2; i++) {
        spawnMerchant({
            id: `merchant-${i}`,
            name: i === 0 ? 'Wandering Trader' : 'Weaponsmith',
            lat: playerLocation.lat + (Math.random() - 0.5) * 0.003,
            lng: playerLocation.lng + (Math.random() - 0.5) * 0.003,
            inventory: [
                { item: { id: `m${i}-1`, name: 'Iron Sword', type: 'weapon', rarity: 'uncommon', stats: { attack: 5 }, icon: 'Sword' }, price: 20 },
                { item: { id: `m${i}-2`, name: 'Leather Armor', type: 'armor', rarity: 'uncommon', stats: { defense: 3 }, icon: 'Shield' }, price: 25 },
                { item: { id: `m${i}-3`, name: 'Remedy Potion', type: 'remedy', rarity: 'common', stats: { health: 10 }, icon: 'FlaskConical' }, price: 10 },
            ]
        });
    }
  }, [playerLocation, merchants.length, spawnMerchant]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      // Fast forward time for demo purposes (1 real second = 1 game minute)
      setTimeOfDay(new Date(Date.now())); 
      
      // Randomly change weather
      if (Math.random() < 0.05) {
        setWeather(Math.random() < 0.5 ? 'rain' : 'clear');
      }
    }, 60000); // Actually let's use real time update per minute

    return () => clearInterval(timeInterval);
  }, [setTimeOfDay, setWeather]);

  useEffect(() => {
    if (!playerLocation) return;

    const spawnInterval = setInterval(() => {
      if (enemies.length > 10) return; // Cap enemies

      const rand = Math.random();
      let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common';
      if (rand > 0.95) rarity = 'legendary';
      else if (rand > 0.85) rarity = 'epic';
      else if (rand > 0.7) rarity = 'rare';
      else if (rand > 0.4) rarity = 'uncommon';

      const typeRaw = Math.random();
      const type = typeRaw < 0.3 ? 'slime' : typeRaw < 0.6 ? 'goblin' : typeRaw < 0.9 ? 'skeleton' : 'dragon';

      let name = type;
      let isNamed = false;
      let isDescribed = false;
      
      let actualRarity = rarity;

      if (rarity === 'legendary' || rarity === 'rare') {
        const generated = generateNamedEnemy();
        name = generated.name;
        actualRarity = generated.rarity;
        isNamed = true;
      } else if (rarity === 'epic' || rarity === 'uncommon') {
        name = `${PREFIXES[Math.floor(Math.random() * PREFIXES.length)]} ${type}`;
        isDescribed = true;
      }

      // Spawn within ~200 meters of player
      const latOffset = (Math.random() - 0.5) * 0.004;
      const lngOffset = (Math.random() - 0.5) * 0.004;

      spawnEnemy({
        id: Math.random().toString(36).substring(7),
        name: name,
        isNamed,
        isDescribed,
        lat: playerLocation.lat + latOffset,
        lng: playerLocation.lng + lngOffset,
        level: Math.floor(Math.random() * 5) + 1,
        rarity: actualRarity,
        type,
        spawnTime: Date.now()
      });
    }, 5000); // 5 sec spawn for demo

    return () => clearInterval(spawnInterval);
  }, [playerLocation, enemies.length, spawnEnemy]);

  return null;
};
