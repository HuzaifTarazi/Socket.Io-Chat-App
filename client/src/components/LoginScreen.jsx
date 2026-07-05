import { useState } from "react";
import "./LoginScreen.css";

export default function LoginScreen({ onJoin, isConnecting }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }

    onJoin(trimmed, (response) => {
      if (!response.success) {
        setError(response.error || "Failed to join chat.");
      }
    });
  };

  return (
    <div className="login-screen">
      <div className="login-header">
        <div className="login-icon">💬</div>
        <h1>Welcome to Chat</h1>
        <p>Enter a username to join the conversation</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="e.g. Alex"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          autoFocus
          disabled={isConnecting}
        />

        {error && <div className="login-error">{error}</div>}

        <button type="submit" disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Join Chat"}
        </button>
      </form>
    </div>
  );
}
