import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Chip,
  Switch,
  Avatar,
} from "@mui/material";
import { getFullUserProfileUrl } from "../../apis/apiEndPoints";
import { colors } from "../../styles/theme";
import {
  SKILLS_OPTIONS,
  ENGAGEMENT_FIELDS,
} from "../profile/design/DesignTab.constants";
import Star from "@mui/icons-material/Star";
import PushPinIcon from "@mui/icons-material/PushPin";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import useReviews from "../../hooks/useReviews";
import defaultBanner from "../../assets/images/cover.jpg";
import ProfilePreviewLayout from "../common/ProfilePreviewLayout";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import { USER_TYPES } from "../../utils/constants/login";
import { useTranslation } from "react-i18next";
import { THEME_OVERRIDES } from "../profile/design/themeOverrides";

// Font mapping utility
const FONT_MAP = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  oswald: "'Oswald', sans-serif",
  playfair: "'Playfair Display', serif",
  anton: "'Anton', sans-serif",
  courier: "'Courier New', Courier, monospace",
  lora: "'Lora', serif",
  montserrat: "'Montserrat', sans-serif",
  orbitron: "'Orbitron', sans-serif",
  pacifico: "'Pacifico', cursive",
  dancing: "'Dancing Script', cursive", 
};
function getFontFamily(fontValue) {
  return FONT_MAP[fontValue] || FONT_MAP["inter"];
}

function getThemeColor(theme) {
  switch (theme) {
    case "green":
      return { bg: "#F7FFE6", main: "#709a1c" };
    case "white":
      return { bg: colors.white, main: colors.black800 };
    case "blue":
      return { bg: colors.blue300, main: "#20335F" };
    case "grey":
      return { bg: colors.grey400, main: colors.black800 };
    case "purple":
      return { bg: "#F8F4F8", main: "#5f4a61" };
    case "yellow":
      return { bg: colors.orange200, main: "#DB7121" };
    case "rose":
      return { bg: colors.red300, main: "#8C3849" };
    case "orange_gradient":
      return {
        bg: "#F9AB2D",
        main: "#000000",
        backgroundImage: "/background/bk-1.png",
        type: "gradient",
      };
    case "decorative_frame":
      return {
        id: "decorative_frame",
        bg: "#FFFFFF",
        main: "#3E2314",
        backgroundImage: "/background/bk-2.png",
        decorativeImage: "/background/bk-3.png",
        type: "decorative",
        textColor: "#3E2314",
      };
    case "decorative_frame_alt":
      return {
        id: "decorative_frame_alt",
        bg: "#FFFFFF",
        main: "#352F2F",
        backgroundImage: "/background/bk-2.png",
        decorativeImage: "/background/bk-4.png",
        type: "decorative",
        textColor: "#352F2F",
      };
    case "new_orange_frame":
      return {
        id: "new_orange_frame",
        bg: "#FAE2B3",
        main: "#B54708",
        decorativeImage: "/background/bk-5.png",
        type: "decorative",
        textColor: "#B54708",
      };
    case "green_gradient":
      return {
        id: "green_gradient",
        bg: "#F4EDD2",
        main: "#000000",
        backgroundImage: "/background/bk-1.png",
        decorativeImage: "/background/bk-1.png",
        type: "gradient",
        textColor: "#000000",
      };
    case "white_green_gradient":
      return {
        id: "white_green_gradient",
        bg: "#FFF",
        main: "#000000",
        backgroundImage: "/background/bk-1.png",
        decorativeImage: "/background/bk-1.png",
        type: "gradient",
        textColor: "#000000",
      };
    case "white_green_gradient_diagonal":
      return {
        id: "white_green_gradient_diagonal",
        bg: "#FFF",
        main: "#000000",
        backgroundImage: "/background/bk-1.png",
        decorativeImage: "/background/bk-1.png",
        imagePosition: "top",
        type: "gradient",
        textColor: "#000000",
      };
    default:
      return { bg: "#F7FFE6", main: "#709a1c" };
  }
}

function stripHtmlTags(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "");
}

// Fix in both ViewUserProfile.jsx and DesignPreviewMode.jsx - PreviewReviews component

function PreviewReviews({
  reviewsData,
  themeColors = { bg: "#fff", main: "#4BAF50" },
  showAll = false,
}) {
  const { t } = useTranslation();
  const renderStars = (rating) => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          sx={{
            color: star <= rating ? themeColors.main : themeColors.main + "40",
            fontSize: 20,
          }}
        />
      ))}
    </Box>
  );

  if (!reviewsData || reviewsData.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{ color: themeColors.main, opacity: 0.7 }}
      >
        {t("user_profile.no_reviews_yet")}
      </Typography>
    );
  }

  const displayedReviews = showAll ? reviewsData : reviewsData.slice(0, 3);
  const hasMoreReviews = reviewsData.length > 3 && !showAll;

  return (
    <Box>
      {displayedReviews.map((review, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 2,
            borderRadius: 2,
            width: "100%",
            maxWidth: "800px",
            backgroundColor: themeColors.main + "20",
            border: review.highlight
              ? `2px solid ${themeColors.main}`
              : `1px solid ${themeColors.main}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* FIXED: Header with rating, date, and highlight badge in same row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {/* Left side: Rating and date */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              {renderStars(review.rating)}
              <Typography
                variant="body1"
                sx={{ color: themeColors.main, fontWeight: 500 }}
              >
                {review.rating.toFixed(1)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: themeColors.main,
                  opacity: 0.8,
                  ml: 1,
                }}
              >
                {review.date}
              </Typography>
            </Box>

            {/* Right side: Highlight badge */}
            {review.highlight && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "transparent",
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  color: themeColors.main,
                  border: `1px solid ${themeColors.main}`,
                  fontSize: "0.75rem",
                  flexShrink: 0, // Prevent shrinking
                  "&:hover": {
                    borderColor: themeColors.main,
                    bgcolor: `${themeColors.main}10`,
                  },
                }}
              >
                <PushPinIcon sx={{ fontSize: 14, color: "inherit" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "inherit",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  {t("user_profile.highlight")}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Review content */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: themeColors.main,
                mb: 1,
                fontSize: "0.9rem",
                fontWeight: 400,
                lineHeight: 1.5,
                fontStyle: "italic",
                wordWrap: "break-word",
              }}
            >
              <Box
                component="span"
                sx={{ fontWeight: 600, fontStyle: "normal" }}
              >
                {t("user_profile.like")}
              </Box>{" "}
              &ldquo;{stripHtmlTags(review.like)}&rdquo;
            </Typography>

            {review.dislike && (
              <Typography
                variant="body2"
                sx={{
                  color: themeColors.main,
                  mb: 1,
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  fontStyle: "italic",
                  wordWrap: "break-word",
                }}
              >
                <Box
                  component="span"
                  sx={{ fontWeight: 600, fontStyle: "normal" }}
                >
                  {t("user_profile.dislike")}
                </Box>{" "}
                &ldquo;{stripHtmlTags(review.dislike)}&rdquo;
              </Typography>
            )}
          </Box>

          {/* Author info */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: "auto",
              pt: 1,
              borderTop: `1px solid ${themeColors.main}20`,
            }}
          >
            {review.avatar && (
              <Avatar
                src={review.avatar}
                alt={review.author}
                sx={{ width: 28, height: 28 }}
              >
                {!review.avatar &&
                  review.author &&
                  review.author.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Typography
              variant="body2"
              sx={{
                color: themeColors.main,
                opacity: 0.8,
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              {review.author}
            </Typography>
          </Stack>
        </Paper>
      ))}

      {hasMoreReviews && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="outlined"
            sx={{
              color: themeColors.main,
              borderColor: themeColors.main,
              "&:hover": {
                borderColor: themeColors.main,
                bgcolor: `${themeColors.main}10`,
              },
              textTransform: "none",
              fontWeight: 500,
            }}
            onClick={() => {
              if (typeof window !== "undefined") {
                const event = new CustomEvent("showAllReviews");
                window.dispatchEvent(event);
              }
            }}
          >
            {t("user_profile.show_more")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

function PreviewPortfolio({
  portfolioData,
  themeColors = { bg: "#fff", main: "#4BAF50" },
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [openImage, setOpenImage] = useState(null);
  const navigate = useNavigate();
  if (!portfolioData || !portfolioData.length) return null;
  const displayItems = showAll ? portfolioData : portfolioData.slice(0, 2);
  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        {displayItems.map((item) => {
          const imgSrc = item.image || item.thumbnail || item.thumbnail?.url;
          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${themeColors.main}`,
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "translateY(-2px)" },
                cursor: imgSrc ? "pointer" : "default",
              }}
              // onClick={() => imgSrc && setOpenImage(imgSrc)}
              onClick={() => navigate(`/profile/portfolio/view/${item.id}`)}
            >
              <Box sx={{ position: "relative", pb: "75%", overflow: "hidden" }}>
                <img
                  src={imgSrc}
                  alt={item.title}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Box sx={{ p: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: themeColors.main,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 0.5,
                  }}
                >
                  {item.role}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: themeColors.main,
                    fontSize: "0.75rem",
                    opacity: 0.8,
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
      {!showAll && portfolioData.length > 2 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="outlined"
            sx={{
              color: themeColors.main,
              borderColor: themeColors.main,
              "&:hover": {
                borderColor: themeColors.main,
                bgcolor: `${themeColors.main}10`,
              },
            }}
            onClick={() => setShowAll(true)}
          >
            {t("user_profile.show_more")}
          </Button>
        </Box>
      )}
      {/* Image Dialog Popup */}
      <Dialog
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        PaperProps={{
          sx: {
            boxShadow: "none",
            borderRadius: 0,
            background: "transparent",
            m: 0,
            overflow: "visible",
            p: 0,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 0,
            minHeight: 0,
            p: 0,
          }}
        >
          {/* Centered outlined green button under the image to close dialog */}
          {openImage && (
            <img
              src={openImage}
              alt="Full Size"
              style={{
                maxWidth: "135vw",
                maxHeight: "120vh",
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setOpenImage(null)}
              sx={{
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
              }}
            >
              {t("common.close")}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

function ViewUserProfile({ userId }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { fetchReviews, fetchHighlightReview } = useReviews();
  const navigate = useNavigate();
  const { userList } = useSelector((state) => state.pubnub);
  const { t } = useTranslation();
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const response = await getFullUserProfileUrl(userId);
        setProfileData(response.data.data);
      } catch {
        setError(t("user_profile.profile_not_found"));
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchProfile();
  }, [userId, t]);

  // In your ViewUserProfile.jsx, update the useEffect where you fetch reviews:

  // Update the useEffect in ViewUserProfile.jsx where you fetch and process reviews:

  useEffect(() => {
    async function fetchReviewsForUser() {
      if (profileData?.id) {
        // Use userType instead of category
        const userType = profileData.userType;

        // Fetch both highlighted and normal reviews with user type filter
        const [highlighted, fetchedReviews] = await Promise.all([
          fetchHighlightReview(profileData.id, userType),
          fetchReviews(profileData.id, userType),
        ]);

        // Merge, deduplicate by id, highlight review first
        const allReviews = [
          ...(highlighted && highlighted.length ? highlighted : []),
          ...(fetchedReviews || []),
        ];

        const uniqueReviews = [];
        const seen = new Set();
        for (const r of allReviews) {
          if (!seen.has(r.id)) {
            uniqueReviews.push(r);
            seen.add(r.id);
          }
        }

        console.log(
          "🔍 [ViewUserProfile] Unique reviews before mapping:",
          uniqueReviews.map((r) => ({
            id: r.id,
            highlight: r.highlight,
            rating: r.rating || r.ratings?.overallExperience,
            createdAt: r.createdAt,
          }))
        );

        // Map to expected fields for PreviewReviews - use review giver info
        let mappedReviews = (uniqueReviews || []).map((r) => ({
          rating: r.ratings?.overallExperience || r.rating || r.experince || 0,
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : r.startDate || "",
          dateRaw: r.createdAt || r.startDate || "", // for sorting
          like: r.likes || r.like || "",
          dislike: r.dislikes || r.dislike || "",

          // Use review giver information (the person who gave the review)
          author: r.name || "Anonymous", // This is already correctly mapped in useReviews
          avatar: r.avatar || null, // This is already correctly mapped in useReviews

          // IMPORTANT: Use highlight field from backend
          highlight: r.highlight || false,

          // Keep original data for debugging
          _originalReview: r,
        }));

        console.log(
          "🔍 [ViewUserProfile] Mapped reviews before sorting:",
          mappedReviews.map((r) => ({
            rating: r.rating,
            highlight: r.highlight,
            date: r.date,
            author: r.author,
          }))
        );

        // ENHANCED: Sort with more explicit logic - highlight first, then by dateRaw descending
        mappedReviews = mappedReviews.sort((a, b) => {
          // First priority: highlighted reviews come first
          if (a.highlight && !b.highlight) {
            console.log(
              `🔍 [SORT] Moving highlighted review to top: ${a.author} (${a.rating}★)`
            );
            return -1;
          }
          if (!a.highlight && b.highlight) {
            console.log(
              `🔍 [SORT] Moving highlighted review to top: ${b.author} (${b.rating}★)`
            );
            return 1;
          }

          // Second priority: sort by date (newest first)
          const dateA = new Date(a.dateRaw);
          const dateB = new Date(b.dateRaw);

          if (dateB.getTime() !== dateA.getTime()) {
            return dateB.getTime() - dateA.getTime();
          }

          // Third priority: sort by rating (highest first)
          return (b.rating || 0) - (a.rating || 0);
        });

        console.log(
          "🔍 [ViewUserProfile] Final sorted reviews:",
          mappedReviews.map((r) => ({
            rating: r.rating,
            highlight: r.highlight,
            date: r.date,
            author: r.author,
            position: mappedReviews.indexOf(r),
          }))
        );

        // Log highlight reviews specifically
        const highlightedReviews = mappedReviews.filter((r) => r.highlight);
        console.log(
          `🔍 [ViewUserProfile] Found ${highlightedReviews.length} highlighted reviews at positions:`,
          highlightedReviews.map((r) => mappedReviews.indexOf(r))
        );

        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }
    }
    fetchReviewsForUser();
  }, [profileData?.id, profileData?.userType]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handler = () => setShowAllReviews(true);
      window.addEventListener("showAllReviews", handler);
      return () => window.removeEventListener("showAllReviews", handler);
    }
  }, []);

  if (loading) return <div>{t("user_profile.loading_profile")}</div>;
  if (error || !profileData)
    return <div>{error || t("user_profile.profile_not_found")}</div>;

  // Theme and profile display fields
  const themeValue = profileData?.profileDesign?.layout?.theme || "green";
  const themeColors = getThemeColor(themeValue);
  const overrides = THEME_OVERRIDES[themeValue] || {};

  const bannerImage =
    profileData?.profileDesign?.layout?.banner || defaultBanner;
  const userName = `${profileData?.firstName || ""} ${
    profileData?.lastName || ""
  }`.trim();
  const userCategory = profileData?.category || t("user_profile.category");
  // Format category: capitalize each word and replace underscores with spaces
  function formatCategory(category) {
    if (!category) return "";
    return category
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  const userCategoryFormatted = formatCategory(userCategory);
  const userAvatar = profileData?.avatar || "";
  // Average rating calculation
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

  // General info fields
  const description =
    profileData?.profileDesign?.content?.slogan ||
    profileData?.description ||
    "";
  const email = profileData?.email || "";
  const phoneNumber = profileData?.phoneNumber || "";
  const skills = profileData?.profileDesign?.content?.skills || [];
  const certifications =
    profileData?.profileDesign?.content?.certifications || [];
  const awards = profileData?.profileDesign?.content?.awards || [];
  const introVideo = profileData?.profileDesign?.content?.introVideo;
  const fullVideoUrl = introVideo
    ? `${import.meta.env.VITE_IMAGE_BASE_URL}${introVideo}`
    : "";
  const callToAction = profileData?.profileDesign?.engagement?.callToAction;
  const professionalAffiliations =
    profileData?.specialistAdditionalInfo?.professionalAffiliations || [];
  const projects = profileData?.portfolio?.projects || [];
  // Opening hours logic
  const openingHours = profileData?.vendorAdditionalInfo?.openingHours || [];
  function formatOpeningHours(hoursArr) {
    if (!Array.isArray(hoursArr) || hoursArr.length === 0) return null;
    return hoursArr.map((entry, idx) => {
      const days = Array.isArray(entry.daysOfWeek)
        ? entry.daysOfWeek.join(", ")
        : "";
      return (
        <Box key={days + entry.startTime + entry.endTime + idx} sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: themeColors.main,
              fontWeight: 500,
              fontSize: "0.95rem",
              mb: 0.5,
            }}
          >
            {days}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: themeColors.main,
              fontSize: "0.95rem",
              opacity: 0.8,
            }}
          >
            {entry.startTime} - {entry.endTime}
          </Typography>
        </Box>
      );
    });
  }

  // Workflow fields
  const workflowSteps = profileData?.workflowSteps || [];
  const workflowAdditionalInfo = profileData?.workflowAdditionalInfo;
  const faqs = profileData?.profileDesign?.interactive?.faq || [];

  // Extract font value from profileDesign.layout.font
  const fontValue = profileData?.profileDesign?.layout?.font || "inter";
  const fontFamily = getFontFamily(fontValue);

  // Helper to check if approach is empty or just a <p> tag
  function isApproachEmpty(approach) {
    if (!approach) return true;
    const trimmed = approach.trim();
    // Matches <p></p>, <p> </p>, <p>   </p>, etc.
    return trimmed === "<p></p>" || /^<p>\s*<\/p>$/.test(trimmed);
  }

  const renderSection = (title, children) => (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 16 },
        py: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
        bgcolor: "transparent",
        mb: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 2,
          color: themeColors.main,
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
        }}
      >
        {title}
      </Typography>
      <Box sx={{ fontFamily }}>{children}</Box>
    </Paper>
  );

  const isClient = profileData?.userType === USER_TYPES.client;

  if (isClient) {
    // For client, render only the General content, no tabs or tab container at all
    return (
      <ProfilePreviewLayout
        bannerImage={bannerImage}
        userAvatar={userAvatar}
        userName={userName || t("user_profile.user_name")}
        userCategory={userCategoryFormatted}
        averageRating={averageRating}
        totalReviews={reviews.length}
        themeColors={themeColors}
        fontFamily={fontFamily}
        showTabs={false}
        themeBackgroundImage={themeColors.backgroundImage}
        themeType={themeColors.type}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "95%", md: "100%", lg: "100%" },
            margin: "0 auto",
            pl: { xs: 1, sm: 2, md: 10, lg: 10 },
            pr: { xs: 1, sm: 2, md: 10, lg: 10 },
            mt: 2,
          }}
        >
          {/* Description */}
          {description &&
            renderSection(
              t("user_profile.description"),
              <Typography
                variant="body1"
                sx={{ color: themeColors.main, fontSize: "0.9rem", fontFamily }}
              >
                {description}
              </Typography>
            )}
          {/* Skills/Categories */}
          {skills.length > 0 &&
            renderSection(
              t("user_profile.skills"),
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {skills.map((skillId) => {
                  const skill = SKILLS_OPTIONS.find((s) => s.id === skillId);
                  if (!skill) return null;
                  return (
                    <Chip
                      key={skillId}
                      label={skill.label}
                      size="small"
                      sx={{
                        bgcolor:
                          themeValue === "decorative_frame"
                            ? "#FEDF89"
                            : themeValue === "decorative_frame_alt"
                            ? "#F4FEEE"
                            : themeValue === "orange_gradient"
                            ? "#FFFAEB"
                            : themeValue === "green_gradient"
                            ? "#FFFBEA"
                            : `${themeColors.main}10`,
                        color:
                          themeValue === "decorative_frame"
                            ? "#3E2314"
                            : themeValue === "decorative_frame_alt"
                            ? "#619344"
                            : themeValue === "orange_gradient"
                            ? "#000"
                            : themeValue === "green_gradient"
                            ? "#719C40"
                            : themeColors.main,
                        borderRadius: "20px",
                        border:
                          themeValue === "decorative_frame"
                            ? "1px solid #FEDF89"
                            : themeValue === "decorative_frame_alt"
                            ? "1px solid #619344"
                            : themeValue === "orange_gradient"
                            ? "1px solid #F79009"
                            : themeValue === "green_gradient"
                            ? "1px solid #719C40"
                            : `1px solid ${themeColors.main}`,
                        px: 2,
                        fontFamily,
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          {/* Contact Info */}
          {(email || phoneNumber) &&
            renderSection(
              t("user_profile.contact_info"),
              <Stack spacing={2}>
                {email && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <EmailIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {email}
                    </Typography>
                  </Stack>
                )}
                {phoneNumber && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <PhoneIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {phoneNumber}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          {/* Opening Hours */}
          {openingHours.length > 0 &&
            renderSection(
              t("user_profile.opening_hours"),
              <Stack spacing={2} sx={{ fontFamily }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AccessTimeIcon sx={{ color: themeColors.main, mt: 0.5 }} />
                  <Box>{formatOpeningHours(openingHours)}</Box>
                </Stack>
              </Stack>
            )}
          {/* Company Details */}
          {(profileData?.companyDetails?.website ||
            profileData?.companyDetails?.address ||
            profileData?.companyDetails?.email ||
            typeof (profileData?.userType === 'vendor' ? profileData?.vendorAdditionalInfo?.isDeliver : profileData?.companyDetails?.isDeliver) !== "undefined") &&
            renderSection(
              t("user_profile.company_details"),
              <Stack spacing={2}>
                {profileData.companyDetails?.website && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <LanguageIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {profileData.companyDetails.website}
                    </Typography>
                  </Stack>
                )}
                {profileData.companyDetails?.address && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <LocalShippingIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {profileData.companyDetails.address}
                    </Typography>
                  </Stack>
                )}
                {profileData.companyDetails?.email && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <EmailIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {profileData.companyDetails.email}
                    </Typography>
                  </Stack>
                )}
                {typeof (profileData?.userType === 'vendor' ? profileData?.vendorAdditionalInfo?.isDeliver : profileData?.companyDetails?.isDeliver) !==
                  "undefined" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShippingIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {(profileData?.userType === 'vendor' ? profileData?.vendorAdditionalInfo?.isDeliver : profileData?.companyDetails?.isDeliver) === "yes"
                        ? t("user_profile.delivery_available")
                        : t("user_profile.delivery_not_available")}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          {/* Professional Affiliations */}
          {Array.isArray(professionalAffiliations) &&
            professionalAffiliations.length > 0 &&
            renderSection(
              t("user_profile.professional_affiliations"),
              <Stack spacing={2}>
                {professionalAffiliations.map((affiliation, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <AccountBalanceIcon
                        sx={{ color: themeColors.main, mt: 0.3 }}
                      />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              color: themeColors.main,
                              fontSize: "1rem",
                              fontFamily,
                            }}
                          >
                            {affiliation.title}
                          </Typography>
                          {affiliation.memberSince && (
                            <>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: themeColors.main,
                                  fontWeight: 400,
                                  fontSize: "1.05rem",
                                  fontFamily,
                                }}
                              >
                                •
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: themeColors.main,
                                  fontSize: "0.9rem",
                                  fontFamily,
                                }}
                              >
                                {affiliation.memberSince}
                              </Typography>
                            </>
                          )}
                        </Stack>
                        {affiliation.description && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: themeColors.main,
                              mt: 0.5,
                              fontSize: "0.9rem",
                              fontFamily,
                            }}
                          >
                            {affiliation.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          {/* Certifications */}
          {certifications.length > 0 &&
            renderSection(
              t("user_profile.certifications"),
              <Stack spacing={2}>
                {certifications.map((cert, index) => (
                  <Stack
                    key={cert.id || index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <SchoolIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.95rem",
                        fontFamily,
                      }}
                    >
                      {cert.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      •
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {cert.year}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          {/* Awards */}
          {awards.length > 0 &&
            renderSection(
              t("user_profile.awards"),
              <Stack spacing={2}>
                {awards.map((award, index) => (
                  <Stack
                    key={award.id || index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <EmojiEventsIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.95rem",
                        fontFamily,
                      }}
                    >
                      {award.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      •
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {award.year}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          {/* Projects */}
          {projects.length > 0 &&
            renderSection(
              t("accounts.project"),
              <Stack spacing={2}>
                {projects.map((project, index) => {
                  let displayYear = project.year;
                  if (!displayYear && project.createdAt) {
                    const d = new Date(project.createdAt);
                    if (!isNaN(d)) displayYear = d.getFullYear();
                  }
                  return (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <WorkIcon sx={{ color: themeColors.main }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeColors.main,
                          fontSize: "0.92rem",
                          fontFamily,
                        }}
                      >
                        {project.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: themeColors.main, fontFamily }}
                      >
                        •
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: themeColors.main, fontFamily }}
                      >
                        {displayYear}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          {/* Portfolio */}
          {projects.length > 0 &&
            renderSection(
              t("user_profile.portfolio"),
              <PreviewPortfolio
                portfolioData={projects}
                themeColors={themeColors}
              />
            )}
          {/* Reviews */}
          {(reviews.length > 0 || introVideo || callToAction) &&
            renderSection(
              t("user_profile.reviews"),
              <Box
                sx={{
                  display: { xs: "block", md: "flex" },
                  flexDirection: { md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {reviews.length > 0 && (
                    <PreviewReviews
                      reviewsData={reviews}
                      themeColors={themeColors}
                      showAll={showAllReviews}
                    />
                  )}
                  {/* Call to Action Button under reviews */}
                  {/*
                  {callToAction && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <button
                        style={{
                          color: "#fff",
                          background: "#709a1c",
                          border: "2px solid #709a1c",
                          borderRadius: 8,
                          padding: "12px 32px",
                          fontWeight: 600,
                          fontSize: "1rem",
                          cursor: "pointer",
                          transition: "background 0.2s, color 0.2s",
                        }}
                        onClick={async () => {
                          const label = ENGAGEMENT_FIELDS.find(
                            (f) => f.id === "callToAction"
                          )?.options.find(
                            (opt) => opt.id === callToAction
                          )?.label;
                          if (label === "Learn More") {
                            setShowAllReviews(true);
                          } else if (label === "Contact") {
                            if (!userId) {
                              console.error(
                                "[Contact Button] userId is missing!"
                              );
                              return;
                            }
                            const chatUser = userList?.find(
                              (u) => String(u.id) === String(userId)
                            );
                            if (!chatUser) {
                              console.warn(
                                "[Contact Button] User not found in userList:",
                                userId
                              );
                            } else {
                              console.log(
                                "[Contact Button] Found user in userList:",
                                chatUser
                              );
                            }
                            const navState = chatUser
                              ? {
                                  chatUserId: chatUser.id,
                                  chatUserName: `${chatUser.firstName || ""} ${
                                    chatUser.lastName || ""
                                  }`.trim(),
                                  avatar: chatUser.avatar,
                                }
                              : {
                                  chatUserId: userId,
                                  chatUserName: `${
                                    profileData.firstName || ""
                                  } ${profileData.lastName || ""}`.trim(),
                                  avatar: profileData.avatar,
                                };
                            navigate("/message", { state: navState });
                          }
                        }}
                      >
                        {ENGAGEMENT_FIELDS.find(
                          (f) => f.id === "callToAction"
                        )?.options.find((opt) => opt.id === callToAction)
                          ?.label || callToAction}
                      </button>
                    </Box>
                  )}
                  */}
                </Box>
                {introVideo && (
                  <Box
                    sx={{
                      display: { xs: "flex", md: "inline-block" },
                      flexDirection: { xs: "column", md: "initial" },
                      alignItems: { xs: "center", md: "initial" },
                      justifyContent: { xs: "center", md: "initial" },
                      position: "relative",
                      overflow: "visible",
                      mt: { xs: 5, md: 10 },
                      maxWidth: { md: 180 },
                      minHeight: { xs: 300, sm: 350, md: "initial" },
                      mx: { xs: "auto", md: 0 },
                    }}
                  >
                    <video
                      // src={introVideo}
                      src={fullVideoUrl}
                      controls
                      style={{
                        border: `2px solid ${themeColors.main}`,
                        borderRadius: 12,
                        background: "#000",
                        objectFit: "contain",
                        display: "block",
                        margin: 0,
                        transform: "rotate(90deg)",
                        width: "100%",
                        height: "100%",
                        maxWidth: "420px",
                        maxHeight: "340px",
                      }}
                    >
                      {t("user_profile.no_support_video")}
                    </video>
                    {/* Hello badge in top left corner */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 10,
                        right: "auto",
                        zIndex: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: themeColors.main,
                          color: themeColors.bg,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          boxShadow: 1,
                        }}
                      >
                        {t("user_profile.hello")}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
        </Box>
      </ProfilePreviewLayout>
    );
  }

  // Only show tabs for non-client users
  return (
    <ProfilePreviewLayout
      bannerImage={bannerImage}
      userAvatar={userAvatar}
      userName={userName || t("user_profile.user_name")}
      userCategory={userCategoryFormatted}
      averageRating={averageRating}
      totalReviews={reviews.length}
      themeColors={themeColors}
      fontFamily={fontFamily}
      {...(!isClient
        ? {
            activeTab,
            onTabChange: (_, v) => setActiveTab(v),
            tabLabels: [t("user_profile.general"), t("user_profile.workflow")],
          }
        : {})}
    >
      {/* Main content area, render General or Workflow sections as before */}
      {isClient || activeTab === 0 ? (
        <Box
          sx={{
            width: { xs: "100%", sm: "95%", md: "100%", lg: "100%" },
            margin: "0 auto",
            pl: { xs: 1, sm: 2, md: 10, lg: 10 },
            pr: { xs: 1, sm: 2, md: 10, lg: 10 },
            mt: 2,
          }}
        >
          {/* Description */}
          {description &&
            renderSection(
              t("user_profile.description"),
              <Typography
                variant="body1"
                sx={{ color: themeColors.main, fontSize: "0.9rem", fontFamily }}
              >
                {description}
              </Typography>
            )}
          {/* Skills/Categories */}
          {skills.length > 0 &&
            renderSection(
              t("user_profile.skills"),
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {skills.map((skillId) => {
                  const skill = SKILLS_OPTIONS.find((s) => s.id === skillId);
                  if (!skill) return null;
                  return (
                    <Chip
                      key={skillId}
                      label={skill.label}
                      size="small"
                      sx={{
                        bgcolor: `${themeColors.main}10`,
                        color: themeColors.main,
                        borderRadius: "20px",
                        border: `1px solid ${themeColors.main}`,
                        px: 2,
                        fontFamily,
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          {/* Contact Info */}
          {/* {(email || phoneNumber) &&
            renderSection(
              t("user_profile.contact_info"),
              <Stack spacing={2}>
                {email && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <EmailIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {email}
                    </Typography>
                  </Stack>
                )}
                {phoneNumber && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <PhoneIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {phoneNumber}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )} */}
          {/* Opening Hours */}
          {openingHours.length > 0 &&
            renderSection(
              t("user_profile.opening_hours"),
              <Stack spacing={2} sx={{ fontFamily }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AccessTimeIcon sx={{ color: themeColors.main, mt: 0.5 }} />
                  <Box>{formatOpeningHours(openingHours)}</Box>
                </Stack>
              </Stack>
            )}
          {/* Company Details */}
          {(profileData?.companyDetails?.website ||
            profileData?.companyDetails?.address ||
            profileData?.companyDetails?.email ||
            typeof (profileData?.userType === 'vendor' ? profileData?.vendorAdditionalInfo?.isDeliver : profileData?.companyDetails?.isDeliver) !== "undefined") &&
            renderSection(
              t("user_profile.company_details"),
              <Stack spacing={2}>
                {profileData.companyDetails?.website && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <LanguageIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {profileData.companyDetails.website}
                    </Typography>
                  </Stack>
                )}
                {profileData.companyDetails?.address && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <LocalShippingIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {profileData.companyDetails.address}
                    </Typography>
                  </Stack>
                )}
                {profileData.companyDetails?.email && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <EmailIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {profileData.companyDetails.email}
                    </Typography>
                  </Stack>
                )}
                {typeof (profileData?.userType === 'vendor' ? profileData?.vendorAdditionalInfo?.isDeliver : profileData?.companyDetails?.isDeliver) !==
                  "undefined" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShippingIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {(profileData?.userType === 'vendor' ? profileData?.vendorAdditionalInfo?.isDeliver : profileData?.companyDetails?.isDeliver) === "yes"
                        ? t("user_profile.delivery_available")
                        : t("user_profile.delivery_not_available")}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          {/* Professional Affiliations */}
          {Array.isArray(professionalAffiliations) &&
            professionalAffiliations.length > 0 &&
            renderSection(
              t("user_profile.professional_affiliations"),
              <Stack spacing={2}>
                {professionalAffiliations.map((affiliation, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <AccountBalanceIcon
                        sx={{ color: themeColors.main, mt: 0.3 }}
                      />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              color: themeColors.main,
                              fontSize: "1rem",
                              fontFamily,
                            }}
                          >
                            {affiliation.title}
                          </Typography>
                          {affiliation.memberSince && (
                            <>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: themeColors.main,
                                  fontWeight: 400,
                                  fontSize: "1.05rem",
                                  fontFamily,
                                }}
                              >
                                •
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: themeColors.main,
                                  fontSize: "0.9rem",
                                  fontFamily,
                                }}
                              >
                                {affiliation.memberSince}
                              </Typography>
                            </>
                          )}
                        </Stack>
                        {affiliation.description && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: themeColors.main,
                              mt: 0.5,
                              fontSize: "0.9rem",
                              fontFamily,
                            }}
                          >
                            {affiliation.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          {/* Certifications */}
          {certifications.length > 0 &&
            renderSection(
              t("user_profile.certifications"),
              <Stack spacing={2}>
                {certifications.map((cert, index) => (
                  <Stack
                    key={cert.id || index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <SchoolIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.95rem",
                        fontFamily,
                      }}
                    >
                      {cert.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      •
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {cert.year}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          {/* Awards */}
          {awards.length > 0 &&
            renderSection(
              t("user_profile.awards"),
              <Stack spacing={2}>
                {awards.map((award, index) => (
                  <Stack
                    key={award.id || index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <EmojiEventsIcon sx={{ color: themeColors.main }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.95rem",
                        fontFamily,
                      }}
                    >
                      {award.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      •
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: themeColors.main,
                        fontSize: "0.9rem",
                        fontFamily,
                      }}
                    >
                      {award.year}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          {/* Projects */}
          {projects.length > 0 &&
            renderSection(
              t("accounts.project"),
              <Stack spacing={2}>
                {projects.map((project, index) => {
                  let displayYear = project.year;
                  if (!displayYear && project.createdAt) {
                    const d = new Date(project.createdAt);
                    if (!isNaN(d)) displayYear = d.getFullYear();
                  }
                  return (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <WorkIcon sx={{ color: themeColors.main }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeColors.main,
                          fontSize: "0.92rem",
                          fontFamily,
                        }}
                      >
                        {project.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: themeColors.main, fontFamily }}
                      >
                        •
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: themeColors.main, fontFamily }}
                      >
                        {displayYear}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          {/* Portfolio */}
          {projects.length > 0 &&
            renderSection(
              t("accounts.portfolio"),
              <PreviewPortfolio
                portfolioData={projects}
                themeColors={themeColors}
              />
            )}
          {/* Reviews */}
          {(reviews.length > 0 || introVideo || callToAction) &&
            renderSection(
              t("user_profile.reviews"),
              <Box
                sx={{
                  display: { xs: "block", md: "flex" },
                  flexDirection: { md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {reviews.length > 0 && (
                    <PreviewReviews
                      reviewsData={reviews}
                      themeColors={themeColors}
                      showAll={showAllReviews}
                    />
                  )}
                  {/* Call to Action Button under reviews */}
                  {/*
                  {callToAction && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <button
                        style={{
                          color: "#fff",
                          background: "#709a1c",
                          border: "2px solid #709a1c",
                          borderRadius: 8,
                          padding: "12px 32px",
                          fontWeight: 600,
                          fontSize: "1rem",
                          cursor: "pointer",
                          transition: "background 0.2s, color 0.2s",
                        }}
                        onClick={async () => {
                          const label = ENGAGEMENT_FIELDS.find(
                            (f) => f.id === "callToAction"
                          )?.options.find(
                            (opt) => opt.id === callToAction
                          )?.label;
                          if (label === "Learn More") {
                            setShowAllReviews(true);
                          } else if (label === "Contact") {
                            if (!userId) {
                              console.error(
                                "[Contact Button] userId is missing!"
                              );
                              return;
                            }
                            const chatUser = userList?.find(
                              (u) => String(u.id) === String(userId)
                            );
                            if (!chatUser) {
                              console.warn(
                                "[Contact Button] User not found in userList:",
                                userId
                              );
                            } else {
                              console.log(
                                "[Contact Button] Found user in userList:",
                                chatUser
                              );
                            }
                            const navState = chatUser
                              ? {
                                  chatUserId: chatUser.id,
                                  chatUserName: `${chatUser.firstName || ""} ${
                                    chatUser.lastName || ""
                                  }`.trim(),
                                  avatar: chatUser.avatar,
                                }
                              : {
                                  chatUserId: userId,
                                  chatUserName: `${
                                    profileData.firstName || ""
                                  } ${profileData.lastName || ""}`.trim(),
                                  avatar: profileData.avatar,
                                };
                            navigate("/message", { state: navState });
                          }
                        }}
                      >
                        {ENGAGEMENT_FIELDS.find(
                          (f) => f.id === "callToAction"
                        )?.options.find((opt) => opt.id === callToAction)
                          ?.label || callToAction}
                      </button>
                    </Box>
                  )}
                    */}
                </Box>
              </Box>
            )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              px: 2, // Padding to avoid edge clipping on mobile
              py: 4,
            }}
          >
            {introVideo && (
              <Box
                sx={{
                  position: "relative",
                  width: {
                    xs: "100%", // full width on extra small
                    sm: "90%",
                    md: "500px", // max width on desktop
                  },
                }}
              >
                <video
                  // src={introVideo}
                  src={fullVideoUrl}
                  controls
                  style={{
                    width: "100%",
                    height: "auto",
                    border: `2px solid ${themeColors.main}`,
                    borderRadius: 12,
                    background: "#000",
                    objectFit: "contain",
                    display: "block",
                  }}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Hello badge in top left corner */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 10,
                    zIndex: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: themeColors.main,
                      color: themeColors.bg,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.875rem",
                        md: "1rem",
                      },
                      boxShadow: 1,
                    }}
                  >
                    Hello!
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: { xs: "100%", sm: "95%", md: "100%", lg: "100%" },
            margin: "0 auto",
            pl: { xs: 1, sm: 2, md: 10, lg: 0 },
            pr: { xs: 1, sm: 2, md: 10, lg: 0 },
            mt: 2,
          }}
        >
          {/* Workflow Steps */}
          {renderSection(
            t("user_profile.workflow_steps"),
            <Stack spacing={3}>
              {workflowSteps.map((step, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "transparent",
                    border: `1px solid ${themeColors.main}`,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: themeColors.main,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: themeColors.main,
                        fontWeight: 600,
                        fontFamily,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: themeColors.main, fontFamily }}
                    >
                      {step.description}
                    </Typography>
                    {step.duration && (
                      <Typography
                        variant="body2"
                        sx={{ color: themeColors.main, fontFamily }}
                      >{`${t("user_profile.duration")}: ${
                        step.duration
                      }`}</Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
          {/* Additional Workflow Info */}
          {workflowAdditionalInfo &&
            renderSection(
              t("user_profile.additional_workflow_info"),
              <Typography
                variant="body1"
                sx={{ color: themeColors.main, fontFamily }}
              >
                {workflowAdditionalInfo}
              </Typography>
            )}
          {/* FAQ Section */}
          {faqs.length > 0 &&
            renderSection(
              t("user_profile.frequently_asked_questions"),
              <Stack spacing={0}>
                {faqs.map((faq, index) => (
                  <Box
                    key={index}
                    sx={{
                      borderBottom:
                        index !== faqs.length - 1
                          ? `1px solid ${themeColors.main}20`
                          : "none",
                    }}
                  >
                    <Box
                      onClick={() =>
                        // setActiveTab(activeTab === index ? null : index)
                        setFaqOpenIndex(faqOpenIndex === index ? null : index)
                      }
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 2,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: themeColors.main,
                          // fontWeight: activeTab === index ? 600 : 400,
                          fontWeight: faqOpenIndex === index ? 600 : 400,
                          fontFamily,
                        }}
                      >
                        {faq.question}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{
                          color: themeColors.main,
                          border: `1px solid ${themeColors.main}`,
                        }}
                      >
                        {/* {activeTab === index ? <RemoveIcon /> : <AddIcon />} */}
                        {faqOpenIndex === index ? <RemoveIcon /> : <AddIcon />}
                      </IconButton>
                    </Box>
                    {/* {activeTab === index && ( */}
                    {faqOpenIndex === index && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#555",
                          pb: 2,
                          pl: 0.5,
                          fontFamily,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}

          {/* Approach Section (now under Workflow tab) */}
          {profileData?.profileDesign?.interactive?.approach &&
            !isApproachEmpty(profileData.profileDesign.interactive.approach) &&
            renderSection(
              t("user_profile.approach"),
              <Typography
                variant="h6"
                sx={{
                  color: themeColors.main,
                  mb: 2,
                  fontWeight: 500,
                  fontFamily,
                }}
                dangerouslySetInnerHTML={{
                  __html: profileData.profileDesign.interactive.approach,
                }}
              />
            )}
        </Box>
      )}
    </ProfilePreviewLayout>
  );
}

export default ViewUserProfile;
