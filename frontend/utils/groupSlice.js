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
        removeGroup: (action, payload) => {
            return [];
        }
    }
})

export const {setGroups, addGroup, removeGroup} = groupSlice.actions;

export default groupSlice.reducer;