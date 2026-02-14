import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Rating,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import PreviewGeneral from "./PreviewGeneral";
import PreviewWorkflow from "./PreviewWorkflow";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { ArrowBackIos, Visibility } from "@mui/icons-material";
import { colors } from "../../styles/theme";

// Default banner image URL
const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop";

const getThemeColor = (theme) => {
  switch (theme) {
    case "green":
      return "#F7FFE6";
    case "white":
      return colors.white;
    case "blue":
      return colors.blue300;
    case "grey":
      return colors.grey400;
    case "purple":
      return colors.purple;
    case "yellow":
      return colors.orange200;
    case "rose":
      return colors.red300;
    default:
      return "#F7FFE6";
  }
};

const BannerContainer = styled(Box)(({ theme, bgcolor }) => ({
  position: "relative",
  width: "85%",
  height: "300px",
  backgroundColor: bgcolor || colors.grey100,
  overflow: "visible",
  borderRadius: theme.spacing(3),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "96px auto 0 auto",
}));

const BannerImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "24px",
});

const AvatarContainer = styled(Box)(({ borderColor }) => ({
  position: "absolute",
  left: "17%",
  bottom: "-70px",
  transform: "translateX(-50%)",
  width: 140,
  height: 140,
  borderRadius: "50%",
  border: `4px solid ${borderColor}`,
  overflow: "hidden",
  backgroundColor: colors.white,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const AvatarImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const UserInfoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, { xs: 2, sm: 3, md: 4 }),
}));

const UserName = styled(Typography)(({ theme }) => ({
  fontSize: "1.75rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: colors.black800,
}));

const UserCategory = styled(Typography)(({ theme }) => ({
  color: colors.grey700,
  marginBottom: theme.spacing(2),
}));

const RatingContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
});

const RatingRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const ReviewCount = styled(Typography)({
  color: colors.grey700,
  fontSize: "0.875rem",
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: "none",
  marginTop: theme.spacing(2),
  padding: 0,
  borderRadius: "6px",
  backgroundColor: "transparent",
  border: `1px solid ${colors.primary}`,
  "& .MuiTabs-flexContainer": {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  color: colors.primary,
  borderRadius: "6px",
  opacity: 1,
  zIndex: 1,
  backgroundColor: "transparent",
  border: `1px solid ${colors.primary}`,
  "&.Mui-selected": {
    color: colors.primary,
    backgroundColor: "rgba(75, 175, 80, 0.1)",
    fontWeight: 600,
    border: "none",
  },
  "&:not(.Mui-selected)": {
    backgroundColor: "transparent",
    border: "none",
  },
}));

const StyledRating = styled(Rating)({
  "& .MuiRating-iconEmpty": {
    color: "#faaf00",
  },
});

function PreviewContainer({ data, profileData, onExitPreview }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    setAverageRating(4.5);
    setTotalReviews(0);
  }, []);

  // Defensive: fallback if data is not loaded yet
  if (!data) {
    return <div>Loading preview...</div>;
  }

  // Use fallback objects for nested properties
  const layout = data?.layout || {};

  const themeColor = getThemeColor(layout?.theme);
  const userName =
    `${profileData?.firstName || ""} ${profileData?.lastName || ""}`.trim() ||
    "User Name";
  const userCategory = profileData?.category || "Category";
  const userAvatar = profileData?.avatar || DEFAULT_BANNER_IMAGE;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: themeColor,
        color: themeColor === colors.white ? colors.black800 : colors.white,
        width: "100%",
        minHeight: "100vh",
        pt: 4,
        position: "relative",
      }}
    >
      {/* Top Navigation Buttons */}
      <Box
        sx={{
          position: "absolute",
          top: 32,
          left: 32,
          zIndex: 2,
          pt: 2,
          pb: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Button
          variant="text"
          onClick={onExitPreview}
          startIcon={<ArrowBackIos sx={{ fontSize: 16 }} />}
          sx={{
            color: colors.primary,
            "& .MuiButton-startIcon": {
              marginRight: 0.5,
            },
            "&:hover": {
              backgroundColor: "transparent",
              color: colors.primary800,
            },
          }}
        >
          {t("profile.preview.back_to_edit")}
        </Button>
        <Button
          variant="contained"
          startIcon={<Visibility />}
          disableRipple
          sx={{
            backgroundColor: "rgba(75, 175, 80, 0.1)",
            color: colors.primary,
            "& .MuiButton-startIcon": {
              marginRight: 0.5,
            },
            boxShadow: "none",
            cursor: "default",
            pointerEvents: "none",
          }}
        >
          {t("common.preview_mode")}
        </Button>
      </Box>

      {/* Banner Box */}
      <BannerContainer>
        <BannerImage
          src={layout?.banner || DEFAULT_BANNER_IMAGE}
          alt="Profile Banner"
        />
        <AvatarContainer borderColor={themeColor}>
          <AvatarImage src={userAvatar} alt="Profile Avatar" />
        </AvatarContainer>
      </BannerContainer>

      {/* User Name/Category left, Reviews/Rating right, directly under avatar */}
      <Box
        sx={{
          width: "85%",
          margin: "0 auto",
          mt: 12,
          mb: 1,
          pl: 10,
          pr: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Name and Category */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <UserName>{userName}</UserName>
          <UserCategory>{userCategory}</UserCategory>
        </Box>
        {/* Right: Reviews/Rating aligned with UserName */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            mt: "8px",
          }}
        >
          <RatingContainer>
            <RatingRow>
              <StyledRating value={averageRating} readOnly precision={0.5} />
              <ReviewCount>({totalReviews})</ReviewCount>
            </RatingRow>
          </RatingContainer>
        </Box>
      </Box>
      {/* Tabs below the row */}
      <Box
        sx={{
          width: "85%",
          margin: "0 auto",
          mb: 2,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box sx={{ flex: 1 }} />
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ minWidth: "auto", width: "auto", maxWidth: 400, mr: 10 }}
        >
          <StyledTab label="General" sx={{ minWidth: 100, maxWidth: 200 }} />
          <StyledTab label="Workflow" sx={{ minWidth: 100, maxWidth: 200 }} />
        </StyledTabs>
      </Box>

      {/* User Info */}
      <UserInfoContainer>
        {activeTab === 0 ? (
          <PreviewGeneral data={data} profileData={profileData} />
        ) : (
          <PreviewWorkflow data={data} profileData={profileData} />
        )}
      </UserInfoContainer>
    </Paper>
  );
}

export default PreviewContainer;
