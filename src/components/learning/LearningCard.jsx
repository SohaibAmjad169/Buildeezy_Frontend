import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Box, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { VolumeHigh, VolumeCross } from "iconsax-react";
import ReactPlayer from "react-player";
import { colors } from "../../styles/theme";
import ShareIcon from "../common/icons/ShareIcon";
import ShareMenu from "../common/ShareMenu";
import buildeezy from "../../assets/images/buildeezy.png";
import {
  getAdLikesUrl,
  getAdViewsUrl,
  getAdCommentsUrl,
} from "../../apis/apiEndPoints";
import { useSelector } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import useImpressionTracking from "../../hooks/useImpressionTracking";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Simple global audio state - shared across all LearningCard instances
let globalAudioMuted = true;
const audioStateListeners = new Set();

const LearningCard = ({
  ad,
  isSaved = false,
  onLike,
  onSave,
  alwaysPlay = false,
  variant = "default", // default, dashboard, myAds
  mobilePlayMode = "viewport", // "viewport" or "hover"
  handleVideoReady,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [isLocallySaved, setIsLocallySaved] = useState(isSaved);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [localAudioMuted, setLocalAudioMuted] = useState(globalAudioMuted); // Sync with global state
  const videoContainerRef = useRef(null);

  // Subscribe to global audio state changes and sync with video element
  useEffect(() => {
    const updateAudioState = () => {
      setLocalAudioMuted(globalAudioMuted);
      
      // Also update the actual video element for this component
      const videoElement = videoContainerRef.current?.querySelector('video');
      if (videoElement) {
        videoElement.muted = globalAudioMuted;
        videoElement.volume = globalAudioMuted ? 0 : 1;
      }
    };
    
    audioStateListeners.add(updateAudioState);
    
    // IMPORTANT: Immediately sync with current global state when component mounts
    updateAudioState();
    
    return () => {
      audioStateListeners.delete(updateAudioState);
    };
  }, []);

  const userId = useSelector((state) => state.profile.profileData?.id);

  const trackImpression = useImpressionTracking();

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer for viewport-based autoplay
  useEffect(() => {
    if (!isMobile || mobilePlayMode !== "viewport" || !videoContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only play when 60% visible AND hasn't played once yet
        if (!hasPlayedOnce) {
          setIsInViewport(entry.isIntersecting && entry.intersectionRatio > 0.6);
        }
      },
      { 
        threshold: [0.6], // Trigger when 60% visible
        rootMargin: "-50px 0px -50px 0px" // Add some margin for better UX
      }
    );

    observer.observe(videoContainerRef.current);
    return () => observer.disconnect();
  }, [isMobile, mobilePlayMode, hasPlayedOnce]);

  const handleImpression = useCallback(() => {
    // Track impressions everywhere EXCEPT myAds (default, dashboard, ideas lounge, etc.)
    if (variant !== "myAds") {
      // Silent tracking for analytics (no UI updates)
      trackImpression(ad.id, () => {});
    }
    // myAds variant: no tracking needed since user owns the ads
  }, [trackImpression, ad.id, variant]);

  const [impressionRef] = useIntersectionObserver({
    threshold: 0.8, // 80% visible
    onIntersect: handleImpression,
    once: true, // Track only once per component mount
  });

  // Check if ad is new (less than 24 hours old)
  const now = new Date();
  const adDate = ad.startAt
    ? new Date(ad.startAt)
    : ad.createdAt
    ? new Date(ad.createdAt)
    : ad.created_at
    ? new Date(ad.created_at)
    : ad.created
    ? new Date(ad.created)
    : null;
  const hoursDiff = adDate ? (now - adDate) / (1000 * 60 * 60) : null;
  const isNew = hoursDiff !== null && hoursDiff < 24;

  // Update local state when prop changes
  useEffect(() => {
    setIsLocallySaved(isSaved);
  }, [isSaved]);

  // Determine when to play video based on mode
  const shouldPlayVideo = () => {
    if (alwaysPlay) return true;
    
    if (isMobile) {
      if (mobilePlayMode === "viewport") {
        // First time: play when in viewport
        // After first play: only play on user interaction
        if (!hasPlayedOnce) {
          return isInViewport;
        } else {
          return userInteracted;
        }
      } else if (mobilePlayMode === "hover") {
        return isHovered; // Use CSS hover simulation for mobile
      }
    }
    
    // Desktop always uses hover
    return isHovered;
  };

  const handleClick = () => {
    navigate(`/dashboard/view/${ad.id}`, { state: { from: "Ideas Lounge" } });
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsLocallySaved(!isLocallySaved); // Optimistic update
    onSave();
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget);
  };

  const handleShareClose = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShareAnchorEl(null);
  };

  // Enhanced hover handlers that work for both desktop and mobile hover simulation
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Touch event handlers for mobile hover simulation
  const handleTouchStart = (e) => {
    if (isMobile && mobilePlayMode === "hover") {
      // Simulate hover start on touch
      setIsHovered(true);
    } else if (isMobile && mobilePlayMode === "viewport" && hasPlayedOnce) {
      // If video has played once, allow touch to play again
      setUserInteracted(true);
    }
  };

  const handleTouchEnd = (e) => {
    if (isMobile && mobilePlayMode === "hover") {
      // Keep "hovered" state for a bit after touch ends
      setTimeout(() => setIsHovered(false), 1000);
    } else if (isMobile && mobilePlayMode === "viewport" && hasPlayedOnce) {
      // Stop playing after touch ends
      setTimeout(() => setUserInteracted(false), 1000);
    }
  };

  // Handle audio toggle - updates global state and all video elements
  const handleAudioToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    try {
      // Update global state
      globalAudioMuted = !globalAudioMuted;
      
      // Update ALL video elements on the page
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((video, index) => {
        video.muted = globalAudioMuted;
        video.volume = globalAudioMuted ? 0 : 1;
      });
      
      // Notify all components to update their UI
      audioStateListeners.forEach(listener => listener());
      
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  // Handle video events
  const handleVideoEnded = () => {
    if (isMobile && mobilePlayMode === "viewport") {
      setHasPlayedOnce(true);
      setUserInteracted(false);
      setIsInViewport(false); // Stop viewport triggering after first play
    }
  };

  const handleVideoClick = (e) => {
    if (isMobile && mobilePlayMode === "viewport" && hasPlayedOnce) {
      e.stopPropagation(); // Prevent card navigation
      setUserInteracted(!userInteracted);
    }
  };

  function formatSocialCount(input) {
    let number = Number(input);

    // Handle invalid input
    if (isNaN(number) || number === null || number === undefined) return "0";

    if (number < 1000) return number.toString();

    const units = ["K", "M", "B", "T"];
    let unitIndex = -1;

    while (number >= 1000 && unitIndex < units.length - 1) {
      number /= 1000;
      unitIndex++;
    }

    const formatted = number % 1 === 0 ? number.toFixed(0) : number.toFixed(1);
    return `${formatted}${units[unitIndex]}`;
  }

  // Helper functions for responsive design based on variant
  const getMediaHeight = () => {
    if (variant === "dashboard" || variant === "myAds") {
      return "300px"; // Match AdCard height
    }
    return "auto"; // Default for aspect ratio
  };

  const getMediaPosition = () => {
    if (variant === "dashboard" || variant === "myAds") {
      return "relative"; // Normal positioning for fixed height
    }
    return "absolute"; // Absolute positioning for aspect ratio
  };

  const isVideo = ad.documents?.[0]?.includes(".mp4");

  return (
    <Box
      onClick={handleClick}
      data-ad-id={ad.id}
      ref={variant !== "myAds" ? impressionRef : null} // Don't track impressions in myAds
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        // Enhanced hover effects for mobile
        ...(isMobile && mobilePlayMode === "hover" && {
          "&:hover": {
            "& .media": {
              transform: "scale(1.05)",
            },
          },
          // CSS hover simulation for mobile using active state
          "&:active": {
            "& .media": {
              transform: "scale(1.05)",
            },
          },
        }),
        // Desktop hover effects
        ...(!isMobile && {
          "&:hover": {
            "& .media": {
              transform: "scale(1.05)",
            },
          },
        }),
      }}
    >
      {/* Media Section */}
      <Box
        className="media"
        ref={videoContainerRef}
        sx={{
          width: "100%",
          position: "relative",
          paddingTop: variant === "dashboard" || variant === "myAds" ? 0 : "133.33%", // Conditional aspect ratio
          height: getMediaHeight(), // Fixed height for dashboard/myAds, auto for default
          transition: "transform 0.3s ease",
          backgroundColor: "black",
          flex: variant === "dashboard" || variant === "myAds" ? "0 0 auto" : 1, // Don't flex-grow in dashboard/myAds mode
          mb: variant === "dashboard" || variant === "myAds" ? 1 : 0, // Add margin bottom like AdCard in dashboard/myAds mode
        }}
      >
        {isVideo ? (
          <ReactPlayer
            url={ad.documents[0] || buildeezy}
            preload
            playing={shouldPlayVideo()}
            onReady={handleVideoReady}
            loop={!isMobile || mobilePlayMode === "hover" || !hasPlayedOnce} // Don't loop after first play on mobile viewport mode
            muted={true}
            width="100%"
            height="100%"
            playsinline
            onEnded={handleVideoEnded}
            onClick={handleVideoClick}
            style={{
              position: getMediaPosition(),
              top: 0,
              left: 0,
              cursor: (isMobile && mobilePlayMode === "viewport" && hasPlayedOnce) ? 'pointer' : 'inherit'
            }}
            config={{
              file: {
                attributes: {
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  },
                  playsInline: true,
                },
                forceVideo: true,
              },
            }}
          />
        ) : (
          <Box
            component="img"
            src={ad.documents?.[0] || buildeezy}
            alt={ad.headline}
            sx={{
              position: getMediaPosition(),
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* New Label */}
        {isNew && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backgroundColor: "white",
              borderRadius: "100px",
              padding: "4px 12px",
              zIndex: 2,
              height: "24px",
              minWidth: "61px",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#6B4EFF",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "#6B4EFF",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: 1,
                letterSpacing: "0.1px",
                textAlign: "center",
              }}
            >
              New
            </Typography>
          </Box>
        )}

        {/* Audio Toggle Button - Like Instagram */}
        {isVideo && (
          <IconButton
            onClick={handleAudioToggle}
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              width: 32,
              height: 32,
              zIndex: 3,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            {localAudioMuted ? (
              <VolumeCross size={18} variant="Bold" />
            ) : (
              <VolumeHigh size={18} variant="Bold" />
            )}
          </IconButton>
        )}

        {/* Play indicator for viewport mode - Only show "Tap" after first play */}
        {isMobile && mobilePlayMode === "viewport" && isVideo && hasPlayedOnce && !userInteracted && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: "20px",
              padding: "4px 8px",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: "6px solid white",
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
                ml: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontSize: "10px",
                fontWeight: 500,
              }}
            >
              Tap
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bottom Info Section with White Background */}
      <Box
        sx={{
          bgcolor: "white",
          py: variant === "dashboard" || variant === "myAds" ? 1 : 1.5, // Reduce padding in dashboard/myAds mode
          px: { xs: 2, sm: 2, md: 0.5, lg: 2 },
          borderTop: variant === "dashboard" || variant === "myAds" ? "none" : "1px solid", // Remove border in dashboard/myAds
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: variant === "dashboard" || variant === "myAds" ? 0.5 : 1, // Reduce gap in dashboard/myAds mode
          flex: "1 1 auto", // Allow to grow and fill remaining space
        }}
      >
        {/* Social interaction icons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2, md: 1, lg: 1.5, xl: 2 },
            flexShrink: 1,
            minWidth: 0,
            overflow: "hidden",
            flexWrap: "nowrap",
          }}
        >
          {/* Like button with count */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.3, sm: 0.5, md: 0.25 },
              minWidth: 0,
            }}
          >
            <IconButton
              onClick={async (e) => {
                e.stopPropagation();
                await onLike();
              }}
              sx={{
                p: { xs: 0.1, sm: 0.25, md: 0.25 },
                color: ad?.isLiked ? "error.main" : "#131a47",
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              {ad?.isLiked ? (
                <FavoriteIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
              )}
            </IconButton>
            <Typography
              variant="subtitle2"
              sx={{
                color: ad?.isLiked ? "error.main" : "#131a47",
                fontSize: "11px",
                fontWeight: 500,
                lineHeight: "16px",
                display: "inline",
                minWidth: 0,
                maxWidth: "40px",
                overflow: "hidden",
              }}
            >
              {formatSocialCount(ad?.likeCount)}
            </Typography>
          </Box>

          {/* Impression count - ONLY show in myAds variant, hide everywhere else */}
          {variant === "myAds" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.3, sm: 0.5, md: 0.25 },
                minWidth: 0,
              }}
            >
              <TrendingUpIcon
                sx={{ fontSize: { xs: 14, sm: 16 }, color: "#131a47" }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#131a47",
                  fontSize: "11px",
                  fontWeight: 500,
                  lineHeight: "16px",
                  display: "inline",
                  minWidth: 0,
                  maxWidth: "40px",
                  overflow: "hidden",
                }}
              >
                {formatSocialCount(ad?.impressionCount)}
              </Typography>
            </Box>
          )}

          {/* View count */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.3, sm: 0.5, md: 0.25 },
              minWidth: 0,
            }}
          >
            <VisibilityIcon
              sx={{ fontSize: { xs: 14, sm: 16 }, color: "#131a47" }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: "#131a47",
                fontSize: "11px",
                fontWeight: 500,
                lineHeight: "16px",
                display: "inline",
                minWidth: 0,
                maxWidth: "40px",
                overflow: "hidden",
              }}
            >
              {formatSocialCount(ad?.viewCount)}
            </Typography>
          </Box>

          {/* Comment icon with count */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.3, sm: 0.25, md: 0.25 },
              minWidth: 0,
            }}
          >
            <ChatBubbleOutlineIcon
              sx={{ fontSize: { xs: 14, sm: 16 }, color: "#131a47" }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: "#131a47",
                fontSize: "11px",
                fontWeight: 500,
                lineHeight: "16px",
                display: "inline",
                minWidth: 0,
                maxWidth: "40px",
                overflow: "hidden",
              }}
            >
              {formatSocialCount(ad?.commentCount)}
            </Typography>
          </Box>

          {/* Share icon without count */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handleShareClick}
              sx={{
                p: { xs: 0.1, sm: 0.5, md: 0.25 },
                pl: { sm: 1, md: 0 },
                color: "#131a47",
                fontSize: { xs: 14, sm: 16 },
                "&:hover": {
                  "& img": {
                    filter:
                      "brightness(0) saturate(100%) invert(48%) sepia(67%) saturate(2284%) hue-rotate(202deg) brightness(101%) contrast(101%)",
                  },
                },
              }}
            >
              <ShareIcon size={14} color="#131a47" />
            </IconButton>
          </Box>
        </Box>

        {/* Optional Save button - uncomment if needed */}
        {/* <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            minWidth: { xs: "72px", sm: "72px", md: "15px", lg: "72px" },
            height: { xs: "28px", sm: "28px", md: "20px", lg: "28px" },
            borderRadius: "6px",
            textTransform: "none",
            backgroundColor: isLocallySaved ? colors.grey200 : colors.primary,
            color: isLocallySaved ? "text.primary" : "white",
            fontSize: "12px",
            fontWeight: 500,
            flexShrink: 0,
            ml: { xs: 1, sm: 1, md: 0, lg: 1 },
            whiteSpace: "nowrap",
            maxWidth: "100%",
            "&:hover": {
              color: "white",
            },
          }}
        >
          {isLocallySaved ? t("common.saved") : t("common.save")}
        </Button> */}
      </Box>

      {/* Share Menu */}
      <ShareMenu
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        headline={ad.headline}
        url={`${window.location.origin}/dashboard/view/${ad.id}`}
      />
    </Box>
  );
};

LearningCard.propTypes = {
  ad: PropTypes.shape({
    id: PropTypes.string.isRequired,
    headline: PropTypes.string.isRequired,
    documents: PropTypes.arrayOf(PropTypes.string),
    audience: PropTypes.arrayOf(PropTypes.string),
    likes: PropTypes.number,
    comments: PropTypes.number,
    shares: PropTypes.number,
    startAt: PropTypes.string,
    createdAt: PropTypes.string,
    created_at: PropTypes.string,
    created: PropTypes.string,
    isLiked: PropTypes.bool,
    likeCount: PropTypes.number,
    viewCount: PropTypes.number,
    commentCount: PropTypes.number,
    impressionCount: PropTypes.number,
  }).isRequired,
  isSaved: PropTypes.bool,
  onLike: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  alwaysPlay: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "dashboard", "myAds"]),
  mobilePlayMode: PropTypes.oneOf(["viewport", "hover"]), // New prop for mobile behavior
  handleVideoReady: PropTypes.func,
};

export default LearningCard;