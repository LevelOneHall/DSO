import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const EnvironmentEffects = () => {
  const { timeOfDay, weather } = useGameStore();

  // Calculate light based on time of day (0-24)
  const hour = timeOfDay.getHours() + timeOfDay.getMinutes() / 60;
  
  let lightColor = 'rgba(255, 255, 255, 1)'; // Day
  if (hour < 5 || hour > 20) {
    lightColor = 'rgba(20, 20, 50, 0.85)'; // Night
  } else if (hour >= 5 && hour < 7) {
    lightColor = 'rgba(255, 150, 100, 0.4)'; // Dawn
  } else if (hour >= 18 && hour <= 20) {
    lightColor = 'rgba(255, 100, 50, 0.5)'; // Dusk
  }

  // Adding gradient for torch-light effect in the center (where player is)
  const overlayStyle = {
    background: hour < 6 || hour > 19 
      ? `radial-gradient(circle at 50% 50%, transparent 5%, ${lightColor} 40%)`
      : lightColor,
    mixBlendMode: 'multiply' as any
  };

  return (
    <>
      <div className="time-overlay" style={overlayStyle} />
      {weather === 'rain' && (
        <div className="weather-overlay bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/41/Rain_drops_on_glass.png')] opacity-30 mix-blend-screen animate-pulse" style={{ backgroundSize: '200px' }} />
      )}
    </>
  );
};
