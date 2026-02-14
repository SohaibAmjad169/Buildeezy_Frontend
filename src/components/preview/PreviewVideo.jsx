import { Box, Typography, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { colors } from "../../styles/theme";
import React from "react";

const PreviewVideo = ({ videoUrl }) => {
  const { t } = useTranslation();
  const videoRef = React.useRef(null);

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <Box sx={{ position: "relative", width: 150 }}>
      {videoUrl ? (
        <Box
          component="video"
          ref={videoRef}
          src={videoUrl}
          sx={{
            width: "100%",
            aspectRatio: "9/16",
            objectFit: "cover",
            borderRadius: 1.5,
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            aspectRatio: "9/16",
            bgcolor: "#E8E8E8",
            borderRadius: 1.5,
          }}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
        }}
      >
        <IconButton
          sx={{
            bgcolor: "transparent",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            padding: "3px",
          }}
          size="small"
        >
          <CloseIcon sx={{ fontSize: 14, color: "white" }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 6,
          right: 6,
        }}
      >
        <IconButton
          onClick={handleFullscreen}
          sx={{
            bgcolor: "transparent",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            padding: "3px",
          }}
          size="small"
        >
          <FullscreenIcon sx={{ fontSize: 34, color: "white" }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <IconButton
          sx={{
            bgcolor: "transparent",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            padding: "3px",
          }}
          size="small"
        >
          <PlayCircleIcon sx={{ fontSize: 34, color: "white" }} />
        </IconButton>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: -20,
          bgcolor: colors.primary,
          color: "white",
          py: 0.25,
          px: 0.75,
          borderRadius: 1.5,
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          whiteSpace: "nowrap",
          zIndex: 11,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 500, fontSize: "0.7rem" }}
        >
          {t("profile.preview.video.hello")}
        </Typography>
      </Box>
    </Box>
  );
};

export default PreviewVideo;
