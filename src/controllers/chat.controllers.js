import {User,Message,Chat} from "../models/Index.js";
import { ApiError, ApiResponse,asyncHandler } from "../utils/Index.js";
import {emitEvent} from "../utils/features.js";
import {ALERT,ALERT_MAIN_PAGE,NEW_ALERT_MESSAGE,NEW_MESSAGE,REFETCH} from "../constants/events.constants.js";
import { deleteFileFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


export const newGroup = asyncHandler(async(req,res)=>{
    const {name,members} = req.body;
    const allMembers = [...members,req.user._id];
    if(allMembers.length < 3)
        throw new ApiError(400,"Group can not consists less than 3 peoples");

    await Chat.create({name,isGroupChat:true,creator:req.user,members:allMembers});
    emitEvent(req,ALERT_MAIN_PAGE,allMembers,{message:`Welcome to the ${name} group`});
    emitEvent(req,REFETCH,members);
    return res.status(201).json(new ApiResponse(201,"Group is created"));
});

export const getMyChat = asyncHandler(async(req,res)=>{
    const chats = await Chat.find({members:req.user}).populate("members","fullName avatar");
    const transformedChats = chats.map(({_id,name,isGroupChat,members})=>{
        const otherMember = members.find((item)=> item._id.toString() !== req.user._id.toString());
        if(otherMember){
            return {
                _id, isGroupChat, avatar: isGroupChat? members.slice(0,3).map(({avatar})=>avatar?.url) : [otherMember?.avatar?.url],
                name:isGroupChat?name:otherMember?.fullName,
                members: members.reduce((prev,curr)=>{
                    if(curr._id.toString() !== req.user._id.toString()){
                        prev.push(curr._id);
                    } 
                    return prev;
                },[])
            }
        }else
            return null;
    })
    return res.status(200).json(new ApiResponse(200,"Get user chats",transformedChats));
});

export const getMyGroup = asyncHandler(async(req,res)=>{
    const groups = await Chat.find({members:req.user,creator:req.user,isGroupChat:true}).populate("members","name avatar");
    const transformedGroups = groups.map(({_id,name,isGroupChat,members})=>{
        return {
            _id,
            isGroupChat,
            avatar: members.slice(0,3).map(({avatar})=>avatar.url),
            name
        }  
    })
    return res.status(200).json(new ApiResponse(200,"Get Groups",transformedGroups));
});

export const addMembers = asyncHandler(async(req,res)=>{
    const {chatId,members} = req.body;
    if(!members || members.length < 1)
        throw new ApiError(400,"Please Add Member");
    const group = await Chat.findById(chatId);
    if(!group || !group.isGroupChat)
        throw new ApiError(400,"No Such Group Exists");
    if(group.creator.toString() !== req.user._id.toString())
        throw new ApiError(400,"You are not allowed to add members");
    const allNewMembersPromise = members.map((i)=> User.findById(i,"name"));
    const allNewMembers = await Promise.all(allNewMembersPromise);
    group.members.push(...allNewMembers.map((i)=>i._id));
    if(group.members.length > 100)
        throw new ApiError(400,"Group member limit has exceeded");
    await group.save();
    const allNewMembersName = allNewMembers.map((i)=>i.fullName).join(",");
    // emitEvent(req,ALERT,group.members,{message:`${allNewMembersName} have been added in group by ${req.user.fullName}`,chatId});
    emitEvent(req,REFETCH,group.members);
    return res.status(200).json(new ApiResponse(200,"Members added successfully"));
});

export const removeMembers = asyncHandler(async(req,res)=>{
   const {userId,chatId} = req.body;
   const [group,userToRemove] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId,"fullName")
   ]);
   if(!group || !group.isGroupChat)
    throw new ApiError(400,"Group Not Found");
   if(!userToRemove)
    throw new ApiError(400,"User Not Found");
   if(group.creator.toString() !== req.user._id.toString())
    throw new ApiError(400,"You are not allowed to remove members");
   if(group.members.length <= 3)
    throw new ApiError(400,"Group must contain minimum 3 members");
   const allChatMembers = group.members.map((i)=>i.toString());
   group.members = group.members.filter((item)=>item.toString() !== userId.toString());
   await group.save();
//    emitEvent(req,ALERT_MAIN_PAGE,group.members,{message:`${userToRemove.fullName} have been removed from group`,chatId});
   emitEvent(req,REFETCH,allChatMembers);
   return res.status(200).json(new ApiResponse(200,"Members removed successfully"));
});

export const leaveGroup = asyncHandler(async(req,res)=>{
    const chatId = req.params.id;
    const group = await Chat.findById(chatId);
    if(!group || !group.isGroupChat)
        throw new ApiError(400,"Group Not Found");
    const remainingMembers = group.members.filter((item)=>item.toString() !== req.user._id.toString());
    if(remainingMembers.length <= 2)
        throw new ApiError(400,"Group must contain minimum of 3 members");
    if(group.creator.toString() === req.user._id.toString()){
        const randNum = Math.floor(Math.random() * remainingMembers.length);
        group.creator = remainingMembers[randNum];
    }
    group.members = remainingMembers;
    await group.save();
    const groupMembers = group.members.map((i)=>i.toString());
    emitEvent(req,REFETCH,groupMembers);
    // emitEvent(req,ALERT,group.members,{message:`${req.user.fullName} left the group`,chatId});
    return res.status(200).json(new ApiResponse(200,"Leave Group successfully"));
});

export const sendAttachment = asyncHandler(async(req,res)=>{
    const {chatId} = req.body;
    const files = req.files || [];
    if(files.length < 1)
        throw new ApiError(400,"You can select 1 file atLeast");
    if(files.length > 5)
        throw new ApiError(400,"You can select 5 files atMax");
    const [chat,user] = await Promise.all([Chat.findById(chatId),User.findById(req.user._id, "fullName")]);
    if(!chat)
        throw new ApiError(400,"No such chat exist");
    const attachments = await uploadOnCloudinary(files);
    const messageForRealTime = {content:"", attachments, chat:chatId, sender:{
        _id:user._id,
        name:user.fullName,
        avatar:user.avatar.url
    }};
    const messageForDb = {content:"", attachments, chat:chatId,sender:user._id}; 
    const message = await Message.create(messageForDb);
    emitEvent(req,NEW_MESSAGE,chat.members,{message:messageForRealTime,chatId});
    emitEvent(req,NEW_ALERT_MESSAGE,chat.members,{chatId});
    return res.status(200).json(new ApiResponse(200,message));
});

export const getChatDetails = asyncHandler(async(req,res)=>{
    const chatId = req.params.id;
    if(req.query.populate==="true"){
        const chat = await Chat.findById(chatId).populate("members","fullName avatar creator").lean();
        if(!chat)
            throw new ApiError(400,"No chat found");
        chat.members = chat.members.map((item)=>({...item,avatar:item.avatar?.url}));  
        return res.status(200).json(new ApiResponse(200,"Sent Populate Chat Details",chat));  
    }else{
        const chat = await Chat.findById(chatId);
        if(!chat)
            throw new ApiError(400,"No chat found");
        return res.status(200).json(new ApiResponse(200,"Sent Chat Details",chat));
    }
});

export const renameGroup = asyncHandler(async(req,res)=>{
    const groupId = req.params.id;
    const {name} = req.body;
    const group = await Chat.findById(groupId);
    if(!group || !group.isGroupChat)
        throw new ApiError(400,"Group is not found");
    if(group.creator.toString() !== req.user._id.toString())
        throw new ApiError(400,"You are not allowed to edit group Name");
    group.name = name;
    await group.save();
    // emitEvent(req,ALERT_MAIN_PAGE,group.members,{message:`Group Name Has Been Changed To &{name}`,chatId: groupId});
    emitEvent(req,REFETCH,group.members);
    return res.status(200).json(new ApiResponse(200,"Group Name Changed Successfully"));
});

export const deleteGroup = asyncHandler(async(req,res)=>{
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if(!chat)
        throw new ApiError(400,"No chat is found");
    const members = chat.members;
    if(chat.isGroupChat && chat.creator.toString() !== req.user._id.toString())
        throw new ApiError(400,"Not Allowed To Delete Group");
    if(!chat.isGroupChat && !chat.members.includes(req.user._id.toString()))
        throw new ApiError(400,"Not Allowed To Unfriend");

    const messageWithAttachment = await Message.find({chat:chatId,attachments:{$exists:true, $ne:[]}});
    let publicId = [];
    messageWithAttachment.map((item)=>item.attachments.forEach((item)=>publicId.push(item.public_id)));
    if(chat.isGroupChat){
        await Promise.all([
            deleteFileFromCloudinary(publicId),
            chat.deleteOne(),
            Message.deleteMany({chat:chatId})
        ]);
    }else{
        await Promise.all([
            deleteFileFromCloudinary(publicId),
            chat.deleteOne(),
            Message.deleteMany({chat:chatId})
        ]);  
    }
    emitEvent(req,REFETCH,members);
    return res.status(200).json(new ApiResponse(200,"Done successfully"));
});

export const getMessages = asyncHandler(async(req,res)=>{
    const chatId = req.params.id;
    const {page=1} = req.query;
    const limit = 20;
    const skip = (page-1)*limit;
    const chat = await Chat.findById(chatId);
    if(!chat)
        throw new ApiError(404,"Chat not found");
    if(!chat.members.includes(req.user._id.toString()))
        throw new ApiError(400,"You are not allowed");
    const [messages,totalMessageCount] = await Promise.all([
        Message.find({chat:chatId})
               .sort({createdAt:-1})
               .skip(skip)
               .limit(limit)
               .populate("sender","fullName avatar")
               .lean(),
        Message.countDocuments({chat:chatId})
    ]);
    const totalPage = Math.ceil(totalMessageCount/limit);
    return res.status(200).json(new ApiResponse(200,"Get Message Successfully",{message:messages.reverse(),totalPage:totalPage}));
});