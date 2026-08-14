const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const SERVERURL = process.env.SERVER_URL;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (process.env.CLIENT_ORIGIN) {
    return process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()).includes(origin);
  }
  return /^http:\/\/localhost:\d+$/.test(origin);
}

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
  res.json({ status: "ok" });
});

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

server.listen(8080, () => {
  console.log(`Chat server running on ${SERVERURL}`);
});
