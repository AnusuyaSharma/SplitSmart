import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps:true
});

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id}, "SplitSmartSecret", {
        expiresIn: "1d"
    });

    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser){
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);

    return isPasswordValid;

}

userSchema.statics.validateMembers = async function(members){
        if(!Array.isArray(members)){
            throw new Error("Members must be a valid array");
        }
    
        if(members.length <= 0){
            throw new Error("Add minimum 1 member");
        }
    
        const users = await User.find({emailId: {$in: members}}, 
            {_id:1})            //projects only id field of the entire document and not the entire document
            .lean();            // to just return the JS object and not the entire thing
    
        if(members.length !== users.length){
            throw new Error("One or more members dont exist");
        }

        const userIds = users.map((user) => user._id);
        
        return userIds;
}

userSchema.index({emailId: 1});
const User = mongoose.model("User", userSchema);

export default User;