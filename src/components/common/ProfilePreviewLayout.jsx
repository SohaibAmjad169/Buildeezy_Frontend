// no need to import React in modern React with JSX
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Tabs,
  Tab,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { colors } from "../../styles/theme";
import BackButton from "./BackButton";
import { THEME_OVERRIDES } from "../profile/design/themeOverrides";
import { useTranslation } from 'react-i18next';

// Shared styled components
const BannerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "bgcolor",
})(({ theme, bgcolor }) => ({
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

const UserName = styled(Typography)(({ theme }) => ({
  fontSize: "1.75rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: colors.primary,
}));

const UserCategory = styled(Typography)(({ theme }) => ({
  color: colors.primary,
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
  border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : colors.primary}`,
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
  color:
    theme.palette.mode === "dark" ? theme.palette.text.primary : colors.primary,
  borderRadius: "6px",
  opacity: 1,
  zIndex: 1,
  backgroundColor: "transparent",
  border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : colors.primary}`,
  "&.Mui-selected": {
    color:
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : colors.primary,
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.action.selected
        : "rgba(75, 175, 80, 0.1)",
    fontWeight: 600,
    border: "none",
  },
  "&:not(.Mui-selected)": {
    backgroundColor: "transparent",
    border: "none",
  },
}));
const StyledRating = styled(Rating)({});

// Section styled component for all main sections (description, skills, contact, etc)
const Section = styled(Paper)(({ theme }) => ({
  px: 2,
  py: 2,
 pl: theme.spacing(0, { xs: 0, sm: 4, md: 15 }),
pr: theme.spacing(0, { xs: 0, sm: 4, md: 15 }),  borderRadius: 2,
backgroundColor: "transparent",
  marginBottom: theme.spacing(3),
}));

function ProfilePreviewLayout({
  bannerImage,
  userAvatar,
  userName,
  userCategory,
  averageRating,
  totalReviews,
  themeColors,
  fontFamily,
  activeTab,
  onTabChange,
  tabLabels = ["General", "Workflow"],
  children,
  renderTopNav,
  showTabs = true,
  previewMode = false,
  themeBackgroundImage,
  themeDecorativeImage,
  themeType,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

const getThemeBackgroundStyle = () => {
  if (themeType === "gradient") {
   
    if (themeColors.id === "green_gradient") {
      return {
        background: `
          linear-gradient(
            to bottom,
            rgba(69, 82, 53, 0.08) 0px,
            rgba(113,156,64,0.08) 450px,
            #F4EDD2 450px,
            #F4EDD2 100%
          ),
          url(${themeBackgroundImage}) no-repeat top center
        `,
        backgroundColor: "#F4EDD2",
        minHeight: "100vh",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundSize: {
           xs: "auto 250px ",
        sm: "auto 350px",
        md: "auto 600px",
        lg: "auto 600px",
        },
      };
    }
 
    return {
      background: `
        linear-gradient(
          to bottom,
          rgba(249,171,45,0.5) 0px,
          rgba(249,171,45,0.5) 450px,
          ${themeColors.bg} 450px,
          ${themeColors.bg} 100%
        ),
        url(${themeBackgroundImage}) no-repeat top center
      `,
      backgroundColor: themeColors.bg,
      minHeight: "100vh",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top center",
      backgroundSize: {
        xs: "auto 250px ",
        sm: "auto 350px",
        md: "auto 600px",
        lg: "auto 600px",
      },
    };
  }

  if (themeType === "decorative") {
    if (
      themeColors.id === "new_orange_frame" ||
      themeColors.imagePosition === "left-right"
    ) {
      return {
        backgroundColor: themeColors.bg,
        position: "relative",
        minHeight: "100vh",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: { xs: "24px", sm: "24px", md: "24px", lg: "32px" }, // más angosto en xs/sm
          backgroundImage: `url(${themeDecorativeImage})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% 100%",
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: "24px", sm: "24px", md: "24px", lg: "32px" }, // igual que before
          backgroundImage: `url(${themeDecorativeImage})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% 100%",
          zIndex: 1,
        },
      };
    }
   
    return {
      background: `
        url(${themeBackgroundImage}) center/cover,
        ${themeColors.bg}
      `,
      position: "relative",
      minHeight: "100vh",
     "&::before, &::after": {
  content: '""',
  position: "absolute",
  left: 0,
  right: 0,
   height: "30px",
  backgroundImage: `url(${themeDecorativeImage})`,
  backgroundRepeat: "repeat-x",
  zIndex: 1,
},
      "&::before": {
        top: 0,
      },
      "&::after": {
        bottom: 0,
      },
    };
  }

  return {
    backgroundColor: themeColors.bg,
    minHeight: "100vh",
  };
};

const overrides =
  themeType === "gradient"
    ? THEME_OVERRIDES[themeColors.id] || THEME_OVERRIDES["orange_gradient"] || {}
    : THEME_OVERRIDES[themeColors.id] || {};

  return (
    <>
      <BackButton />
   
<Paper
  elevation={0}
  sx={{
    ...getThemeBackgroundStyle(),
    color: themeColors.main,
    width: "100%",
    minHeight: "100vh",
    pt: { xs: 2, sm: 3, md: 4 },
    pb: { xs: 6, sm: 8, md: 12 },
    px: {
      xs: themeType === "decorative" ? 4 : 2,
      sm: themeType === "decorative" ? 8 : 4,
      md: themeType === "decorative" ? 16 : 8,
    },
    position: "relative",
    borderRadius: 4,
    fontFamily: fontFamily,
  }}
>

        {renderTopNav && renderTopNav(themeColors)}
        {/* Spacer for mobile to fit buttons above banner */}
        <Box />
        {/* Banner Box */}
        <BannerContainer
          sx={{
            width: { xs: "100%", sm: "100%", md: "100%" }, // banner siempre ancho completo
            height: { xs: 160, sm: 220, md: 300 },
            margin: {
              xs: `${previewMode ? 106 : 16}px auto 0 auto`,
              sm: `${previewMode ? 86 : 52}px auto 0 auto`,
              md: `${previewMode ? 76 : 36}px auto 0 auto`,
            },
          }}
        >
          <BannerImage src={bannerImage} alt="Profile Banner" />
          <Avatar
            src={userAvatar}
            sx={{
              width: { xs: 80, sm: 110, md: 120 },
              height: { xs: 80, sm: 110, md: 120 },
              border: {
                xs: `2px solid ${themeColors.bg}`,
                md: `4px solid ${themeColors.bg}`,
              },
              bgcolor: themeColors.bg,
              position: "absolute",
              bottom: { xs: -40, sm: -55, md: -60 },
              left: { xs: 16, sm: 24, md: 40 },
            }}
          />
        </BannerContainer>
  {/* ...existing code... */}
        {/* User Name/Category left, Reviews/Rating right, directly under avatar */}
        <Box
          sx={{
            width: { xs: "98%", sm: "95%", md: "92%" },
            margin: "0 auto",
            mt: { xs: 7, sm: 10, md: 12 },
            mb: 1,
            pl: { xs: 0, sm: 4, md: 7 },
            pr: { xs: 0, sm: 4, md: 10 },
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "flex-start" },
            justifyContent: { xs: "space-between", md: "space-between" },
            gap: { xs: 2, sm: 2, md: 0 },
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
            <UserName
              sx={{ color: themeColors.main, fontSize: "1.2rem", fontFamily }}
            >
              {userName}
            </UserName>
            <UserCategory
              sx={{ color: themeColors.main, fontSize: "1.2rem", fontFamily }}
            >
              {userCategory}
            </UserCategory>
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
  <Typography
    variant="h4"
    sx={{ fontWeight: 600, color: themeColors.main, mr: 1 }}
  >
    {averageRating?.toFixed(1) ?? "-"}
  </Typography>
<StyledRating
  value={averageRating}
  readOnly
  precision={0.5}
  sx={{
    color: overrides.star || themeColors.main,
    "& .MuiRating-iconEmpty": { color: overrides.star || themeColors.main },
  }}
/>
  <ReviewCount sx={{ color: themeColors.main }}>
  </ReviewCount>
</RatingRow>
            </RatingContainer>
          </Box>
        </Box>
        {/* Tabs below the row */}
        {showTabs && (
          <Box
            sx={{
              width: { xs: "98%", sm: "95%", md: "85%" },
              margin: "0 auto",
              mb: 2,
              display: "flex",
              flexDirection: "row",
              justifyContent: { xs: "center", sm: "center", md: "flex-end" },
            }}
          >
            
          <StyledTabs
  value={activeTab}
  onChange={onTabChange}
  sx={{
    backgroundColor: overrides.tab?.background || "transparent",
    minWidth: "auto",
    width: "auto",
    maxWidth: { xs: 220, sm: 300, md: 400 },
    mr: { xs: 0, sm: 0, md: 10, lg: 4 },
    mx: { xs: "auto", sm: "auto", md: 10 },
    borderColor: "transparent",
    "& .MuiTabs-indicator": {
      backgroundColor: overrides.tab?.indicator || overrides.tab?.activeBg || themeColors.main,
      height: 4,
      borderRadius: 2,
    },
  }}
>
{tabLabels.map((label, idx) => (
  <StyledTab
    key={label}
    label={label}
    sx={{
      color: overrides.tab?.color || themeColors.main,
      "&.Mui-selected": {
        backgroundColor: overrides.tab?.activeBg || themeColors.main + "20",
        color: overrides.tab?.activeColor || overrides.tab?.color || themeColors.main, 
        fontWeight: 600,
        border: "none",
      },
      "&:not(.Mui-selected)": {
        backgroundColor: "transparent",
        color: overrides.tab?.color || themeColors.main,
        border: "none",
      },
    }}
  />
))}
</StyledTabs>
          </Box>
        )}
        {/* Main content area */}
        <Box
          sx={{
            width: "100%",
            pl: 0,
            pr: 0,
            mt: 2,
          }}
        >
          {children}
        </Box>
        {/* Contact Button for public profiles (not own profile) - now at the bottom */}
        {typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/view/') && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, mb: 2 }}>
            <Box
              component="button"
              sx={{
                color: themeColors.bg,
                background: themeColors.main,
                border: `2px solid ${themeColors.main}`,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                cursor: 'pointer',
                boxShadow: 1,
                fontFamily,
                transition: 'background 0.2s, color 0.2s',
                '&:hover': {
                  background: themeColors.bg,
                  color: themeColors.main,
                  border: `2px solid ${themeColors.main}`,
                },
              }}
              onClick={() => {
                const match = window.location.pathname.match(/dashboard\/view\/(\d+)\/profile/);
                const userId = match ? match[1] : null;
             
                if (userId) {
                  navigate("/message", {
                    state: {
                      chatUserId: userId,
                      chatUserName: userName,
                      avatar: userAvatar,
                    },
                  });
                }
              }}
            >
              {t('profile.contact')}
            </Box>
          </Box>
        )}
      </Paper>
    </>
  );
}

export default ProfilePreviewLayout;
export {
  BannerContainer,
  BannerImage,
  UserName,
  UserCategory,
  RatingContainer,
  RatingRow,
  ReviewCount,
  StyledTabs,
  StyledTab,
  StyledRating,
  Section,
};
