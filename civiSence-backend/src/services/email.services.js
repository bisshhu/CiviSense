const sendVerificationEmail = async (email, otp) => {
    try {
        console.log("EMAIL SERVICE CALLED");

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                accept: "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: "CiviSense",
                    email: process.env.EMAIL_USER,
                },
                to: [
                    {
                        email: email,
                    },
                ],
                subject: "CiviSense Email Verification",

                textContent: `Your CiviSense verification OTP is ${otp}. This OTP will expire in 10 minutes.`,

                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                        <h2>CiviSense Email Verification</h2>

                        <p>
                            Thank you for registering with CiviSense.
                        </p>

                        <p>
                            Your verification code is:
                        </p>

                        <div style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 20px;
                            background: #f1f5f9;
                            text-align: center;
                            border-radius: 8px;
                        ">
                            ${otp}
                        </div>

                        <p>
                            This OTP will expire in <strong>10 minutes</strong>.
                        </p>

                        <p>
                            If you did not request this, you can safely ignore this email.
                        </p>

                        <p>
                            — CiviSense Team
                        </p>
                    </div>
                `,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("BREVO API ERROR:", data);
            throw new Error(
                data?.message || "Failed to send verification email"
            );
        }

        console.log("EMAIL SENT:", data.messageId);

        return data;

    } catch (error) {
        console.error("EMAIL ERROR:", error);
        throw error;
    }
};

export {
    sendVerificationEmail,
};