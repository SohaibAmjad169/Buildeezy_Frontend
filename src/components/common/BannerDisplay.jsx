import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { useThemeMode } from "../../context/ThemeContext";
import { colors } from "../../styles/theme";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import MuiTypography from "./MuiTypography";
import { useTranslation } from "react-i18next";

function BannerDisplay({ banner, onBannerChange }) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const [isUploading, setIsUploading] = useState(false);
  const hiddenFileInput = useRef();

  const handleUploadClick = () => {
    hiddenFileInput.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        onBannerChange(reader.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    onBannerChange(null);
  };

  return (
    <Box
      onClick={handleUploadClick}
      sx={{
        border: `1px solid ${colors.grey800}`,
        borderRadius: "8px",
        cursor: "pointer",
        p: 2,
        bgcolor: mode === "dark" ? colors.grey800 : colors.white,
        "&:hover": {
          borderWidth: "2px",
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "180px",
        width: "100%",
        flex: "1 1 auto",
        position: "relative",
      }}
    >
      <input
        ref={hiddenFileInput}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            flexShrink: 0,
            overflow: "hidden",
            opacity: isUploading ? 0.5 : 1,
            transition: "opacity 0.2s",
            position: "relative",
          }}
        >
          {banner ? (
            <Box
              component="img"
              src={banner}
              alt="banner"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            <CloudUploadIcon
              sx={{
                fontSize: 40,
                color: "text.secondary",
              }}
            />
          )}
        </Box>

        {banner && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 1,
            }}
          >
            <IconButton
              onClick={handleRemoveBanner}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            mt: banner ? 0 : 1,
          }}
        >
          {!banner && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <MuiTypography
                  variant="h6"
                  sx={{ color: "primary.main", fontSize: "0.875rem" }}
                >
                  {t("profile.design.layout.click_to_upload")}
                </MuiTypography>
                <MuiTypography
                  variant="h6"
                  sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                >
                  {t("profile.design.layout.or_drag_and_drop")}
                </MuiTypography>
              </Box>

              <MuiTypography
                variant="subtitle1"
                sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  mt: 0.5,
                  textAlign: "center",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                }}
              >
                {t("profile.design.layout.banner_formats")}
              </MuiTypography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default BannerDisplay;
