import  mongoose  from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"Please Provide Full Name"]
    },
    username:{
        type:String,
        required:[true,"Please Provide Username"],
        trim:true,  
        unique:true
    },
    password:{
        type:String,
        required:[true,"PLease Provide Password"],
        select:false
    },
    bio:String,
    avatar:{
        public_id:{
            type:String,
            // required:true
        },
        url:{
            type:String,
            // required:true
        }
    },
    // refreshToken:{
    //     type:String,
    //     select:false
    // }
},{timestamps:true});

userSchema.pre("save", async function(next){
    
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});


userSchema.methods.isPasswordValidate = async function(password){
    return await bcrypt.compare(password,this.password);
} 

userSchema.methods.generateAccessToken = async function (){
    return jwt.sign({_id: this._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

// userSchema.methods.generateRefreshToken = async function(){
//     return jwt.sign({_id: this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
//     )
// }

const User = mongoose.models.User || mongoose.model("User",userSchema);

export default User;