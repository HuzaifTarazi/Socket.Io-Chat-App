import { useEffect, useRef } from "react";
import "./MessageList.css";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageList({ messages, currentUsername, typingUsers }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const typingText =
    typingUsers.length === 0
      ? ""
      : typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.slice(0, -1).join(", ")} and ${typingUsers.at(-1)} are typing...`;

  return (
    <>
      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">👋</span>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="message system">
                  <div className="message-bubble">{msg.text}</div>
                </div>
              );
            }

            const isOwn = msg.username === currentUsername;

            return (
              <div key={msg.id} className={`message ${isOwn ? "own" : "other"}`}>
                {!isOwn && (
                  <div className="message-meta">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <div className="message-bubble">
                  {isOwn && (
                    <div className="message-meta">
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="typing-indicator">{typingText}</div>
    </>
  );
}
