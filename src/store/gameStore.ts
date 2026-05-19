import { create } from 'zustand';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'potion' | 'remedy';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
  };
  icon: string;
}

export interface Enemy {
  id: string;
  name: string;
  isNamed: boolean;
  isDescribed: boolean;
  lat: number;
  lng: number;
  level: number;
  rarity: ItemRarity;
  type: 'slime' | 'goblin' | 'dragon' | 'skeleton';
  spawnTime: number;
}

export interface Merchant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  inventory: { item: Item; price: number }[];
}

export interface CharacterStats {
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  expToNext: number;
  gold: number;
}

export interface PlayerProfile {
  name: string;
  gender: 'Male' | 'Female';
}

export interface RemotePlayer {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  lat: number;
  lng: number;
  lastSeenTime?: number;
}

export interface DroppedLoot {
  id: string;
  enemyName: string;
  lat: number;
  lng: number;
  items: Item[];
  coins: number;
  timestamp: number;
}

interface GameState {
  playerProfile: PlayerProfile | null;
  setPlayerProfile: (profile: PlayerProfile) => void;

  remotePlayers: RemotePlayer[];
  setRemotePlayers: (players: RemotePlayer[]) => void;
  updateRemotePlayer: (player: RemotePlayer) => void;
  removeRemotePlayer: (id: string) => void;

  narratorLogs: string[];
  addNarratorLog: (log: string) => void;

  droppedLoot: DroppedLoot[];
  addDroppedLoot: (loot: DroppedLoot) => void;
  removeDroppedLoot: (id: string) => void;
  updateDroppedLoot: (id: string, newItems: Item[], newCoins: number) => void;
  
  viewingLootId: string | null;
  setViewLoot: (id: string | null) => void;

  playerLocation: { lat: number; lng: number } | null;
  setPlayerLocation: (lat: number, lng: number) => void;
  
  inventory: Item[];
  equipped: {
    weapon: Item | null;
    armor: Item | null;
  };
  addToInventory: (item: Item) => void;
  removeFromInventory: (id: string) => void;
  equipItem: (item: Item) => void;
  unequipItem: (slot: 'weapon' | 'armor') => void;

  enemies: Enemy[];
  spawnEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;

  merchants: Merchant[];
  spawnMerchant: (merchant: Merchant) => void;

  inEncounter: Enemy | null;
  setEncounter: (enemy: Enemy | null) => void;

  inShop: Merchant | null;
  setShop: (merchant: Merchant | null) => void;

  stats: CharacterStats;
  gainExp: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;

  timeOfDay: Date;
  setTimeOfDay: (date: Date) => void;

  weather: 'clear' | 'rain' | 'fog';
  setWeather: (weather: 'clear' | 'rain' | 'fog') => void;
  
  showInventory: boolean;
  setShowInventory: (show: boolean) => void;

  getTotalStats: () => { attack: number; defense: number; maxHp: number };
}

export const useGameStore = create<GameState>((set, get) => ({
  playerProfile: null,
  setPlayerProfile: (profile) => set({ playerProfile: profile }),

  remotePlayers: [],
  setRemotePlayers: (players) => set({ remotePlayers: players }),
  updateRemotePlayer: (player) => set((state) => {
    const exists = state.remotePlayers.find(p => p.id === player.id);
    if (exists) {
      return { remotePlayers: state.remotePlayers.map(p => p.id === player.id ? { ...p, ...player } : p) };
    }
    return { remotePlayers: [...state.remotePlayers, player] };
  }),
  removeRemotePlayer: (id) => set((state) => ({ remotePlayers: state.remotePlayers.filter(p => p.id !== id) })),

  narratorLogs: [],
  addNarratorLog: (log) => set((state) => ({ narratorLogs: [...state.narratorLogs, log] })),

  droppedLoot: [],
  addDroppedLoot: (loot) => set((state) => ({ droppedLoot: [...state.droppedLoot, loot] })),
  removeDroppedLoot: (id) => set((state) => ({ droppedLoot: state.droppedLoot.filter(l => l.id !== id) })),
  updateDroppedLoot: (id, newItems, newCoins) => set((state) => ({
    droppedLoot: state.droppedLoot.map(l => l.id === id ? { ...l, items: newItems, coins: newCoins } : l)
  })),

  viewingLootId: null,
  setViewLoot: (id) => set({ viewingLootId: id }),

  playerLocation: null,
  setPlayerLocation: (lat, lng) => set({ playerLocation: { lat, lng } }),

  inventory: [
    { id: '1', name: 'Wooden Sword', type: 'weapon', rarity: 'common', stats: { attack: 2 }, icon: 'Sword' },
    { id: '2', name: 'Health Potion', type: 'potion', rarity: 'common', stats: { health: 20 }, icon: 'FlaskConical' },
  ],
  equipped: { weapon: null, armor: null },
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  removeFromInventory: (id) => set((state) => ({ inventory: state.inventory.filter(i => i.id !== id) })),
  equipItem: (item) => set((state) => {
    if (item.type === 'potion' || item.type === 'remedy') {
       // use item
       if (item.stats?.health && state.stats.hp < state.stats.maxHp) {
         return {
           inventory: state.inventory.filter(i => i.id !== item.id),
           stats: { ...state.stats, hp: Math.min(state.stats.maxHp, state.stats.hp + item.stats.health) }
         };
       }
       return state;
    }
    
    if (item.type !== 'weapon' && item.type !== 'armor') return state;
    const currentlyEquipped = state.equipped[item.type];
    const newInventory = state.inventory.filter(i => i.id !== item.id);
    if (currentlyEquipped) {
      newInventory.push(currentlyEquipped);
    }
    return {
      equipped: { ...state.equipped, [item.type]: item },
      inventory: newInventory
    };
  }),
  unequipItem: (slot) => set((state) => {
    const item = state.equipped[slot];
    if (!item) return state;
    return {
      equipped: { ...state.equipped, [slot]: null },
      inventory: [...state.inventory, item]
    };
  }),

  enemies: [],
  spawnEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  removeEnemy: (id) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== id) })),

  merchants: [],
  spawnMerchant: (merchant) => set((state) => ({ merchants: [...state.merchants, merchant] })),

  inEncounter: null,
  setEncounter: (enemy) => set({ inEncounter: enemy }),

  inShop: null,
  setShop: (merchant) => set({ inShop: merchant }),

  stats: {
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    exp: 0,
    expToNext: 100,
    gold: 50
  },
  gainExp: (amount) => set((state) => {
    let newExp = state.stats.exp + amount;
    let newLevel = state.stats.level;
    let newMaxHp = state.stats.maxHp;
    let newAttack = state.stats.attack;
    let newDefense = state.stats.defense;
    let newExpToNext = state.stats.expToNext;
    
    let leveledUp = false;

    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel++;
      newMaxHp += 20;
      newAttack += 3;
      newDefense += 2;
      newExpToNext = Math.floor(newExpToNext * 1.5);
      leveledUp = true;
    }

    if (leveledUp) {
      setTimeout(() => {
        get().addNarratorLog("Certainly you have reached a new threshold! Your level has increased!");
      }, 0);
    }

    return {
      stats: {
        ...state.stats,
        level: newLevel,
        hp: newMaxHp, // heal on level up
        maxHp: newMaxHp,
        attack: newAttack,
        defense: newDefense,
        exp: newExp,
        expToNext: newExpToNext
      }
    };
  }),
  damagePlayer: (amount) => set((state) => ({ stats: { ...state.stats, hp: Math.max(0, state.stats.hp - amount) } })),
  healPlayer: (amount) => set((state) => ({ stats: { ...state.stats, hp: Math.min(state.stats.maxHp, state.stats.hp + amount) } })),

  timeOfDay: new Date(),
  setTimeOfDay: (date) => set({ timeOfDay: date }),

  weather: 'clear',
  setWeather: (weather) => set({ weather }),
  
  showInventory: false,
  setShowInventory: (show) => set({ showInventory: show }),

  getTotalStats: () => {
    const state = get();
    let totalAtk = state.stats.attack;
    let totalDef = state.stats.defense;
    let totalMaxHp = state.stats.maxHp;

    if (state.equipped.weapon?.stats?.attack) totalAtk += state.equipped.weapon.stats.attack;
    if (state.equipped.armor?.stats?.defense) totalDef += state.equipped.armor.stats.defense;
    if (state.equipped.armor?.stats?.health) totalMaxHp += state.equipped.armor.stats.health;

    return { attack: totalAtk, defense: totalDef, maxHp: totalMaxHp };
  }
}));
