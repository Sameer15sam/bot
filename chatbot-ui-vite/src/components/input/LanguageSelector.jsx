import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useContext(ChatContext);

  return (
    <select
      className="language-select"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="te">Telugu</option>
      <option value="ta">Tamil</option>
      <option value="kn">Kannada</option>
      <option value="ml">Malayalam</option>
      <option value="mr">Marathi</option>
      <option value="bn">Bengali</option>
      <option value="gu">Gujarati</option>
      <option value="pa">Punjabi</option>
    </select>
  );
}
