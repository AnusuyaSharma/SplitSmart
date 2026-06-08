import mongoose from "mongoose";
import express from "express";
import Group from "../models/group.js";
import userAuth from "../middlewares/auth.js";

const groupRouter = express.Router();

groupRouter.post("/create-group", userAuth, async(req,res) => {
    try {
        const {name, members} = req.body;
        if(!name || !name.trim()){
            return res.status(400).send("Group name is required!");
        }
        if(!Array.isArray(members)){
            return res.status(400).send("Members must be an array");
        }
        if(members.length <= 0){
            return res.status(400).send("Add minimum 1 member to the group");
        }

        const inValidMembers = members.filter((id) => 
            !mongoose.Types.ObjectId.isValid(id)
        );

        if(inValidMembers.length > 0 ){
            return res.status(400).send("Invalid members added");
        }

        const creatorId = req.user._id;

        const uniqueMembers = [...new Set([...members, creatorId.toString()]),];

        const group = new Group({
            name: name,
            createdBy: creatorId,
            members: uniqueMembers,
        });

        await group.save();
        
        res.status(201).json({
            message:"Group created successfully!",
            group
        });

    } catch (error) {
        res.status(400).send("Failed to create the group!");
    }
})

export default groupRouter;