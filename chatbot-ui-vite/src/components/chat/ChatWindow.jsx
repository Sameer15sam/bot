import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const { chats, activeChatId, isLoading } = useContext(ChatContext);
  const chat = chats.find((c) => c.id === activeChatId);

  if (!chat) {
    return <div className="empty">Start typing…</div>;
  }

  return (
    <div className="chat-window">
      {chat.messages.map((m, i) => (
        <MessageBubble key={i} message={m} />
      ))}

      {isLoading && (
        <div className="bubble bot processing">
          Answer is processing…
        </div>
      )}
    </div>
  );
}
