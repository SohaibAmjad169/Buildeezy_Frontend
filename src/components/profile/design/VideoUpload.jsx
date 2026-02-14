import { useRef, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useThemeMode } from "../../../context/ThemeContext";
import MuiTypography from "../../common/MuiTypography";
import { uploadFileUrl } from "../../../apis/apiEndPoints";

function VideoUpload({ value, onChange }) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const hiddenFileInput = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        throw new Error(t("errors.invalid_video_format"));
      }

      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(t("errors.video_too_large"));
      }

      // Upload to backend
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadFileUrl(formData);
      const videoUrl = response?.data?.url || response?.data?.data?.url;
      if (!videoUrl) throw new Error(t("errors.upload_failed"));
      onChange(videoUrl);
    } catch (err) {
      setError(err.message);
      onChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError("");
  };

  return (
    <Box>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleFileChange}
        accept="video/mp4"
        style={{ display: "none" }}
      />

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
            backgroundColor: mode === "dark" ? "#1A1D1F" : "#F9FAFB",
            borderRadius: 1,
          }}
        >
          <CircularProgress />
        </Box>
      ) : value ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            backgroundColor: mode === "dark" ? "#1A1D1F" : "#F9FAFB",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <video
            controls
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "contain",
            }}
          >
            <source src={value} type="video/mp4" />
            {t("errors.video_not_supported")}
          </video>
          <Button
            onClick={handleRemove}
            startIcon={<DeleteIcon />}
            variant="contained"
            color="error"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            {t("actions.remove")}
          </Button>
        </Box>
      ) : (
        <Button
          onClick={handleClick}
          startIcon={<CloudUploadIcon />}
          variant="outlined"
          fullWidth
          sx={{
            height: 200,
            border: "2px dashed",
            borderColor: mode === "dark" ? "#2F3336" : "#D0D5DD",
            backgroundColor: mode === "dark" ? "#1A1D1F" : "#F9FAFB",
            color: mode === "dark" ? "#fff" : "#344054",
            "&:hover": {
              borderColor: mode === "dark" ? "#3F4447" : "#98A2B3",
              backgroundColor: mode === "dark" ? "#1A1D1F" : "#F9FAFB",
            },
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <MuiTypography variant="body1" sx={{ mb: 1 }}>
              {t("actions.upload_video")}
            </MuiTypography>
            <MuiTypography variant="body2" color="textSecondary">
              MP4 {t("common.format_max_size", { size: "20MB" })}
            </MuiTypography>
          </Box>
        </Button>
      )}

      {error && (
        <MuiTypography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </MuiTypography>
      )}
    </Box>
  );
}

export default VideoUpload;
