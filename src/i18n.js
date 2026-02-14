// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
// import translationEN from "./locales/en/translation.json";
// import translationFR from "./locales/fr/translation.json";

// i18n.use(initReactI18next).init({
//   resources: {
//     en: {
//       translation: translationEN,
//     },
//     fr: {
//       translation: translationFR,
//     },
//   },
//   lng: localStorage.getItem("i18nextLng") || "en",
//   fallbackLng: "en",
//   debug: true,
//   interpolation: {
//     escapeValue: false,
//   },
//   react: {
//     useSuspense: false,
//   },
// });

// export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en/translation.json";
import translationFR from "./locales/fr/translation.json";

// Safe fallback logic for initial language
const storedLang = localStorage.getItem("i18nextLng");
const validLang = storedLang === "fr" || storedLang === "en" ? storedLang : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    fr: { translation: translationFR },
  },
  lng: validLang,
  fallbackLng: "en",
  // debug: true,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
