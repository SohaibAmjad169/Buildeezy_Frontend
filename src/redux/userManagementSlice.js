import { createSlice } from "@reduxjs/toolkit";

// Initial state for PubNub
const initialState = {
  adminUserList: [],
  userStateLoading: false,
};

// Create slice to manage PubNub state
const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    setAdminUserList: (state, action) => {
      state.adminUserList = action.payload;
    },
    setUserStateLoading: (state, action) => {
      state.userStateLoading = action.payload;
    },
  },
});

export const { setAdminUserList, setUserStateLoading } =
  userManagementSlice.actions;

export default userManagementSlice.reducer;
