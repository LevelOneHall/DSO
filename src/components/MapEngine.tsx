import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGameStore } from '../store/gameStore';
import { Ghost, Skull, ShieldEllipsis, User, Store } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

// Custom icon creator utilizing lucide icons
const createCustomIcon = (iconElement: React.ReactElement, color: string, isRare: boolean, timeOfDay: Date) => {
  const hour = timeOfDay.getHours() + timeOfDay.getMinutes() / 60;
  let shadowStyle = {};
  if (hour >= 6 && hour <= 18) {
    const angle = ((hour - 6) / 12) * Math.PI;
    const shadowX = Math.cos(angle) * -15; // Sun moves, shadow opposes
    const shadowY = Math.abs(Math.sin(angle)) * 5;
    shadowStyle = { filter: `drop-shadow(${shadowX}px ${shadowY}px 2px rgba(0,0,0,0.4))` };
  } else {
    // Torch shadow at night (flickering soft shadow)
    shadowStyle = { filter: `drop-shadow(0px 5px 5px rgba(0,0,0,0.8))` };
  }

  const html = renderToString(
    <div className={`flex flex-col items-center justify-center`} style={shadowStyle}>
      {isRare && <span className="text-[10px] font-bold text-orange-400 -mt-4 absolute whitespace-nowrap bg-black/50 px-1 rounded">Named Beast</span>}
      <div className={`p-1 bg-gray-900 rounded-full border-2 ${color} ${isRare ? 'animate-pulse' : ''}`}>
        {iconElement}
      </div>
    </div>
  );
  
  return new L.DivIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const PlayerMapController = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);

  useEffect(() => {
    const handleActionEnd = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        map.panTo([lat, lng], { animate: true, duration: 1 });
      }, 1500); // return to player after short pause
    };

    map.on('dragend', handleActionEnd);
    map.on('zoomend', handleActionEnd);

    return () => {
      map.off('dragend', handleActionEnd);
      map.off('zoomend', handleActionEnd);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lat, lng, map]);

  return null;
};

export const MapEngine = () => {
  const { playerLocation, setPlayerLocation, enemies, showInventory, inEncounter, setEncounter, merchants, setShop, inShop, timeOfDay, droppedLoot, remotePlayers } = useGameStore();

  useEffect(() => {
    // Simulate getting geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPlayerLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location", error);
          // Fallback location
          setPlayerLocation(40.7128, -74.0060);
        }
      );
    } else {
      setPlayerLocation(40.7128, -74.0060);
    }
  }, [setPlayerLocation]);

  if (!playerLocation) {
    return <div className="flex items-center justify-center w-full h-full bg-black text-white pixel-font">Loading World...</div>;
  }

  return (
    <div className={`relative w-full h-full transition-all duration-300 ${showInventory || inEncounter || inShop ? 'blur-sm scale-110' : ''}`}>
      <MapContainer 
        center={[playerLocation.lat, playerLocation.lng]} 
        zoom={16} 
        minZoom={15}
        maxZoom={18}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#000' }}
        maxBounds={[
            [playerLocation.lat - 0.01, playerLocation.lng - 0.01],
            [playerLocation.lat + 0.01, playerLocation.lng + 0.01]
        ]}
        maxBoundsViscosity={1.0}
      >
        <PlayerMapController lat={playerLocation.lat} lng={playerLocation.lng} />
        
        {/* Dark map style using CartoDB Dark Matter or similar, configured via CSS filters */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="map-tiles-pixelated"
        />

        {/* Player Marker */}
        <Marker 
          position={[playerLocation.lat, playerLocation.lng]}
          icon={createCustomIcon(<User size={20} color="#fff" />, "border-blue-500", false, timeOfDay)}
        />

        {/* Vision range */}
        <Circle 
            center={[playerLocation.lat, playerLocation.lng]}
            radius={150}
            pathOptions={{ color: 'transparent', fillColor: '#fff', fillOpacity: 0.1 }}
        />

        {/* Merchants */}
        {merchants.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            eventHandlers={{ click: () => setShop(m) }}
            icon={createCustomIcon(<Store size={20} color="#eab308" />, "border-yellow-500", false, timeOfDay)}
          />
        ))}

        {/* Enemies */}
        {enemies.map((enemy) => (
          <Marker
            key={enemy.id}
            position={[enemy.lat, enemy.lng]}
            eventHandlers={{
                click: () => {
                    setEncounter(enemy);
                }
            }}
            icon={createCustomIcon(
                enemy.type === 'goblin' ? <Ghost size={20} color="#22c55e" /> : 
                enemy.type === 'skeleton' ? <Skull size={20} color="#d1d5db" /> :
                <ShieldEllipsis size={20} color="#ef4444" />,
                enemy.rarity === 'legendary' ? "border-orange-500" :
                enemy.rarity === 'epic' ? "border-purple-500" :
                enemy.rarity === 'rare' ? "border-blue-500" : "border-gray-500",
                enemy.rarity === 'legendary' || enemy.rarity === 'epic',
                timeOfDay
            )}
          />
        ))}
        {/* Dropped Loot / Dead Enemies */}
        {droppedLoot.map((loot) => (
          <Marker
            key={loot.id}
            position={[loot.lat, loot.lng]}
            eventHandlers={{
                click: () => useGameStore.setState({ viewingLootId: loot.id })
            }}
            icon={createCustomIcon(<Skull size={20} color="#6b7280" />, "border-stone-500", false, timeOfDay)}
          />
        ))}

        {/* Remote Players */}
        {remotePlayers.map((rp) => (
          <Marker
            key={rp.id}
            position={[rp.lat, rp.lng]}
            icon={createCustomIcon(<User size={20} color={rp.gender === 'Female' ? "#f472b6" : "#60a5fa"} />, "border-green-500", false, timeOfDay)}
          />
        ))}
      </MapContainer>
    </div>
  );
};
