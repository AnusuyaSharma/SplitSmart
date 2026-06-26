import mongoose from "mongoose";
import express from "express";
import Group from "../models/group.js";
import userAuth from "../middlewares/auth.js";
import User from "../models/user.js";

const groupRouter = express.Router();

groupRouter.post("/group/create", userAuth, async(req,res) => {
    try {
        const {name, members, type} = req.body;
        if(!name || !name.trim()){
            return res.status(400).send("Group name is required!");
        }
        
        const memberIds = await User.validateMembers(members);

        const creatorId = req.user._id;

        const uniqueMembers = [...new Set([...memberIds.map((id) => id.toString()), creatorId.toString()]),];

        const group = new Group({
            name: name,
            createdBy: creatorId,
            members: uniqueMembers,
            type: type,
        });

        await group.save();

        res.status(201).json({
            message:"Group created successfully!",
            group
        });

    } catch (error) {
        res.status(400).send(error.message);
    }
})

groupRouter.get("/group/all", userAuth, async(req,res) =>{
    try {
        const userId = req.user._id;
        const getUserData = await Group.find({members: userId});
        res.status(201).json({
            message: "Successfully fetched all groups of the user!",
            getUserData
        });
    } catch (error) {
        res.status(400).send("Error fetching groups created by the user!");
    }
})

groupRouter.get("/group/:groupId", userAuth, async(req,res) => {
    try {
        const {groupId} = req.params;
        const group = await Group.findById(groupId).populate("members", "_id name");
        res.status(200).json({
            message:"Fetched group successfully!",
            group
        });
    } catch (error) {
        res.status(400).send("Error fetching this group");
    }
})

groupRouter.post("/group/:groupId/member", userAuth, async(req,res)=> {
    try {
        const {groupId} = req.params;
        const {members} = req.body;
       
        await User.validateMembers(members);
        const group = await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: {members: { $each: members}}}, //For each id in members from the body, add it to group.members if it’s not there yet
            {new: true}  //send the updated data after adding the members in the group variable
        );

        if(!group){
            return res.status(400).send("Group not found!");
        }

        res.status(200).json({
            message: "Members added successfully!",
            group
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
})

groupRouter.delete("/group/:groupId/member", userAuth, async(req,res) => {
    try {
        const {groupId} = req.params;

        const {members} = req.body;
        if(!members || members.length <= 0){
            return res.status(400).send("Can't find this user");
        }

        await User.validateMembers(members);

        const group = await Group.findById(groupId);

        if(!group){
            return res.status(400).send("Group not found!");
        }

        const notInGroup = members.filter((member) => !group.members.includes(member));
        
        if(notInGroup.length > 0){
            return res.status(400).send("Member(s) don't exist in the group");
        }

        const updatedMembers = await Group.findByIdAndUpdate(
            groupId,
            { $pull: {members:{$in: members}}},
            {new: true}
        );


        return res.status(200).json({
            message:"User deleted from the group successfully!",
            updatedMembers
        });

    } catch (error) {
        return res.status(400).send(error.message);
    }
})

//For deleting a group entirely
groupRouter.delete("/group/:groupId", userAuth, async(req,res) => {
    try {
        const {groupId}= req.params;
        console.log(groupId);
        if(!groupId || !mongoose.Types.ObjectId.isValid(groupId)){
            return res.status(400).send("Invalid group id");
        }
        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).send("Group not found!");
        }
        const isUserAuthorized = group.createdBy.equals(req.user._id);
        if(!isUserAuthorized){
            return res.status(400).send("User not authorized to delete the group!");
        }
        await Group.findByIdAndDelete(groupId);
        return res.status(200).send("Group successfully deleted!");
    } catch (error) {
        return res.status(500).send("Error deleting the group");
    }
})

export default groupRouter;