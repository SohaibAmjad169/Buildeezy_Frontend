import secureLocalStorage from "react-secure-storage";

export const setLocalStorage = (key, value, isObject = false) => {
  if (isObject) {
    secureLocalStorage.setItem(key, JSON.stringify(value));
  } else {
    secureLocalStorage.setItem(key, value);
  }
};

export const getLocalStorage = (key, isObject = false) => {
  if (isObject) {
    return JSON.parse(secureLocalStorage.getItem(key));
  } else {
    return secureLocalStorage.getItem(key);
  }
};

export const removeLocalStorage = (key) => {
  secureLocalStorage.removeItem(key);
};

export const removeAll = () => {
  secureLocalStorage.clear();
  sessionStorage.clear();
};
