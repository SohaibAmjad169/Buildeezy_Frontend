import PropTypes from "prop-types";
import { Box, Card, CardContent, styled, Avatar, Chip } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { getFirstCharUpperCase } from "../../utils/common";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useEffect, useState } from "react";
import { getProfileUrl } from "../../apis/apiEndPoints";
import { useTranslation } from "react-i18next";
import buildeezy from "../../assets/images/buildeezy.png";
import { useSelector } from "react-redux";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "1rem",
  width: "100%",
  // minWidth: 290,
  // maxWidth: 320,
  minHeight: 320,
  padding: 0,
  transition: "box-shadow 0.2s, border 0.2s",
  position: "relative",
  overflow: "visible",
  "&:hover": {
    border: `solid ${theme.palette.primary.main} 1px`,
    boxShadow: theme.shadows[4],
  },
}));

// Utility to format category string
function formatCategory(category) {
  if (!category) return "";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper style for ellipsis (2 lines)
const ellipsisStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "normal",
  width: "100%",
};

export default function ProffecionalCards({ profile, onClick, showCompletionBadge = false, showVerificationBadge = false }) {

  const { loading } = useSelector((state) => state.config);
  const { t } = useTranslation()

  // Detect if this is an ads profile card or suggested profile
  const isAdsProfile = profile?.adType === 'profile' || profile?.type === 'suggested_profile';
  const isSuggestedProfile = profile?.type === 'suggested_profile';

  console.log('ProffecionalCards received profile:', {
    isAdsProfile,
    isSuggestedProfile,
    keys: Object.keys(profile || {}),
    profile: profile
  });

  // Banner: Handle different data structures
  let banner;
  if (isAdsProfile && !isSuggestedProfile) {
    // For ads profile cards, use documents array or other ad-specific fields
    banner = profile?.documents?.[0] ||
      profile?.media?.[0] ||
      profile?.image ||
      profile?.banner ||
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop";
  } else {
    // For suggested profiles, use regular profile fields
    banner = profile?.profileDesign?.layout?.banner ||
      profile?.banner ||
      profile?.image ||
      profile?.profilePicture ||
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop";
  }

  const [imgSrc, setImgSrc] = useState(banner || buildeezy);

  // Avatar: Handle different field names  
  let avatar;
  if (isAdsProfile && !isSuggestedProfile) {
    // For ads profile cards, might not have avatar - could use business logo or first letter of business name
    avatar = profile?.avatar || 
      profile?.logo || 
      profile?.businessLogo ||
      null; // No avatar for ads
  } else {
    // For suggested profiles, use regular avatar fields
    avatar = profile?.avatar || profile?.profilePicture || profile?.image;
  }
  
  // Treat default placeholder as no avatar
  const isDefaultAvatar =
    avatar?.includes("default.png") ||
    avatar?.includes("default.jpg") ||
    avatar?.includes("default_avatar");

  // Name: Handle different structures
  let name;
  if (isAdsProfile && !isSuggestedProfile) {
    // For ads profile cards, use business name or headline
    name = profile?.businessName || 
      profile?.companyName || 
      profile?.name ||
      profile?.headline ||
      "Business";
  } else {
    // For suggested profiles, use regular name fields
    name = profile?.name || 
      `${getFirstCharUpperCase(profile?.firstName || '')} ${getFirstCharUpperCase(profile?.lastName || '')}`;
  }

  // Slogan: Handle different data sources
  let slogan;
  if (isAdsProfile && !isSuggestedProfile) {
    // For ads profile cards, use headline or title
    slogan = profile?.headline || 
      profile?.title || 
      profile?.adTitle ||
      "";
  } else {
    // For suggested profiles, use regular slogan fields
    slogan = profile?.profileDesign?.content?.slogan || 
      profile?.slogan || 
      profile?.tagline || 
      "";
  }

  // Description: Handle different field names
  const description = profile?.description || 
    profile?.summary || 
    profile?.bio || 
    profile?.content ||
    "";

  // Profession/Category: Handle different field names
  let profession;
  if (isAdsProfile && !isSuggestedProfile) {
    // For ads profile cards, use ad type or category
    profession = profile?.adType || 
      profile?.category || 
      profile?.type ||
      "Advertisement";
  } else {
    // For suggested profiles, use regular profession fields
    profession = profile?.category || 
      profile?.userType || 
      profile?.profession || 
      profile?.specialization || 
      "Professional";
  }

  // Company details: Handle different structures
  let companyDetails;
  if (isAdsProfile && !isSuggestedProfile) {
    // For ads profile cards, only show location (city) since business name is already shown as main name
    companyDetails = {
      name: "", // Don't repeat business name
      city: profile?.city || profile?.location || ""
    };
  } else {
    // For suggested profiles, use regular company details
    companyDetails = profile?.companyDetails ||
      profile?.vendorAdditionalInfo?.companyDetails ||
      profile?.specialistAdditionalInfo?.companyDetails ||
      profile?.contractorAdditionalInfo?.companyDetails ||
      profile?.company ||
      {};
  }

  // Verification status: Handle different field names
  const isVerified = profile?.isVerified || profile?.verified || false;

  // Profile completion: Handle different field names
  const profileCompletion = profile?.profileCompletionPercentage || 
    profile?.completionPercentage || 
    profile?.completion || 
    0;

  if (loading) {
    return (
      <StyledCard variant="outlined">
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          {t("loading", "Loading...")}
        </CardContent>
      </StyledCard>
    );
  }
  if (!profile) return null

  return (
    <StyledCard
      variant="outlined"
      onClick={onClick}
      sx={{ width: "100%", minWidth: 0 }}
    >
      {/* Banner */}
      <Box
        sx={{
          width: "100%",
          height: 190,
          position: "relative",
          overflow: "visible",
          mb: 0,
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          borderBottomLeftRadius: "1rem",
          borderBottomRightRadius: "1rem",
          boxSizing: "border-box",
        }}
      >
        <Box
          component="img"
          src={imgSrc}
          onError={() => setImgSrc(buildeezy)}
          alt="banner"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        />
        
        {/* Badges Container */}
        <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Verification Badge */}
          {showVerificationBadge && isVerified && (
            <Chip
              icon={<VerifiedIcon />}
              label="Verified"
              color="primary"
              size="small"
              sx={{
                backgroundColor: "rgba(25, 118, 210, 0.9)",
                color: "white",
                fontWeight: "bold",
                '& .MuiChip-icon': {
                  color: "white"
                }
              }}
            />
          )}
          
          {/* Completion Badge */}
          {showCompletionBadge && profileCompletion === 100 && (
            <Chip
              icon={<VerifiedIcon />}
              label="Complete"
              color="success"
              size="small"
              sx={{
                backgroundColor: "rgba(46, 125, 50, 0.9)",
                color: "white",
                fontWeight: "bold",
                '& .MuiChip-icon': {
                  color: "white"
                }
              }}
            />
          )}
        </Box>
      </Box>
      <CardContent
        sx={{
          pt: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          // height: "100%",
        }}
      >
        {/* Info area with fixed minHeight for slogan/description */}
        <Box
          sx={{
            width: "100%",
            borderBottomLeftRadius: "1rem",
            borderBottomRightRadius: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            minHeight: 90, // fixed minHeight for slogan/description
            justifyContent: "flex-start",
            mb: 2,
          }}
        >
          {slogan && (
            <MuiTypography
              variant="h6"
              sx={{
                fontWeight: 500,
                fontSize: "0.95rem",
                color: "primary.main",
                mb: 0.5,
                lineHeight: 1.2,
                ...ellipsisStyle,
              }}
            >
              {slogan}
            </MuiTypography>
          )}
          {description && (
            <MuiTypography
              variant="subtitle2"
              sx={{
                minHeight: "35px",
                fontSize: "0.85rem",
                fontWeight: 400,
                color: "text.secondary",
                mb: 0.5,
                ...ellipsisStyle,
              }}
            >
              {description}
            </MuiTypography>
          )}
        </Box>
        {/* Name/profession block always at the same place */}
        <Box
          sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1 }}
        >
          {/* {avatar && !isDefaultAvatar ? (
            <Avatar
              src={avatar}
              alt={name}
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                bgcolor: "white",
                color: "white",
                border: "2px solid #eee",
                fontWeight: 700,
                fontSize: 28,
                boxShadow: "none",
              }}
            >
              {profile.firstName?.[0]}
            </Avatar>
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "transparent",
              }}
            >
              <AccountCircleIcon
                sx={{ fontSize: 40, color: "text.secondary" }}
              />
            </Box>
          )} */}

          {avatar ? (
            <Avatar
              src={avatar}
              alt={name}
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                bgcolor: "white",
                color: "text.secondary",
                border: "2px solid #eee",
                fontWeight: 700,
                fontSize: 28,
                boxShadow: "none",
              }}
            >
              {isAdsProfile && !isSuggestedProfile 
                ? name?.[0]?.toUpperCase() 
                : profile.firstName?.[0]?.toUpperCase()
              }
            </Avatar>
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "transparent",
              }}
            >
              {isAdsProfile && !isSuggestedProfile ? (
                <BusinessIcon
                  sx={{ fontSize: 32, color: "text.secondary" }}
                />
              ) : (
                <AccountCircleIcon
                  sx={{ fontSize: 32, color: "text.secondary" }}
                />
              )}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minWidth: 0,
            }}
          >
            <MuiTypography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "text.primary",
                lineHeight: 1,
              }}
            >
              {name}
            </MuiTypography>
            <MuiTypography
              variant="subtitle2"
              sx={{
                color: "primary.main",
                fontWeight: 500,
                minHeight: 0,
              }}
            >
              {t(`categories.${profession}`, formatCategory(profession))}
            </MuiTypography>
          </Box>
        </Box>
        {(companyDetails.name || companyDetails.city) && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 0.5 }}>
            <BusinessIcon
              sx={{
                fontSize: 20,
                color: "text.secondary",
                ml: 1,
                mr: 2,
                bgcolor: "transparent",
              }}
            />
            <Box>
              {companyDetails.name && (
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  {companyDetails.name}
                </MuiTypography>
              )}
              {companyDetails.city && (
                <MuiTypography
                  variant="caption"
                  sx={{ 
                    color: "text.secondary",
                    fontSize: "0.7rem"
                  }}
                >
                  {companyDetails.city}
                </MuiTypography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}

ProffecionalCards.propTypes = {
  profile: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  cardWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
  ]),
};
