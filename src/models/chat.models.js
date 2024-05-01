import  mongoose, { Types }  from "mongoose";

const chatSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Provide Chat Name"]
    },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    creator:{
        type:Types.ObjectId,
        ref:"User"
    },
    members:[
        {
            type:Types.ObjectId,
            ref:"User"
        },
    ]
},{timestamps:true});

const Chat = mongoose.models.Chat || mongoose.model("Chat",chatSchema);

export default Chat;