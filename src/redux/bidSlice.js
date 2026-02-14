import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bidList: [],
  bidDetails: {},
};

export const bidSlice = createSlice({
  name: "bid",
  initialState,
  reducers: {
    setBidList: (state, action) => {
      state.bidList = action.payload;
    },
    setUpdatedBidData: (state, action) => {
      const { bidId, updatedDetails } = action.payload;
      const findIndex = state.bidList.findIndex((bid) => bid.id === bidId);
      state.bidList[findIndex] = {
        ...state.bidList[findIndex],
        ...updatedDetails,
      };
    },
    setBidDetails: (state, action) => {
      state.bidDetails = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setBidList, setUpdatedBidData, setBidDetails } =
  bidSlice.actions;

export default bidSlice.reducer;
