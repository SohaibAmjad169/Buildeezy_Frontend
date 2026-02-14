import { createSlice } from "@reduxjs/toolkit";
import { USER_DATA } from "../utils/constants/auth";
import { getLocalStorage } from "../utils/localStorageUtils";

const initialState = {
  profileLoading: false,
  profileData: getLocalStorage(USER_DATA, true)?.user || "",
  veriffStatus: "",
  reviews: [],
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileLoading: (state, action) => {
      state.profileLoading = action.payload;
    },
    setProfileData: (state, action) => {
      state.profileData = action.payload;
      // Update local storage when profile data changes
      if (action.payload) {
        const userData = getLocalStorage(USER_DATA, true);
        if (userData) {
          userData.user = action.payload;
          localStorage.setItem(USER_DATA, JSON.stringify(userData));
        }
      }
    },
    setVeriffStatus: (state, action) => {
      state.veriffStatus = action.payload;
    },
    updateVerificationStatus: (state, action) => {
      const { isVerified, veriffStatus } = action.payload;
      state.profileData.isVerified = isVerified;
      state.veriffStatus = veriffStatus;
      
      // Update local storage
      const userData = getLocalStorage(USER_DATA, true);
      if (userData && userData.user) {
        userData.user.isVerified = isVerified;
        localStorage.setItem(USER_DATA, JSON.stringify(userData));
      }
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setProfileLoading,
  setProfileData,
  setVeriffStatus,
  updateVerificationStatus,
  setReviews,
} = profileSlice.actions;

export default profileSlice.reducer;
