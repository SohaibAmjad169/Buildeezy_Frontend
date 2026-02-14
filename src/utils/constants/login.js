import i18next from "../../i18n";
import {
  validateEmail,
  validateIsEmpty,
  validatePassword,
  validatePhone,
} from "../common";

export const USER_TYPES = {
  admin: "admin",
  client: "client",
  contractor: "contractor",
  specialist: "specialist",
  vendor: "vendor",
};

export const mappedUserType = {
  client: "Client",
  contractor: "Contracting Companies",
  specialist: "Professionals",
  vendor: "vendor",
  admin: "admin",
};

export const CONTRACTOR_USER_TYPES = [
  "contractor",
  "specialist",
  "Professionals",
  "Contracting Companies",
];

export const isContractorType = (userType) => {
  return CONTRACTOR_USER_TYPES.includes(userType);
};

export const getMappedUserType = (userType) => {
  const translations = {
    client: i18next.t("login.client"),
    contractor: i18next.t("login.contractor"),
    specialist: i18next.t("login.specialist"),
    vendor: i18next.t("login.vendor"),
    admin: i18next.t("login.admin", "Admin"),
  };
  return translations[userType] || mappedUserType[userType];
};

export const FIELD_TYPES = {
  text: "text",
  password: "password",
  description: "description",
  select: "select",
  multipleSelect: "multipleSelect",
  autoComplete: "autoComplete",
  contact: "contact",
  upload: "upload",
  timezone: "timezone",
  files: "files",
  address: "address",
  radio: "radio",
  dates: "dates",
  rating: "rating",
  countryCity: "countryCity",
  doubleInput: "doubleInput",
  textSide: "textSide",
  professionalAffiliation: "professionalAffiliation",
  quillEditor: "quillEditor",
  list: "list",
  richText: "richText",
  userAutocomplete: "userAutocomplete",
};

export const LOGIN = [
  {
    id: "email",
    placeholder: "login.email",
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      rules: validateEmail,
      error: "",
      valid: false,
    },
  },
  {
    id: "password",
    placeholder: "login.password",
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

export const FORGOT_PASSWORD = {
  id: "email",
  placeholder: "login.email",
  type: FIELD_TYPES.text,
  value: "",
  validation: {
    required: true,
    rules: validateEmail,
    error: "",
    valid: false,
  },
};

export const RESET_PASSWORD = [
  {
    id: "password",
    placeholder: "login.new_password",
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
    placeholder: "login.confirm_password",
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

export const REACTIVATE_ACCOUNT = {
  id: "description",
  placeholder: "login.description_placeholder",
  type: FIELD_TYPES.description,
  value: "",
  validation: {
    required: true,
    rules: validateIsEmpty,
    msg: "errors.description_required",
    error: "",
    valid: false,
  },
};

export const STEPS = [
  {
    label: "register.step_account",
    description: "register.step_account_desc",
  },
  {
    label: "register.step_auth",
    description: "register.step_auth_desc",
  },
];

export const getUserTypeOptions = () => [
  {
    id: USER_TYPES.client,
    label: i18next.t("login.client"),
  },
  {
    id: USER_TYPES.contractor,
    label: i18next.t("login.contractor"),
  },
  {
    id: USER_TYPES.specialist,
    label: i18next.t("login.specialist"),
  },
  {
    id: USER_TYPES.vendor,
    label: i18next.t("login.vendor"),
  },
];

export const getRegisterAccountDetails = () => [
  {
    id: "firstName",
    placeholder: "login.first_name",
    type: FIELD_TYPES.text,
    value: "",
    width: "48%",
    disabled: false,
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: "errors.first_name_required",
      error: "",
      valid: false,
    },
  },
  {
    id: "lastName",
    placeholder: "login.last_name",
    type: FIELD_TYPES.text,
    value: "",
    width: "48%",
    disabled: false,
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: "errors.last_name_required",
      error: "",
      valid: false,
    },
  },
  {
    id: "email",
    placeholder: "login.email",
    type: FIELD_TYPES.text,
    value: "",
    disabled: false,
    validation: {
      required: true,
      rules: validateEmail,
      error: "",
      valid: false,
    },
  },
  {
    id: "country",
    placeholder: "login.country",
    type: FIELD_TYPES.autoComplete,
    value: { name: "" },
    width: "48%",
    options: [],
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: "errors.country_required",
      error: "",
      valid: false,
    },
  },
  {
    id: "city",
    placeholder: "login.city",
    type: FIELD_TYPES.autoComplete,
    value: { name: "" },
    width: "48%",
    options: [],
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: "errors.city_required",
      error: "",
      valid: false,
    },
  },
  {
    id: "userType",
    placeholder: "login.user_type",
    type: FIELD_TYPES.select,
    value: "", // Changed from USER_TYPES.client to empty string
    options: getUserTypeOptions(),
    validation: {
      required: true, // Added required validation
      rules: validateIsEmpty, // Added validation rule
      msg: "Select the User Type", // Added error message
      error: "Select the User Type",
      valid: false, // Added valid flag
    },
  },
];

// Keep backward compatibility
export const REGISTER_ACCOUNT_DETAILS = getRegisterAccountDetails();

export const REGISTER_AUTH = [
  {
    id: "phoneNumber",
    placeholder: "login.phone_number",
    type: FIELD_TYPES.contact,
    value: "",
    validation: {
      required: true,
      rules: validatePhone,
      msg: "errors.phone_required",
      error: "",
      valid: false,
    },
  },
  {
    id: "password",
    placeholder: "login.password",
    type: FIELD_TYPES.password,
    value: "",
    width: "48%",
    validation: {
      required: true,
      rules: validatePassword,
      error: "",
      valid: false,
    },
  },
  {
    id: "confirm_password",
    placeholder: "login.confirm_password",
    type: FIELD_TYPES.password,
    value: "",
    width: "48%",
    validation: {
      required: true,
      rules: validatePassword,
      error: "",
      valid: false,
    },
  },
];

export const USER_INFO = {
  [USER_TYPES.client]: i18next.t("login.client_info"),
  [USER_TYPES.contractor]: i18next.t("login.contractor_info"),
  [USER_TYPES.specialist]: i18next.t("login.specialist_info"),
  [USER_TYPES.vendor]: i18next.t("login.vendor_info"),
};

export const USER_TYPE_LABELS = {
  client: "login.client_plural",
  contractor: "login.contractor_plural",
  specialist: "login.specialist_plural",
  vendor: "login.vendor_plural",
};
