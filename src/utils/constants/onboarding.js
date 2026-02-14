import { USER_TYPES } from "./login";
import i18next from "../../i18n";
import { IMAGE_FILE_TYPES } from "../file";

export const QUESTION_TYPES = {
  select: "select",
  multipleSelect: "multipleSelect",
  description: "description",
  pastClients: "pastClients",
  radio: "radio",
  upload: "upload",
  companyDetails: "companyDetails",
  hours: "hours",
  professionalAffiliation: "professionalAffiliation",
};

// Options with i18next translations
export const EXP_LEVEL_OPTIONS = [
  {
    id: "beginner",
    label: i18next.t("onboarding.exp_beginner"),
  },
  {
    id: "intermediate",
    label: i18next.t("onboarding.exp_intermediate"),
  },
  {
    id: "professional",
    label: i18next.t("onboarding.exp_professional"),
  },
  {
    id: "expert",
    label: i18next.t("onboarding.exp_expert"),
  },
];

export const ID_OPTIONS1 = [
  {
    id: "company_reg_certificate",
    label: i18next.t("onboarding.id_company_reg_certificate"),
  },
];

export const ID_OPTIONS2 = [
  {
    id: "passport",
    label: i18next.t("onboarding.id_passport"),
  },
  {
    id: "nid",
    label: i18next.t("onboarding.id_nid"),
  },
];

export const CONTACT_HOW_OPTIONS = [
  {
    id: "Email",
    label: i18next.t("onboarding.contact_email"),
  },
  {
    id: "Telephone",
    label: i18next.t("onboarding.contact_telephone"),
  },
  {
    id: "Whatsapp",
    label: i18next.t("onboarding.contact_whatsapp"),
  },
];

export const CONTACT_WHEN_OPTIONS = [
  {
    id: "Morning",
    label: i18next.t("onboarding.contact_morning"),
  },
  {
    id: "Afternoon",
    label: i18next.t("onboarding.contact_afternoon"),
  },
  {
    id: "Evening",
    label: i18next.t("onboarding.contact_evening"),
  },
];

export const CURRENCY_OPTIONS = [
  {
    id: "USD",
    label: i18next.t("onboarding.currency_usd"),
  },
  {
    id: "Euro",
    label: i18next.t("onboarding.currency_euro"),
  },
  {
    id: "GBP",
    label: i18next.t("onboarding.currency_gbp"),
  },
  {
    id: "Local",
    label: i18next.t("onboarding.currency_local"),
  },
];

export const TOGGLE_OPTIONS = [
  {
    id: "yes",
    label: i18next.t("onboarding.yes"),
  },
  {
    id: "no",
    label: i18next.t("onboarding.no"),
  },
];

export const DAYS = [
  {
    id: "Saturday",
    label: i18next.t("onboarding.saturday"),
  },
  {
    id: "Sunday",
    label: i18next.t("onboarding.sunday"),
  },
  {
    id: "Monday",
    label: i18next.t("onboarding.monday"),
  },
  {
    id: "Tuesday",
    label: i18next.t("onboarding.tuesday"),
  },
  {
    id: "Wednesday",
    label: i18next.t("onboarding.wednesday"),
  },
  {
    id: "Thursday",
    label: i18next.t("onboarding.thursday"),
  },
  {
    id: "Friday",
    label: i18next.t("onboarding.friday"),
  },
];

// Questions for each user type
const clientQuestions = [
  {
    id: "avatar",
    title: i18next.t("onboarding.client_que1"),
    type: QUESTION_TYPES.upload,
    value: "",
    fileTypes: IMAGE_FILE_TYPES,
  },
  {
    id: "description",
    title: i18next.t("onboarding.client_que2"),
    placeholder: i18next.t("onboarding.client_que2_place"),
    type: QUESTION_TYPES.description,
    value: "",
  },
];

const contractorQuestions = [
  {
    id: "category",
    title: i18next.t("onboarding.common_que1"),
    placeholder: i18next.t("onboarding.common_que1"),
    type: QUESTION_TYPES.select,
    options: [],
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "experienceLevel",
    title: i18next.t("onboarding.common_que2"),
    placeholder: i18next.t("onboarding.common_que2"),
    type: QUESTION_TYPES.radio,
    options: EXP_LEVEL_OPTIONS,
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "verificationType",
    title: i18next.t("onboarding.common_que3"),
    placeholder: i18next.t("onboarding.common_que3"),
    type: QUESTION_TYPES.radio,
    options: ID_OPTIONS1,
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "verificationDoc",
    title: i18next.t("onboarding.contractor_que1"),
    type: QUESTION_TYPES.upload,
    value: "",
  },
  {
    id: "pastClients",
    title: i18next.t("onboarding.common_que4"),
    subtitle: i18next.t("onboarding.common_que4_subtitle"),
    type: QUESTION_TYPES.pastClients,
    value: "",
  },
  {
    id: "contactType",
    title: i18next.t("onboarding.common_que5"),
    placeholder: i18next.t("onboarding.common_que5"),
    type: QUESTION_TYPES.multipleSelect,
    options: CONTACT_HOW_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_contact_type"),
      valid: true,
    },
  },
  {
    id: "preferContactedTime",
    title: i18next.t("onboarding.common_que6"),
    placeholder: i18next.t("onboarding.common_que6"),
    type: QUESTION_TYPES.multipleSelect,
    options: CONTACT_WHEN_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_contact_time"),
      valid: true,
    },
  },
  {
    id: "currency",
    title: i18next.t("onboarding.common_que7"),
    placeholder: i18next.t("onboarding.common_que7"),
    type: QUESTION_TYPES.multipleSelect,
    options: CURRENCY_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_currency"),
      valid: true,
    },
  },
  {
    id: "description",
    title: i18next.t("onboarding.common_que8"),
    placeholder: i18next.t("onboarding.common_que8_place"),
    type: QUESTION_TYPES.description,
    value: "",
  },
];

const specialistQuestions = [
  {
    id: "category",
    title: i18next.t("onboarding.common_que1"),
    placeholder: i18next.t("onboarding.common_que1"),
    type: QUESTION_TYPES.select,
    options: [],
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "experienceLevel",
    title: i18next.t("onboarding.common_que2"),
    placeholder: i18next.t("onboarding.common_que2"),
    type: QUESTION_TYPES.radio,
    options: EXP_LEVEL_OPTIONS,
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "verificationType",
    title: i18next.t("onboarding.common_que3"),
    placeholder: i18next.t("onboarding.common_que3"),
    type: QUESTION_TYPES.radio,
    options: ID_OPTIONS2,
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "verificationDoc",
    title: i18next.t("onboarding.professional_que1"),
    type: QUESTION_TYPES.upload,
    value: "",
  },
  {
    id: "pastClients",
    title: i18next.t("onboarding.common_que4"),
    subtitle: i18next.t("onboarding.common_que4_subtitle"),
    type: QUESTION_TYPES.pastClients,
    value: "",
  },
  {
    id: "contactType",
    title: i18next.t("onboarding.common_que5"),
    placeholder: i18next.t("onboarding.common_que5"),
    type: QUESTION_TYPES.multipleSelect,
    options: CONTACT_HOW_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_contact_type"),
      valid: true,
    },
  },
  {
    id: "preferContactedTime",
    title: i18next.t("onboarding.common_que6"),
    placeholder: i18next.t("onboarding.common_que6"),
    type: QUESTION_TYPES.multipleSelect,
    options: CONTACT_WHEN_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_contact_time"),
      valid: true,
    },
  },
  {
    id: "currency",
    title: i18next.t("onboarding.common_que7"),
    placeholder: i18next.t("onboarding.common_que7"),
    type: QUESTION_TYPES.multipleSelect,
    options: CURRENCY_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_currency"),
      valid: true,
    },
  },
  {
    id: "description",
    title: i18next.t("onboarding.common_que8"),
    placeholder: i18next.t("onboarding.common_que8_place"),
    type: QUESTION_TYPES.description,
    value: "",
  },
];

const vendorQuestions = [
  {
    id: "category",
    title: i18next.t("onboarding.common_que1"),
    placeholder: i18next.t("onboarding.common_que1"),
    type: QUESTION_TYPES.select,
    options: [],
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "sellingProductType",
    title: i18next.t("onboarding.vendor_que1"),
    placeholder: i18next.t("onboarding.vendor_que1"),
    type: QUESTION_TYPES.multipleSelect,
    options: [],
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "isDeliver",
    title: i18next.t("onboarding.vendor_que2"),
    placeholder: i18next.t("onboarding.vendor_que2"),
    type: QUESTION_TYPES.radio,
    options: TOGGLE_OPTIONS,
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "verificationType",
    title: i18next.t("onboarding.vendor_que3"),
    placeholder: i18next.t("onboarding.vendor_que3"),
    type: QUESTION_TYPES.radio,
    options: ID_OPTIONS1,
    value: "",
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "verificationDoc",
    title: i18next.t("onboarding.vendor_que4"),
    type: QUESTION_TYPES.upload,
    value: "",
  },
  {
    id: "companyDetails",
    title: i18next.t("onboarding.vendor_que5"),
    placeholder: i18next.t("onboarding.vendor_que5"),
    type: QUESTION_TYPES.companyDetails,
    value: null,
  },
  {
    id: "contactType",
    title: i18next.t("onboarding.vendor_que6"),
    placeholder: i18next.t("onboarding.vendor_que6"),
    type: QUESTION_TYPES.multipleSelect,
    options: CONTACT_HOW_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_contact_type"),
      valid: true,
    },
  },
  {
    id: "openingHours",
    title: i18next.t("onboarding.vendor_que7"),
    placeholder: i18next.t("onboarding.vendor_que7"),
    type: QUESTION_TYPES.hours,
    value: [{ daysOfWeek: [], startTime: "", endTime: "" }],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_field"),
      valid: true,
    },
  },
  {
    id: "currency",
    title: i18next.t("onboarding.vendor_que8"),
    placeholder: i18next.t("onboarding.vendor_que8"),
    type: QUESTION_TYPES.multipleSelect,
    options: CURRENCY_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: i18next.t("onboarding.required_currency"),
      valid: true,
    },
  },
  {
    id: "description",
    title: i18next.t("onboarding.vendor_que9"),
    placeholder: i18next.t("onboarding.vendor_que9_place"),
    type: QUESTION_TYPES.description,
    value: "",
  },
];

export const onboardingQuestions = {
  [USER_TYPES.client]: clientQuestions,
  [USER_TYPES.contractor]: contractorQuestions,
  [USER_TYPES.specialist]: specialistQuestions,
  [USER_TYPES.vendor]: vendorQuestions,
};