
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

const portalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const complaintSchema = new Schema(
  {
    
    // USER
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    
    // ORIGINAL COMPLAINT

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

    
    // AI ANALYSIS
    issueType: {
      type: String,
      enum: [
        "road",
        "pothole",
        "garbage",
        "water",
        "electricity",
        "drainage",
        "streetlight",
        "sewage",
        "railway",
        "public safety",
        "other",
      ],
    },

    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // LOCATION
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      area: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      district: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      postcode: {
        type: String,
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

    
    // AI GENERATED CONTENT

    formalDescription: {
      type: String,
      trim: true,
    },

    complaintMessage: {
      type: String,
      trim: true,
    },

   
    // GOVERNMENT PORTALS

    portals: {
      type: [portalSchema],
      default: [],
    },

    // =========================
    // COMPLAINT STATUS
    // =========================

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


// INDEXES


complaintSchema.index({
  user: 1,
  createdAt: -1,
});

complaintSchema.index({
  "location.state": 1,
  "location.city": 1,
});

complaintSchema.index({
  status: 1,
});

// MODEL

export const Complaint = mongoose.model(
  "Complaint",
  complaintSchema
);

