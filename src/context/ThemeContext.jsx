// import React, { createContext, useState, useMemo, useContext } from "react";
// import getTheme from "../styles/theme";
// import { ThemeProvider } from "@mui/material/styles";

// const ThemeContext = createContext();

// export const useThemeMode = () => {
//   return useContext(ThemeContext);
// };

// const CustomThemeProvider = ({ children }) => {
//   const [mode, setMode] = useState("light");

//   const theme = useMemo(() => getTheme(mode), [mode]);

//   const toggleMode = () => {
//     setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
//   };

//   return (
//     <ThemeContext.Provider value={{ mode, toggleMode }}>
//       <ThemeProvider theme={theme}>{children}</ThemeProvider>
//     </ThemeContext.Provider>
//   );
// };

// export default CustomThemeProvider;


import React, { createContext, useState, useMemo, useContext, useEffect } from "react";
import getTheme from "../styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import { getLocalStorage, setLocalStorage } from "../utils/localStorageUtils";
import { THEME_KEY } from "../utils/constants/auth";

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return getLocalStorage(THEME_KEY) || "light";
    }
    return "light";
  });

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    setLocalStorage(THEME_KEY, newMode);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
