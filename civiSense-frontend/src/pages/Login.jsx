import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const identifier = formData.identifier.trim();

            const payload = {
                password: formData.password,
            };

            // Determine whether the user entered
            // an email or username.
            if (identifier.includes("@")) {
                payload.email = identifier;
            } else {
                payload.username = identifier;
            }
            console.log("LOGIN PAYLOAD:", payload);
            const response = await api.post(
                "/auth/login",
                payload
            );

            console.log(
                "LOGIN SUCCESS:",
                response.data
            );

            login(response.data.data);

            navigate("/dashboard");

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            <div className="auth-card">

                <h1>
                    Welcome back
                </h1>

                <p>
                    Login to continue to CiviSense.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Email or Username
                    </label>

                    <input
                        type="text"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        placeholder="Email or username"
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                    <Link
                        to="/forgot-password"
                        className="forgot-password-link"
                    >
                        Forgot password?
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create one
                    </Link>
                </p>

            </div>

        </main>
    );
};

export default Login;