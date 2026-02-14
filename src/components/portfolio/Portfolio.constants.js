import { FIELD_TYPES } from "../../utils/constants/login";
import i18next from "../../i18n";
import { ALL_FILE_TYPES } from "../../utils/file";
import { SKILLS_OPTIONS } from "../profile/design/DesignTab.constants";
export const PROJECT_CATEGORY_OPTIONS = [
  {
    id: "residential",
    label: i18next.t("profile.portfolio.category.residential"),
  },
  {
    id: "commercial",
    label: i18next.t("profile.portfolio.category.commercial"),
  },
  {
    id: "renovation",
    label: i18next.t("profile.portfolio.category.renovation"),
  },
  {
    id: "remodeling",
    label: i18next.t("profile.portfolio.category.remodeling"),
  },
  {
    id: "electrical",
    label: i18next.t("profile.portfolio.category.electrical"),
  },
  {
    id: "plumbing",
    label: i18next.t("profile.portfolio.category.plumbing"),
  },
  {
    id: "hvac",
    label: i18next.t("profile.portfolio.category.hvac"),
  },
  {
    id: "carpentry",
    label: i18next.t("profile.portfolio.category.carpentry"),
  },
  {
    id: "masonry",
    label: i18next.t("profile.portfolio.category.masonry"),
  },
  {
    id: "painting",
    label: i18next.t("profile.portfolio.category.painting"),
  },
  {
    id: "flooring",
    label: i18next.t("profile.portfolio.category.flooring"),
  },
  {
    id: "roofing",
    label: i18next.t("profile.portfolio.category.roofing"),
  },
  {
    id: "landscaping",
    label: i18next.t("profile.portfolio.category.landscaping"),
  },
  {
    id: "interior",
    label: i18next.t("profile.portfolio.category.interior"),
  },
];

export const PROJECT_STATUS_OPTIONS = [
  {
    id: "draft",
    label: i18next.t("profile.portfolio.status.draft"),
  },
  {
    id: "published",
    label: i18next.t("profile.portfolio.status.published"),
  },
];

// Overview section fields
export const OVERVIEW_FIELDS = [
  {
    id: "title",
    type: FIELD_TYPES.text,
    translationKey: i18next.t("profile.portfolio.fields.project_title.label"),
    placeholder: i18next.t(
      "profile.portfolio.fields.project_title.placeholder"
    ),
    helperText: i18next.t("profile.portfolio.fields.project_title.helper"),
    defaultValue: "",
    isRequired: true,
    validation: {
      required: true,
      error: "",
      valid: false,
      maxLength: 70,
    },
  },
  {
    id: "role",
    type: FIELD_TYPES.text,
    translationKey: i18next.t("profile.portfolio.fields.your_role.label"),
    placeholder: i18next.t("profile.portfolio.fields.your_role.placeholder"),
    helperText: i18next.t("profile.portfolio.fields.your_role.helper"),
    defaultValue: "",
    validation: {
      required: false,
      error: "",
      valid: false,
      maxLength: 100,
    },
  },
  {
    id: "project_description",
    type: FIELD_TYPES.description,
    translationKey: i18next.t(
      "profile.portfolio.fields.project_description.label"
    ),
    placeholder: i18next.t(
      "profile.portfolio.fields.project_description.placeholder"
    ),
    helperText: i18next.t(
      "profile.portfolio.fields.project_description.helper"
    ),
    defaultValue: "",
    isRequired: true,
    validation: {
      required: true,
      error: "",
      valid: false,
      maxLength: 600,
    },
    multiline: true,
    rows: 3,
    sx: {
      "& .MuiOutlinedInput-root": {
        height: 93,
      },
      "& .MuiInputBase-input": {
        height: "auto !important",
        paddingLeft: "14px !important",
      },
    },
  },
];

// Results section fields
export const RESULTS_FIELDS = [
  {
    id: "skills",
    type: FIELD_TYPES.multipleSelect,
    translationKey: i18next.t("profile.portfolio.fields.skills.label"),
    placeholder: i18next.t("profile.portfolio.fields.skills.placeholder"),
    defaultValue: [],
    options: SKILLS_OPTIONS,
    validation: {
      required: false,
      error: "",
      valid: false,
      minItems: 1,
      maxItems: 8,
    },
  },
  {
    id: "jobLink",
    type: FIELD_TYPES.select,
    translationKey: i18next.t("profile.portfolio.fields.link_to_job.label"),
    placeholder: i18next.t("profile.portfolio.fields.link_to_job.placeholder"),
    defaultValue: "",
    options: [], // Will be populated from API
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
  {
    id: "files",
    type: FIELD_TYPES.upload,
    translationKey: i18next.t("profile.portfolio.fields.files.label"),
    placeholder: i18next.t("profile.portfolio.fields.files.placeholder"),
    addMoreText: i18next.t("profile.portfolio.fields.files.add_more"),
    defaultValue: "",
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "thumbnail",
    type: FIELD_TYPES.upload,
    translationKey: i18next.t("profile.portfolio.fields.thumbnail.label"),
    placeholder: i18next.t("profile.portfolio.fields.thumbnail.placeholder"),
    defaultValue: null,
    validation: {
      required: true,
      error: "",
      valid: false,
    },
    maxSize: "800x400",
    acceptedFormats: ["image/svg+xml", "image/png", "image/jpeg", "image/gif"],
  },
];
