import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notificationsList: [],
	isLoading: false,
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notificationsList = action.payload;
    },
		setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setNotifications,
	setIsLoading,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
