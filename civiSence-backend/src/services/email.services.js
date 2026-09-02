import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, otp) => {
    try {
        console.log("EMAIL SERVICE CALLED");
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log(
            "EMAIL_APP_PASSWORD EXISTS:",
            !!process.env.EMAIL_APP_PASSWORD
        );

        const info = await transporter.sendMail({
            from: `"CiviSense" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "CiviSense Email Verification",

            text: `Your CiviSense verification OTP is ${otp}. This OTP will expire in 10 minutes.`,

            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                    <h2>CiviSense Email Verification</h2>

                    <p>Thank you for registering with CiviSense.</p>

                    <p>Your verification code is:</p>

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

                    <p>— CiviSense Team</p>
                </div>
            `,
        });

        console.log("EMAIL SENT SUCCESSFULLY:", info.messageId);

    } catch (error) {
        console.error("========== EMAIL ERROR ==========");
        console.error("CODE:", error.code);
        console.error("COMMAND:", error.command);
        console.error("RESPONSE:", error.response);
        console.error("RESPONSE CODE:", error.responseCode);
        console.error("MESSAGE:", error.message);
        console.error("================================");

        throw error;
    }
};
export {
    sendVerificationEmail,
};