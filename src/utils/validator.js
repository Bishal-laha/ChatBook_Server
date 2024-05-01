import { body, param, validationResult } from "express-validator";
import { ApiResponse } from "./Index.js";

export const validateHandler = (req,res,next)=>{
    const error = validationResult(req);
    const message = error.array().map((item)=>item.msg).join(", ");
    if(error.isEmpty()) return next()
    else 
        res.json(new ApiResponse(400,message));
};

export const registerValidator = ()=>[
    body("fullName","Please Enter Full Name").notEmpty(),
    body("username","Please Enter Username").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
    body("bio","Please Enter Bio").notEmpty(),
];

export const loginValidator = () => [
  body("username", "Please Enter Username").notEmpty(),
  body("password", "Please Enter Password").notEmpty(),
];

export const newGroupValidator = () => [
  body("name", "Please Enter Name").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please Enter Members")
    .isArray({ min: 2, max: 100 })
    .withMessage("Members must be 2-100"),
];

export const addMemberValidator = () => [
  body("chatId", "Please Enter Chat ID").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please Enter Members")
    .isArray({ min: 1, max: 97 })
    .withMessage("Members must be 1-97"),
];

export const removeMemberValidator = () => [
  body("chatId", "Please Enter Chat ID").notEmpty(),
  body("userId", "Please Enter User ID").notEmpty(),
];

export const sendAttachmentsValidator = () => [
  body("chatId", "Please Enter Chat ID").notEmpty(),
];

export const chatIdValidator = () => [param("id", "Please Enter Chat ID").notEmpty()];

export const renameValidator = () => [
  param("id", "Please Enter Chat ID").notEmpty(),
  body("name", "Please Enter New Name").notEmpty(),
];

export const sendRequestValidator = () => [
  body("receiverId", "Please Enter User ID").notEmpty(),
];

export const acceptRequestValidator = () => [
  body("requestId", "Please Enter Request ID").notEmpty(),
  body("accept")
    .notEmpty()
    .withMessage("Please Add Accept")
    .isBoolean()
    .withMessage("Accept must be a boolean"),
];

export const adminLoginValidator = () => [
  body("secretKey", "Please Enter Secret Key").notEmpty(),
];