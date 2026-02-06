import { ChatProvider } from "./context/ChatContext";
import MainLayout from "./components/layout/MainLayout";
import ChatWindow from "./components/chat/ChatWindow";
import InputBar from "./components/input/InputBar";

import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/chat.css";
import "./styles/input.css";

export default function App() {
  return (
    <ChatProvider>
      <MainLayout>
        <ChatWindow />
        <InputBar />
      </MainLayout>
    </ChatProvider>
  );
}
