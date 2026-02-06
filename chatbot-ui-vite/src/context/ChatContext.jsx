import { createContext, useState } from "react";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

 const newChat = () => {
  const chat = {
    id: Date.now().toString(),
    title: "New chat",
    messages: [],
  };
  setChats((prev) => [chat, ...prev]);
  setActiveChatId(chat.id);
};

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        activeChatId,
        setActiveChatId,
        newChat,
        language,
        setLanguage,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
