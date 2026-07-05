import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./ChatRoom.css";

export default function ChatRoom({
  username,
  messages,
  userCount,
  typingUsers,
  onSend,
  onTyping,
}) {
  return (
    <div className="chat-room">
      <header className="chat-header">
        <div className="chat-header-info">
          <h2>Live Chat</h2>
          <p>Signed in as {username}</p>
        </div>
        <div className="online-badge">
          <span className="online-dot" />
          {userCount} online
        </div>
      </header>

      <div className="chat-body">
        <MessageList
          messages={messages}
          currentUsername={username}
          typingUsers={typingUsers}
        />
        <MessageInput onSend={onSend} onTyping={onTyping} />
      </div>
    </div>
  );
}
