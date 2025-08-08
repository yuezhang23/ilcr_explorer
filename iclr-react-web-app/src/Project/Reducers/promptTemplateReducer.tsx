import { createSlice } from "@reduxjs/toolkit";

const promptTemplateSlice = createSlice({
    name: "promptTemplate",
    initialState: {
        promptTemplates: [],
    },
    reducers: {
        setPromptTemplates: (state, action) => {
            state.promptTemplates = action.payload;
        },
    },
});

export const { setPromptTemplates } = promptTemplateSlice.actions;
export default promptTemplateSlice.reducer; 