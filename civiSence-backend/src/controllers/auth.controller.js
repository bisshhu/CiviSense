import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import app from "../app.js";
import jwt from "jsonwebtoken"
import { PendingUser } from "../models/pendingUser.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "../services/email.services.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  if ([email, password, username].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Some of the fields are missing");
  }
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(
      400,
      "Please provide a valid email address"
    );
  }
  if (password.length < 8) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters"
    );
  }

  const existingUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
  })

  if (existingUser) {
    throw new ApiError(409, "User with same email or username already exist")
  }
  await PendingUser.deleteOne({
    $or: [
      { username: normalizedUsername },
      { email: normalizedEmail }
    ]
  });
  const otp = crypto
    .randomInt(100000, 1000000)
    .toString();

  const otpHash = await bcrypt.hash(otp, 10);
  const hashedPassword = await bcrypt.hash(
    password,
    12
  );
  const otpExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );
  await PendingUser.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    otpHash,
    otpExpiresAt,
  });
  try {
    await sendVerificationEmail(
      normalizedEmail,
      otp
    );
  } catch (error) {

    // Don't leave a pending registration if
    // the email could not be sent.
    await PendingUser.deleteOne({
      email: normalizedEmail
    });

    console.error(
      "VERIFICATION EMAIL ERROR:",
      error
    );
    throw new ApiError(
      500,
      "Unable to send verification email"
    );
  }


  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          email: normalizedEmail
        },
        "Verification OTP sent to your email"
      )
    );
})

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email?.trim() || !otp?.trim()) {
    throw new ApiError(
      400,
      "Email and OTP are required"
    );
  }
  const normalizedEmail =
    email.trim().toLowerCase();
  const pendingUser = await PendingUser.findOne({
    email: normalizedEmail
  });
  if (!pendingUser) {
    throw new ApiError(
      404,
      "Registration request not found or expired"
    );
  }
  if (pendingUser.otpExpiresAt.getTime() < Date.now()) {
    await PendingUser.deleteOne({
      _id: pendingUser._id
    })
    throw new ApiError(
      400,
      "OTP has expired. Please register again."
    );
  }
  if (pendingUser.otpAttempts >= 5) {
    await PendingUser.deleteOne({
      _id: pendingUser._id
    });

    throw new ApiError(
      429,
      "Too many incorrect OTP attempts. Please register again."
    );
  }
  const isOtpCorrect = await bcrypt.compare(
    otp,
    pendingUser.otpHash
  );
  if (!isOtpCorrect) {
    pendingUser.otpAttempts += 1;

    await pendingUser.save();

    throw new ApiError(
      400,
      "Invalid OTP"
    );
  }
  const existingUser = await User.findOne({
    $or: [
      { username: pendingUser.username },
      { email: pendingUser.email }
    ]
  });
  if (existingUser) {
    await PendingUser.deleteOne({
      _id: pendingUser._id
    });

    throw new ApiError(
      409,
      "User with same email or username already exists"
    );
  }
  const userData = {
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const result = await User.collection.insertOne(userData);

await PendingUser.deleteOne({
    _id: pendingUser._id
});

const createdUser = await User
    .findById(result.insertedId)
    .select("-password -refreshToken");
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "Email verified and account created successfully"
      )
    );

})
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { refreshToken, accessToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh token and access token")
  }
}
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body
  if (!email && !username) {
    throw new ApiError(400, "username or email is required")
  }
  const user = await User.findOne({
    $or: [{ email }, { username }]
  })
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  const validateUser = await user.isPasswordCorrect(password)
  if (!validateUser) {
    throw new ApiError(401, "Invalid user Credentials")
  }
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User Logged in Successfully"))
})
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id,
    {
      $unset: {
        refreshToken: 1
      }
    }, {
    new: true,
  })
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used ")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully "
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token ")
  }
})
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user fetched successfully"
      )
    );
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  verifyEmail
};