import { ApiError,ApiResponse,asyncHandler } from "../utils/Index.js";
import {User} from "../models/Index.js";
import jwt from "jsonwebtoken";

const isAuthenticated = asyncHandler(async (req,res,next)=>{
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!accessToken){
            throw new ApiError(401,"UNAUTHORIZED REQUEST");
    }
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    req.user = user;
    next();
});

export const isAdminAuthenticated = asyncHandler(async (req,res,next)=>{
    const {adminToken} = req.cookies;
    if(!adminToken)
            throw new ApiError(401,"UNAUTHORIZED REQUEST FOR ADMIN");
    const decodedAdminToken = jwt.verify(adminToken,process.env.ADMIN_TOKEN_SECRET);
    const isMatched = decodedAdminToken.secretKey === process.env.ADMIN_SECRET_KEY;
    if(!isMatched)
        throw new ApiError(400,"ADMIN CREDENTIALS MISMATCHED");
    next();
});

export const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) throw new ApiError(400,err.message);
    const authToken = socket.request.cookies.accessToken;
    if (!authToken)
      return new ApiResponse(401,"Please login to access this route");
      // throw new ApiError(401,"UNAUTHORIZED REQUEST");
    const decodedData = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedData._id);
    if (!user)
      return new ApiResponse(401,"Please login to access this route");
    socket.user = user;
    return next();
  } catch (error) {
    const errorMessage = error;
    // console.log(error);
    // throw new ApiError(401,"Please login to access this route");
  }
};

export default isAuthenticated;