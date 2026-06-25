import {configureStore} from "@reduxjs/toolkit";
import userReducer from "./userSlice.js";
import groupReducer from "./groupSlice.js";

const appStore = configureStore({
    reducer:{
        user: userReducer,
        group: groupReducer,
    }

});

export default appStore;