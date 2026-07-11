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

    const finish = (response) => {
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
    };

    const attemptJoin = () => {
      socket.emit("join", name, (response) => {
        if (!response) {
          finish({ success: false, error: "No response from server. Is it running?" });
          return;
        }
        finish(response);
      });
    };

    const timeout = setTimeout(() => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      finish({ success: false, error: "Connection timed out. Make sure the server is running on port 3001." });
    }, 10000);

    const onConnect = () => {
      clearTimeout(timeout);
      socket.off("connect_error", onConnectError);
      attemptJoin();
    };

    const onConnectError = () => {
      clearTimeout(timeout);
      socket.off("connect", onConnect);
      finish({ success: false, error: "Could not connect to server. Make sure it is running on port 3001." });
    };

    if (socket.connected) {
      clearTimeout(timeout);
      attemptJoin();
    } else {
      socket.once("connect", onConnect);
      socket.once("connect_error", onConnectError);
      socket.connect();
    }
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
