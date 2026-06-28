import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    paidBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    splitAmong: [                                                  
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            share: {
                    type: Number,
                    required: true,
                },
            isPaid: {
                type: Boolean,
                default: false,
            }
        },
    ],
},{
    timestamps:true
});

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;


// "splitAmong": [
//   { "user": "userId1", "share": 100 },
//   { "user": "userId2", "share": 100 },
//   { "user": "userId3", "share": 100 }
// ]   not necessary that all users of the group will share the expense
