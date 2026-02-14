import ReactPlayer from "react-player";
import PropsTypes from "prop-types";
import { Box } from "@mui/material";
import { PlayCircle } from "iconsax-react";
import { useState } from "react";

export default function VideoThumb({
  videoUrl,
  onClick = null,
  width,
  height,
  sx,
  isLearningAd = false,
}) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    if (isLearningAd) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (isLearningAd) {
      setIsHovering(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width,
        "&": {
          "&, &:hover": { backgroundColor: "black" },
          transition: "opacity 250ms ease-in-out",
          "& .playIcon": {
            transition: "opacity 250ms ease-in-out",
            opacity: isHovering ? 0 : 0.75,
          },
          "&:hover": {
            "&, & .playIcon": {
              opacity: 1,
            },
          },
          overflow: "hidden",
          border: "none",
          opacity: 0.85,
        },
        ...sx,
      }}
      onClick={() => onClick?.(videoUrl)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <PlayCircle
        color="white"
        size={32}
        className="playIcon"
        style={{
          translate: "-50% -50%",
          position: "absolute",
          left: "50%",
          top: "50%",
          opacity: isHovering ? 0 : 1,
          zIndex: 1,
        }}
      />
      <ReactPlayer
        url={videoUrl}
        height={height}
        width={width}
        playing={isHovering && isLearningAd}
        muted={true}
        loop={true}
        style={{
          backgroundColor: "black",
          borderRadius: "0.5rem",
          marginBottom: "0.75",
          cursor: "pointer",
        }}
      />
    </Box>
  );
}

VideoThumb.propTypes = {
  videoUrl: PropsTypes.string,
  onClick: PropsTypes.func,
  width: PropsTypes.oneOfType([PropsTypes.number, PropsTypes.string]),
  height: PropsTypes.oneOfType([PropsTypes.number, PropsTypes.string]),
  sx: PropsTypes.object,
  isLearningAd: PropsTypes.bool,
};
