import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        minlength:3,
        maxlength:30,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        match: [
             /^\S+@\S+\.\S+$/,
             "Please provide a valid email address",
        ],
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:8,
        maxlength:72,
        validate: {
        validator: function (value) {
            return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/.test(value);
            },
         message:
         "Password must contain at least one uppercase letter, one number, and one symbol",
         },
     },
     refreshToken:{
        type:String,
     }
},
{
    timestamps:true
})
userSchema.pre("save",async function () {
    if(!this.isModified("password")) return //checks if password is modified 
    this.password=await bcrypt.hash(this.password,12)// 12 salts for better security
})       
userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password);
}    
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    
)
}

export const User=mongoose.model("User",userSchema)//will be stored as users in database 