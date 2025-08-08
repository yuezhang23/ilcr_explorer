import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentIclr: [],
  currentIclrName: "",
}


const iclrSlice = createSlice({
  name: "iclr",
  initialState,
  reducers: {
    setIclr(state, action) {
      state.currentIclr = action.payload;
    },
    setIclrName(state, action) {
      state.currentIclrName = action.payload;
    }
  },
});

export const { setIclr, setIclrName } = iclrSlice.actions;
export default iclrSlice.reducer;