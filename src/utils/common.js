import { isEmpty, isObject } from "lodash";
import i18next from "../i18n";
import { ACCESS_TOKEN_KEY, USER_DATA } from "./constants/auth";
import { getLocalStorage } from "./localStorageUtils";
import {
  EST_OPTIONS,
  HOW_BIG_AREA_OPTIONS,
  HOW_MANY_AC_OPTIONS,
  HOW_MANY_ROOMS_OPTIONS,
  JOB_TYPE_OPTIONS,
  SPECIFY_AC_OPTIONS,
  SPECIFY_AVAIL_OPTIONS,
  SPECIFY_CLEANING_OPTIONS,
  SPECIFY_ELECTRICAL_OPTIONS,
  SPECIFY_PLUMBING_OPTIONS,
  SPECIFY_ROOMS_OPTIONS,
  SPECIFY_TILING_OPTIONS,
  SPECIFY_UPHOLSTERY_OPTIONS,
  START_BY_OPTIONS,
  WHAT_NEED_AC_TILING_OPTIONS,
  WHAT_NEED_CLEANING_OPTIONS,
  WHAT_NEED_CONS_OPTIONS,
  WHAT_NEED_ELECTRICAL_OPTIONS,
  WHAT_NEED_GARD_OPTIONS,
  WHAT_NEED_PAINTING_OPTIONS,
  WHAT_NEED_PLUMBING_OPTIONS,
  WHAT_NEED_UPHOLSTERY_OPTIONS,
  WHERE_TILING_OPTIONS,
  YES_NO_OPTIONS,
} from "./constants/job";
import { DASHBOARD_AD_TYPE_OPTIONS, AUDIENCE_TYPE_OPTIONS } from "./constants/ad";
import {
  CONTACT_HOW_OPTIONS,
  CONTACT_WHEN_OPTIONS,
  CURRENCY_OPTIONS,
  EXP_LEVEL_OPTIONS,
  ID_OPTIONS1,
  ID_OPTIONS2,
} from "./constants/onboarding";
import dayjs from "dayjs";

export function getToken() {
  return getLocalStorage(ACCESS_TOKEN_KEY);
}

export function isAuthorized() {
  return !!getToken();
}

export function isLoggedIn() {
  return !!getToken() && !!getLocalStorage(USER_DATA);
}

export function validatePhone(phone, errorMsg) {
  return phone.length < 7 ? errorMsg : "";
}

export function validateIsEmpty(text, errorMsg) {
  return isEmpty(text) || Object.values(text).some((item) => item === "")
    ? errorMsg
    : "";
}

export function validateSelect(value, errorMsg) {
  return value.length === 0 || !value ? errorMsg : "";
}

export function validateEmail(email) {
  let newError = "";
  if (!email.trim()) {
    newError = i18next.t("errors.email_required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newError = i18next.t("errors.invalid_email");
  }
  return newError;
}

export function validatePassword(password) {
  let newError = "";
  if (!password.trim()) {
    newError = i18next.t("errors.password_required");
  } else if (password.trim().length < 8) {
    newError = i18next.t("errors.password_char");
  }
  return newError;
}

export function validateHours(hoursData) {

  if (!hoursData || (typeof hoursData !== "object" && !Array.isArray(hoursData))) {
    return false;
  }

  let hoursEntries = [];

  if (Array.isArray(hoursData)) {
    hoursEntries = hoursData;
  } else {
    // Object with openingHours keys
    hoursEntries = Object.entries(hoursData)
      .filter(([key]) => key.startsWith("openingHours"))
      .map(([, val]) => val);
  }

  if (hoursEntries.length === 0) return false;

  const isValid = hoursEntries.every((hour) => {
    const hasValidDays =
      Array.isArray(hour.daysOfWeek) && hour.daysOfWeek.length > 0;
    const hasValidStartTime =
      hour.startTime && typeof hour.startTime === "string" && hour.startTime.trim() !== "";
    const hasValidEndTime =
      hour.endTime && typeof hour.endTime === "string" && hour.endTime.trim() !== "";

    return hasValidDays && hasValidStartTime && hasValidEndTime;
  });

  return isValid;
}


export function validateHoursType(hoursData) {
  return validateHours(hoursData)
    ? ""
    : "Please fill in all required fields for opening hours";
}

export function validateArray(data, errorMsg) {
  return data.some((el) => el.value === "") ? errorMsg : "";
}

export function validateCountryCity(data, errorMsg) {
  return Object.values(data).some((value) => !value.name) ? errorMsg : "";
}

export function convertToFormData(data) {
  const formData = new FormData();
  for (let el of data) {
    if (el.id === "past_clients") {
      const clientData = el.value.map(({ name, phone, email }) => ({
        name,
        phone,
        email,
      }));
      formData.append(el.id, JSON.stringify(clientData));
      const clientDocs = el.value
        .map(({ doc }, index) => ({
          id: `past_client_portfolios[${index}][0]`,
          value: doc,
        }))
        .filter((el) => el.value);
      formData.append(clientDocs.id, clientDocs.value);
    } else {
      const value =
        isObject(el.value) && !(el.value instanceof File)
          ? JSON.stringify(el.value)
          : el.value;
      formData.append(el.id, value);
    }
  }
  return formData;
}

export function getInitial(name) {
  return name.charAt(0).toUpperCase();
}

export function getFirstCharUpperCase(text) {
  return text?.charAt(0)?.toUpperCase() + text?.slice(1);
}

// export function getFirstCharUpperCase(text) {
//   if (typeof text !== "string" || text.length === 0) return "";
//   return text.charAt(0).toUpperCase() + text.slice(1);
// }


export function getAllFirstCharUpperCase(text) {
  return text?.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getInitialUpperCase(text) {
  return text
    ?.replace(/-/g, " ") // Replace all hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter
}

export const getLabelFromId = (id, type) => {
  if (!id && !type) return null;

  const objectTypes = {
    title: JOB_TYPE_OPTIONS,
    startTimePreference: START_BY_OPTIONS,
    specifyDetails: [
      ...SPECIFY_AVAIL_OPTIONS,
      ...SPECIFY_ROOMS_OPTIONS,
      ...SPECIFY_PLUMBING_OPTIONS,
      ...SPECIFY_ELECTRICAL_OPTIONS,
      ...SPECIFY_AC_OPTIONS,
      ...SPECIFY_TILING_OPTIONS,
      ...SPECIFY_CLEANING_OPTIONS,
      ...SPECIFY_UPHOLSTERY_OPTIONS,
    ],
    jobsToBeDone: [
      ...WHAT_NEED_CONS_OPTIONS,
      ...WHAT_NEED_PAINTING_OPTIONS,
      ...WHAT_NEED_PLUMBING_OPTIONS,
      ...WHAT_NEED_ELECTRICAL_OPTIONS,
      ...WHAT_NEED_AC_TILING_OPTIONS,
      ...WHAT_NEED_GARD_OPTIONS,
      ...WHAT_NEED_CLEANING_OPTIONS,
      ...WHAT_NEED_UPHOLSTERY_OPTIONS,
    ],
    newConstruction: YES_NO_OPTIONS,
    roofPainting: YES_NO_OPTIONS,
    roomsAffected: HOW_MANY_ROOMS_OPTIONS,
    units: HOW_MANY_AC_OPTIONS,
    areaSize: HOW_BIG_AREA_OPTIONS,
    areaLocation: WHERE_TILING_OPTIONS,
    estimatedItems: EST_OPTIONS,
    adType: DASHBOARD_AD_TYPE_OPTIONS,
    audience: AUDIENCE_TYPE_OPTIONS,
    experienceLevel: EXP_LEVEL_OPTIONS,
    contactType: CONTACT_HOW_OPTIONS,
    verificationType: [...ID_OPTIONS1, ...ID_OPTIONS2],
    preferContactedTime: CONTACT_WHEN_OPTIONS,
    currency: CURRENCY_OPTIONS,
  };
  const getObjTypes = objectTypes[type];
  const processId = getObjTypes?.find((item) => item.id === id);
  const labelText = processId?.label || id;

  return labelText;
};

export const hasAnyEmptyValue = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return obj === "";
  }

  // Iterate through the object's properties
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (hasAnyEmptyValue(obj[key])) {
        return true;
      }
    }
  }

  return false;
};

export const mapOtherFieldId = {
  jobsToBeDone: "otherJobsToBeDone",
  units: "otherUnitsDetails",
};

export function categorizeAds(data) {
  return data.reduce((acc, item) => {
    // Handle null or undefined adType
    const category = item.adType || "uncategorized";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
}

export const DRAWER_WIDTH = 240;

export const mapJobState = {
  filled: "In Progress",
  active: "Active",
  completed: "Completed",
  preview_mode: "Preview Mode",
};

export function convertDateTime(inputDate) {
  return dayjs(inputDate).isSame(dayjs(), "day")
    ? `Today ${dayjs(inputDate).format("h:mmA")}`
    : inputDate.format("dddd h:mmA");
}

export function getAvatarName(firstName, lastName) {
  return getInitial(firstName) + getInitial(lastName);
}

export function getTimetokenDaysAgo(days = 8) {
  const now = Date.now(); // current time in milliseconds
  const past = now - days * 24 * 60 * 60 * 1000; // subtract X days
  return past * 10000; // convert to PubNub timetoken
}


