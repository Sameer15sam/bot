import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import LanguageSelector from "../input/LanguageSelector";
import ThemeToggle from "../ui/ThemeToggle";
import ProfileDropdown from "../ui/ProfileDropdown";
import SidebarToggle from "../ui/SidebarToggle";

export default function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <SidebarToggle />
        <span>Pragna-1 A</span>
      </div>

      <div className="header-right">
        <LanguageSelector />
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </div>
  );
}
