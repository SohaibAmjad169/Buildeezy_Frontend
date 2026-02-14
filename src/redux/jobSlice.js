import { createSlice } from "@reduxjs/toolkit";
import { cloneDeep, isArray } from "lodash";

import { FIELD_TYPES } from "../utils/constants/login";
import { JOB_QUESTIONS, mapQuestions } from "../utils/constants/job";

const initialState = {
  postJobData: JOB_QUESTIONS,
  jobDetails: {},
  myContractList: [],
  fetchNextLoading: false,
};

export const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    setPostJobData: (state, action) => {
      state.postJobData = action.payload;
    },
    setPostJobDataValue: (state, action) => {
      const { id, value } = action.payload;
      let newPostJobData = cloneDeep(state.postJobData);
      const fieldIndex = newPostJobData.findIndex((el) => el.id === id);

      if (
        newPostJobData[fieldIndex].child &&
        (value === "others" || (isArray(value) && value.includes("others")))
      ) {
        newPostJobData[fieldIndex].child.value = "";
        newPostJobData[fieldIndex].child.show = true;
      } else {
        if (newPostJobData[fieldIndex].child) {
          newPostJobData[fieldIndex].child.show = false;
        }
      }

      if (newPostJobData[fieldIndex].type === FIELD_TYPES.upload) {
        newPostJobData[fieldIndex].value = value(
          state.postJobData[fieldIndex].value
        );
      } else {
        newPostJobData[fieldIndex].value = value;
      }

      //adding rest of the questions once first question is filled
      if (id === "title") {
        newPostJobData = [newPostJobData[0], ...mapQuestions[value]];
      }
      state.postJobData = newPostJobData;
    },
    setJobDetails: (state, action) => {
      state.jobDetails = action.payload;
    },
    setMyContractList: (state, action) => {
      state.myContractList = action.payload;
    },
    setFetchNextLoading: (state, action) => {
      state.fetchNextLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setPostJobData,
  setPostJobDataValue,
  setJobDetails,
  setMyContractList,
  setFetchNextLoading,
} = jobSlice.actions;

export default jobSlice.reducer;
