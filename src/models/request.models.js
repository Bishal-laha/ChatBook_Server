import  mongoose, { Types }  from "mongoose";

const requestSchema = new mongoose.Schema({
    sender:{
        type:Types.ObjectId,
        ref:"User",
        required:[true,"Please Provide Sender Name"],
    },
    receiver:{
        type:Types.ObjectId,
        ref:"User",
        required:[true,"Please Provide Receiver Name"],
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending","accepted","rejected"]
    },

},{timestamps:true});

const Request = mongoose.models.Request || mongoose.model("Request",requestSchema);

export default Request;