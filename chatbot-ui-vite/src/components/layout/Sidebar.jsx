import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";

export default function Sidebar() {
  const {
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    newChat,
  } = useContext(ChatContext);

  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");

  const startEdit = (chat) => {
    setEditingId(chat.id);
    setTempTitle(chat.title);
  };

  const saveEdit = (chatId) => {
    if (!tempTitle.trim()) return;

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, title: tempTitle } : c
      )
    );
    setEditingId(null);
  };

  return (
    <div className="sidebar">
      <button className="new-chat-btn" onClick={newChat}>
        + New Chat
      </button>

      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`chat-item ${
            chat.id === activeChatId ? "active" : ""
          }`}
          onClick={() => setActiveChatId(chat.id)}
        >
          {editingId === chat.id ? (
            <input
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={() => saveEdit(chat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(chat.id);
                if (e.key === "Escape") setEditingId(null);
              }}
            />
          ) : (
            <span onDoubleClick={() => startEdit(chat)}>
              {chat.title}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
