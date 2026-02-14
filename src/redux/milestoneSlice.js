import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  milestoneLoading: false,
  stateLoading: false,
  dialogLoading: false,
};

export const milestoneSlice = createSlice({
  name: "milestone",
  initialState,
  reducers: {
    setMilestoneLoading: (state, action) => {
      state.milestoneLoading = action.payload;
    },
    setStateLoading: (state, action) => {
      state.stateLoading = action.payload;
    },
    setDialogLoading: (state, action) => {
      state.dialogLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setMilestoneLoading, setStateLoading, setDialogLoading } =
  milestoneSlice.actions;

export default milestoneSlice.reducer;
