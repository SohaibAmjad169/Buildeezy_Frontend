import React, { useState, useCallback } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { colors } from "../../../styles/theme";
import MuiTypography from "../../common/MuiTypography";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import MuiActionDialog from "../../common/MuiActionDialog";
import { useTheme } from "@mui/material/styles";

/**
 * @deprecated This component is deprecated and should not be used in new code.
 * Please use the UploadDoc component instead.
 */

function BannerUpload({ value, onChange }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const hiddenFileInput = React.useRef(null);
  const imageRef = React.useRef(null);

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

  const handleClick = () => {
    hiddenFileInput.current.click();
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

  // const uploadCroppedImage = useCallback(async () => {
  //   const blob = await generateCroppedImage();
  //   if (!blob) return;

  //   const croppedFile = new File([blob], "banner.jpeg", {
  //     type: "image/jpeg",
  //   });

  //   // Create image URL for immediate preview
  //   const imageDataUrl = URL.createObjectURL(croppedFile);

  //   onChange({
  //     imageDataUrl,
  //     uploadedKey: "",
  //     fileName: croppedFile.name,
  //     size: `${(croppedFile.size / 1024 / 1024).toFixed(2)}MB`,
  //   });

  //   onCloseEditImageDialog();
  // }, [generateCroppedImage, onChange]);

  const uploadCroppedImage = useCallback(async () => {
    const blob = await generateCroppedImage();
    if (!blob) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result;

      onChange({
        imageDataUrl: base64Image, // base64 string
        uploadedKey: "",
        fileName: "banner.jpeg",
        size: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
      });

      onCloseEditImageDialog();
    };

    reader.readAsDataURL(blob); // convert Blob to base64
  }, [generateCroppedImage, onChange]);


  const handleFileChange = (event) => {
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

  function onCloseEditImageDialog() {
    setOpenEditImage(false);
    setImagePreview(null);
  }

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
    <Box sx={{ width: "100%" }}>
      {value?.imageDataUrl && (
        <Box
          sx={{
            width: "100%",
            height: "200px",
            borderRadius: "8px",
            overflow: "hidden",
            mb: 2,
            border: `1px solid ${colors.grey400}`,
          }}
        >
          <Box
            component="img"
            src={value.imageDataUrl}
            alt="banner"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      <Box
        onClick={handleClick}
        sx={{
          border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : theme.palette.grey[300]}`,
          borderRadius: "8px",
          cursor: "pointer",
          p: 2,
          backgroundColor: "transparent",
          "&:hover": {
            borderColor:
              theme.palette.mode === "dark" ? "#fff" : theme.palette.grey[400],
            borderWidth: "2px",
            backgroundColor: "transparent",
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
          accept="image/svg+xml,image/png,image/jpeg,image/gif"
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
              {t("profile.design.layout.banner_formats")}
            </MuiTypography>
          </Box>
        </Box>
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
    </Box>
  );
}

export default BannerUpload;
