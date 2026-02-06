import { createContext, useState, useEffect } from "react";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  // New states for UI features
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Sync theme with localStorage and document
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const newChat = () => {
    const chat = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [],
    };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const login = (name, email) => {
    setUser({ name, email });
  };

  const logout = () => {
    setUser(null);
  };

  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    // If deleting active chat, clear active chat ID
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
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
        theme,
        toggleTheme,
        sidebarOpen,
        toggleSidebar,
        user,
        login,
        logout,
        deleteChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
