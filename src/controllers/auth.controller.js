import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from"../utils/ApiResponse.js"
import{ApiError} from "../utils/ApiError.js"
const registerUser=asyncHandler(async(req,res)=>{
  const {username,email,password}=req.body

  if([email,password,username].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"Some of the fields are missing");
  }

  const existingUser=await User.findOne({
    $or:[{username},{email}]
  })

  if(existingUser){
    throw new ApiError(409,"User with same email or username already exist")
  }

  const user=await User.create({
    username,
    email,
    password,
  })

  const createdUser=await User.findById(user._id).select("-password -refreshToken");
  return res.status(201)
  .json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
})

export { registerUser };