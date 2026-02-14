import i18next from "../../i18n";
import {
  validateArray,
  validateCountryCity,
  validateIsEmpty,
  validateSelect,
} from "../common";
import { JOB_TYPE_OPTIONS } from "./job";
import { FIELD_TYPES } from "./login";

export const HOW_MUCH_OPTIONS = [
  {
    id: "lessThan100",
    label: "Less than 100",
  },
  {
    id: "100To500",
    label: "100 to 500",
  },
  {
    id: "500To1000",
    label: "500 to 1000",
  },
  {
    id: "1000To5000",
    label: "1000 to 5000",
  },
  {
    id: "5000To10000",
    label: "5000 to 10000",
  },
  {
    id: "10000+",
    label: "10000 +",
  },
];

// FIXED: Convert JOB_TYPE_OPTIONS to use 'label' instead of 'labelKey'
const getServiceOptions = (t) => {
  const baseOptions = JOB_TYPE_OPTIONS.map(option => ({
    id: option.id,
    label: option.labelKey ? t(option.labelKey) : option.id.charAt(0).toUpperCase() + option.id.slice(1)
  }));
  
  // Add "Other" option at the end
  baseOptions.push({
    id: "other",
    label: t("services.other") || "Other"
  });
  
  return baseOptions;
};

// Add fallback service options in case JOB_TYPE_OPTIONS is empty or not available
const FALLBACK_SERVICE_OPTIONS = [
  { id: "general", label: "General" },
  { id: "construction", label: "Construction" },
  { id: "renovation", label: "Renovation" },
  { id: "painting", label: "Painting" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical Work" },
  { id: "airCondition", label: "Air Conditioning" },
  { id: "tiling", label: "Tiling" },
  { id: "gardeningLandscaping", label: "Gardening & Landscaping" },
  { id: "cleaning", label: "Cleaning" },
  { id: "laundry", label: "Laundry" },
  { id: "other", label: "Other" }, // Add Other option to fallback too
];

export const REVIEW_QUESTIONS = [
  {
    id: "likes",
    label: i18next.t("review.question6"),
    type: FIELD_TYPES.quillEditor,
    placeholder: i18next.t("review.question6_placeholder"),
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "dislikes",
    label: i18next.t("review.question7"),
    type: FIELD_TYPES.quillEditor,
    placeholder: i18next.t("review.question7_placeholder"),
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "rating",
    label: i18next.t("review.question8"),
    type: FIELD_TYPES.rating,
    value: [
      {
        id: "quality",
        value: "",
        reasonId: "qualityReason",
        reason: "",
      },
      {
        id: "timelineMeeetings",
        value: "",
        reasonId: "timelineMeeetingsReason",
        reason: "",
      },
      {
        id: "costing",
        value: "",
        reasonId: "costingReason",
        reason: "",
      },
      {
        id: "experince",
        value: "",
        reasonId: "experinceReason",
        reason: "",
      },
    ],
    validation: {
      required: true,
      rules: validateArray,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
];

export function getAddReviewQuestions(t) {
  console.log("🔍 JOB_TYPE_OPTIONS:", JOB_TYPE_OPTIONS);
  
  // Get service options with proper labels
  const serviceOptions = JOB_TYPE_OPTIONS && JOB_TYPE_OPTIONS.length > 0 
    ? getServiceOptions(t) 
    : FALLBACK_SERVICE_OPTIONS;

  console.log("🔍 Service options for dropdown:", serviceOptions);

  return [
    {
      id: "userId",
      label: t("review.question1"),
      subtitle: t("review.question1_subtitle") || "Search and select the contractor you worked with",
      subtitle2: t("review.question1_subtitle2") || "Search for the professional you'd like to review by name",
      placeholder: t("review.question1_placeholder"),
      type: FIELD_TYPES.userAutocomplete,
      value: "",
      options: [],
      validation: {
        required: true,
        rules: validateIsEmpty,
        msg: t("errors.field_required"),
        error: "",
        valid: false,
      },
    },
    {
      id: "jobId",
      label: t("review.select_job_label"),
      subtitle: t("review.select_job_subtitle") || "Select the specific job or project this review relates to",
      subtitle2: t("review.select_job_subtitle2") || "Choose the job where you worked with this contractor",
      type: FIELD_TYPES.select,
      placeholder: t("review.select_job_placeholder"),
      value: "",
      options: [],
      validation: {
        required: true,
        rules: validateSelect,
        msg: t("errors.field_required"),
        error: "",
        valid: false,
      },
    },
    {
      id: "customJobDetails",
      label: t("review.custom_job_details") || "Other Job Details",
      subtitle2: t("review.custom_job_details_subtitle2") || "Describe the work completed by this contractor",
      placeholder: t("review.custom_job_details_placeholder") || "Enter details about the work performed (type of work, duration, specific tasks, materials used, etc.)",
      type: FIELD_TYPES.text, // Use text instead of textarea for better compatibility
      value: "",
      validation: {
        required: true, // Make it required when visible
        rules: validateIsEmpty,
        msg: t("review.custom_job_details_validation") || "Please provide job details",
        error: "",
        valid: false, // Start as invalid since it's required
      },
      dependsOn: "jobId", // Show only when jobId has specific value
      dependsOnValue: "other", // Show when jobId equals "other" instead of "custom"
    },
    {
      id: "location",
      label: t("review.question2") || "Where was the work performed?",
      type: FIELD_TYPES.countryCity,
      placeholder: t("review.question2_placeholder") || "Enter location",
      value: {
        country: null,
        city: null,
      },
      validation: {
        required: true,
        rules: validateCountryCity,
        msg: t("errors.field_required") || "Please select location",
        error: "",
        valid: false,
      },
    },
    {
      id: "when",
      label: t("review.question3"),
      type: FIELD_TYPES.dates,
      value: [
        { id: "startDate", value: "" },
        { id: "endDate", value: "" },
      ],
      validation: {
        required: true,
        rules: validateArray,
        msg: t("errors.field_required"),
        error: "",
        valid: false,
      },
    },
    {
      id: "cost",
      label: t("review.question4") || "How much did you pay?",
      type: FIELD_TYPES.select,
      placeholder: t("review.question4_placeholder") || "Select amount",
      value: "",
      options: HOW_MUCH_OPTIONS,
      validation: {
        required: true,
        rules: validateSelect,
        msg: t("errors.field_required") || "Please select an amount",
        error: "",
        valid: false,
      },
    },
    {
      id: "services",
      label: t("review.question5") || "What services were provided?",
      type: FIELD_TYPES.multipleSelect,
      placeholder: t("review.question5_placeholder") || "Search for services",
      value: [],
      options: serviceOptions, // FIXED: Use properly formatted service options
      validation: {
        required: true,
        rules: validateSelect,
        msg: t("errors.field_required") || "Please select at least one service",
        error: "",
        valid: false,
      },
    },
    // NEW: Custom service details field (shows only when "other" is selected in services)
    {
      id: "customServiceDetails",
      label: t("review.custom_service_label") || "Other Service Details",
      subtitle2: t("review.custom_service_subtitle2") || "Describe the other services",
      placeholder: t("review.custom_service_subtitle") || "Enter details about other services provided...",
      type: FIELD_TYPES.text,
      value: "",
      validation: {
        required: true, // Required when visible
        rules: validateIsEmpty,
        msg: t("review.custom_service_validation") || "Please specify the other services",
        error: "",
        valid: false,
      },
      dependsOn: "services", // Show only when services contains "other"
      dependsOnValue: "other", // Show when services array includes "other"
    },
    
    ...getReviewQuestions(t),
  ];
}

export function getReviewQuestions(t) {
  return [
    {
      id: "likes",
      label: t("review.question6") || "What did you like about working with this contractor?",
      subtitle: t("review.question6_subtitle") || "Share the positive aspects of your experience",
      subtitle2: t("review.question6_subtitle2") || "Tell others what went well",
      type: FIELD_TYPES.quillEditor,
      placeholder: t("review.question6_placeholder") || "Enter description here",
      value: "",
      validation: {
        required: true,
        rules: validateIsEmpty,
        msg: t("errors.field_required") || "Please share what you liked",
        error: "",
        valid: false,
      },
    },
    {
      id: "dislikes",
      label: t("review.question7") || "What could have been better?",
      subtitle: t("review.question7_subtitle") || "Share any areas for improvement",
      subtitle2: t("review.question7_subtitle2") || "Help others understand any issues",
      type: FIELD_TYPES.quillEditor,
      placeholder: t("review.question7_placeholder") || "Enter description here",
      value: "",
      validation: {
        required: true,
        rules: validateIsEmpty,
        msg: t("errors.field_required") || "Please share areas for improvement",
        error: "",
        valid: false,
      },
    },
    {
      id: "rating",
      label: t("review.question8") || "Rate different aspects of the work",
      subtitle: t("review.question8_subtitle") || "Rate quality, timing, cost, and experience",
      subtitle2: t("review.question8_subtitle2") || "Provide ratings for each category",
      type: FIELD_TYPES.rating,
      value: [
        {
          id: "quality",
          value: "",
          reasonId: "qualityReason",
          reason: "",
        },
        {
          id: "timelineMeeetings",
          value: "",
          reasonId: "timelineMeeetingsReason",
          reason: "",
        },
        {
          id: "costing",
          value: "",
          reasonId: "costingReason",
          reason: "",
        },
        {
          id: "experince",
          value: "",
          reasonId: "experinceReason",
          reason: "",
        },
      ],
      validation: {
        required: true,
        rules: validateArray,
        msg: t("errors.field_required") || "Please provide ratings",
        error: "",
        valid: false,
      },
    },
  ];
}

// Updated static array with custom job details
export const ADD_REVIEW_QUESTIONS = [
  {
    id: "userId",
    label: i18next.t("review.question1"),
    subtitle2: i18next.t("review.question1_subtitle2"),
    placeholder: i18next.t("review.question1_placeholder"),
    type: FIELD_TYPES.userAutocomplete,
    value: "",
    options: [],
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "jobId",
    label: i18next.t("review.select_job_label"),
    type: FIELD_TYPES.select,
    placeholder: i18next.t("review.select_job_placeholder"),
    value: "",
    options: [],
    validation: {
      required: true,
      rules: validateSelect,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  // NEW: Custom job details field
  {
    id: "customJobDetails",
    label: i18next.t("review.custom_job_details") || "Job Details",
    type: FIELD_TYPES.textarea || FIELD_TYPES.quillEditor,
    placeholder: i18next.t("review.custom_job_details_placeholder") || "Enter details about the work performed...",
    value: "",
    validation: {
      required: false,
      rules: validateIsEmpty,
      msg: i18next.t("review.custom_job_details_validation") || "Please provide job details",
      error: "",
      valid: true,
    },
    dependsOn: "jobId",
    dependsOnValue: "custom",
  },
  {
    id: "location",
    label: i18next.t("review.question2"),
    type: FIELD_TYPES.countryCity,
    placeholder: i18next.t("review.question2_placeholder"),
    value: {
      country: { name: "" },
      city: { name: "" },
    },
    validation: {
      required: true,
      rules: validateCountryCity,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "when",
    label: i18next.t("review.question3"),
    type: FIELD_TYPES.dates,
    value: [
      { id: "startDate", value: "" },
      { id: "endDate", value: "" },
    ],
    validation: {
      required: true,
      rules: validateArray,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "cost",
    label: i18next.t("review.question4"),
    type: FIELD_TYPES.select,
    placeholder: i18next.t("review.question4_placeholder"),
    value: "",
    options: HOW_MUCH_OPTIONS,
    validation: {
      required: true,
      rules: validateSelect,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "services",
    label: i18next.t("review.question5"),
    type: FIELD_TYPES.multipleSelect,
    placeholder: i18next.t("review.question5_placeholder"),
    value: [],
    options: FALLBACK_SERVICE_OPTIONS, // Use fallback options for static array
    validation: {
      required: true,
      rules: validateSelect,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  ...REVIEW_QUESTIONS,
];