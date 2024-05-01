import { userSocketIDs } from "../app.js";

export const getSocketID = (users=[])=>{
    return users.map((item)=>userSocketIDs.get(item.toString()));
};

export const emitEvent = (req,event,users,data)=>{
    const io = req.app.get("io");
    const userSockets = getSocketID(users);
    io.to(userSockets).emit(event,data);
};