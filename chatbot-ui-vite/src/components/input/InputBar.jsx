import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { sendText, sendAudio } from "../../api/api";
import useRecorder from "../../hooks/useRecorder";

export default function InputBar() {
  const [text, setText] = useState("");
  const {
    chats,
    setChats,
    activeChatId,
    language,
    isLoading,
    setIsLoading,
    newChat,
  } = useContext(ChatContext);

  const { start, stop, recording } = useRecorder();

  const activeChat = chats.find((c) => c.id === activeChatId);

  // ❌ NO CHAT → NO SEND
  const guardNoChat = () => {
    if (!activeChat) {
      alert("Click 'New Chat' first");
      return true;
    }
    return false;
  };

  // 📝 TEXT SEND
  const send = async () => {
    if (!text.trim() || isLoading) return;
    if (guardNoChat()) return;

    const updatedMessages = [
      ...activeChat.messages,
      { sender: "user", text },
    ];

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: updatedMessages } : c
      )
    );

    setText("");
    setIsLoading(true);

    try {
      const res = await sendText(text, language, activeChatId);

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
              ...c,
              messages: [
                ...updatedMessages,
                {
                  sender: "bot",
                  text: res.data.response_text,
                  audio: res.data.audio_response,
                  mime: res.data.audio_mime,
                },
              ],
            }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🎤 MIC SEND
  const stopMic = async () => {
    if (guardNoChat()) return;

    const blob = await stop();
    setIsLoading(true);

    try {
      const res = await sendAudio(blob, language, activeChatId);

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
              ...c,
              messages: [
                ...c.messages,
                { sender: "user", text: "Voice input" },
                {
                  sender: "bot",
                  text: res.data.response_text,
                  audio: res.data.audio_response,
                  mime: res.data.audio_mime,
                  autoPlay: true,
                },
              ],
            }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="input-bar">
      <button
        className="new-chat-icon-btn"
        onClick={newChat}
        title="New chat"
      >
        <svg width="" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <input
        placeholder="Ask anything"
        value={text}
        disabled={isLoading}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />

      <button
        className="mic-btn"
        onClick={recording ? stopMic : start}
        disabled={isLoading}
        title={recording ? "Stop recording" : "Voice input"}
      >
        {recording ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"></rect>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        )}
      </button>

      <button
        className="send-btn"
        onClick={send}
        disabled={isLoading || !text.trim()}
        title="Send message"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}
