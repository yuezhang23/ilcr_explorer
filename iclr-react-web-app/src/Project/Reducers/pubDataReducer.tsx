import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pubData: [],
}

const pubDataSlice = createSlice({
    name: "pubData",
    initialState,
    reducers: {
        setPubData(state, action) {
            state.pubData = action.payload;
        }
    }
});

export const { setPubData } = pubDataSlice.actions;
export default pubDataSlice.reducer;