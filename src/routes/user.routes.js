import express from "express";
import { singleAvatar } from "../middlewares/multer.middlewares.js";
import { acceptFriendRequest, changeBio, changeImg, deleteAccount, getFriends, getNotification, getProfile, loginUser, logoutUser, registerUser, searchUser, sendFriendRequest } from "../controllers/user.controllers.js";
import isAuthenticated from "../middlewares/auth.middlewares.js";
import {registerValidator,loginValidator ,validateHandler,sendRequestValidator,acceptRequestValidator} from "../utils/validator.js";

const router = express.Router();

router.post("/register",singleAvatar,registerValidator(),validateHandler,registerUser);
router.post("/login",loginValidator(),validateHandler,loginUser);

router.get("/profile",isAuthenticated,getProfile);
router.get("/search",isAuthenticated,searchUser);
router.put("/send-request",isAuthenticated,sendRequestValidator(),validateHandler,sendFriendRequest);
router.put("/accept-request",isAuthenticated,acceptRequestValidator(),validateHandler,acceptFriendRequest);
router.get("/notifications",isAuthenticated,getNotification);
router.get("/friends",isAuthenticated,getFriends);
router.get("/logout",isAuthenticated,logoutUser);
router.put("/change-bio",isAuthenticated,changeBio);
router.post("/change-img",isAuthenticated,singleAvatar,changeImg);
router.delete("/delete-account",isAuthenticated,deleteAccount);

export default router;