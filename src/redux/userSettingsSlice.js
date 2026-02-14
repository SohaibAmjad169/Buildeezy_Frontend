import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userSettings: {},
  userSettingsIsLoading: false,
};

export const userSettingsSlice = createSlice({
  name: "userSettings",
  initialState,
  reducers: {
    setUserSettings: (state, action) => {
      state.userSettings = action.payload;
    },
    setUserSettingsIsLoading: (state, action) => {
      state.userSettingsIsLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUserSettings, setUserSettingsIsLoading } = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
