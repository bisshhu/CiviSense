import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const VerifyResetOtp = () => {
    const navigate = useNavigate();

    const email = sessionStorage.getItem("resetEmail");

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            setError(
                "Reset session expired. Please request a new OTP."
            );
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/verify-reset-otp",
                {
                    email,
                    otp,
                }
            );

            console.log(
                "RESET OTP VERIFIED:",
                response.data
            );

            const resetToken =
                response.data.data.resetToken;

            // Store token temporarily for the
            // reset-password page.
            sessionStorage.setItem(
                "resetToken",
                resetToken
            );

            navigate("/reset-password");

        } catch (error) {
            console.error(
                "VERIFY RESET OTP ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Invalid or expired OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            <div className="auth-card">

                <h1>
                    Verify your email
                </h1>

                <p>
                    Enter the 6-digit OTP sent to
                    <br />
                    <strong>{email}</strong>
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Verification Code
                    </label>

                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength="6"
                        value={otp}
                        onChange={(e) =>
                            setOtp(
                                e.target.value.replace(
                                    /\D/g,
                                    ""
                                )
                            )
                        }
                        placeholder="123456"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify OTP"}
                    </button>

                </form>

                <p className="auth-footer">
                    Didn't request a reset?{" "}
                    <Link to="/login">
                        Back to Login
                    </Link>
                </p>

            </div>

        </main>
    );
};

export default VerifyResetOtp;