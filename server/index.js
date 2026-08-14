require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

function getPort() {
  return Number(process.env.PORT) || 3001;
}

function getConfiguredOrigins() {
  const rawOrigins = [
    process.env.CLIENT_ORIGIN,
    process.env.CLIENT,
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
  ];

  return rawOrigins
    .flatMap((entry) => String(entry || "").split(","))
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const configuredOrigins = getConfiguredOrigins();
  if (configuredOrigins.includes(origin)) return true;

  return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
}

const PORT = getPort();
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

const clientDistPath = path.resolve(__dirname, "../client/dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const users = new Map();

io.on("connection", (socket) => {
  socket.on("join", (username, callback) => {
    const trimmed = username?.trim();

    if (!trimmed) {
      callback?.({ success: false, error: "Username is required." });
      return;
    }

    if (trimmed.length > 20) {
      callback?.({ success: false, error: "Username must be 20 characters or less." });
      return;
    }

    const isTaken = [...users.values()].some(
      (name) => name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isTaken) {
      callback?.({ success: false, error: "Username is already taken." });
      return;
    }

    users.set(socket.id, trimmed);
    socket.data.username = trimmed;

    callback?.({ success: true, username: trimmed });

    socket.broadcast.emit("user_joined", {
      username: trimmed,
      timestamp: Date.now(),
    });

    io.emit("user_count", users.size);
  });

  socket.on("send_message", (text) => {
    const username = socket.data.username;
    const trimmed = text?.trim();

    if (!username || !trimmed) return;

    const message = {
      id: `${socket.id}-${Date.now()}`,
      username,
      text: trimmed,
      timestamp: Date.now(),
    };

    io.emit("receive_message", message);
  });

  socket.on("typing", (isTyping) => {
    const username = socket.data.username;
    if (!username) return;

    socket.broadcast.emit("user_typing", { username, isTyping: Boolean(isTyping) });
  });

  socket.on("disconnect", () => {
    const username = users.get(socket.id);

    if (username) {
      users.delete(socket.id);
      socket.broadcast.emit("user_left", {
        username,
        timestamp: Date.now(),
      });
      io.emit("user_count", users.size);
    }
  });
});

if (require.main === module) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Chat server running on ${SERVER_URL}`);
  });
}

module.exports = { getPort, isAllowedOrigin, app, server, io };
