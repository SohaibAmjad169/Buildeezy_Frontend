import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questionWizard: [],
  isUploading: { id: null, status: false },
};

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setQuestionWizard: (state, action) => {
      state.questionWizard = action.payload;
    },
    setQuestionValidation: (state, action) => {
      const step = action.payload.step;
      const isValid = action.payload.isValid;
      state.questionWizard[step].validation.valid = isValid;
    },
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
  },
});

export const { setQuestionWizard, setQuestionValidation, setIsUploading } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
