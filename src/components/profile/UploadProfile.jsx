import { useState, useRef, useCallback, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Stack, OutlinedInput, useTheme } from "@mui/material";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { setAlert } from "../../redux/configSlice";
import { uploadFileUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setProfileLoading } from "../../redux/profileSlice";
import MuiActionDialog from "../common/MuiActionDialog";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";

// Custom input component for OutlinedInput
const CustomInputComponent = forwardRef(
  function CustomInputComponent(props, ref) {
    // Destructure props to get what you need
    const {
      onUploadProfile,
      hiddenFileInput,
      handleEditImage,
      profileLoading,
      displayImage,
      t,
    } = props;
    return (
      <Box
        ref={ref}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
        onClick={onUploadProfile}
      >
        <input
          ref={hiddenFileInput}
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleEditImage}
          style={{ display: "none" }}
        />
        <Box
          sx={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            flexShrink: 0,
            overflow: "hidden",
            opacity: profileLoading ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {displayImage ? (
            <Box
              component="img"
              src={displayImage}
              alt="profile"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <FileDownloadOutlinedIcon sx={{ fontSize: 100 }} />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ flexWrap: "wrap", justifyContent: "center" }}
          >
            <MuiTypography
              variant="h6"
              sx={{ color: "primary.main", fontSize: "0.875rem" }}
            >
              {t("profile.click_to_upload")}
            </MuiTypography>
            <MuiTypography
              variant="h6"
              sx={{ color: "text.secondary", fontSize: "0.875rem" }}
            >
              {t("profile.drag_and_drop")}
            </MuiTypography>
          </Stack>
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
            {t("profile.upload_info")}
          </MuiTypography>
        </Box>
      </Box>
    );
  }
);

function UploadProfile({ onPicChange, tempAvatar }) {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef();
  const imageRef = useRef();
  const { t } = useTranslation();

  const { profileData } = useSelector((state) => state.profile);
  const { profileLoading } = useSelector((state) => state.profile);

  const [openEditImage, setOpenEditImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState(null);

  const theme = useTheme();
  const borderColor =
    theme.palette.mode === "dark" ? theme.palette.divider : "#D0D5DD";

  // Display the temporary avatar if available, otherwise use the profile avatar
  const displayImage = tempAvatar || profileData?.avatar;

  function onUploadProfile() {
    hiddenFileInput.current.click();
  }

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
    try {
      dispatch(setProfileLoading(true));

      const blob = await generateCroppedImage();
      if (!blob) return;

      const croppedFile = new File([blob], "cropped.jpeg", {
        type: "image/jpeg",
      });

      // Create image URL for immediate preview
      const imageDataUrl = URL.createObjectURL(croppedFile);

      // Upload to server
      const formData = new FormData();
      formData.append("file", croppedFile);
      formData.append("folderName", profileData?.id);

      const response = await uploadFileUrl(formData);
      const key = response.data.data[0].key;

      onPicChange(imageDataUrl, key);
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
      dispatch(setProfileLoading(false));
    }
  }, [dispatch, profileData?.id, onPicChange, generateCroppedImage]);

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
    setCrop(
      centerCrop(
        makeAspectCrop(
          { unit: "%", width: 50 },
          0,
          e.currentTarget.width,
          e.currentTarget.height
        ),
        e.currentTarget.width,
        e.currentTarget.height
      )
    );
  };

  return (
    <>
      <OutlinedInput
        fullWidth
        readOnly
        disabled={profileLoading}
        sx={{
          height: 180,
          backgroundColor: "transparent",
          borderRadius: "10px",
          cursor: "pointer",
          p: 0,
          alignItems: "stretch",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: borderColor,
            borderWidth: "1px",
            borderRadius: "10px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderRadius: "10px",
          },
          "& .MuiInputBase-input": {
            p: 0,
          },
        }}
        onClick={onUploadProfile}
        startAdornment={null}
        endAdornment={null}
        tabIndex={-1}
        inputComponent={CustomInputComponent}
        inputProps={{
          onUploadProfile,
          hiddenFileInput,
          handleEditImage,
          profileLoading,
          displayImage,
          t,
        }}
      />

      <MuiActionDialog
        width={750}
        open={openEditImage}
        handleClose={() => {
          onCloseEditImageDialog();
          // Reset state when dialog is closed without uploading
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

export default UploadProfile;
