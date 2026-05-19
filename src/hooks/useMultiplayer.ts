import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

export const useMultiplayer = () => {
  const socketRef = useRef<Socket | null>(null);
  const { playerProfile, playerLocation, setRemotePlayers, updateRemotePlayer, removeRemotePlayer, addNarratorLog } = useGameStore();

  const lastSeenMap = useRef<{ [id: string]: number }>({});

  useEffect(() => {
    if (!playerProfile || !playerLocation) return;

    if (!socketRef.current) {
      socketRef.current = io('/', { transports: ['websocket', 'polling'] });
      
      socketRef.current.on('connect', () => {
        socketRef.current?.emit('join', {
          name: playerProfile.name,
          gender: playerProfile.gender,
          lat: playerLocation.lat,
          lng: playerLocation.lng
        });
      });

      socketRef.current.on('all_players', (players: any[]) => {
        setRemotePlayers(players.filter(p => p.id !== socketRef.current?.id));
      });

      socketRef.current.on('player_joined', (player: any) => {
        updateRemotePlayer(player);
      });

      socketRef.current.on('player_moved', (data: any) => {
        updateRemotePlayer(data);
      });

      socketRef.current.on('player_left', (id: string) => {
        removeRemotePlayer(id);
      });
    }

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        // We only want to disconnect when the component completely unmounts,
        // Since React 18 strict mode double-invokes effects, we might need to handle this carefully
        // or just let the socket reconnect. We'll let it reconnect.
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [playerProfile]); // Connect once player is created

  // Move emitter
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && playerLocation) {
      socketRef.current.emit('move', { lat: playerLocation.lat, lng: playerLocation.lng });
    }
  }, [playerLocation]);

  // Handle narrator log for near players
  const remotePlayers = useGameStore(s => s.remotePlayers);
  useEffect(() => {
    if (!playerLocation) return;
    
    remotePlayers.forEach(p => {
      // Calculate distance roughly (euclidean on lat/lng isn't perfect but fine for short distances)
      const dist = Math.sqrt(Math.pow(p.lat - playerLocation.lat, 2) + Math.pow(p.lng - playerLocation.lng, 2));
      // ~200 meters is roughly 0.002 in coordinates
      if (dist < 0.002) {
        const lastSeen = lastSeenMap.current[p.id] || 0;
        const now = Date.now();
        // 10 minutes cooldown = 600,000 ms
        if (now - lastSeen > 600000) {
          addNarratorLog(`${p.name} draws near.`);
          lastSeenMap.current[p.id] = now;
        }
      }
    });

  }, [remotePlayers, playerLocation, addNarratorLog]);

  return null;
};
