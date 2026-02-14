import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  styled,
} from "@mui/material";
import { Buildings } from "iconsax-react";
import { useNavigate } from "react-router-dom";

import MuiTypography from "../common/MuiTypography";
import {
  getAllFirstCharUpperCase,
  getFirstCharUpperCase,
} from "../../utils/common";
import { AD_CARD_HEIGHT, AD_CARD_WIDTH } from "../../utils/constants/webinar";
import { getDocIcon, getFileType } from "../../utils/file";
import VideoThumb from "../common/VideoThumb";
import WebinarActionButtons from "./WebinarActionButtons";
import dayjs from "dayjs";

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "showActions",
})(({ theme }) => ({
  "&": {
    borderRadius: "1rem",
    width: AD_CARD_WIDTH,
    minHeight: AD_CARD_HEIGHT,
    padding: 0,
  },
  "&:not(.disabled):hover": {
    border: `solid ${theme.palette.primary.main} 1px`,
  },
}));

export default function WebinarCard({
  id,
  mappedType,
  headline,
  description,
  businessName,
  documents = [],
  showActions = false,
  handleDeleteWebinar,
  expireAt,
  onAdClick,
  isActive,
  state,
  status,
  active,
  published,
  visible,
}) {
  const navigate = useNavigate();

  function handleAdClick(e) {
    e.stopPropagation();
    if (onAdClick) {
      onAdClick(id);
    } else {
      navigate("view/" + id);
    }
  }

  function onReactiveAd(e) {
    e.stopPropagation();
    navigate("reactive/" + id);
  }

  function onEditWebinar(e) {
    e.stopPropagation();
    navigate("edit/" + id);
  }

  function onDeleteWebinar(e) {
    e.stopPropagation();
    handleDeleteWebinar(id);
  }

  const renderMedia = () => {
    if (!documents || !documents.length) {
      return (
        <Box
          sx={{
            placeItems: "center",
            display: "grid",
            width: "100%",
            height: 180,
            bgcolor: "paginationBg",
            mb: 1,
          }}
        >
          <Box
            component="img"
            src={getDocIcon("")}
            alt="no-file"
            sx={{
              height: 35,
              width: 35,
              mr: 1.5,
            }}
          />
        </Box>
      );
    }

    const fileType = getFileType(documents[0]);

    if (fileType === "image") {
      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 180,
            mb: 1,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={documents[0]}
            alt="ad-image"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      );
    }

    if (fileType === "video") {
      return (
        <VideoThumb
          videoUrl={documents[0]}
          width={"100%"}
          height={180}
          sx={{
            backgroundColor: "black",
            mb: 1,
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          placeItems: "center",
          display: "grid",
          width: "100%",
          height: 180,
          bgcolor: "paginationBg",
          mb: 1,
        }}
      >
        <Box
          component="img"
          src={getDocIcon(documents[0])}
          alt="ad-file"
          sx={{
            height: 35,
            width: 35,
            mr: 1.5,
          }}
        />
      </Box>
    );
  };

  return (
    <StyledCard variant="outlined" showActions={showActions}>
      {showActions ? (
        <Box>
          <Box onClick={handleAdClick} sx={{ cursor: "pointer" }}>
            {renderMedia()}
            <Stack spacing={1} sx={{ p: 2 }}>
              <MuiTypography
                variant="subtitle2"
                className="text-ellipsis"
                sx={{
                  maxWidth: 280,
                  fontSize: "0.75rem",
                  textAlign: "justify",
                  color: "primary.main",
                  fontWeight: 500,
                }}
              >
                {mappedType || "Uncategorized"}
              </MuiTypography>
              <MuiTypography
                variant="h3"
                className="text-ellipsis"
                sx={{
                  maxWidth: 280,
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                {headline ? getAllFirstCharUpperCase(headline) : "Untitled Ad"}
              </MuiTypography>
              <MuiTypography
                variant="subtitle2"
                className="text-ellipsis-line-2"
                sx={{
                  maxWidth: 280,
                  minHeight: "35px",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                }}
              >
                {description
                  ? getFirstCharUpperCase(description)
                  : "No description available"}
              </MuiTypography>
            </Stack>
          </Box>
          <Box
            sx={{
              p: 2,
              pt: 0,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <WebinarActionButtons
              onEditWebinar={onEditWebinar}
              onDeleteWebinar={onDeleteWebinar}
            />
          </Box>
        </Box>
      ) : (
        <CardActionArea onClick={handleAdClick}>
          <CardContent sx={{ p: 0 }}>
            {renderMedia()}
            <Stack spacing={1} sx={{ p: 2 }}>
              <MuiTypography
                variant="subtitle2"
                className="text-ellipsis"
                sx={{
                  maxWidth: 280,
                  fontSize: "0.75rem",
                  textAlign: "justify",
                  color: "primary.main",
                  fontWeight: 500,
                }}
              >
                {mappedType || "Uncategorized"}
              </MuiTypography>
              <MuiTypography
                variant="h3"
                className="text-ellipsis"
                sx={{
                  maxWidth: 280,
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                {headline ? getAllFirstCharUpperCase(headline) : "Untitled Ad"}
              </MuiTypography>
              <MuiTypography
                variant="subtitle2"
                className="text-ellipsis-line-2"
                sx={{
                  maxWidth: 280,
                  minHeight: "35px",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                }}
              >
                {description
                  ? getFirstCharUpperCase(description)
                  : "No description available"}
              </MuiTypography>

              {businessName && (
                <Stack
                  direction={"row"}
                  spacing={1}
                  sx={{ mt: "16px !important" }}
                >
                  <Buildings size={19} />
                  <MuiTypography
                    variant="subtitle1"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      textAlign: "justify",
                      fontWeight: 600,
                    }}
                  >
                    {getFirstCharUpperCase(businessName)}
                  </MuiTypography>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </CardActionArea>
      )}
    </StyledCard>
  );
}

WebinarCard.propTypes = {
  id: PropTypes.string,
  mappedType: PropTypes.string,
  headline: PropTypes.string,
  description: PropTypes.string,
  businessName: PropTypes.string,
  documents: PropTypes.array,
  showActions: PropTypes.bool,
  handleDeleteWebinar: PropTypes.func,
  expireAt: PropTypes.string,
  onAdClick: PropTypes.func,
  isActive: PropTypes.bool,
  state: PropTypes.string,
  status: PropTypes.string,
  active: PropTypes.bool,
  published: PropTypes.bool,
  visible: PropTypes.bool,
};
