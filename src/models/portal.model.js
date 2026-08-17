import mongoose, { Schema } from "mongoose";

const portalSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sourcePage: {
        type: String,
        trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
        },

        issueTypes: {
            type: [String],
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },

        verified: {
            type: Boolean,
            default: false,
        },

        lastVerifiedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

portalSchema.index({
    state: 1,
    district: 1,
    city: 1,
});

portalSchema.index({
    issueTypes: 1,
});

export const Portal = mongoose.model("Portal", portalSchema);