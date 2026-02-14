import { useTranslation } from "react-i18next";
import { Box, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { VolumeHigh, VolumeCross } from "iconsax-react";

import MuiTypography from "../common/MuiTypography";
import {
  getDocIcon,
  getFileFormat,
  getFileName,
  getFileType,
} from "../../utils/file";
import DocumentViewer from "../upload/DocumentViewer";
import buildeezy from "../../assets/images/buildeezy.png";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function LearningAdAssetView({ file }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  function onViewerOpen() {
    setOpen(true);
  }
  function onCloseViewer() {
    setOpen(false);
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Auto-start playing when component mounts
  useEffect(() => {
    setIsPlaying(true);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 0, md: 0 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      {file ? (
        <>
          {getFileType(file) === "image" ? (
            <Box
              component="img"
              src={file.includes("https:") ? file : IMAGE_URL + file}
              alt="Learning Asset"
              onClick={onViewerOpen}
              sx={{
                objectFit: "cover",
                width: "100%",
                height: { xs: "300px", sm: "400px", md: "450px", lg: "450px" },
                maxWidth: { xs: "1000px", sm: "700px", xl: "800px" },
                mr: { xs: 1, sm: 0 },
                borderRadius: { xs: "8px", md: "16px" },
                bgcolor3: "paginationBg",
                cursor: "pointer",
                display: "block",
                ml: { xs: 0, sm: "auto" },
              }}
            />
          ) : getFileType(file) === "video" ? (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: "300px", sm: "400px", md: "450px", lg: "450px" },
                maxWidth: { xs: "1000px", sm: "700px", xl: "500px" },
                borderRadius: { xs: "8px", md: "16px" },
                overflow: "hidden",
                bgcolor: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ml: { xs: 0, sm: "auto" },
                mr: { xs: 1, sm: 0 },
              }}
            >
              <ReactPlayer
                url={file.includes("https:") ? file : IMAGE_URL + file}
                width="100%"
                height="100%"
                playing={isPlaying}
                loop={true}
                muted={isMuted}
                controls={true}
                playsinline
                pip={false}
                stopOnUnmount={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                config={{
                  file: {
                    attributes: {
                      style: {
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      },
                      playsInline: true,
                      controlsList: "nodownload",
                    },
                    forceVideo: true,
                    forceHLS: false,
                    forceSafariHLS: false,
                  },
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
              <IconButton
                onClick={toggleMute}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  zIndex: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                {isMuted ? (
                  <VolumeCross size={24} variant="Bold" />
                ) : (
                  <VolumeHigh size={24} variant="Bold" />
                )}
              </IconButton>
            </Box>
          ) : (
            <Box
              key={file}
              onClick={onViewerOpen}
              sx={{
                placeItems: "center",
                display: "grid",
                width: "100%",
                height: "700px",
                borderRadius: { xs: "8px", md: "16px" },
                bgcolor: "paginationBg",
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src={getDocIcon(file)}
                alt="file"
                sx={{
                  height: { xs: 35, md: 45 },
                  width: { xs: 35, md: 45 },
                  mr: 1.5,
                }}
              />
            </Box>
          )}
        </>
      ) : (
            <Box
              component="img"
              src={buildeezy}
              alt="Learning Asset"
              onClick={onViewerOpen}
              sx={{
                objectFit: "contain",
                width: "100%",
                height: { xs: "300px", sm: "400px", md: "450px", lg: "450px" },
                maxWidth: { xs: "1000px", sm: "700px", xl: "800px" },
                mr: { xs: 1, sm: 0 },
                borderRadius: { xs: "8px", md: "16px" },
                bgcolor3: "paginationBg",
                cursor: "pointer",
                display: "block",
                ml: { xs: 0, sm: "auto" },
              }}
            />
     )}

      {open && getFileType(file) !== "video" && (
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

export default LearningAdAssetView;
