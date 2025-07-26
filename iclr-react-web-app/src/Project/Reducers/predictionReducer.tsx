import { createSlice } from "@reduxjs/toolkit";

const predictionSlice = createSlice({
    name: "prediction",
    initialState: {
        currentPreds: [],
    },
    reducers: {
        setCurrentPreds: (state, action) => {
            state.currentPreds = action.payload;
        },
        addPrediction: (state, action) => {
            state.currentPreds.push(action.payload);
        },
        updatePrediction: (state, action) => {
            const { paper_id, prompt, prediction} = action.payload;
            const index = state.currentPreds.findIndex(pred => pred.paper_id === paper_id);
            if (index !== -1) {
                state.currentPreds[index] = {paper_id: paper_id, prompt: prompt, prediction: prediction};
            } else {
                state.currentPreds.push({paper_id: paper_id, prompt: prompt, prediction: prediction});
            }
        },
    },
});

export const { setCurrentPreds, addPrediction, updatePrediction } = predictionSlice.actions;
export default predictionSlice.reducer;