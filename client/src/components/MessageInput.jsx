import { useState, useRef, useCallback } from "react";
import "./MessageInput.css";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const typingTimeout = useRef(null);

  const handleTyping = useCallback(() => {
    onTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1500);
  }, [onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText("");
    onTyping(false);
    clearTimeout(typingTimeout.current);
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        maxLength={500}
      />
      <button type="submit" disabled={!text.trim()} aria-label="Send message">
        ➤
      </button>
    </form>
  );
}
