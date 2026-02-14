import i18next from "../../i18n";
import { FIELD_TYPES, USER_TYPES } from "./login";
import {
  validateEmail,
  validateIsEmpty,
  validatePassword,
  validatePhone,
  validateSelect,
} from "../common";
import {
  CONTACT_HOW_OPTIONS,
  CURRENCY_OPTIONS,
  TOGGLE_OPTIONS,
  QUESTION_TYPES,
  ID_OPTIONS1,
  ID_OPTIONS2,
  CONTACT_WHEN_OPTIONS,
} from "./onboarding";

const verificationInfo = `<ol>
<p style="font-size:1rem">Note there is a 3 step verification process</p>
<li><strong>Load Document:</strong> Passport, National ID or company registration certificate if you are a business. Note that all personal information is encrypted and securely stored.</li>
<li><strong>Past Clients:</strong> Submit 2 past clients for references. Then save the details.</li>
<li><strong>Click Verify Me:</strong> Click on Verify Me to be instantly verified.</li>
</ol>`;

const verificationInfoVendor = `<ol>
<p>Note there is a 2 step verification process</p>
<li><strong>Load Document:</strong> Passport, National ID or company registration certificate if you are a business. Note that all personal information is encrypted and securely stored.</li>
<li><strong>Click Verify Me:</strong> Click on Verify Me to be instantly verified.</li>
</ol>`;

const verificationInfoClient = `<ol>
<p>Note there is a 1 step verification process</p>
<li><strong>Load Document:</strong> Passport, National ID or company registration certificate if you are a business. Note that all personal information is encrypted and securely stored.</li>
</ol>`;

export const mapVeriffStatus = {
  submitted: "submitted",
  approved: "approved",
  declined: "declined",
  expired: "expired",
};
export const mapStatus = {
  1: "error",
  2: "warning",
  3: "success",
};

export const profileStatus = {
  1: {
    label: "profile.status.unverified",
    isBtn: true,
    color: "error.main",
    chipLabel: "profile.status.chip_unverified",
    bgColor:
      "linear-gradient(0deg, rgba(231, 33, 6, 0.1), rgba(231, 33, 6, 0.1)),linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
    info: {
      [USER_TYPES.contractor]: verificationInfo,
      [USER_TYPES.specialist]: verificationInfo,
      [USER_TYPES.vendor]: verificationInfoVendor,
      [USER_TYPES.client]: verificationInfoClient,
    },
  },
  2: {
    label: "profile.status.pending",
    isBtn: false,
    color: "warning.main",
    chipLabel: "profile.status.chip_pending",
    bgColor:
      "linear-gradient(0deg, rgba(255, 204, 0, 0.2), rgba(255, 204, 0, 0.2)),linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
    info: {
      [USER_TYPES.contractor]: verificationInfo,
      [USER_TYPES.specialist]: verificationInfo,
      [USER_TYPES.vendor]: verificationInfoVendor,
      [USER_TYPES.client]: verificationInfoClient,
    },
  },
  3: {
    label: "profile.status.verified",
    isBtn: false,
    color: "success.main",
    chipLabel: "profile.status.chip_verified",
    bgColor:
      "linear-gradient(0deg, rgba(46, 125, 50, 0.1), rgba(46, 125, 50, 0.1)),linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
    info: {
      [USER_TYPES.contractor]: {},
      [USER_TYPES.specialist]: {},
      [USER_TYPES.vendor]: {},
      [USER_TYPES.client]: {},
    },
  },
};

export const veriffStatusObj = {
  [mapVeriffStatus.submitted]: {
    color: "info.main",
    chipLabel: "profile.veriff.submitted",
    bgColor:
      "linear-gradient(0deg, rgba(2, 136, 209, 0.1), rgba(2, 136, 209, 0.1)),linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
    info: "profile.veriff.info_submitted",
  },
  [mapVeriffStatus.approved]: {
    color: "primary.main",
    chipLabel: "profile.veriff.approved",
    bgColor:
      "linear-gradient(0deg, rgba(46, 125, 50, 0.2), rgba(46, 125, 50, 0.2)),linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
    info: "profile.veriff.info_approved",
  },
  [mapVeriffStatus.declined]: {
    color: "error.main",
    chipLabel: "profile.veriff.declined",
    bgColor:
      "linear-gradient(0deg, rgba(209, 2, 2, 0.1), rgba(209, 2, 2, 0.1)), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
    info: "profile.veriff.info_declined",
  },
};

export const CHANGE_PASSWORD = [
  {
    id: "currentPassword",
    placeholder: i18next.t("login.current_password"),
    type: FIELD_TYPES.password,
    value: "",
    validation: {
      required: true,
      rules: validatePassword,
      error: "",
      valid: false,
    },
  },
  {
    id: "password",
    placeholder: i18next.t("login.new_password"),
    type: FIELD_TYPES.password,
    value: "",
    validation: {
      required: true,
      rules: validatePassword,
      error: "",
      valid: false,
    },
  },
  {
    id: "confirmPassword",
    placeholder: i18next.t("login.confirm_password"),
    type: FIELD_TYPES.password,
    value: "",
    validation: {
      required: true,
      rules: validatePassword,
      error: "",
      valid: false,
    },
  },
];

// Common fields for all user types
export const COMMON_PROFILE_FIELDS = [
  {
    id: "name",
    title: i18next.t("login.name"),
    type: FIELD_TYPES.doubleInput,
    value: { first: "", second: "" },
    width: "100%",
    placeholder: [i18next.t("login.first_name"), i18next.t("login.last_name")],
    validation: {
      required: true,
      rules: (value) => {
        if (!value.first) {
          return i18next.t("errors.first_name_required");
        }
        if (!value.second) {
          return i18next.t("errors.last_name_required");
        }
        return "";
      },
      error: "",
      valid: false,
    },
  },
  {
    id: "email",
    title: i18next.t("login.email"),
    type: FIELD_TYPES.text,
    value: "",
    width: "48%",
    validation: {
      required: true,
      rules: validateEmail,
      error: "",
      valid: false,
    },
  },
  {
    id: "phoneNumber",
    title: i18next.t("login.phone_number"),
    type: FIELD_TYPES.contact,
    value: "",
    width: "48%",
    validation: {
      required: true,
      rules: validatePhone,
      msg: i18next.t("errors.phone_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "country",
    title: i18next.t("login.country"),
    type: FIELD_TYPES.autoComplete,
    value: { name: "" },
    width: "48%",
    options: [],
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.country_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "city",
    title: i18next.t("login.city"),
    type: FIELD_TYPES.autoComplete,
    value: { name: "" },
    width: "48%",
    options: [],
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.city_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "description",
    title: i18next.t("onboarding.client_que2"),
    placeholder: i18next.t("onboarding.client_que2_place"),
    type: FIELD_TYPES.description,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
];

// Fields for Contractor and Specialist
export const CONTRACTOR_SPECIALIST_FIELDS = [
  {
    id: "category",
    title: i18next.t("onboarding.common_que1"),
    placeholder: i18next.t("onboarding.common_que1"),
    width: "48%",
    type: FIELD_TYPES.select,
    options: [],
    value: "",
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_field"),
      valid: false,
    },
  },

  {
    id: "contactType",
    title: i18next.t("onboarding.common_que5"),
    placeholder: i18next.t("onboarding.common_que5"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: CONTACT_HOW_OPTIONS,
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_contact_type"),
      valid: false,
    },
  },
  {
    id: "preferContactedTime",
    title: i18next.t("onboarding.common_que6"),
    placeholder: i18next.t("onboarding.common_que6"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: CONTACT_WHEN_OPTIONS,
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_contact_time"),
      valid: false,
    },
  },
  {
    id: "currency",
    title: i18next.t("onboarding.type_of_paid"),
    placeholder: i18next.t("onboarding.type_of_paid"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: CURRENCY_OPTIONS,
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_currency"),
      valid: false,
    },
  },
  {
    id: "professionalAffiliations",
    title: i18next.t("profile.professional_affiliations"),
    type: QUESTION_TYPES.professionalAffiliation,
    value: [],
    validation: {
      required: false,
      error: "",
      valid: true,
    },
    fields: [
      {
        id: "title",
        type: FIELD_TYPES.doubleInput,
        placeholder: ["Organization", "Position"],
        validation: {
          required: true,
        },
      },
      {
        id: "memberSince",
        type: FIELD_TYPES.doubleInput,
        placeholder: ["From", "To"],
        validation: {
          required: true,
        },
      },
      {
        id: "licenceNumber",
        type: FIELD_TYPES.text,
        placeholder: "License Number",
        validation: {
          required: false,
        },
      },
      {
        id: "description",
        type: FIELD_TYPES.description,
        placeholder: "Description",
        validation: {
          required: false,
        },
      },
    ],
  },
];

// Fields for Vendor
export const VENDOR_FIELDS = [
  {
    id: "category",
    title: i18next.t("onboarding.common_que1"),
    placeholder: i18next.t("onboarding.common_que1"),
    width: "48%",
    type: FIELD_TYPES.select,
    options: [],
    value: "",
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_field"),
      valid: false,
    },
  },
  {
    id: "sellingProductType",
    title: i18next.t("onboarding.vendor_que1"),
    placeholder: i18next.t("onboarding.vendor_que1"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: [],
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_field"),
      valid: false,
    },
  },
  {
    id: "isDeliver",
    title: i18next.t("onboarding.vendor_que2"),
    placeholder: i18next.t("onboarding.vendor_que2"),
    width: "48%",
    type: FIELD_TYPES.select,
    options: TOGGLE_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_field"),
      valid: false,
    },
  },
  {
    id: "contactType",
    title: i18next.t("onboarding.common_que5"),
    placeholder: i18next.t("onboarding.common_que5"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: CONTACT_HOW_OPTIONS,
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_contact_type"),
      valid: false,
    },
  },
  {
    id: "preferContactedTime",
    title: i18next.t("onboarding.common_que6"),
    placeholder: i18next.t("onboarding.common_que6"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: CONTACT_WHEN_OPTIONS,
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_contact_time"),
      valid: false,
    },
  },
  {
    id: "currency",
    title: i18next.t("onboarding.type_of_paid"),
    placeholder: i18next.t("onboarding.type_of_paid"),
    width: "48%",
    type: FIELD_TYPES.multipleSelect,
    options: CURRENCY_OPTIONS,
    value: [],
    validation: {
      required: true,
      rules: validateSelect,
      error: "",
      msg: i18next.t("onboarding.required_currency"),
      valid: false,
    },
  },
  {
    id: "companyDetails",
    title: i18next.t("profile.company_details"),
    type: QUESTION_TYPES.companyDetails,
    value: {
      website: "",
      address: "",
      email: "",
    },
    validation: {
      required: true,
      error: "",
      valid: false,
    },
    fields: [
      {
        id: "website",
        type: FIELD_TYPES.doubleInput,
        placeholder: "Website",
        validation: {
          required: true,
          rules: validateEmail,
        },
      },
      {
        id: "address",
        type: FIELD_TYPES.doubleInput,
        placeholder: "Address",
        validation: {
          required: true,
        },
      },
      {
        id: "email",
        type: FIELD_TYPES.doubleInput,
        placeholder: "Email",
        validation: {
          required: true,
          rules: validateEmail,
        },
      },
    ],
  },
  {
    id: "openingHours",
    title: i18next.t("profile.opening_hours"),
    type: QUESTION_TYPES.hours,
    value: [],
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
];

// Profile fields by user type
export const PROFILE_DATA = {
  [USER_TYPES.admin]: [...COMMON_PROFILE_FIELDS],
  [USER_TYPES.client]: [...COMMON_PROFILE_FIELDS],
  [USER_TYPES.contractor]: [
    ...COMMON_PROFILE_FIELDS,
    ...CONTRACTOR_SPECIALIST_FIELDS,
  ],
  [USER_TYPES.specialist]: [
    ...COMMON_PROFILE_FIELDS,
    ...CONTRACTOR_SPECIALIST_FIELDS,
  ],
  [USER_TYPES.vendor]: [...COMMON_PROFILE_FIELDS, ...VENDOR_FIELDS],
};

export const mapDocOptions = {
  [USER_TYPES.client]: ID_OPTIONS2,
  [USER_TYPES.contractor]: ID_OPTIONS1,
  [USER_TYPES.specialist]: ID_OPTIONS2,
  [USER_TYPES.vendor]: ID_OPTIONS1,
};

export const VERIFICATION_TYPE = {
  id: "verificationType",
  title: i18next.t("profile.id_type"),
  placeholder: i18next.t("onboarding.vendor_que3"),
};

export const VERIFICATION_DOC = {
  id: "verificationDoc",
};

export const RESIDENCE_DOC = {
  id: "residenceDoc",
  value: "residenceType",
};

export const RESI_ID_OPTION = [
  {
    id: "residenceType",
    label: "Residence Document",
  },
];

// Example of a double input field definition
export const SAMPLE_DOUBLE_INPUT_FIELD = {
  id: "nameParts",
  title: i18next.t("profile.name_parts"), // Assuming i18next is used for translations
  type: FIELD_TYPES.doubleInput,
  value: { first: "", second: "" },
  width: "100%",
  placeholder: [
    i18next.t("profile.first_part"),
    i18next.t("profile.second_part"),
  ], // Array of placeholders
  validation: {
    required: true,
    rules: (value) => {
      // Custom validation for both fields
      if (!value.first && !value.second) {
        return i18next.t("errors.at_least_one_required");
      }
      return "";
    },
    error: "",
    valid: false,
  },
};
