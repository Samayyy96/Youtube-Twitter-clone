import { asynchandler } from "../utils/asynchandler.js";
import { apierrors } from "../utils/apierrors.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return{accessToken,refreshToken}

    } catch (error) {
        throw new apierrors(500,"something went wrong while generating access token")
    }
}

const registerUser = asynchandler(async (req,res) => {

    //REGISTER USER STEPS
    //validation process (includes checking all fields are empty or not)
    //check if user already exists(email or username)
    //check for images and avatar
    //upload them to cloudinary,avatar
    // crreate user object (entry in db)
    //remove password and refresh token field
    //return res

    const {fullName,email,username,password} = req.body
    // console.log("email:",email);

    //this method is used instead of if statement just a replacement both are valid
    if(
       [fullName,email,username,password].some((field) => 
    field?.trim() === "") 
    ){
        throw new apierrors(400,"ALL FIELDS ARE REQUIRED")
    }
  
    const existedUser = await User.findOne({
        $or: [ {username} , {email} ]
    })
    
    if (existedUser){
        throw new apierrors(409,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path 
      let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new apierrors(404,"avatar is needed")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apierrors(400,"avatar is needed")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

   if (!createdUser) {
    throw new apierrors(500,"something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered sucessfully")
    
   )
   
})

const loginUser = asynchandler(async(req,res) => {
    //req body se data le aao
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password} = req.body

    if (!username || !email){
        if (!username && !email){
        throw new apierrors(404,"username or email required")
        }
    }

    const user = User.findOne({
        $or:[{username,email}]
    })

    if(!user){
        throw new apierrors(404,"user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new apierrors(404,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "user logged in sucessfully"
        )
    )

})

const logoutuser = asynchandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apierrors(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apierrors(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apierrors(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apierrors(401, error?.message || "Invalid refresh token")
    }

})


export { 
    registerUser,
    loginUser,
    logoutuser,
    refreshAccessToken
 }