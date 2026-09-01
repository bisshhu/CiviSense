import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        } finally {
            logout();
            closeMenu();
            navigate("/login");
        }
    };

    return (
        <nav className="navbar">

            <Link
                to="/"
                className="navbar-logo"
                onClick={closeMenu}
            >
                CiviSense
            </Link>

            {/* HAMBURGER */}

            <button
                className={`navbar-toggle ${
                    menuOpen ? "active" : ""
                }`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* NAVIGATION */}

            <div
                className={`navbar-links ${
                    menuOpen ? "open" : ""
                }`}
            >

                <Link
                    to="/"
                    onClick={closeMenu}
                >
                    Home
                </Link>

                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            onClick={closeMenu}
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/complaints/create"
                            onClick={closeMenu}
                        >
                            Report Issue
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            onClick={closeMenu}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            onClick={closeMenu}
                        >
                            Register
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
};

export default Navbar;