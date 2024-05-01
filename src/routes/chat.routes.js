import express from "express";
import isAuthenticated from "../middlewares/auth.middlewares.js";
import { addMembers, deleteGroup, getChatDetails, getMessages, getMyChat, getMyGroup, leaveGroup, newGroup, removeMembers, renameGroup, sendAttachment } from "../controllers/chat.controllers.js";
import {attachmentsMulter} from "../middlewares/multer.middlewares.js";
import {newGroupValidator,addMemberValidator, removeMemberValidator,renameValidator,sendAttachmentsValidator,validateHandler,chatIdValidator} from "../utils/validator.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/newGroup",newGroupValidator(),validateHandler,newGroup);
router.get("/my",getMyChat);
router.get("/my/groups",getMyGroup);
router.put("/addMember",addMemberValidator(),validateHandler,addMembers);
router.put("/removeMember",removeMemberValidator(),validateHandler,removeMembers);
router.delete("/leave/:id",chatIdValidator(),validateHandler,leaveGroup);

router.post("/message",attachmentsMulter,sendAttachmentsValidator(),validateHandler,sendAttachment);
router.get("/message/:id",chatIdValidator(),validateHandler,getMessages);
router.route("/:id").get(chatIdValidator(),validateHandler,getChatDetails)
                    .put(renameValidator(),validateHandler,renameGroup)
                    .delete(chatIdValidator(),validateHandler,deleteGroup);

export default router;