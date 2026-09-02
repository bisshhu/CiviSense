import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const sendVerificationEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"CiviSense" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "CiviSense Email Verification",

        text: `Your CiviSense verification OTP is ${otp}. This OTP will expire in 10 minutes.`,

        html: `
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
    });
};

export {
    sendVerificationEmail,
};