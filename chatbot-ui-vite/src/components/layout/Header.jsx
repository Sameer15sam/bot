import logo from "../../assets/logo.jpeg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import LanguageSelector from "../input/LanguageSelector";

export default function Header() {
  const { chats, activeChatId } = useContext(ChatContext);

  const copyChat = async () => {
    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat || chat.messages.length === 0) {
      alert("Nothing to copy");
      return;
    }

    const text = chat.messages
      .map((m) => `${m.sender === "user" ? "You" : "AI"}: ${m.text}`)
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    alert("Chat copied");
  };

  return (
    <div className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" />
        <span>EtherX BOT</span>
      </div>

      <div className="header-right">
        <LanguageSelector />
        <button className="copy-btn" onClick={copyChat}>
          Copy
        </button>
      </div>
    </div>
  );
}
