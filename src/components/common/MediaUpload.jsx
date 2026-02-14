import { useState, useCallback, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useThemeMode } from "../../context/ThemeContext";
import { colors } from "../../styles/theme";
import MuiTypography from "./MuiTypography";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import MuiActionDialog from "./MuiActionDialog";

const MediaUpload = ({
  type = "banner", // 'banner' or 'video'
  value,
  onChange,
  aspectRatio = 2, // default 2:1 for banner
  maxSize = type === "video" ? 20 : 5, // 20MB for video, 5MB for images
}) => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const hiddenFileInput = useRef(null);
  const imageRef = useRef(null);
  const [error, setError] = useState("");

  // Image crop states
  const [openEditImage, setOpenEditImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50 / aspectRatio,
  });
  const [completedCrop, setCompletedCrop] = useState(null);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleRemove = () => {
    onChange(null);
    setError("");
  };

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imageRef.current) return null;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    return blob;
  }, [completedCrop]);

  const uploadCroppedImage = useCallback(async () => {
    const blob = await generateCroppedImage();
    if (!blob) return;

    const croppedFile = new File([blob], "banner.jpeg", {
      type: "image/jpeg",
    });

    // Create image URL for immediate preview
    const imageDataUrl = URL.createObjectURL(croppedFile);

    onChange({
      imageDataUrl,
      uploadedKey: "",
      fileName: croppedFile.name,
      size: `${(croppedFile.size / 1024 / 1024).toFixed(2)}MB`,
    });

    onCloseEditImageDialog();
  }, [generateCroppedImage, onChange]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(t("errors.file_too_large", { size: maxSize }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setOpenEditImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCloseEditImageDialog = () => {
    setOpenEditImage(false);
    setImagePreview(null);
  };

  const onImageLoaded = (e) => {
    imageRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const cropWidth = 50;
    const cropHeight = cropWidth / aspectRatio;

    setCrop(
      centerCrop(
        makeAspectCrop(
          { unit: "%", width: cropWidth, height: cropHeight },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      )
    );
  };

  const renderPreview = () => {
    if (type === "banner" && (value?.imageDataUrl || value?.uploadedKey)) {
      return (
        <Box
          sx={{
            width: "100%",
            height: "200px",
            borderRadius: "8px",
            overflow: "hidden",
            mb: 2,
            border: `1px solid ${colors.grey400}`,
            position: "relative",
          }}
        >
          <Box
            component="img"
            src={value?.imageDataUrl || value?.uploadedKey}
            alt="banner"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Button
            onClick={handleRemove}
            startIcon={<DeleteIcon />}
            variant="text"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#fff",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            {t("actions.remove")}
          </Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {renderPreview()}

      {!value?.imageDataUrl && !value?.uploadedKey && (
        <Box
          onClick={handleClick}
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
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            ref={hiddenFileInput}
            type="file"
            accept={type === "video" ? "video/mp4" : "image/*"}
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
            <CloudUploadIcon
              sx={{ fontSize: 40, color: "text.secondary", mb: 2 }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <MuiTypography
                  variant="h6"
                  sx={{ color: "text.secondary", fontSize: "0.875rem" }}
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
                {type === "video"
                  ? t("common.format_max_size", { size: `${maxSize}MB` }) +
                    " (MP4)"
                  : t("profile.design.layout.banner_formats")}
              </MuiTypography>
            </Box>
          </Box>
        </Box>
      )}

      {error && (
        <MuiTypography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </MuiTypography>
      )}

      <MuiActionDialog
        width={750}
        open={openEditImage}
        handleClose={onCloseEditImageDialog}
        title={t("upload.crop_image")}
        handleSuccess={uploadCroppedImage}
        actionTitle={t("submit")}
      >
        <Box sx={{ width: "100%", height: "100%", p: 2 }}>
          {imagePreview && (
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
              aspect={aspectRatio}
            >
              <img
                src={imagePreview}
                alt="Crop"
                onLoad={onImageLoaded}
                style={{ width: "100%" }}
              />
            </ReactCrop>
          )}
        </Box>
      </MuiActionDialog>
    </Box>
  );
};

export default MediaUpload;
