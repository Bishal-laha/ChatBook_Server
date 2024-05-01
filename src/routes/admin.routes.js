import express from "express";
import { adminLogin, adminLogout, allChats, allMessages, allUsers, dashboardStats, getAdminData } from "../controllers/admin.controllers.js";
import {adminLoginValidator,validateHandler} from "../utils/validator.js";
import {isAdminAuthenticated} from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/verify",adminLoginValidator(),validateHandler,adminLogin);
router.get("/logout",adminLogout);

router.use(isAdminAuthenticated);

router.get("/",getAdminData);
router.get("/users",allUsers);
router.get("/chats",allChats);
router.get("/messages",allMessages);
router.get("/stats",dashboardStats);

export default router;