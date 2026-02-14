import { createSlice } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

import {
  AD_PROFESSIONAL_TYPE,
  SETUP_QUESTIONS,
  AD_QUESTIONS,
  DESIGN_QUESTIONS,
} from "../utils/constants/webinar";
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
  addWebinarData: [
    ...SETUP_QUESTIONS,
    ...AD_QUESTIONS,
    ...initializedDesignQuestions,
  ],
  webinarList: [],
  webinarDetails: {},
  webinarResponse: null,
};

export const webinarSlice = createSlice({
  name: "webinar",
  initialState,
  reducers: {
    setAddWebinarData: (state, action) => {
      state.addWebinarData = action.payload;
    },
    setAddWebinarDataValue: (state, action) => {
      const { id, value } = action.payload;
      const newAddWebinarData = cloneDeep(state.addWebinarData);
      const fieldIndex = newAddWebinarData.findIndex((el) => el.id === id);

      // If field not found, it might be a design field
      if (fieldIndex === -1) {
        const designField = DESIGN_QUESTIONS.find((field) => field.id === id);
        if (designField) {
          // Add the design field with its value
          newAddWebinarData.push({
            ...designField,
            value: value,
          });
        }
      } else {
        // Update existing field
        if (newAddWebinarData[fieldIndex].child && value === "pickADate") {
          newAddWebinarData[fieldIndex].child.data[0].value = "";
          newAddWebinarData[fieldIndex].child.data[1].value = "";
          newAddWebinarData[fieldIndex].child.show = true;
        } else {
          if (newAddWebinarData[fieldIndex].child) {
            newAddWebinarData[fieldIndex].child.show = false;
          }
        }

        if (newAddWebinarData[fieldIndex].type === FIELD_TYPES.upload) {
          newAddWebinarData[fieldIndex].value =
            typeof value === "function"
              ? value(state.addWebinarData[fieldIndex].value)
              : value;
        } else {
          newAddWebinarData[fieldIndex].value = value;
        }

        // Handle audience field changes
        if (id === "audience") {
          const fieldProfessionalIndex = newAddWebinarData.findIndex(
            (el) => el.id === "professionalType"
          );
          if (
            newAddWebinarData[fieldIndex].value.length === 1 &&
            newAddWebinarData[fieldIndex].value[0] === "client"
          ) {
            if (fieldProfessionalIndex !== -1) {
              newAddWebinarData.splice(fieldProfessionalIndex, 1);
            }
          } else {
            if (fieldProfessionalIndex === -1) {
              newAddWebinarData.splice(fieldIndex + 1, 0, {
                ...AD_PROFESSIONAL_TYPE,
              });
            }
          }
        }

        // Handle ad type changes for learning solution
        if (id === "adType") {
          if (value === "learningSolution") {
            // Remove URL field
            const urlFieldIndex = newAddWebinarData.findIndex(
              (el) => el.id === "url"
            );
            if (urlFieldIndex !== -1) {
              newAddWebinarData.splice(urlFieldIndex, 1);
            }

            // Remove all design fields except call to action and display on dashboard
            const designFieldsToRemove = DESIGN_QUESTIONS.filter(
              (field) =>
                field.id !== "callToAction" && field.id !== "displayOnDashboard"
            );
            designFieldsToRemove.forEach((field) => {
              const designFieldIndex = newAddWebinarData.findIndex(
                (el) => el.id === field.id
              );
              if (designFieldIndex !== -1) {
                newAddWebinarData.splice(designFieldIndex, 1);
              }
            });

            // Add call to action field if not present
            const callToActionField = DESIGN_QUESTIONS.find(
              (field) => field.id === "callToAction"
            );
            if (callToActionField) {
              const callToActionIndex = newAddWebinarData.findIndex(
                (el) => el.id === "callToAction"
              );
              if (callToActionIndex === -1) {
                newAddWebinarData.push({
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
              const displayOnDashboardIndex = newAddWebinarData.findIndex(
                (el) => el.id === "displayOnDashboard"
              );
              if (displayOnDashboardIndex === -1) {
                newAddWebinarData.push({
                  ...displayOnDashboardField,
                  value: "",
                });
              }
            }
          } else {
            // Restore URL field if it was removed
            const urlFieldIndex = newAddWebinarData.findIndex(
              (el) => el.id === "url"
            );
            if (urlFieldIndex === -1) {
              const urlField = AD_QUESTIONS.find((field) => field.id === "url");
              if (urlField) {
                newAddWebinarData.push({
                  ...urlField,
                  value: "",
                });
              }
            }

            // Restore all design fields
            DESIGN_QUESTIONS.forEach((field) => {
              const designFieldIndex = newAddWebinarData.findIndex(
                (el) => el.id === field.id
              );
              if (designFieldIndex === -1) {
                newAddWebinarData.push({
                  ...field,
                  value: field.value || "",
                });
              }
            });
          }
        }
      }

      state.addWebinarData = newAddWebinarData;
    },
    setWebinarList: (state, action) => {
      state.webinarList = action.payload;
    },
    setWebinarDetails: (state, action) => {
      state.webinarDetails = action.payload;
    },
    setWebinarResponse: (state, action) => {
      state.webinarResponse = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setAddWebinarData,
  setAddWebinarDataValue,
  setWebinarList,
  setWebinarDetails,
  setWebinarResponse,
} = webinarSlice.actions;

export default webinarSlice.reducer;
