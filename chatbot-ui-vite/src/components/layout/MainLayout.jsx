import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }) {
  const { theme } = useContext(ChatContext);

  return (
    <div className="layout" data-theme={theme}>
      <Sidebar />
      <div className="main">
        <Header />
        {children}
      </div>
    </div>
  );
}
