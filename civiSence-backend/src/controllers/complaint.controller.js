import { Complaint } from "../models/complaint.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { reverseGeocode } from "../services/geocoding.services.js";
import { findGovernmentPortals } from "../services/portal.services.js";
import {
    analyzeComplaint,
    generateComplaintApplication,
} from "../services/ai.services.js";
const createComplaint = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        latitude,
        longitude,
    } = req.body;
    if (
        !title?.trim() ||
        !description?.trim() ||
        !category ||
        latitude === undefined ||
        longitude === undefined
    ) {
        throw new ApiError(400, "Title, description, category and location are required")
    }

    const imageLocalPath = req.files?.image?.[0]?.path
    if (!imageLocalPath) {
        throw new ApiError(400, "Complaint image is required")
    }
    const image = await uploadOnCloudinary(imageLocalPath)
    if (!image) {
        throw new ApiError(500, "Failed to get the image link from cloudinary");
    }

    const lat = Number(latitude)
    const lon = Number(longitude)
    if (
        Number.isNaN(lat) ||
        Number.isNaN(lon)
    ) {
        throw new ApiError(400, "Latitude and longitude must be valid numbers")
    }
    if (
        lat < -90 ||
        lat > 90 ||
        lon > 180 ||
        lon < -180
    ) {
        throw new ApiError(400, "Invalid latitude and longitude")
    }

    const location = await reverseGeocode(lat, lon);

    if (!location) {
        throw new ApiError(
            502,
            "Unable to determine complaint location"
        );
    }
    const aiResult = await analyzeComplaint(description);
    const { issueType, urgency } = aiResult;

    const portals = await findGovernmentPortals({
        complaintText: description,
        issueType,
        state: location.state,
        district: location.district,
        city: location.city,
    });
    const application = await generateComplaintApplication({
        title,
        description,
        category,
        issueType,
        urgency,
        location,
        portals,
    });

    const complaint = await Complaint.create({
        user: req.user._id,
        title: title.trim(),
        description: description.trim(),
        category,
        image: image?.url,
        location,
        issueType,
        urgency,
        portals: portals.map(portal => portal._id),
        status: "submitted",
        statusHistory: [
            {
                status: "submitted",
                note: "Complaint submitted",
            },
        ],
        application,
    });
    await complaint.populate("portals");
    return res
        .status(201)
        .json(new ApiResponse(201, complaint, "Complaint created successfully "))
})
const getUserComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({
        user: req.user._id,
    })
        .populate("portals")
        .sort({ createdAt: -1 })
    return res
        .status(200)
        .json(
            new ApiResponse(200, complaints, "complaints fetched successfully")
        )

})

const getComplaintId = asyncHandler(async (req, res) => {
    const { complaintId } = req.params
    const complaint = await Complaint.findOne({
        _id: complaintId,
        user: req.user._id
    }).populate("portals")
    if (!complaint) {
        throw new ApiError(404, "complaint not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200, complaint, "complaint fetched successfully"
        ))
})
const getComplaintPortals = asyncHandler(async (req, res) => {
    const { complaintId } = req.params
    const complaint = await Complaint.findOne({
        _id: complaintId,
        user: req.user._id
    }).populate("portals")
    if (!complaint) {
        throw new ApiError(404, "complaint not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, complaint.portals, "Complaint portals fetched successfully"))
})


export {
    createComplaint,
    getUserComplaints,
    getComplaintId,
    getComplaintPortals,

}