import { PlayCircle } from "iconsax-react";
import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

const VideoThumbnail = ({
  videoSrc,
  style,
  onClick,
  left = "43%",
  top = "35%",
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    const generateThumbnail = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const captureThumbnail = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg"); // Convert canvas to data URL
        setThumbnail(dataUrl);
      };

      // Ensure video is loaded and ready
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = 1; // Set time to capture the thumbnail (1 second)
      });

      video.addEventListener("seeked", captureThumbnail);

      // Clean up event listeners on unmount
      return () => {
        video.removeEventListener("loadedmetadata", () => {});
        video.removeEventListener("seeked", captureThumbnail);
      };
    };

    generateThumbnail();
  }, [videoSrc]);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: '100%'
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={200}
        height={100}
        style={{ display: "none" }}
      />
      {thumbnail && (
        <>
          <img
            src={thumbnail}
            alt="Video Thumbnail"
            style={{ ...style }}
            onClick={onClick}
          />
          <PlayCircle
            onClick={onClick}
            size="32"
            color="white"
            style={{
              position: "absolute",
              left: left,
              top: top,
              cursor: "pointer",
            }}
          />
        </>
      )}
    </Box>
  );
};

VideoThumbnail.propTypes  = {
  videoSrc: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  left: PropTypes.string,
  top: PropTypes.string,
}

export default VideoThumbnail;
