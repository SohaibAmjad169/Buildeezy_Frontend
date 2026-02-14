import { createSlice } from "@reduxjs/toolkit";
import {
  REGISTER_ACCOUNT_DETAILS,
  REGISTER_AUTH,
} from "../utils/constants/login";

const initialState = {
  userType: "",
  accountDetails: REGISTER_ACCOUNT_DETAILS,
  authDetails: REGISTER_AUTH,
  term: false,
  isSocialRegister: false,
  provider: {
    id: "",
    type: "",
  },
};

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    setAccountDetails: (state, action) => {
      state.accountDetails = action.payload;
    },
    setAuthDetails: (state, action) => {
      state.authDetails = action.payload;
    },
    setTerm: (state, action) => {
      state.term = action.payload;
    },
    setIsSocialRegister: (state, action) => {
      state.isSocialRegister = action.payload;
    },
    setProvider: (state, action) => {
      state.provider.id = action.payload.id;
      state.provider.type = action.payload.type;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setUserType,
  setAccountDetails,
  setAuthDetails,
  setTerm,
  setIsSocialRegister,
  setProvider,
} = registerSlice.actions;

export default registerSlice.reducer;
