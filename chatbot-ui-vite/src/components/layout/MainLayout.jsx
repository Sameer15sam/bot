import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Header />
        {children}
      </div>
    </div>
  );
}
