import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  styled,
  Divider,
  Chip,
} from "@mui/material";
import { Buildings, Eye, Heart, MessageText1, Chart } from "iconsax-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";

import MuiTypography from "../common/MuiTypography";
import {
  getAllFirstCharUpperCase,
  getFirstCharUpperCase,
} from "../../utils/common";
import { AD_CARD_HEIGHT, AD_CARD_WIDTH } from "../../utils/constants/ad";
import { getDocIcon, getFileType } from "../../utils/file";
import VideoThumb from "../common/VideoThumb";
import AdActionButtons from "./AdActionButtons";
import dayjs from "dayjs";
import buildeezyPlaceholder from "../../assets/images/buildeezy-placeholder.png";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import useImpressionTracking from "../../hooks/useImpressionTracking";
import { rest } from "lodash";

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "showActions",
})(({ theme }) => ({
  "&": {
    borderRadius: "1rem",
    // width: AD_CARD_WIDTH,
    // minHeight: AD_CARD_HEIGHT,
    padding: 0,
  },
  "&:not(.disabled):hover": {
    border: `solid ${theme.palette.primary.main} 1px`,
  },
}));

// Helper function to get status configuration
const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return {
        color: 'success',
        label: 'Active',
        variant: 'filled'
      };
    case 'pending':
      return {
        color: 'warning',
        label: 'Pending Approval',
        variant: 'filled'
      };
    case 'expired':
      return {
        color: 'error',
        label: 'Expired',
        variant: 'outlined'
      };
    default:
      return {
        color: 'default',
        label: status || 'Unknown',
        variant: 'outlined'
      };
  }
};

// Component for displaying counts
const CountsSection = ({
  likeCount,
  viewCount,
  commentCount,
  impressionCount,
  showEngagementCounts = true,
}) => {
  const counts = [
    // Always show impressions
    {
      icon: Chart,
      count: impressionCount,
      label: "Impressions",
      color: "#ff9800",
      alwaysShow: true,
    },
    // Only show engagement counts for learning solutions
    {
      icon: Heart,
      count: likeCount,
      label: "Likes",
      color: "#e91e63",
      alwaysShow: false,
    },
    {
      icon: Eye,
      count: viewCount,
      label: "Views",
      color: "#2196f3",
      alwaysShow: false,
    },
    {
      icon: MessageText1,
      count: commentCount,
      label: "Comments",
      color: "#4caf50",
      alwaysShow: false,
    },
  ];

  // Filter counts based on showEngagementCounts
  const displayCounts = counts.filter(
    (count) => count.alwaysShow || showEngagementCounts
  );

  return (
    <Box sx={{ px: 2, pb: 1 }}>
      <Divider sx={{ mb: 1 }} />
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent:
            displayCounts.length === 1 ? "center" : "space-around",
          alignItems: "center",
        }}
      >
        {displayCounts.map(({ icon: Icon, count, label, color }) => (
          <Stack
            key={label}
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              minWidth: "fit-content",
            }}
          >
            <Icon size={14} color={color} />
            <MuiTypography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              {count || 0}
            </MuiTypography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default function AdCard({
  id,
  mappedType,
  headline,
  description,
  businessName,
  documents = [],
  showActions = false,
  handleDeleteAd,
  expireAt,
  onAdClick,
  // New status prop
  status,
  // New count props
  likeCount = 0,
  viewCount = 0,
  commentCount = 0,
  impressionCount = 0,
  showCounts = false,
  // New prop to control which counts to show
  showEngagementCounts = true, // likes, views, comments (only for learning solutions)
  // New prop to enable/disable impression tracking
  enableImpressionTracking = false,
  webinarId,
  ...rest
}) {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(documents?.[0] || buildeezyPlaceholder);

  // Impression tracking logic (silent tracking only, no state updates)
  const trackImpression = useImpressionTracking();

  const handleImpression = useCallback(() => {
    if (enableImpressionTracking && id) {
      console.log("👀 AdCard - Silent impression tracked for ad:", id);
      // Silent tracking - no UI updates needed
      trackImpression(id, () => {});
    }
  }, [trackImpression, id, enableImpressionTracking]);

  const [impressionRef] = useIntersectionObserver({
    threshold: 0.8, // 80% visible
    onIntersect: handleImpression,
    once: true, // Track only once per component mount
  });

  function handleAdClick(e) {
    e.stopPropagation();
    if (onAdClick) {
      onAdClick(id);
    } else {
      navigate("view/" + id, {
        state: {
          webinarId,
          authorId: rest.authorId,
          authorName: rest?.author?.firstName + " " + rest?.author?.lastName,
        },
      });
    }
  }

  function onReactiveAd(e) {
    e.stopPropagation();
    navigate("reactive/" + id);
  }

  function onEditAd(e) {
    e.stopPropagation();
    navigate("edit/" + id);
  }

  function onDeleteAd(e) {
    e.stopPropagation();
    handleDeleteAd(id);
  }

  const renderMedia = () => {
    const statusConfig = getStatusConfig(status);
    
    const statusBadge = status && (
      <Chip
        label={statusConfig.label}
        color={statusConfig.color}
        variant={statusConfig.variant}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          fontSize: "0.7rem",
          fontWeight: 700,
          backgroundColor: statusConfig.color === 'success' ? '#4caf50' : 
                           statusConfig.color === 'warning' ? '#ff9800' :
                           statusConfig.color === 'error' ? '#f44336' : '#9e9e9e',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&.MuiChip-filled': {
            backgroundColor: statusConfig.color === 'success' ? '#4caf50' : 
                             statusConfig.color === 'warning' ? '#ff9800' :
                             statusConfig.color === 'error' ? '#f44336' : '#9e9e9e',
            color: '#ffffff',
          },
          '&.MuiChip-outlined': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: statusConfig.color === 'success' ? '#4caf50' : 
                   statusConfig.color === 'warning' ? '#ff9800' :
                   statusConfig.color === 'error' ? '#f44336' : '#9e9e9e',
            borderColor: statusConfig.color === 'success' ? '#4caf50' : 
                        statusConfig.color === 'warning' ? '#ff9800' :
                        statusConfig.color === 'error' ? '#f44336' : '#9e9e9e',
            borderWidth: '2px',
          }
        }}
      />
    );

    if (!documents || !documents.length) {
      return (
        <Box
          sx={{
            position: "relative",
            placeItems: "center",
            display: "grid",
            width: "100%",
            height: 180,
            bgcolor: "paginationBg",
            mb: 1,
          }}
        >
          {statusBadge}
          <Box
            component="img"
            src={buildeezyPlaceholder}
            alt="no-file"
            sx={{
              height: "100%",
              width: "100%",
            }}
          />
        </Box>
      );
    }

    const fileType = getFileType(documents[0]);
    if (fileType == "undefined") {
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
          {statusBadge}
          <Box
            component="img"
            src={buildeezyPlaceholder}
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
          {statusBadge}
          <Box
            component="img"
            src={imgSrc}
            onError={() => setImgSrc(buildeezyPlaceholder)}
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
        <Box sx={{ position: "relative", mb: 1 }}>
          {statusBadge}
          <VideoThumb
            videoUrl={documents[0]}
            width={"100%"}
            height={180}
            sx={{
              backgroundColor: "black",
            }}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          position: "relative",
          placeItems: "center",
          display: "grid",
          width: "100%",
          height: 180,
          bgcolor: "paginationBg",
          mb: 1,
        }}
      >
        {statusBadge}
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

  const renderContent = () => (
    <>
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
          <Stack direction={"row"} spacing={1} sx={{ mt: "16px !important" }}>
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
    </>
  );

  return (
    <StyledCard
      variant="outlined"
      showActions={showActions}
      ref={enableImpressionTracking ? impressionRef : null} // Only attach ref when tracking is enabled
      data-ad-id={id}
    >
      {showActions ? (
        <Box>
          <Box onClick={handleAdClick} sx={{ cursor: "pointer" }}>
            {renderContent()}
          </Box>

          {/* Show counts section if enabled */}
          {showCounts && (
            <CountsSection
              likeCount={likeCount}
              viewCount={viewCount}
              commentCount={commentCount}
              impressionCount={impressionCount}
              showEngagementCounts={showEngagementCounts}
            />
          )}

          <Box
            sx={{
              p: 2,
              pt: showCounts ? 1 : 0,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <AdActionButtons
              onEditAd={onEditAd}
              onReactiveAd={onReactiveAd}
              onDeleteAd={onDeleteAd}
              disabledReactiveAd={
                expireAt ? dayjs(expireAt) > dayjs(new Date()) : false
              }
            />
          </Box>
        </Box>
      ) : (
        <CardActionArea onClick={handleAdClick}>
          <CardContent sx={{ p: 0 }}>
            {renderContent()}

            {/* Show counts section if enabled */}
            {showCounts && (
              <CountsSection
                likeCount={likeCount}
                viewCount={viewCount}
                commentCount={commentCount}
                impressionCount={impressionCount}
                showEngagementCounts={showEngagementCounts}
              />
            )}
          </CardContent>
        </CardActionArea>
      )}
    </StyledCard>
  );
}

AdCard.propTypes = {
  id: PropTypes.string,
  mappedType: PropTypes.string,
  headline: PropTypes.string,
  description: PropTypes.string,
  businessName: PropTypes.string,
  documents: PropTypes.array,
  showActions: PropTypes.bool,
  handleDeleteAd: PropTypes.func,
  expireAt: PropTypes.string,
  onAdClick: PropTypes.func,
  // New status prop
  status: PropTypes.string,
  // New count props
  likeCount: PropTypes.number,
  viewCount: PropTypes.number,
  commentCount: PropTypes.number,
  impressionCount: PropTypes.number,
  showCounts: PropTypes.bool,
  // New engagement counts control prop
  showEngagementCounts: PropTypes.bool,
  // New impression tracking prop
  enableImpressionTracking: PropTypes.bool,
};

CountsSection.propTypes = {
  likeCount: PropTypes.number,
  viewCount: PropTypes.number,
  commentCount: PropTypes.number,
  impressionCount: PropTypes.number,
  showEngagementCounts: PropTypes.bool,
};
