import { asynchandler } from "../utils/asynchandler.js";
import { apierrors } from "../utils/apierrors.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js";

const registerUser = asynchandler(async (req,res) => {

    //REGISTER USER STEPS
    //validation process (includes checking all fields are empty or not)
    //check if user already exists(email or username)
    //check for images and avatar
    //upload them to cloudinary,avatar
    // crreate user object (entry in db)
    //remove password and refresh token field
    //return res

    const {fullname,email,username,password} = req.body
    console.log("email:",email);

    //this method is used instead of if statement just a replacement both are valid
    if(
       [fullname,email,username,password].some((field) => 
    field?.trim() === "") 
    ){
        throw new apierrors(400,"ALL FIELDS ARE REQUIRED")
    }
  
    const existedUser = User.findOne({
        $or: [ {username} , {email} ]
    })

    if (existedUser){
        throw new apierrors(409,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    const coverimageLocalPath = req.files?.coverimage[0]?.path

    if (!avatarLocalPath) {
        throw new apierrors[404,"avatar is needed"]
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverimageLocalPath)

    if (!avatar) {
        throw new apierrors[400,"avatar is needed"]
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage.url || "",
        email,
        username:username.toLowerCase() 
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
)

   if (createdUser) {
    throw new apierrors(500,"something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered sucessfully")

   )
})

export { registerUser }