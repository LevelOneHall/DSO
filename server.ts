import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  // Players store
  const players = new Map();

  io.on("connection", (socket) => {
    console.log("Player connected: " + socket.id);

    socket.on("join", (data) => {
      players.set(socket.id, {
        id: socket.id,
        name: data.name,
        gender: data.gender,
        lat: data.lat,
        lng: data.lng,
      });
      // Send the current players to the new player
      socket.emit("all_players", Array.from(players.values()));
      // Tell everyone else about the new player
      socket.broadcast.emit("player_joined", players.get(socket.id));
    });

    socket.on("move", (data) => {
      const player = players.get(socket.id);
      if (player) {
        player.lat = data.lat;
        player.lng = data.lng;
        // Broadcast movement to all other players
        socket.broadcast.emit("player_moved", { id: socket.id, lat: data.lat, lng: data.lng });
      }
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected: " + socket.id);
      players.delete(socket.id);
      socket.broadcast.emit("player_left", socket.id);
    });
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
