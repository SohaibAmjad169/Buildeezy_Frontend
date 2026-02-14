import { createSlice } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

import {
  AD_PROFESSIONAL_TYPE,
  AD_QUESTIONS,
  DESIGN_QUESTIONS,
} from "../utils/constants/ad";
import { FIELD_TYPES } from "../utils/constants/login";

// Initialize design questions with proper structure
const initializedDesignQuestions = DESIGN_QUESTIONS.map((question) => ({
  ...question,
  value:
    question.defaultValue ||
    question.value ||
    (question.type === FIELD_TYPES.multipleSelect ? [] : ""),
}));

const initialState = {
  postAdData: [...AD_QUESTIONS, ...initializedDesignQuestions],
  adList: [],
  adDetails: {},
  adsResponse: null,
  // ADD: Analytics state
  analytics: null,
  analyticsLoading: false,
};

export const adSlice = createSlice({
  name: "ad",
  initialState,
  reducers: {
    setPostAdData: (state, action) => {
      state.postAdData = action.payload;
    },
    setPostAdDataValue: (state, action) => {
      const { id, value } = action.payload;
      const newPostAdData = cloneDeep(state.postAdData);
      const fieldIndex = newPostAdData.findIndex((el) => el.id === id);

      // If field not found, it might be a design field
      if (fieldIndex === -1) {
        const designField = DESIGN_QUESTIONS.find((field) => field.id === id);
        if (designField) {
          // Add the design field with its value
          newPostAdData.push({
            ...designField,
            value: value,
          });
        }
      } else {
        // Update existing field
        if (newPostAdData[fieldIndex].child && value === "pickADate") {
          newPostAdData[fieldIndex].child.data[0].value = "";
          newPostAdData[fieldIndex].child.data[1].value = "";
          newPostAdData[fieldIndex].child.show = true;
        } else {
          if (newPostAdData[fieldIndex].child) {
            newPostAdData[fieldIndex].child.show = false;
          }
        }

        if (newPostAdData[fieldIndex].type === FIELD_TYPES.upload) {
          newPostAdData[fieldIndex].value =
            typeof value === "function"
              ? value(state.postAdData[fieldIndex].value)
              : value;
        } else {
          newPostAdData[fieldIndex].value = value;
        }

        // Handle audience field changes
        if (id === "audience") {
          const fieldProfessionalIndex = newPostAdData.findIndex(
            (el) => el.id === "professionalType"
          );
          if (
            newPostAdData[fieldIndex].value.length === 1 &&
            newPostAdData[fieldIndex].value[0] === "client"
          ) {
            if (fieldProfessionalIndex !== -1) {
              newPostAdData.splice(fieldProfessionalIndex, 1);
            }
          } else {
            if (fieldProfessionalIndex === -1) {
              newPostAdData.splice(fieldIndex + 1, 0, {
                ...AD_PROFESSIONAL_TYPE,
              });
            }
          }
        }

        // Handle ad type changes for learning solution
        if (id === "adType") {
          if (value === "learningSolution") {
            // Remove URL field
            const urlFieldIndex = newPostAdData.findIndex(
              (el) => el.id === "url"
            );
            if (urlFieldIndex !== -1) {
              newPostAdData.splice(urlFieldIndex, 1);
            }

            // Remove all design fields except call to action and display on dashboard
            const designFieldsToRemove = DESIGN_QUESTIONS.filter(
              (field) =>
                field.id !== "callToAction" && field.id !== "displayOnDashboard"
            );
            designFieldsToRemove.forEach((field) => {
              const designFieldIndex = newPostAdData.findIndex(
                (el) => el.id === field.id
              );
              if (designFieldIndex !== -1) {
                newPostAdData.splice(designFieldIndex, 1);
              }
            });

            // Add call to action field if not present
            const callToActionField = DESIGN_QUESTIONS.find(
              (field) => field.id === "callToAction"
            );
            if (callToActionField) {
              const callToActionIndex = newPostAdData.findIndex(
                (el) => el.id === "callToAction"
              );
              if (callToActionIndex === -1) {
                newPostAdData.push({
                  ...callToActionField,
                  value: "",
                });
              }
            }

            // Add display on dashboard field if not present
            const displayOnDashboardField = DESIGN_QUESTIONS.find(
              (field) => field.id === "displayOnDashboard"
            );
            if (displayOnDashboardField) {
              const displayOnDashboardIndex = newPostAdData.findIndex(
                (el) => el.id === "displayOnDashboard"
              );
              if (displayOnDashboardIndex === -1) {
                newPostAdData.push({
                  ...displayOnDashboardField,
                  value: "",
                });
              }
            }
          } else {
            // Restore URL field if it was removed
            const urlFieldIndex = newPostAdData.findIndex(
              (el) => el.id === "url"
            );
            if (urlFieldIndex === -1) {
              const urlField = AD_QUESTIONS.find((field) => field.id === "url");
              if (urlField) {
                newPostAdData.push({
                  ...urlField,
                  value: "",
                });
              }
            }

            // Restore all design fields
            DESIGN_QUESTIONS.forEach((field) => {
              const designFieldIndex = newPostAdData.findIndex(
                (el) => el.id === field.id
              );
              if (designFieldIndex === -1) {
                newPostAdData.push({
                  ...field,
                  value: field.value || "",
                });
              }
            });
          }
        }
      }

      state.postAdData = newPostAdData;
    },
    setAdList: (state, action) => {
      state.adList = action.payload;
    },
    setAdDetails: (state, action) => {
      state.adDetails = action.payload;
    },
    setAdsResponse: (state, action) => {
      state.adsResponse = action.payload;
    },
    // ADD: New analytics reducers
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    setAnalyticsLoading: (state, action) => {
      state.analyticsLoading = action.payload;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
      state.analyticsLoading = false;
    },
  },
});

// Action creators are generated for each case reducer function
// ADD: Export new analytics actions along with existing ones
export const { 
  setPostAdData, 
  setPostAdDataValue, 
  setAdList, 
  setAdDetails, 
  setAdsResponse,
  setAnalytics,
  setAnalyticsLoading,
  clearAnalytics
} = adSlice.actions;

export default adSlice.reducer;