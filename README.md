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

## Production readiness

The app now supports a deployment-friendly production setup:

- Express serves the built React app when `NODE_ENV=production`
- Server listens on `PORT` with a safe default fallback
- CORS allows localhost development and configured deployment origins
- Vite binds to `0.0.0.0` for container and cloud hosting compatibility

## Environment variables

Create a `.env` file in the server folder for deployment:

```bash
PORT=3001
SERVER_URL=http://localhost:3001
CLIENT_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

If you are deploying the frontend separately, set `VITE_SERVER_URL` in the client environment to the backend URL.

## Local production run

```bash
npm install
npm run build
npm start
```

The app will serve the static frontend from the generated client build and keep the Socket.IO server available on the same host.

## Deployment options

This project is ready for platforms such as:

- Render
- Railway
- Fly.io
- Ubuntu VM with Nginx
- Docker-based hosting

For a single-container deployment, build the client, start the Node server, and point the frontend origin to the deployed backend URL via `CLIENT_ORIGIN`.

