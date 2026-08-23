import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        } finally {
            logout();
            navigate("/login");
        }
    };

    return (
        <nav className="navbar">

            <Link to="/" className="navbar-logo">
                CiviSense
            </Link>

            <div className="navbar-links">

                <Link to="/">
                    Home
                </Link>

                {user ? (
                    <>
                        <Link to="/dashboard">
                            Dashboard
                        </Link>

                        <Link to="/complaints/create">
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
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
};

export default Navbar;