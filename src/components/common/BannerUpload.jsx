import { useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Box, IconButton } from "@mui/material";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setProfileLoading } from "../../redux/profileSlice";
import MuiActionDialog from "./MuiActionDialog";
import MuiTypography from "./MuiTypography";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../../context/ThemeContext";
import { colors } from "../../styles/theme";
import { alpha } from "@mui/material";

function BannerUpload({ onBannerChange, value, tempBanner }) {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef();
  const imageRef = useRef();
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const [loading, setLoading] = useState(false);

  const [openEditImage, setOpenEditImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 25, // 2:1 aspect ratio for banner
  });
  const [completedCrop, setCompletedCrop] = useState(null);

  // Use tempBanner if available, otherwise use value
  const displayBanner = tempBanner || value;

  function onUploadBanner() {
    hiddenFileInput.current.click();
  }

  const handleRemoveBanner = () => {
    onBannerChange(null);
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
      canvas.toBlob(resolve, "image/jpeg", 0.7)
    );

    return blob;
  }, [completedCrop]);

  const uploadCroppedImage = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(setProfileLoading(true));

      const blob = await generateCroppedImage();
      if (!blob) return;

      // Convert blob to base64 data URL with reduced quality
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        // Compress the image by reducing quality
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set a reasonable size for the banner
          const maxWidth = 1200;
          const maxHeight = 300;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight * width) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw the image with reduced quality
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with reduced quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);

          // Pass the compressed base64 string
          onBannerChange(compressedBase64);
        };
      };

      onCloseEditImageDialog();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      setLoading(false);
      dispatch(setProfileLoading(false));
    }
  }, [dispatch, onBannerChange, generateCroppedImage]);

  function onCloseEditImageDialog() {
    setOpenEditImage(false);
    setImagePreview(null);
  }

  const handleEditImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setOpenEditImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoaded = (e) => {
    imageRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const cropWidth = 50;
    const cropHeight = (cropWidth * height) / (width * 2); // maintain 2:1 aspect ratio

    setCrop(
      centerCrop(
        makeAspectCrop(
          { unit: "%", width: cropWidth, height: cropHeight },
          2, // aspect ratio (2:1 for banner)
          width,
          height
        ),
        width,
        height
      )
    );
  };

  return (
    <>
      <Box
        onClick={onUploadBanner}
        data-tour='banner-upload'
        sx={{
          borderRadius: "8px",
          cursor: "pointer",
          bgcolor: mode === "dark" ? alpha(colors.grey100, 0.0) : colors.white,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "180px",
          width: "100%",
          position: "relative",
          ...(displayBanner
            ? {
                p: 0,
                border: "none",
              }
            : {
                p: 0,
                border: `1px solid ${colors.grey800}`,
                "&:hover": {
                  borderWidth: "2px",
                },
              }),
        }}
      >
        <input
          ref={hiddenFileInput}
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleEditImage}
          style={{ display: "none" }}
        />

        {displayBanner ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              opacity: loading ? 0.5 : 1,
              transition: "opacity 0.2s",
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={displayBanner}
              alt="banner"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBanner();
                }}
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
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              p: 2,
            }}
          >
            <CloudUploadIcon
              sx={{
                fontSize: 40,
                color: "text.secondary",
                mb: 2,
              }}
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
            </Box>
          </Box>
        )}
      </Box>

      <MuiActionDialog
        width={750}
        open={openEditImage}
        handleClose={() => {
          onCloseEditImageDialog();
          setImagePreview(null);
        }}
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
              aspect={2} // 2:1 aspect ratio for banner
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
    </>
  );
}

export default BannerUpload;
