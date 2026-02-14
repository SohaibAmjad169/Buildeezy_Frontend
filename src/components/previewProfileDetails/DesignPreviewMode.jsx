import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useReviews from "../../hooks/useReviews";
import { colors } from "../../styles/theme";
import {
  getFullUserProfileUrl,
  getPortfolioUrl,
} from "../../apis/apiEndPoints";
import { useTranslation } from "react-i18next";
import Star from "@mui/icons-material/Star";
import PushPinIcon from "@mui/icons-material/PushPin";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  SKILLS_OPTIONS,
  ENGAGEMENT_FIELDS,
} from "../profile/design/DesignTab.constants";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import defaultBanner from "../../assets/images/cover.jpg";
import ProfilePreviewLayout from "../common/ProfilePreviewLayout";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { THEME_OVERRIDES } from "../profile/design/themeOverrides";

const LICENSE_OPTIONS = [
  { id: "real_estate", label: "Real Estate License" },
  { id: "contractor", label: "Contractor License" },
  { id: "architect", label: "Architect License" },
  { id: "engineer", label: "Engineering License" },
  { id: "other", label: "Other Professional License" },
];

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

// Utility to ensure font is always valid
function getValidFont(font) {
  if (!font || font === "undefined" || font === "") return "inter";
  return font;
}

function DesignPreviewMode({ data, renderTopNav, userId: propUserId }) {
  const [activeTab, setActiveTab] = useState(0);
  const profileData = useSelector((state) => state.profile.profileData);
  const [fetchedProfile, setFetchedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showSubmitButton, setShowSubmitButton] = useState(true);

  // Move these up before any useState that uses them
  const effectiveProfile = propUserId ? fetchedProfile : profileData;
  const effectiveData = propUserId ? fetchedProfile : data;

  const { fetchReviews, fetchHighlightReview } = useReviews();

  const [reviews, setReviews] = useState(() => {
    // Use reviews from effectiveData or effectiveProfile if available
    const initialReviews =
      effectiveProfile?.reviews ||
      effectiveData?.reviews ||
      effectiveData?.user?.reviews;
    if (Array.isArray(initialReviews) && initialReviews.length > 0) {
      return initialReviews
        .map((r) => ({
          rating: r.ratings?.overallExperience || r.rating || 0,
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : r.startDate || "",
          dateRaw: r.createdAt || r.startDate || "", // for sorting
          like: r.likes || r.like || "",
          dislike: r.dislikes || r.dislike || "",
          author: r.contractor?.attributes
            ? `${r.contractor.attributes.firstName || ""} ${r.contractor.attributes.lastName || ""}`.trim()
            : r.author || r.name || "",
          highlight: r.highlight || false,
        }))
        .sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw))
        .slice(0, 10);
    }
    return [];
  });

  // Initialize averageRating and totalReviews from initial reviews
  const initialReviews =
    effectiveProfile?.reviews ||
    effectiveData?.reviews ||
    effectiveData?.user?.reviews;
  const initialMappedReviews =
    Array.isArray(initialReviews) && initialReviews.length > 0
      ? initialReviews.map((r) => ({
        rating: r.ratings?.overallExperience || r.rating || 0,
        dateRaw: r.createdAt || r.startDate || "",
      }))
      : [];
  const initialAvgRating =
    initialMappedReviews.length > 0
      ? initialMappedReviews.reduce((acc, review) => acc + review.rating, 0) /
      initialMappedReviews.length
      : 0;
  const initialTotalReviews = initialMappedReviews.length;

  const [averageRating, setAverageRating] = useState(initialAvgRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);

  // Fetch profile if userId is provided
  useEffect(() => {
    async function fetchProfile() {
      if (!propUserId) return;
      setLoading(true);
      try {
        const response = await getFullUserProfileUrl(propUserId);
        setFetchedProfile(response.data.data);
      } catch {
        setFetchedProfile(null);
      } finally {
        setLoading(false);
      }
    }
    if (propUserId) fetchProfile();
  }, [propUserId]);

  // Fetch reviews
  useEffect(() => {
    const loadReviews = async () => {
      let userId =
        effectiveProfile?.id || effectiveProfile?.userId || effectiveData?.id;
      if (userId) {
        // Fetch both highlighted and normal reviews
        const [highlighted, fetchedReviews] = await Promise.all([
          fetchHighlightReview(userId),
          fetchReviews(userId),
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
        // Map to expected fields for PreviewReviews
        let mappedReviews = (uniqueReviews || []).map((r) => ({
          rating: r.ratings?.overallExperience || r.rating || 0,
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : r.startDate || "",
          dateRaw: r.createdAt || r.startDate || "", // for sorting
          like: r.likes || r.like || "",
          dislike: r.dislikes || r.dislike || "",
          author: r.contractor?.attributes
            ? `${r.contractor.attributes.firstName || ""} ${r.contractor.attributes.lastName || ""}`.trim()
            : r.author || r.name || r.name || "",
          highlight: r.highlight || false,
        }));
        // Sort: highlight first, then by dateRaw descending
        mappedReviews = mappedReviews.sort((a, b) => {
          if (a.highlight && !b.highlight) return -1;
          if (!a.highlight && b.highlight) return 1;
          return new Date(b.dateRaw) - new Date(a.dateRaw);
        });
        mappedReviews = mappedReviews.slice(0, 10);
        setReviews(mappedReviews);
        if (mappedReviews.length > 0) {
          const avgRating =
            mappedReviews.reduce((acc, review) => acc + review.rating, 0) /
            mappedReviews.length;
          setAverageRating(avgRating);
          setTotalReviews(mappedReviews.length);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }
      } else {
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      }
    };
    loadReviews();
  }, [
    effectiveProfile?.id,
    effectiveProfile?.userId,
    effectiveData?.id,
    // fetchReviews,
    // fetchHighlightReview,
  ]);

  // Defensive: fallback if data is not loaded yet
  if (propUserId && loading) {
    return <div>Loading preview...</div>;
  }
  if (propUserId && !fetchedProfile && !loading) {
    return <div>Profile not found.</div>;
  }
  if (!propUserId && !data && !profileData) {
    return <div>Loading preview...</div>;
  }

  // Prefer local theme value if present
  const getThemeField = () => {
    // Try local preview data first (like banner logic)
    const localTheme = effectiveData?.profileDesign?.layout?.theme;
    if (localTheme && localTheme !== "undefined" && localTheme !== "")
      return localTheme;
    // Then try profileData
    const profileTheme = effectiveProfile?.profileDesign?.layout?.theme;
    if (profileTheme && profileTheme !== "undefined" && profileTheme !== "")
      return profileTheme;
    // Then try data.theme (legacy)
    if (
      effectiveData?.theme &&
      effectiveData.theme !== "undefined" &&
      effectiveData.theme !== ""
    )
      return effectiveData.theme;
    // Default to 'green'
    return "green";
  };
  const themeValue = getThemeField();
  const themeColors = getThemeColor(themeValue);
  const bannerImage =
    effectiveData?.banner ||
    effectiveData?.profileDesign?.layout?.banner ||
    effectiveProfile?.profileDesign?.layout?.banner ||
    defaultBanner;
  const userName =
    (effectiveProfile?.firstName || "") +
    (effectiveProfile?.lastName ? ` ${effectiveProfile.lastName}` : "");
  const displayUserName = userName.trim() || "User Name";
  const userCategory = effectiveProfile?.category || "Category";
  const userAvatar = effectiveProfile?.avatar || "";

  // Extract font value from profileDesign.layout.font
  const fontValue =
    getValidFont(effectiveProfile?.profileDesign?.layout?.font) ||
    getValidFont(effectiveData?.profileDesign?.layout?.font) ||
    "inter";
  const fontFamily = getFontFamily(fontValue);

  const overrides =
    themeColors.type === "gradient"
      ? THEME_OVERRIDES[themeColors.id] || THEME_OVERRIDES["orange_gradient"] || {}
      : THEME_OVERRIDES[themeColors.id] || {};

  return (

    <ProfilePreviewLayout
      bannerImage={bannerImage}
      userAvatar={userAvatar}
      userName={displayUserName}
      userCategory={userCategory}
      averageRating={averageRating}
      totalReviews={totalReviews}
      themeColors={themeColors}
      fontFamily={fontFamily}
      activeTab={activeTab}
      onTabChange={(_, v) => setActiveTab(v)}
      tabLabels={["General", "How I work"]}
      renderTopNav={renderTopNav ? () => renderTopNav(themeColors, themeValue) : undefined}
      previewMode={true}
      themeBackgroundImage={themeColors.backgroundImage}
      themeDecorativeImage={themeColors.decorativeImage}
      themeType={themeColors.type}
    >

      <Box
        sx={{
          width: { xs: "98%", sm: "95%", md: "100%", lg: "100%" },
          margin: "0 auto",
          pl: { xs: 0, sm: 1, md: 1, lg: 1 },
          pr: { xs: 0, sm: 1, md: 1, lg: 1 },
          mt: 2,
        }}
      >
        {/* Main content area, render PreviewGeneral or PreviewWorkflow as before */}
        {activeTab === 0 ? (
          <PreviewGeneral
            data={{
              ...effectiveData,
              user: {
                ...effectiveData?.user,
                reviews,
              },
            }}
            profileData={effectiveProfile}
            themeColors={themeColors}
            fontFamily={fontFamily}
            themeValue={themeValue}
            overrides={overrides}
          />
        ) : (
          <PreviewWorkflow
            data={effectiveData}
            profileData={effectiveProfile}
            themeColors={themeColors}
            fontFamily={fontFamily}
          />
        )}
        {/* Restore Submit button at the bottom, right-aligned */}
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
            mt: 4,
            pb: 6,
            pr: { xs: 0, md: 15 },
          }}
        >
          {showSubmitButton && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: overrides.button?.activeBg || overrides.button?.backgroundColor,
                color: overrides.button?.color || "#222",
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                '&:hover': {
                  backgroundColor: overrides.button?.hoverBg || overrides.button?.activeBg || overrides.button?.backgroundColor,
                  color: overrides.button?.color || "#222",
                },
              }}
            >
              {t("common.submit")}
            </Button>
          )}
        </Box>
      </Box>
    </ProfilePreviewLayout>
  );
}

// Helper function for theme color
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
        textColor: "#719C40",
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

function PreviewReviews({
  reviewsData,
  themeColors = { bg: "#fff", main: "#4BAF50" },
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  // Always put highlight review first (if any)
  let highlightReview = null;
  let otherReviews = [];
  if (Array.isArray(reviewsData) && reviewsData.length > 0) {
    highlightReview = reviewsData.find((r) => r.highlight);
    otherReviews = reviewsData.filter((r) => !r.highlight);
  }
  const orderedReviews = highlightReview
    ? [highlightReview, ...otherReviews]
    : otherReviews;

  const displayedReviews = showAll
    ? orderedReviews.slice(0, 10)
    : orderedReviews.slice(0, 3);
  const hasMoreReviews = orderedReviews.length > 3 && !showAll;

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

  if (!orderedReviews || orderedReviews.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{ color: themeColors.main, opacity: 0.7 }}
      >
        {t("profile.no_reviews")}
      </Typography>
    );
  }

  return (
    <Box>
      {displayedReviews.map((review, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            minWidth: { xs: "100%", sm: "60vw", md: "60%" },
            backgroundColor: themeColors.main + "20",
            border: review.highlight
              ? `2px solid ${themeColors.main}`
              : `1px solid ${themeColors.main}`,
            position: "relative",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 1 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {renderStars(review.rating)}
              <Typography
                variant="body1"
                sx={{ ml: 1, color: themeColors.main, fontWeight: 500 }}
              >
                {review.rating.toFixed(1)}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: themeColors.main,
                opacity: 0.8,
                ml: { xs: 0, sm: 1 },
              }}
            >
              {review.date}
            </Typography>
          </Stack>
          {review.highlight && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "transparent",
                py: 0.5,
                px: 1.5,
                borderRadius: 1,
                color: colors.primary,
                border: `1px solid ${colors.primary}`,
                "&:hover": {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`,
                },
              }}
            >
              <PushPinIcon sx={{ fontSize: 16, color: "inherit" }} />
              <Typography
                variant="caption"
                sx={{ color: "inherit", fontWeight: 500 }}
              >
                {t("profile.preview.highlight")}
              </Typography>
            </Box>
          )}
          <Typography
            variant="body1"
            sx={{
              color: themeColors.main,
              mb: 1,
              fontSize: "0.85rem",
              fontWeight: 400,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            <strong>Like:</strong> &ldquo;{stripHtmlTags(review.like)}&rdquo;
          </Typography>
          {review.dislike && (
            <Typography
              variant="body1"
              sx={{
                color: themeColors.main,
                mb: 1,
                fontSize: "0.85rem",
                fontWeight: 400,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              <strong>Dislike:</strong> &ldquo;{stripHtmlTags(review.dislike)}
              &rdquo;
            </Typography>
          )}
          <Typography
            variant="subtitle2"
            sx={{
              color: themeColors.main,
              opacity: 0.8,
              fontWeight: 500,
            }}
          >
            - {review.author}
          </Typography>
        </Paper>
      ))}
      {hasMoreReviews && (
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
              opacity: 1,
              cursor: "pointer",
            }}
            onClick={() => setShowAll(true)}
          >
            {t("profile.preview.see_more")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

function PreviewGeneral({
  data,
  profileData,
  themeColors = { bg: "#F7FFE6", main: "#4BAF50" },
  fontFamily,
  themeValue,
  overrides, // <-- agrega esto
}) {
  const { t } = useTranslation();
  const [portfolio, setPortfolio] = useState([]);
  const [projects, setProjects] = useState([]);

  // Helper to prefer local profileData over API data
  const getField = (fieldPath, fallback) => {
    // Try to get the value from profileData first, then from data
    const get = (obj, path) =>
      path
        .split(".")
        .reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
    const localValue = get(profileData, fieldPath);
    if (localValue !== undefined && localValue !== null && localValue !== "")
      return localValue;
    const dataValue = get(data, fieldPath);
    if (dataValue !== undefined && dataValue !== null && dataValue !== "")
      return dataValue;
    return fallback;
  };

  const description = getField(
    "profileDesign.content.slogan",
    getField("description", "")
  );
  const email = getField("email", "");
  const phoneNumber = getField("phoneNumber", "");
  const skills = getField(
    "profileDesign.content.skills",
    getField("user.skills", [])
  );
  const openingHours = getField("vendorAdditionalInfo.openingHours", []);
  const companyDetails = getField("vendorAdditionalInfo.companyDetails", {});
  const isDeliver = getField("vendorAdditionalInfo.isDeliver", undefined);
  const certifications = getField("profileDesign.content.certifications", []);
  const awards = getField("profileDesign.content.awards", []);
  const introVideo = getField("profileDesign.content.introVideo", undefined);
  const callToAction = getField(
    "profileDesign.engagement.callToAction",
    undefined
  );
  const professionalAffiliations = getField(
    "specialistAdditionalInfo.professionalAffiliations",
    []
  );

  useEffect(() => {
    async function fetchPortfolio() {
      const userId = profileData?.id || profileData?.userId || data?.id;
      if (userId) {
        try {
          const response = await getPortfolioUrl(userId);
          const allPortfolios = response?.data?.data || [];
          // Only published projects
          const published = allPortfolios.filter(
            (portfolio) =>
              (portfolio.status || "").toLowerCase() === "published"
          );
          setPortfolio(published);
          // Map to { title, year }
          const mappedProjects = published.map((p) => ({
            title: p.title,
            year: p.createdAt ? new Date(p.createdAt).getFullYear() : "",
          }));
          setProjects(mappedProjects);
        } catch {
          setPortfolio([]);
          setProjects([]);
        }
      }
    }
    fetchPortfolio();
  }, [profileData?.id, profileData?.userId, data?.id]);

  function formatOpeningHours(hoursArr) {
    if (!Array.isArray(hoursArr) || hoursArr.length === 0) return null;
    return hoursArr.map((entry, idx) => {
      const days = Array.isArray(entry.daysOfWeek)
        ? entry.daysOfWeek.join(", ")
        : "";
      return (
        <Box
          key={days + entry.startTime + entry.endTime + idx}
          sx={{ mt: 0.5 }}
        >
          <Typography
            variant="body2"
            sx={{ color: themeColors.main, fontWeight: 500, fontSize: "1rem" }}
          >
            {days}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: themeColors.main, fontSize: "0.95rem" }}
          >
            {entry.startTime} - {entry.endTime}
          </Typography>
        </Box>
      );
    });
  }

  const renderSection = (title, children) => (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 1, sm: 2, md: 6, lg: 10 },
        py: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: 2,
        bgcolor: "transparent",
        mb: { xs: 2, sm: 3, md: 5 },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 1.5,
          color: themeColors.main,
          fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" }, // más compacto en xs
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ fontFamily }}>{children}</Box>
    </Paper>
  );

  const renderInfoItem = (icon, text) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      {icon && React.cloneElement(icon, { sx: { color: themeColors.main } })}
      <Typography
        variant="body1"
        sx={{ color: themeColors.main, fontSize: "0.9rem", fontFamily }}
      >
        {text || t("profile.preview.placeholder")}
      </Typography>
    </Stack>
  );

  const renderAffiliationItem = (
    title,
    subtitle,
    description,
    licenseNumber
  ) => {
    const licenseLabel =
      LICENSE_OPTIONS.find((option) => option.id === licenseNumber)?.label ||
      licenseNumber;

    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <AccountBalanceIcon sx={{ color: themeColors.main }} />
          <Typography variant="h6" sx={{ color: themeColors.main }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.main }}>
            •
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.main }}>
            {subtitle}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 1, ml: 4 }}
        >
          <Typography variant="body2" sx={{ color: themeColors.main }}>
            {licenseLabel}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{ color: themeColors.main, ml: 4, mb: 2, fontFamily }}
        >
          {description}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* Description */}
      {description &&
        renderSection(
          t("profile.preview.description"),
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
          t("profile.preview.skills.title"),
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
                    fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                    px: { xs: 1, sm: 2 },
                    bgcolor:
                      themeValue === "decorative_frame"
                        ? "#FEDF89"
                        : themeValue === "decorative_frame_alt"
                          ? "#F4FEEE"
                          : themeValue === "orange_gradient"
                            ? " #FEDF89"
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
                    // px: 2,
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
          t("profile.preview.contact.title"),
          <Stack spacing={2} sx={{ fontFamily }}>
            {email &&
              renderInfoItem(
                <EmailIcon sx={{ color: themeColors.main }} />,
                email
              )}
            {phoneNumber &&
              renderInfoItem(
                <PhoneIcon sx={{ color: themeColors.main }} />,
                phoneNumber
              )}
          </Stack>
        )}

      {/* Operating Hours */}
      {openingHours &&
        openingHours.length > 0 &&
        renderSection(
          t("profile.preview.operating_hours.title"),
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <AccessTimeIcon sx={{ color: themeColors.main, mt: 0.5 }} />
              <Box>{formatOpeningHours(openingHours)}</Box>
            </Stack>
          </Stack>
        )}

      {/* Company Details */}
      {(companyDetails.website ||
        companyDetails.address ||
        companyDetails.email ||
        typeof isDeliver !== "undefined") &&
        renderSection(
          t("profile.preview.company_details.title"),
          <Stack spacing={2} sx={{ fontFamily }}>
            {companyDetails.website &&
              renderInfoItem(
                <LanguageIcon sx={{ color: themeColors.main }} />,
                companyDetails.website
              )}
            {companyDetails.address &&
              renderInfoItem(
                <LocalShippingIcon sx={{ color: themeColors.main }} />,
                companyDetails.address
              )}
            {companyDetails.email &&
              renderInfoItem(
                <EmailIcon sx={{ color: themeColors.main }} />,
                companyDetails.email
              )}
            {typeof isDeliver !== "undefined" && (
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
                  {isDeliver === "yes"
                    ? t("profile.preview.company_details.delivery_available")
                    : "Delivery not available"}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

      {/* Professional Affiliations */}
      {professionalAffiliations.length > 0 &&
        renderSection(
          t("profile.preview.professional_affiliations.title"),
          <Stack spacing={2}>
            {professionalAffiliations.map((affiliation, index) => (
              <Box key={index}>
                {renderAffiliationItem(
                  affiliation.title,
                  affiliation.memberSince,
                  affiliation.description,
                  affiliation.licenceNumber
                )}
              </Box>
            ))}
          </Stack>
        )}

      {/* Certifications */}
      {certifications.length > 0 &&
        renderSection(
          t("profile.preview.certifications.title"),
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
                  sx={{ color: themeColors.main, fontSize: "0.9rem" }}
                >
                  •
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: themeColors.main, fontSize: "0.9rem" }}
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
          t("profile.preview.awards.title"),
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
          t("profile.preview.projects.title"),
          <Stack spacing={2}>
            {projects.map((project, index) => (
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
                  {project.year}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

      {/* Portfolio */}
      {renderSection(
        t("profile.portfolio.title"),
        <PreviewPortfolio portfolioData={portfolio} themeColors={themeColors} />
      )}

      {/* Reviews */}
      {data?.user?.reviews &&
        data.user.reviews.length > 0 &&
        renderSection(
          t("profile.reviews"),
          <Box
            sx={{
              display: { xs: "block", md: "flex" },
              flexDirection: { md: "row" },
              justifyContent: { md: "flex-end" },
              alignItems: { md: "flex-start" },
            }}
          >
            <Box sx={{ flexBasis: { md: "70%" }, flexGrow: 1, minWidth: 0 }}>
              <PreviewReviews
                reviewsData={data.user.reviews}
                themeColors={themeColors}
              />
              {/* Call to Action Button under reviews */}
              {callToAction && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <button
                    style={{
                      color: overrides.button?.color || "#222",
                      background: overrides.button?.activeBg || overrides.button?.backgroundColor,
                      border: `2px solid ${overrides.button?.activeBg || overrides.button?.backgroundColor}`,
                      borderRadius: 8,
                      padding: "12px 32px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {ENGAGEMENT_FIELDS.find(
                      (f) => f.id === "callToAction"
                    )?.options.find((opt) => opt.id === callToAction)?.label ||
                      callToAction}
                  </button>
                </Box>
              )}
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
                  maxWidth: 320,
                  maxHeight: 240,
                  mx: { xs: "auto", md: 0 },
                }}
              >
                <video
                  src={introVideo}
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
                    maxWidth: "320px",
                    maxHeight: "240px",
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Hello badge in top right corner */}
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
                    Hello!
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
    </Box>
  );
}

function PreviewWorkflow({
  data,
  profileData,
  themeColors = { bg: "#F7FFE6", main: "#4BAF50" },
  fontFamily,
}) {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const approach = profileData?.profileDesign?.interactive?.approach || "";
  const faqs = profileData?.profileDesign?.interactive?.faq || [];

  const handleFaqClick = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const renderSection = (title, children) => (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 1, sm: 2, md: 6, lg: 10 },
        py: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: 2,
        bgcolor: "transparent",
        mb: { xs: 2, sm: 3, md: 5 },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 1.5,
          color: themeColors.main,
          fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" }, // más compacto en xs
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ fontFamily }}>{children}</Box>
    </Paper>
  );

  const renderFaqItem = (question, answer, index) => (
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
        onClick={() => handleFaqClick(index)}
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
            fontWeight: expandedFaq === index ? 600 : 400,
            fontFamily,
          }}
        >
          {question}
        </Typography>
        <IconButton
          size="small"
          sx={{
            color: themeColors.main,
            border: `1px solid ${themeColors.main}`,
          }}
        >
          {expandedFaq === index ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Box>
      {expandedFaq === index && (
        <Typography
          variant="h6"
          sx={{
            color: themeColors.main,
            pb: 2,
            pl: 1,
            fontFamily,
          }}
        >
          {answer}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ pb: 10 }}>
      {/* Workflow Steps */}
      {data?.workflow?.steps?.length > 0 &&
        renderSection(
          t("profile.preview.workflow.steps"),
          <Stack spacing={3}>
            {data.workflow.steps.map((step, index) => (
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
                    >
                      {t("profile.preview.workflow.duration")}: {step.duration}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

      {/* Additional Workflow Info */}
      {data?.workflow?.additionalInfo &&
        renderSection(
          t("profile.preview.workflow.additional_info"),
          <Typography
            variant="body1"
            sx={{ color: themeColors.main, fontFamily }}
          >
            {data.workflow.additionalInfo}
          </Typography>
        )}

      {/* FAQ Section */}
      {faqs.length > 0 &&
        renderSection(
          t("profile.preview.workflow.faq"),
          <Stack spacing={0}>
            {faqs.map((faq, index) =>
              renderFaqItem(faq.question, faq.answer, index)
            )}
          </Stack>
        )}

      {/* Approach Section (after FAQ) */}
      {approach &&
        renderSection(
          t("profile.preview.approach"),
          <Typography
            variant="h6"
            sx={{
              color: themeColors.main,
              mb: 2,
              fontWeight: 500,
              fontFamily,
            }}
            dangerouslySetInnerHTML={{ __html: approach }}
          />
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
        {displayItems.map((item, idx) => (
          <Paper
            key={item.id || idx}
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${themeColors.main}`,
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box sx={{ position: "relative", pb: "75%", overflow: "hidden" }}>
              <img
                src={item.thumbnail || item.image || item.thumbnail?.url}
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
        ))}
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
            {t("profile.preview.see_more")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default DesignPreviewMode;

export { PreviewReviews };
