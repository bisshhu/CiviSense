import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
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

        const resetToken =
            sessionStorage.getItem("resetToken");

        if (!resetToken) {
            setError(
                "Reset session expired. Please start again."
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        // Match your backend password validation
        if (
            !/(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])/.test(
                formData.password
            )
        ) {
            setError(
                "Password must contain at least one uppercase letter, one number, and one symbol."
            );
            return;
        }

        setLoading(true);

        try {
            await api.post(
                "/auth/reset-password",
                {
                    resetToken,
                    newPassword: formData.password,
                }
            );

            // Reset flow is finished
            sessionStorage.removeItem("resetEmail");
            sessionStorage.removeItem("resetToken");

            navigate("/login");

        } catch (error) {
            console.error(
                "RESET PASSWORD ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            <div className="auth-card">

                <h1>
                    Create a new password
                </h1>

                <p>
                    Choose a strong password for your
                    CiviSense account.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        New Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <label>
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>

                </form>

            </div>

        </main>
    );
};

export default ResetPassword;