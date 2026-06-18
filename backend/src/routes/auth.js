import validateSignedUpData from "../utils/validation.js";
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import userAuth from "../middlewares/auth.js";
const authRouter = express.Router();

authRouter.post("/signup", async(req,res) => {
    try {
        validateSignedUpData(req);
    
        const {name,emailId, password} = req.body;
    
        const passwordHash = await bcrypt.hash(password, 10);
    
        const user = new User({
            name,
            emailId,
            password: passwordHash
        });
    
        await user.save();

        res.send("User added successfully!!");
        
    } catch (error) {
        res.status(500).send(error.message);
    }
})

authRouter.post("/login", async(req,res) => {
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId: emailId});

        if(!user){
            res.status(400).send("Invalid credentials");
        }

        const isPasswordValid = await user.validatePassword(password);
        
        if(isPasswordValid){
            const token = await user.getJWT();
            res.cookie("token", token, {
                expires: new Date(Date.now() + 900000),
            });
            res.send("Login successful");
        }
        else{
            throw new Error("Invalid credentials");
        }

    } catch (error) {
        res.status(400).send("Internal server error");        
    }
})

authRouter.post("/logout", async(req,res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logged out successfully!");
})

authRouter.get("/profile/view", userAuth, async(req,res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (error) {
        res.status(400).send("Error fetching user profile")
    }
})

authRouter.patch("/profile/edit", userAuth, async(req,res) => {
    try {
        const {name} = req.body;

        if(!name || typeof name !== "string" || !name.trim()){
            return res.status(400).send("Name is required and must be a string!");
        }

        req.user.name = name.trim();
        await req.user.save();
        res.send("Profile updated successfully!");
    } catch (error) {
        res.status(400).send("Error updating profile!");
    }
})

authRouter.delete("/profile/delete", userAuth, async(req,res) => {
    try {
        const user = req.user;
        await User.findByIdAndDelete({_id: user._id});
        res.cookie("token", null, {expires: new Date(Date.now())});
        res.status(200).send("Profile deleted successfully!");
    } catch (error) {
        console.log(error);
        res.status(400).send("Error deleting the profile!");
    }
})

export default authRouter;

