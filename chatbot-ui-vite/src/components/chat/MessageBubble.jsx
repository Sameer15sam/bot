import { useEffect } from "react";

/**
 * 🔊 Global audio player (shared across all messages)
 * Ensures only ONE audio plays at a time
 */
let currentAudio = null;

export default function MessageBubble({ message }) {
  const playAudio = () => {
    if (!message.audio || !message.mime) return;

    // ⛔ Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // ▶️ Play new audio
    currentAudio = new Audio(
      `data:${message.mime};base64,${message.audio}`
    );
    currentAudio.play();
  };

  // 🔁 Auto-play only once for voice input replies
  useEffect(() => {
    if (message.autoPlay) {
      playAudio();
    }
  }, []);

  return (
    <div className={`bubble ${message.sender}`}>
      <div className="bubble-content">
        <span>{message.text}</span>

        {message.sender === "bot" && message.audio && (
          <button className="audio-btn" onClick={playAudio}>
            🔊
          </button>
        )}
      </div>
    </div>
  );
}
