import { Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ArrowLeft } from "iconsax-react";

// function BackButton({
//   variant = "contained",
//   onClick,
//   sx,
//   disabled,
//   children,
// }) {
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   const handleBack = () => {
//     navigate(-1); // go one step back in browser history
//   };

//   return (
//     <Box sx={{ ...sx }}>
//       <Button
//         disabled={disabled || false}
//         sx={{
//           width: "inherit",
//           ...sx,
//         }}
//         variant={variant}
//         fullWidth
//         onClick={onClick || handleBack}
//         startIcon={<ArrowBackIcon />}
//       >
//         {children || t("common.back")}
//       </Button>
//     </Box>
//   );
// }

function BackButton({
  variant = "contained",
  onClick,
  sx,
  disabled,
  children,
  showText = false,
  color,
  backgroundColor,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const theme = useTheme();
const isDark = theme.palette.mode === "dark";

 const textColor = color || (isDark ? "#E4E7EC" : "#101828");
  const bgColor = backgroundColor ?? "transparent";

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ ...sx }}>
      <Button
        disabled={disabled || false}
        onClick={onClick || handleBack}
        variant={variant}
        fullWidth={showText}
        sx={{
          // backgroundColor: backgroundColor,
          // color: color,
           backgroundColor: bgColor,
          color: textColor,
          "&:hover": {
            backgroundColor: "transparent", // slightly darker on hover
            boxShadow: "none",
          },
          width: showText ? "inherit" : "auto",
          minWidth: showText ? undefined : "auto",
          padding: showText ? undefined : "6px",
          ...sx,
        }}
        startIcon={showText ? <ArrowBackIcon /> : undefined}
      >
        {showText ? (
          children || t("common.back")
        ) : (
          <ArrowLeft size="25" color={color} />
        )}
      </Button>
    </Box>
  );
}

export default BackButton;
