import { alpha, createTheme } from "@mui/material/styles";

export const colors = {
  primary: "#709a1c",
  black: "#131a47",
  black100: "#ffffff0d",
  black200: "#ffffff0a",
  black300: "#535353",
  black400: "#121212",
  black460: "#12121299",
  black500: "#333",
  black600: "#141c2480",
  black700: "#414651",
  black800: "#344054",
  red: "#d32f2f",
  red100: "#B42318",
  red200: "#FECDCA",
  red300: "#FEF3F2",
  green: "#139810",
  green200: "#FBFFF3",
  green300: "#067647",
  green400: "#ABEFC6",
  green500: "#ECFDF3",
  white: "#fff",
  grey: "#131a470a",
  grey100: "#fafafa",
  grey200: "#f6f9f1",
  grey300: "#c8cad6",
  grey400: "#e4e7ec",
  grey500: "#475467",
  grey600: "#F9FAFB",
  grey700: "#667085",
  grey800: "#D0D5DD",
  blue100: "#3538CD",
  blue200: "#C7D7FE",
  blue300: "#EEF4FF",
  orange100: "#DC6803",
  orange200: "#FEDF89",
  orange300: "#FFFCF5",
};

let customTypography = (mode) =>
  createTheme({
    typography: {
      // htmlFontSize: 18,
      color: colors.black,
      fontFamily: "Poppins,Archivo",
      h1: {
        fontSize: "1.4rem",
        fontWeight: 600,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "1.2rem",
        },
      },
      h2: {
        fontSize: "1.125rem",
        fontWeight: 600,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "1rem",
        },
      },
      h3: {
        fontSize: "1rem",
        fontWeight: 500,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "0.875rem",
        },
      },
      h4: {
        fontSize: "0.875rem",
        fontWeight: 400,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "0.75rem",
        },
      },
      h5: {
        fontSize: "0.80rem",
        fontWeight: 600,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "0.75rem",
        },
      },
      h6: {
        fontSize: "0.9rem",
        fontWeight: 500,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "0.8rem",
        },
      },
      subtitle1: {
        fontSize: "0.813rem",
        fontWeight: 400,
        color: mode === "dark" ? colors.white : colors.black,
        "@media (max-width:900px)": {
          fontSize: "0.75rem",
        },
      },
      subtitle2: {
        fontSize: "0.813rem",
        fontWeight: 400,
        color: mode === "dark" ? colors.white : colors.black460,
      },
      subtitle3: {
        fontSize: "0.70rem",
        fontWeight: 400,
        color: mode === "dark" ? colors.white : colors.black,
      },
      errorText: {
        fontSize: "0.813rem",
        fontWeight: 400,
        color: "#d32f2f",
      },
      descriptionText: {
        fontSize: "0.85rem",
        fontWeight: 400,
        color: mode === "dark" ? colors.white : colors.grey500,
        "@media (max-width:900px)": {
          fontSize: "0.8rem",
        },
      },
    },
  }).typography;

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      common: {
        black: colors.black,
        white: colors.white,
      },
      primary: {
        main: "#709A1C",
        dark: "#4E6B13",
      },
      error: {
        main: "#d32f2f",
      },
      warning: {
        main: "#ed6c02",
      },
      info: {
        main: "#0288d1",
      },
      success: {
        main: "#2e7d32",
      },
      socialButton: {
        main: colors.grey,
      },
      greyButton: {
        main: colors.black700,
      },
      baseBgColor: mode === "light" && "#FCFCFC",
      white10: "#ffffff1a",
      borderColor100: "#131A471A",
      uploadBorder: "#131A4733",
      disabledColor: "#9e9e9e",
      placeholderColor: "#131A4761",
      iconBorder: "#D0D0D04D",
      closeIcon: "#131A478A",
      subItemBg: "#739C211A",
      paginationBg: "#709A1C0F",
      greyBackground: colors.grey600,
      borderColor200: colors.grey400,
      subtitleColor: colors.grey500,
      active: "#44b700",
      deactive: "#D5D7DA",
    },
    typography: customTypography(mode),
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? colors.black100 : colors.white,
            color: mode === "dark" ? colors.white : colors.black,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? colors.black100 : colors.white,
            color: mode === "dark" ? colors.white : colors.black,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            boxShadow: "none",
            textTransform: "none",
            fontSize: "0.875rem",
            "@media (max-width:900px)": {
              fontSize: "0.75rem",
            },
          },
        },
        defaultProps: {
          disableRipple: true,
        },
        variants: [
          {
            props: { size: "small" },
            style: { fontSize: "0.7rem" },
          },
        ],
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiIconButton: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            width: "100%",
            height: "46px",
            fontSize: "0.875rem",
            "& .Mui-disabled": {
              backgroundColor:
                mode === "dark" ? colors.black400 : colors.grey100,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: mode === "light" && "#131A473B !important",
              borderRadius: "8px",
            },
            "& .MuiInputAdornment-root": {
              "& .MuiButtonBase-root": {
                backgroundColor: "transparent",
              },
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            "& .Mui-disabled": {
              backgroundColor:
                mode === "dark" ? colors.black400 : colors.grey100,
            },
          },
          paper: {
            backgroundColor: mode === "dark" ? colors.black500 : colors.white,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: colors.black,
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            "& .MuiTypography-root": {
              fontSize: "0.875rem",
              "@media (max-width:900px)": {
                fontSize: "0.75rem",
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                minWidth: 370,
                padding: "24px 32px",
                borderRadius: "12px",
                backgroundColor: mode === "dark" && colors.black400,
                "@media (max-width:900px)": {
                  minWidth: 270,
                  padding: "16px 24px",
                },
                "& .MuiDialogTitle-root": {
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: mode === "dark" ? colors.white : colors.black,
                },
                "& .MuiIconButton-root": {
                  color: mode === "dark" && colors.white,
                  backgroundColor: "transparent",
                },
                "& .MuiDialogContent-root": {
                  marginRight: "-20px",
                  padding: "0 16px 8px 0",
                },
                "& .MuiDialogActions-root": {
                  "& .MuiButtonBase-root": {
                    minWidth: 120,
                    fontSize: "0.75rem",
                    borderRadius: 25,
                  },
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === "dark"
                ? alpha(colors.white, 0.08)
                : alpha(colors.black, 0.08),
            color: mode === "dark" ? colors.white : colors.black,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: "#131A471A",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            padding: "24px 32px",
            boxShadow:
              "0px 4px 3.15px 0px #29489803,0px 8.15px 6.52px 0px #29489805",
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            "& .MuiBreadcrumbs-separator": {
              fontSize: "0.7rem !important",
            },
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            "& .MuiPaper-root": {
              backgroundColor: mode === "dark" ? colors.black500 : colors.white,
            },
          },
        },
      },
      MuiPickersPopper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? colors.black500 : colors.white,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            border: `1px solid ${colors.grey400}`,
            background: colors.grey600,
            borderRadius: "8px",
            minHeight: "42px",
            height: "42px",
            "& .MuiTabs-indicator": {
              opacity: 0,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: "40px",
            maxWidth: "none",
            height: "40px",
            color: colors.grey700,
            fontWeight: 600,
            fontSize: "0.85rem",
            textTransform: "capitalize",
            padding: "0 32px 0 32px",
            flex: 1,
            "&.Mui-selected": {
              border: `1px solid ${colors.grey800}`,
              background: colors.white,
              borderRadius: "8px",
              color: colors.black800,
            },
          },
        },
      },
    },
  });

export default getTheme;
