import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleOtpChange = (e) => {
        const value = e.target.value;

        // Only allow digits
        if (/^\d{0,6}$/.test(value)) {
            setOtp(value);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError(
                "Password must be at least 8 characters"
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/register",
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }
            );

            console.log(
                "REGISTRATION OTP:",
                response.data
            );

            setSuccess(
                "OTP sent to your email. Please check your inbox."
            );

            setStep(2);

        } catch (error) {
            console.error(
                "REGISTER ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (otp.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/verify-email",
                {
                    email: formData.email,
                    otp,
                }
            );

            console.log(
                "EMAIL VERIFIED:",
                response.data
            );

            setSuccess(
                "Email verified! Your account has been created."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            console.error(
                "OTP VERIFICATION ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Invalid OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const goBackToRegistration = () => {
        setStep(1);
        setOtp("");
        setError("");
        setSuccess("");
    };

    return (
        <main className="auth-page">

            <div className="auth-card">

                {step === 1 ? (
                    <>
                        <h1>
                            Create your account
                        </h1>

                        <p>
                            Join CiviSense and start
                            reporting civic issues.
                        </p>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleRegister}
                        >

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={
                                    formData.username
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Your username"
                                required
                            />

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="you@example.com"
                                required
                            />

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="••••••••"
                                required
                            />

                            <label>
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="••••••••"
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Send OTP"}
                            </button>

                        </form>

                        <p className="auth-footer">
                            Already have an account?{" "}
                            <Link to="/login">
                                Login
                            </Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h1>
                            Verify your email
                        </h1>

                        <p>
                            We've sent a 6-digit
                            verification code to:
                        </p>

                        <p>
                            <strong>
                                {formData.email}
                            </strong>
                        </p>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                {success}
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleVerifyEmail
                            }
                        >

                            <label>
                                Verification Code
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onChange={
                                    handleOtpChange
                                }
                                placeholder="123456"
                                maxLength={6}
                                required
                            />

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    otp.length !== 6
                                }
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify Email"}
                            </button>

                        </form>

                        <button
                            type="button"
                            className="secondary-auth-button "
                            onClick={
                                goBackToRegistration
                            }
                            disabled={loading}
                        >
                            ← Change email
                        </button>
                    </>
                )}

            </div>

        </main>
    );
};

export default Register;