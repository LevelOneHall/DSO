import React, { useEffect, useState } from 'react';
import { MapEngine } from './components/MapEngine';
import { GameEngine } from './components/GameEngine';
import { EnvironmentEffects } from './components/EnvironmentEffects';
import { InventoryUI } from './components/InventoryUI';
import { EncounterUI } from './components/EncounterUI';
import { MainUIInfo } from './components/MainUIInfo';
import { ShopUI } from './components/ShopUI';
import { CharacterCreation } from './components/CharacterCreation';
import { NarratorBox } from './components/NarratorBox';
import { LootPanel } from './components/LootPanel';
import { useMultiplayer } from './hooks/useMultiplayer';
import { useGameStore } from './store/gameStore';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const playerProfile = useGameStore(s => s.playerProfile);
  
  useMultiplayer();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!playerProfile) {
    return (
      <div className="w-full h-screen bg-black overflow-hidden relative font-mono select-none flex items-center justify-center">
        {/* Render some subtle background or just keep it black */}
        <CharacterCreation />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-mono select-none">
      <GameEngine />
      
      {/* Map layer */}
      <MapEngine />
      
      {/* Weather and time lighting */}
      <EnvironmentEffects />

      {/* Main HUD overlay */}
      <MainUIInfo />

      {/* Interstitial UI Windows */}
      <InventoryUI />
      <EncounterUI />
      <ShopUI />
      
      <NarratorBox />
      <LootPanel />
    </div>
  );
}
