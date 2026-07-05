# Real-Time Chat Application

A full-stack real-time chat app built with **React.js**, **Express.js**, and **Socket.IO**. Users join with a username, send and receive messages instantly, and see who is online.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)

## Features

- Join chat with a unique username
- Real-time messaging across all connected clients
- Online user count
- Typing indicators
- Join/leave system notifications
- Responsive, modern dark-themed UI

## Project Structure

```
socket-io-chat/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── App.jsx         # Main app logic
│   │   ├── socket.js       # Socket.IO client
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express + Socket.IO backend
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root scripts
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/socket-io-chat.git
cd socket-io-chat
```

### 2. Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

Or install each part separately:

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment (optional)

Copy the example env file for the client:

```bash
cp client/.env.example client/.env
```

The default server URL is `http://localhost:3001`. Change `VITE_SERVER_URL` in `client/.env` if your server runs elsewhere.

### 4. Run the application

**Option A — Run both server and client together (recommended):**

```bash
npm run dev
```

**Option B — Run in separate terminals:**

Terminal 1 (server):

```bash
npm run server
```

Terminal 2 (client):

```bash
npm run client
```

### 5. Open the app

Visit [http://localhost:5173](http://localhost:5173) in your browser.

Open multiple tabs or windows with different usernames to test real-time messaging.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server and client concurrently |
| `npm run server` | Start Express + Socket.IO server on port 3001 |
| `npm run client` | Start React dev server on port 5173 |
| `npm run build` | Build the React app for production |
| `npm run install:all` | Install dependencies in server and client |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join chat with username |
| `send_message` | Client → Server | Send a chat message |
| `typing` | Client → Server | Broadcast typing status |
| `receive_message` | Server → Client | New message broadcast |
| `user_joined` | Server → Client | User joined notification |
| `user_left` | Server → Client | User left notification |
| `user_count` | Server → Client | Updated online count |
| `user_typing` | Server → Client | Someone is typing |

## Production Notes

- Build the client: `npm run build` (output in `client/dist/`)
- Serve the built client from Express or a static host
- Set `CLIENT_ORIGIN` on the server to your frontend URL for CORS
- Set `PORT` on the server if not using 3001

## License

MIT
