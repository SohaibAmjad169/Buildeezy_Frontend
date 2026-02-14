import { createSlice } from "@reduxjs/toolkit";

import { ALERT_TYPE } from "../utils/constants/config";
// import { getLocalStorage } from "../utils/localStorageUtils";
// import { USER_DATA } from "../utils/constants/auth";

const initialState = {
  loading: false,
  alert: {
    show: false,
    type: ALERT_TYPE.error,
    message: "",
    subMessage: "",
  },
  showLogoLeft: false,
  countries: [],
  cities: [],
  loadData: false,
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAlert: (state, action) => {
      state.alert.show = action.payload.show;
      state.alert.type = action.payload.type;
      state.alert.message = action.payload.message;
      state.alert.subMessage = action.payload.subMessage;
    },
    setShowLogoLeft: (state, action) => {
      state.showLogoLeft = action.payload;
    },
    setCountries: (state, action) => {
      state.countries = action.payload;
    },
    setCities: (state, action) => {
      state.cities = action.payload;
    },
    setLoadData: (state, action) => {
      state.loadData = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setAlert,
  setLoading,
  setShowLogoLeft,
  setCountries,
  setCities,
  setLoadData,
} = configSlice.actions;

export default configSlice.reducer;
