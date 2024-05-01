import mongoose from "mongoose";

const DB_NAME = "chat_app";

const connectDB = async ()=>{
    try {
        const connectionRef = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log("MONGODB CONNECTED. HOST IS: ",connectionRef.connection.host);
        
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED: ",error.message);
        process.exit(1);
    }
}
export default connectDB;