import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
    from: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    expenseIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense"
    }],
},{
    timestamps: true
})

const Settlement = new mongoose.model("Settlement", settlementSchema);

export default Settlement;