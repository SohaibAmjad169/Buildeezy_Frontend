import { useEffect, useRef, useCallback } from "react";
import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { isArray } from "lodash";
import { Eye, Trash, ExportCurve } from "iconsax-react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import MuiSpinner from "../common/MuiSpinner";
import MuiTypography from "../common/MuiTypography";
import { deleteFileUrl, uploadFileUrl } from "../../apis/apiEndPoints";
import { setIsUploading } from "../../redux/onboardingSlice";
import { useThemeMode } from "../../context/ThemeContext";
import {
  getDocIcon,
  getFileFormat,
  getFileName,
  getFileType,
} from "../../utils/file";
import { colors } from "../../styles/theme";
import DocumentViewer from "./DocumentViewer";
import MuiDialog from "../common/MuiDialog";
import MuiActionDialog from "../common/MuiActionDialog";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function UploadDoc({
  id,
  label,
  value,
  onSelectFiles,
  acceptedFileTypes,
  multipleFiles = false,
  sx,
  showTitle = true,
  isHorizontal = false,
  isDisabled = false,
  validation = {},
  isAssets = false,
  isLogo = false,
  mobileConfig = {},
  docId = false,
  setUploadedDocumentId,
  shouldVerify = true,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);
  const { isUploading } = useSelector((state) => state.onboarding);
  const { profileData } = useSelector((state) => state.profile);
  const [currentFile, setCurrentFile] = useState(null);
  const imageRef = useRef();

  const { mode } = useThemeMode();

  const [open, setOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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
  const [imageInfo, setImageInfo] = useState({ name: "", type: "" });
  const [selectedFile, setSelectedFile] = useState();
  const [error, setError] = useState("");

  useEffect(() => {
    setError(validation?.error);
  }, [validation.error]);

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }
  async function onDeleteDialogOpen(file) {
    setSelectedFile(file);
    setOpenDeleteDialog(true);
  }

  //viewer dialog
  function onViewerOpen(file) {
    const fileUrl = file.includes("https:") ? file : IMAGE_URL + file;
    setCurrentFile(fileUrl);
    setOpen(true);
  }
  function onCloseViewer() {
    setCurrentFile(null);
    setOpen(false);
  }

   const uploadFile = async (id, files) => {
    try {
      dispatch(setIsUploading({ id, status: true }));
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
        if (profileData?.id) {
          formData.append("folderName", profileData.id);
        }
        formData.append("shouldVerify", shouldVerify.toString());
      });
      const response = await uploadFileUrl(formData);
      let key;
      let documentId;
      if (multipleFiles) {
        key = response.data.data.map((obj) => obj.key);
        documentId = response.data.data.map((obj) => obj.documentId);
      } else {
        key = response.data.data[0].key;
        documentId = response.data.data[0].documentId;
      }
      onSelectFiles(id, (prevValue) => {
        const updatedValue = isArray(prevValue) ? [...prevValue, ...key] : key;
        return updatedValue;
      });

      // Store keys (document paths like "137/image_20250821104724.png") instead of document IDs
      if (docId) {
        setUploadedDocumentId((prev) => {
          const updatedValue = Array.isArray(prev)
            ? [...prev, ...key]
            : key;
          return updatedValue;
        });
      }

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
      dispatch(setIsUploading({ id: null, status: false }));
    }
  };

  const deleteFile = async () => {
    try {
      dispatch(setIsUploading({ id, status: true }));
      if (profileData?.id) {
        await deleteFileUrl(profileData.id, getFileName(selectedFile));
      }
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("onboarding.file_deleted"),
        })
      );
      onSelectFiles(id, (prevValue) => {
        if (isArray(prevValue)) {
          const indexToRemove = prevValue.indexOf(selectedFile);
          if (indexToRemove !== -1) {
            prevValue.splice(indexToRemove, 1);
          }
          return [...prevValue];
        } else {
          return "";
        }
      });
      onDeleteDialogClose();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setIsUploading({ id: null, status: false }));
    }
  };

  //edit image dialog
  function onCloseEditImageDialog() {
    setOpenEditImage(false);
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

  async function onEditImage() {
    const blob = await generateCroppedImage();
    if (!blob) return;

    const croppedFile = new File([blob], imageInfo.name, {
      type: `image/${imageInfo.type}`,
    });

    uploadFile(id, [croppedFile]);
  }

  const handleEditImage = async (file) => {
    setImageInfo({
      name: file.name,
      type: getFileFormat(file.name),
    });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setOpenEditImage(true);
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

  const handleUpload = useCallback(
    (acceptedFiles) => {
      // Check file size for assets (ad uploads)
      if (
        isAssets &&
        acceptedFiles.some((file) => file.size > 250 * 1024 * 1024)
      ) {
        setError("File is too large (max 250MB)");
        return;
      }
      if (getFileType(acceptedFiles[0].name) === "image") {
        handleEditImage(acceptedFiles[0]);
      } else {
        uploadFile(id, acceptedFiles);
      }
    },
    [handleEditImage, uploadFile, id, isAssets]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      handleUpload(acceptedFiles);
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      disabled: isDisabled,
      accept: acceptedFileTypes,
    });

  const renderDragLabel = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDisabled && "not-allowed",
      }}
    >
      <Box
        sx={{
          border: `1px solid ${colors.grey400}`,
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          boxShadow:
            "0px 1px 2px 0px #1018280D, 0px -2px 0px 0px #1018280D inset",
        }}
      >
        {isUploading.status && id === isUploading.id ? (
          <MuiSpinner />
        ) : (
          <ExportCurve
            size={22}
            color={mode === "dark" ? colors.white : colors.black}
          />
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDragActive ? (
          <MuiTypography variant="h6">{t("upload.drop_here")}</MuiTypography>
        ) : (
          <Stack direction={"row"}>
            <MuiTypography
              variant="h6"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              {mobileConfig.uploadButtonText || t("upload.click_to_upload")}
              &nbsp;
            </MuiTypography>
            <MuiTypography
              variant="h6"
              // sx={{ fontWeight: 400, color: "subtitleColor" }}
              sx={{ fontWeight: 400,  color: (theme) =>
                  theme.palette.mode === "dark" ? "#E4E7EC" : "#475467" }}
            >
              {t("upload.drag_and_drop")}
            </MuiTypography>
          </Stack>
        )}

        <MuiTypography
          variant="subtitle1"
          // sx={{ fontSize: "0.8rem", color: "subtitleColor" }}
          sx={{ fontSize: "0.8rem",  color: (theme) =>
              theme.palette.mode === "dark" ? "#E4E7EC" : "#667085" }}
        >
          {mobileConfig.supportedFormats ||
            (isAssets ? t("upload.file_size_assets") : t("upload.file_size"))}
        </MuiTypography>
        {isDragReject && (
          <MuiTypography variant="errorText">
            {t("upload.rejected_files")}
          </MuiTypography>
        )}
      </Box>
    </Box>
  );

  const renderFileList = (file) => {
    if (!file) return null;
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={getDocIcon(file)}
            alt="image"
            sx={{
              width: 35,
              mr: 1.5,
            }}
          />
          <Box>
            <MuiTypography
              variant="subtitle1"
              className="text-ellipsis"
              sx={{ maxWidth: "300px", marginBottom: "-6px" }}
            >
              {file && getFileName(file)}
            </MuiTypography>
            <MuiTypography
              variant="subtitle3"
              className="text-ellipsis"
              sx={{ maxWidth: "300px" }}
            >
              {t("upload.file_format")}&nbsp; {file && getFileFormat(file)}
            </MuiTypography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tooltip title={t("view")} placement="bottom">
            <IconButton
              disabled={loading || isDisabled}
              onClick={() => onViewerOpen(file)}
            >
              <Eye size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("onboarding.delete")} placement="bottom">
            <IconButton
              disabled={loading || isDisabled}
              onClick={() => onDeleteDialogOpen(file)}
              sx={{
                color: "error.main",
              }}
            >
              <Trash size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  const renderAssetsPreview = () => {
    if (!isAssets || !value) return null;

    // Permitir tanto strings (URL) como objetos {fileUrl, fileName}
    const files = (isArray(value) ? value : [value])
      .filter(asset =>
        (typeof asset === "string" && asset) ||
        (asset && asset.fileUrl && asset.fileName)
      );
    if (files.length === 0) return null;
    return (
      <Box
        sx={{
          width: "100%",
          position: "relative",
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {files.map((file, index) => {
            // Soporta string (URL) y objeto {fileUrl, fileName}
            const fileUrl = typeof file === "string" ? file : file.fileUrl;
            const fileType = getFileType(fileUrl);
            return (
              <Box
                key={index}
                sx={{
                  width: "120px",
                  height: "100px",
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  flexShrink: 0,
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              >
                {fileType === "image" ? (
                  <Box
                    component="img"
                    src={fileUrl.includes("https:") ? fileUrl : IMAGE_URL + fileUrl}
                    alt={`Asset Preview ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onClick={() => onViewerOpen(fileUrl)}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "paginationBg",
                    }}
                    onClick={() => onViewerOpen(fileUrl)}
                  >
                    {/* Aquí deberías mapear el tipo de documento a un ícono si lo deseas */}
                    <Box
                      component="img"
                      src={getDocIcon(fileUrl)}
                      alt="file"
                      sx={{ width: 40, height: 40 }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderLogoPreview = () => {
    if (!isLogo || !value) return null;

    return (
      <Box sx={{ width: "100%", mb: 3 }}>
        <Box
          sx={{
            width: "200px",
            height: "200px",
            margin: "0 auto",
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {getFileType(value) === "image" ? (
            <Box
              component="img"
              src={value.includes("https:") ? value : IMAGE_URL + value}
              alt="Logo Preview"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "paginationBg",
              }}
            >
              <Box
                component="img"
                src={getDocIcon(value)}
                alt="file"
                sx={{ width: 50, height: 50 }}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {showTitle && (
        <MuiTypography variant="h4" sx={{ mb: 3, ...sx }}>
          {label}
        </MuiTypography>
      )}
      <Box
        sx={{
          width: "100%",
          ...(isHorizontal && { display: "flex", flexWrap: "wrap", gap: 8 }),
        }}
      >
        {renderAssetsPreview()}
        {renderLogoPreview()}
        {(!isLogo || !value) && (
          <Box
            {...getRootProps()}
            sx={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: isDragActive
                ? "primary.main"
                : mode === "dark"
                ? "common.white"
                : "uploadBorder",
              borderRadius: "14px",
              width: isHorizontal ? "50%" : "100%",
              height: "126px",
              cursor: "pointer",
              px: 1,
              ...(mobileConfig.maxWidth && {
                maxWidth: mobileConfig.maxWidth,
              }),
              ...(mobileConfig.aspectRatio && {
                aspectRatio: mobileConfig.aspectRatio,
              }),
            }}
          >
            <input {...getInputProps()} />
            {renderDragLabel}
            {error && (
              <MuiTypography variant="errorText">{error}</MuiTypography>
            )}
          </Box>
        )}

        {((isArray(value) && value.length > 0) ||
          (!isArray(value) && value)) && (
          <Box sx={{ width: isHorizontal ? "38%" : "100%" }}>
            <MuiTypography
              variant="h5"
              className="text-ellipsis"
              sx={{ maxWidth: "300px", mt: 2 }}
            >
              {t("upload.file")}
            </MuiTypography>
            {isArray(value)
              ? value.length > 0 &&
                value.map((file) => (
                  <Fragment key={file}>{renderFileList(file)}</Fragment>
                ))
              : value && renderFileList(value)}
          </Box>
        )}
      </Box>
      {currentFile && open && (
        <DocumentViewer
          open={open}
          handleClose={onCloseViewer}
          type={getFileFormat(currentFile)}
          name={getFileName(currentFile)}
          path={currentFile}
        />
      )}
      <MuiDialog
        title={t("delete_document")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={deleteFile}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
      <MuiActionDialog
        width={750}
        open={openEditImage}
        handleClose={onCloseEditImageDialog}
        title={t("upload.crop_image")}
        handleSuccess={onEditImage}
        actionTitle={t("submit")}
      >
        <Box sx={{ width: "100%", height: "100%", p: 2 }}>
          {imagePreview && (
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
              aspect={
                mobileConfig.aspectRatio
                  ? parseFloat(mobileConfig.aspectRatio.split(":")[0]) /
                    parseFloat(mobileConfig.aspectRatio.split(":")[1])
                  : undefined
              }
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

UploadDoc.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.any,
  onSelectFiles: PropTypes.func,
  acceptedFileTypes: PropTypes.object,
  multipleFiles: PropTypes.bool,
  sx: PropTypes.object,
  showTitle: PropTypes.bool,
  isHorizontal: PropTypes.bool,
  isAssets: PropTypes.bool,
  isLogo: PropTypes.bool,
  mobileConfig: PropTypes.object,
  shouldVerify: PropTypes.bool,
};

export default UploadDoc;
