import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";

export default function ProfileDropdown() {
    const { user, login, logout } = useContext(ChatContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (name.trim() && email.trim()) {
            login(name, email);
            setShowLoginForm(false);
            setShowDropdown(false);
            setName("");
            setEmail("");
        }
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    return (
        <div className="profile-dropdown">
            <button
                className="profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                title={user ? user.name : "Login"}
            >
                {user ? (
                    user.name.charAt(0).toUpperCase()
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                )}
            </button>

            {showDropdown && (
                <div className="dropdown-menu">
                    {user ? (
                        <>
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                            </div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {showLoginForm ? (
                                <form onSubmit={handleLogin} className="login-form">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit">Login</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <button
                                    className="dropdown-item"
                                    onClick={() => setShowLoginForm(true)}
                                >
                                    Login
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
