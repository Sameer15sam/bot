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
      <input
        placeholder="Send a message…"
        value={text}
        disabled={isLoading}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />

      <button onClick={send} disabled={isLoading}>
        Send
      </button>

      <button onClick={recording ? stopMic : start} disabled={isLoading}>
        {recording ? "Stop" : "Mic"}
      </button>
    </div>
  );
}
