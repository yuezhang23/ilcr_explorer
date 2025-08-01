import { createSlice } from "@reduxjs/toolkit";

const predictionSlice = createSlice({
    name: "prediction",
    initialState: {
        currentPreds: [],
        rebuttalPreds: [], // New: predictions with rebuttal
        nonRebuttalPreds: [], // New: predictions without rebuttal
    },
    reducers: {
        setCurrentPreds: (state, action) => {
            state.currentPreds = action.payload;
        },
        setRebuttalPreds: (state, action) => {
            state.rebuttalPreds = action.payload;
        },
        setNonRebuttalPreds: (state, action) => {
            state.nonRebuttalPreds = action.payload;
        },
        addPrediction: (state, action) => {
            state.currentPreds.push(action.payload);
        },
        updatePrediction: (state, action) => {
            const { paper_id, prompt, prediction} = action.payload;
            const index = state.currentPreds.findIndex(pred => pred.paper_id === paper_id);
            if (index !== -1) {
                state.currentPreds[index] = {paper_id: paper_id, prompt: prompt, prediction: prediction.toLowerCase() === 'yes' ? "Accept" : "Reject"};
            } else {
                state.currentPreds.push({paper_id: paper_id, prompt: prompt, prediction: prediction.toLowerCase() === 'yes' ? "Accept" : "Reject"});
            }
        },
    },
});

export const { setCurrentPreds, setRebuttalPreds, setNonRebuttalPreds, addPrediction, updatePrediction } = predictionSlice.actions;
export default predictionSlice.reducer;