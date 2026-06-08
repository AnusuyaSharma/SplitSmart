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

userSchema.index({emailId: 1});
const User = mongoose.model("User", userSchema);

export default User;