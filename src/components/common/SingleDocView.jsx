import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

import MuiTypography from "../common/MuiTypography";
import {
  getDocIcon,
  getFileFormat,
  getFileName,
  getFileType,
} from "../../utils/file";
import VideoThumb from "../common/VideoThumb";
import DocumentViewer from "../upload/DocumentViewer";
import { useState } from "react";
import buildeezyPlaceholder from "../../assets/images/buildeezy800x400.webp";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function SingleDocView({ file, isMobile }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
const [imgSrc, setImgSrc] = useState(
  file && typeof file === "string"
    ? file.includes("https:") 
      ? file 
      : IMAGE_URL + file 
    : buildeezyPlaceholder
);
//  const [iconSrc, setIconSrc] = useState(getDocIcon(file));

const [iconSrc, setIconSrc] = useState(
  file ? getDocIcon(file) : "/icons/default-doc-icon.svg"
);

  function onViewerOpen() {
    setOpen(true);
  }
  function onCloseViewer() {
    setOpen(false);
  }

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 1, md: 4 },
      }}
    >
      {file ? (
        <>
          {getFileType(file) === "image" ? (
            <Box
              component="img"
              src={imgSrc}
              onError={() => setImgSrc(buildeezyPlaceholder)}
              alt="Additional Document"
              onClick={onViewerOpen}
              sx={{
                objectFit: "cover",
                width: "100%",
                height: { xs: "200px", md: "400px" },
                maxWidth: "800px",
                mr: 1,
                borderRadius: { xs: "8px", md: "16px" },
                bgcolor: "paginationBg",
                cursor: "pointer",
                display: "block",
                ml: 0,
              }}
            />
          ) : getFileType(file) === "video" ? (
            <VideoThumb
              videoUrl={file.includes("https:") ? file : IMAGE_URL + file}
              width="100%"
              height={isMobile ? 200 : 400}
              onClick={onViewerOpen}
              sx={{
                borderRadius: { xs: "8px", md: "16px" },
                cursor: "pointer",
                mr: 1,
              }}
            />
          ) : (
            <Box
              key={file}
              onClick={onViewerOpen}
              sx={{
                placeItems: "center",
                display: "grid",
                width: "100%",
                height: { xs: "200px", md: "400px" },
                borderRadius: { xs: "8px", md: "16px" },
                bgcolor: "paginationBg",
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                // src={getDocIcon(file)}
                src={iconSrc}
                onError={() => setIconSrc(defaultIcon)}
                alt="file"
                sx={{
                  height: { xs: 25, md: 35 },
                  width: { xs: 25, md: 35 },
                  mr: 1.5,
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <MuiTypography variant="subtitle2">
          {t("job.details.no_documents")}
        </MuiTypography>
      )}

      {open && (
        <DocumentViewer
          open={open}
          handleClose={onCloseViewer}
          type={getFileFormat(file)}
          name={getFileName(file)}
          path={file.includes("https:") ? file : IMAGE_URL + file}
        />
      )}
    </Box>
  );
}

export default SingleDocView;
