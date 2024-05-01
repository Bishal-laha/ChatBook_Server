import { ApiError,ApiResponse,asyncHandler } from "../utils/Index.js";
import {User,Chat,Message} from "../models/Index.js";
import jwt from "jsonwebtoken";

export const adminLogin = asyncHandler(async(req,res)=>{
    const {secretKey} = req.body;
    const isMatched = secretKey === process.env.ADMIN_SECRET_KEY;
    if(!isMatched)
        throw new ApiError(401,"Credentials not matched");
    const adminToken = jwt.sign({secretKey},process.env.ADMIN_TOKEN_SECRET,{expiresIn:process.env.ADMIN_TOKEN_EXPIRY});
    const option = {httpOnly:true,secure:true,sameSite:"none"};
    return res.status(200)
              .cookie("adminToken",adminToken,option)
              .json(new ApiResponse(200,"Admin Logged In Successfully"));
});

export const adminLogout = asyncHandler(async(req,res)=>{
    const option = {httpOnly:true,secure:true};
    return res.status(200)
              .clearCookie("adminToken",option)
              .json(new ApiResponse(200,"Admin Logged Out Successfully"));
});

export const getAdminData = asyncHandler(async (req,res)=>{
    return res.status(200).json(new ApiResponse(200,"Welcome Admin",{isAdmin:true}));
});

export const allUsers = asyncHandler(async(req,res)=>{
    const allUsers = await User.find({});
    const transformedUsers = await Promise.all(
        allUsers.map(async ({_id,fullName,username,avatar})=>{
            const [groupCount,friendsCount] = await Promise.all([
                Chat.countDocuments({isGroupChat:true, members:_id}),
                Chat.countDocuments({isGroupChat:false, members:_id})
            ]);
            return{
                _id,fullName,username,
                avatar:avatar.url,
                friendsCount,
                groupCount
            }
        })
    );
    return res.status(200).json(new ApiResponse(200,"Successfully get all users",transformedUsers));
});

export const allChats = asyncHandler(async(req,res)=>{
    const allChats = await Chat.find({}).populate("members","fullName avatar").populate("creator","fullName,avatar");
    const transformedChats = await Promise.all(
        allChats.map(async ({name,_id,isGroupChat,creator,members})=>{
            const totalMessages = await Message.countDocuments({chat:_id});
            return{
                _id,name,isGroupChat,
                avatar:members.slice(0,3).map((item)=>item.avatar.url),
                members: members.map((_id,fullName,avatar)=>({
                    _id,fullName,
                    avatar: avatar.url
                })),
                creator:{
                    fullName: creator?.fullName || "None",
                    avatar: creator?.avatar.url || ""
                },
                totalMembers: members.length,
                totalMessages
            }
        })
    );
    return res.status(200).json(new ApiResponse(200,"Successfully all chats received",transformedChats));
});

export const allMessages = asyncHandler(async(req,res)=>{
    const allMessages = await Message.find({}).populate("sender","fullName avatar").populate("chat","isGroupChat");
    const transformedMessages = allMessages.map(({_id,chat,content,sender,attachments,createdAt})=>({
        _id,attachments,content,createdAt,
        chat: chat._id,
        isGroupChat: chat.isGroupChat,
        sender:{
            _id: sender._id,
            fullName: sender.fullName,
            avatar: sender.avatar.url
        }
    }));
    return res.status(200).json(new ApiResponse(200,"Successfully all messages received",transformedMessages));
});

export const dashboardStats = asyncHandler(async(req,res)=>{
    const [totalGroupsCount,totalUsersCount,totalMessagesCount,totalChatsCount] = await Promise.all([
        Chat.countDocuments({isGroupChat:true}),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments()
    ]);
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysMessages = await Message.find({
        createdAt: {$gte: last7Days,$lte: today}}).select("createdAt");
    const messages = new Array(7).fill(0);
    const dayInMiliseconds = 1000 * 60 * 60 * 24;
    last7DaysMessages.forEach((message) => {
        const indexApprox =  (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
        const index = Math.floor(indexApprox);
        messages[6 - index]++;
    });
    const stats = {
        totalGroupsCount,totalUsersCount,totalMessagesCount,totalChatsCount,
        totalSingleChatsCount: totalChatsCount-totalGroupsCount,
        messagesChart: messages
    };
    return res.status(200).json(new ApiResponse(200,"Successfully Stats Sent",stats));
});