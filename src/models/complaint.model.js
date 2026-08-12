import mongoose, { Schema } from "mongoose";

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "in_progress",
        "resolved",
        "rejected",
      ],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const complaintSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: 5,
      maxlength: 120,
    },

    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "roads",
        "sanitation",
        "water",
        "electricity",
        "streetlight",
        "drainage",
        "other",
      ],
    },

    image: {
      type: String,
      trim: true,
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "in_progress",
        "resolved",
        "rejected",
      ],
      default: "submitted",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: () => [
        {
          status: "submitted",
          note: "Complaint submitted",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ user: 1, createdAt: -1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);