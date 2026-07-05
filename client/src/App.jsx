import { useState, useEffect, useCallback } from "react";
import { socket } from "./socket";
import LoginScreen from "./components/LoginScreen";
import ChatRoom from "./components/ChatRoom";

export default function App() {
  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!username) return;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleUserJoined = ({ username: joinedUser }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-join-${Date.now()}`,
          type: "system",
          text: `${joinedUser} joined the chat`,
        },
      ]);
    };

    const handleUserLeft = ({ username: leftUser }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-leave-${Date.now()}`,
          type: "system",
          text: `${leftUser} left the chat`,
        },
      ]);
      setTypingUsers((prev) => prev.filter((u) => u !== leftUser));
    };

    const handleUserCount = (count) => {
      setUserCount(count);
    };

    const handleUserTyping = ({ username: typingUser, isTyping }) => {
      if (typingUser === username) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(typingUser) ? prev : [...prev, typingUser];
        }
        return prev.filter((u) => u !== typingUser);
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("user_count", handleUserCount);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("user_count", handleUserCount);
      socket.off("user_typing", handleUserTyping);
    };
  }, [username]);

  const handleJoin = useCallback((name, callback) => {
    setIsConnecting(true);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", name, (response) => {
      setIsConnecting(false);
      if (response.success) {
        setUsername(response.username);
        setMessages([
          {
            id: `system-welcome-${Date.now()}`,
            type: "system",
            text: `Welcome to the chat, ${response.username}!`,
          },
        ]);
      }
      callback(response);
    });
  }, []);

  const handleSend = useCallback((text) => {
    socket.emit("send_message", text);
  }, []);

  const handleTyping = useCallback((isTyping) => {
    socket.emit("typing", isTyping);
  }, []);

  if (!username) {
    return <LoginScreen onJoin={handleJoin} isConnecting={isConnecting} />;
  }

  return (
    <ChatRoom
      username={username}
      messages={messages}
      userCount={userCount}
      typingUsers={typingUsers}
      onSend={handleSend}
      onTyping={handleTyping}
    />
  );
}
