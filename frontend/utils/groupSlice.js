import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
    name: "group",
    initialState: [],
    reducers: {
        setGroups: (state, action) => {
            return action.payload
        },
        addGroup: (state,action) => {
            state.push(action.payload.group);       //adds one new group
        },
        removeGroup: (state, action) => {
            return state.filter((group) => group.groupId !== action.payload);
        }
    }
})

export const {setGroups, addGroup, removeGroup} = groupSlice.actions;

export default groupSlice.reducer;