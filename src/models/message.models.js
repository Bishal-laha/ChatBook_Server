import  mongoose, { Types }  from "mongoose";

const messageSchema = new mongoose.Schema({
    sender:{
        type:Types.ObjectId,
        ref:"User",
        required:[true,"Please Provide Sender Name"],
    },
    chat:{
        type:Types.ObjectId,
        ref:"Chat",
        required:[true,"Please Provide Chat Details"]
    },
    content:String,
    attachments:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
    ]
},{timestamps:true});

const Message = mongoose.models.Message || mongoose.model("Message",messageSchema);

export default Message;