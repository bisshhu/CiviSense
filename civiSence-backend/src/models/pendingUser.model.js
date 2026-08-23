import mongoose, { Schema } from "mongoose";

const pendingUserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        otpHash: {
            type: String,
            required: true,
        },

        otpExpiresAt: {
            type: Date,
            required: true,
        },

        otpAttempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically remove expired pending registrations
pendingUserSchema.index(
    { otpExpiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export const PendingUser = mongoose.model(
    "PendingUser",
    pendingUserSchema
);