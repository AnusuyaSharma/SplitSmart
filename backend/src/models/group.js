import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    type: {
        type: String,
        enum: ["Home","Trip","Work", "Other"],
        default: "Other"
    }
});

const Group = mongoose.model("Group", groupSchema); 

export default Group;