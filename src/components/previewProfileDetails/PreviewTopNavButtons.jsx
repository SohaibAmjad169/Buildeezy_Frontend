import { Button, Box } from "@mui/material";
import { ArrowBackIos, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

function PreviewTopNavButtons({ onExitPreview, themeColors, themeValue }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        position: "absolute",
        top: 32,
        left: 32,
        zIndex: 2,
        pt: { xs: 0.5, sm: 2, md: 2 },
        pb: { xs: 0.5, sm: 2, md: 2 },
        display: "flex",
        flexDirection: "row",
        gap: { xs: 1, sm: 2 },
        alignItems: "center",
        mr: { xs: 2, sm: 4, md: 6 },
        width: { xs: "calc(100vw - 64px)", sm: "auto" },
        maxWidth: { xs: "none", sm: 600 },
      }}
    >
      <Button
        variant="text"
        onClick={onExitPreview}
        startIcon={<ArrowBackIos sx={{ fontSize: 16 }} />}
        fullWidth={false}
        sx={{
          color: themeColors.main,
          fontSize: { xs: "0.65rem", sm: "1rem" },
          minWidth: { xs: 0, sm: 120 },
          px: { xs: 1, sm: 2 },
          width: "auto",
          whiteSpace: "nowrap",
          "& .MuiButton-startIcon": {
            marginRight: 0.5,
          },
          "&:hover": {
            backgroundColor: "transparent",
            color: themeColors.main,
          },
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{t("profile.preview.back_to_edit")}</span>
      </Button>
           <Button
  variant="contained"
  startIcon={<Visibility />}
  disableRipple
  fullWidth={false}
  sx={{
    backgroundColor:
      themeValue === "orange_gradient" ||
      themeValue === "decorative_frame" ||
      themeValue === "decorative_frame_alt"||
      themeValue === "green_gradient"
        ? "#FEDF89"
        : `${themeColors.main}20`,
    color:
      themeValue === "orange_gradient" ||
      themeValue === "decorative_frame" ||
       themeValue === "decorative_frame_alt"||
      themeValue === "green_gradient"
        ? "#000"
        : themeColors.main,
    border:
      themeValue === "orange_gradient" ||
      themeValue === "decorative_frame" ||
       themeValue === "decorative_frame_alt"||
      themeValue === "green_gradient"
        ? "2px solid #fff"
        : "none",
    fontSize: { xs: "0.65rem", sm: "1rem" },
    minWidth: { xs: 0, sm: 120 },
    px: { xs: 1, sm: 2 },
    width: "auto",
    whiteSpace: "nowrap",
    boxShadow: "none",
    cursor: "default",
    pointerEvents: "none",
    "& .MuiButton-startIcon": {
      marginRight: 0.5,
    },
  }}
>
  <span style={{ whiteSpace: "nowrap" }}>{t("common.preview_mode")}</span>
</Button>
    </Box>
  );
}

export default PreviewTopNavButtons;
