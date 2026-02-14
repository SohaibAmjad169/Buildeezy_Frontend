import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import MuiTypography from "../common/MuiTypography";
import ChatAvatar from "../common/ChatAvatar";
import { CloseCircle } from "iconsax-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Star from "@mui/icons-material/Star";
import Chip from "@mui/material/Chip";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ActionButton from "../common/ActionButton";
import React from "react";
import { CircularProgress } from "@mui/material";
import { useState } from "react";
import buildeezyPlaceholder from "../../assets/images/buildeezy-placeholder.png";
import { useSelector } from "react-redux";

function ProfessionalProfileView({ user, onClose }) {
  const { loading } = useSelector((state) => state.config);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Banner
  const banner =
    user?.profileDesign?.layout?.banner ||
    user?.banner ||
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop";

  const [imgSrc, setImgSrc] = useState(banner);

  if (!user) return null;
  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}>{t("professional_profile.loading")}</Box>;
  // if (!profile)
  //   return <Box sx={{ p: 4, textAlign: "center" }}>{t("professional_profile.profile_not_found")}</Box>;

  // Breadcrumbs
  const breadcrumbs = [
    { label: t("professional_profile.professionals"), onClick: () => navigate("/professionals") },
    { label: t("professional_profile.details") },
  ];

  // Avatar
  const avatar = user?.avatar || "";

  // Name
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  // Category (format to human readable)
  function toTitleCase(str) {
    return str
      .replace(/_/g, " ")
      .replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
  }
  const rawCategory = user?.category || user?.userType || t("professional_profile.professional");
  const category = toTitleCase(rawCategory);
  // Rating and reviews
  const reviews = user?.reviews || [];
  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce(
          (acc, r) => acc + (r.ratings?.overallExperience || r.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
      : null;
  const totalReviews = reviews.length;
  // Description
  const description =
    user?.profileDesign?.content?.slogan || user?.description || "";
  // Skills
  const skills = user?.profileDesign?.content?.skills || [];
  // Contact info
  const email = user?.email || "";
  const phoneNumber = user?.phoneNumber || "";
  // Opening hours
  const openingHours = user?.vendorAdditionalInfo?.openingHours || [];
  function formatOpeningHours(hoursArr) {
    return hoursArr.map((entry, idx) => {
      const days = Array.isArray(entry.daysOfWeek)
        ? entry.daysOfWeek.join(" ")
        : "";
      return (
        <Box key={days + entry.startTime + entry.endTime + idx} sx={{ mb: 1 }}>
          <MuiTypography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "text.secondary",
              fontSize: "0.85rem",
              mb: 0.2,
            }}
          >
            {days}
          </MuiTypography>
          <MuiTypography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.85rem" }}
          >
            {entry.startTime} - {entry.endTime}
          </MuiTypography>
        </Box>
      );
    });
  }

  return (
    <Box
      sx={{
        width: 400,
        maxWidth: 400,
        minWidth: 400,
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        p: 0,
        // background: "#fff",
        // backgroundColor: (theme) => theme.palette.background.paper,
        overflow: "auto",
      }}
    >
      {/* Header + Close */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          pr: 1,
        }}
      >
        <MuiTypography variant="h6">{t("professional_profile.professionals_details")}</MuiTypography>
        <Box
          sx={{
            pr: 1,
            "@media (max-width:375px)": {
              pr: 7,
            },
            "@media (max-width:321px)": {
              pr: 20,
            },
          }}
        >
          <CloseCircle
            size={24}
            style={{ cursor: "pointer" }}
            onClick={onClose}
          />
        </Box>
      </Box>
      {/* Breadcrumbs */}
      <Box sx={{ px: 3, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={b.label}>
            <MuiTypography
              variant="body2"
              sx={{
                color: b.onClick ? "primary.main" : "text.primary",
                textDecoration: b.onClick ? "underline" : "none",
                cursor: b.onClick ? "pointer" : "default",
                fontWeight: b.onClick ? 500 : 400,
              }}
              onClick={b.onClick}
            >
              {b.label}
            </MuiTypography>
            {i < breadcrumbs.length - 1 && (
              <MuiTypography variant="body2" sx={{ mx: 0.5 }}>
                &gt;
              </MuiTypography>
            )}
          </React.Fragment>
        ))}
      </Box>
      {/* Banner */}
      <Box sx={{ px: 3, pt: 1, position: "relative" }}>
        <Box
          component="img"
          src={imgSrc}
          onError={() => setImgSrc(buildeezyPlaceholder)}
          alt="banner"
          sx={{
            width: { xs: "85vw", sm: "100%" },
            height: 220,
            objectFit: "cover",
            borderRadius: 2,
            mb: 2,
            display: "block",
            marginRight: { xs: "auto", sm: 0 },
            marginLeft: 0,
            // Ensure the image doesn't overlap the close button
            maxWidth: { xs: "calc(100vw - 64px)", sm: "100%" },
          }}
        />
        {/* Optionally, adjust header padding for mobile */}
      </Box>
      {/* Avatar, Name, Category, Rating */}
      <Box sx={{ px: 3, display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <ChatAvatar
          src={avatar}
          alt={name}
          sx={{ width: 64, height: 64, fontSize: 32 }}
        >
          {user.firstName?.[0]}
        </ChatAvatar>
        <Box sx={{ flex: 1 }}>
          <MuiTypography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "text.primary",
              lineHeight: 1,
              mb: 0.5,
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
              mb: 0.5,
            }}
          >
            {category}
          </MuiTypography>
          {averageRating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{ color: "#FFC107", display: "flex", alignItems: "center" }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    sx={{
                      fontSize: 18,
                      color:
                        i < Math.round(averageRating) ? "#FFC107" : "#E0E0E0",
                    }}
                  />
                ))}
              </Box>
              <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
                {averageRating}
              </MuiTypography>
              <MuiTypography variant="body2" color="text.secondary">
                {t("professional_profile.reviews", { count: totalReviews })}
              </MuiTypography>
            </Box>
          )}
        </Box>
      </Box>
      {/* Description */}
      <Box sx={{ px: 3, mt: 1 }}>
        <MuiTypography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {t("professional_profile.description")}
        </MuiTypography>
        <MuiTypography
          variant="h5"
          sx={{ mb: 2, mt: 0.5, fontWeight: 500, color: "text.secondary" }}
        >
          {description}
        </MuiTypography>
        {/* Skills */}
        {/* <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills.map((skill) => (
            <Chip key={skill} label={skill} size="small" />
          ))}
        </Box> */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              size="small"
            />
          ))}
        </Box>

      </Box>
      {/* Contact Info */}
      {/* {(email || phoneNumber) && (
        <Box sx={{ px: 3, mt: 2 }}>
          <MuiTypography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t("professional_profile.contact")}
          </MuiTypography>
          {email && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <EmailIcon sx={{ color: "text.secondary" }} />
              <MuiTypography variant="body2">{email}</MuiTypography>
            </Box>
          )}
          {phoneNumber && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ color: "text.secondary" }} />
              <MuiTypography variant="body2">{phoneNumber}</MuiTypography>
            </Box>
          )}
        </Box>
      )} */}
      {/* Opening Hours */}
      {Array.isArray(openingHours) && openingHours.length > 0 && (
        <Box sx={{ px: 3, mt: 2 }}>
          <MuiTypography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t("professional_profile.opening_hours")}
          </MuiTypography>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <AccessTimeIcon sx={{ color: "text.secondary", mt: 0.5 }} />
            <Box>{formatOpeningHours(openingHours)}</Box>
          </Box>
        </Box>
      )}
      {/* See Full Profile Button */}
      <Box sx={{ px: 3, pb: 3, pt: 2 }}>
        <Box display="flex" justifyContent="flex-start">
          <ActionButton
            variant="contained"
            onClick={() => {
              if (user?.id) navigate(`/dashboard/view/${user?.id}/profile`);
            }}
          >
            {t("professional_profile.see_full_profile")}
          </ActionButton>
        </Box>
      </Box>
    </Box>
  );
}

export default function ProfessionalProfilePopup({
  open,
  user,
  onClose,
  isLoading,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      // anchorOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: (theme) => ({
          width: { xs: "100vw", sm: 450 },
          maxWidth: { xs: "100vw", sm: "450px" },
          minWidth: { xs: 0, sm: "450px" },
          height: "100vh",
          position: "fixed",
          right: 0,
          top: 0,
          m: 0,
          borderRadius: { xs: 0, sm: 0 },
          overflow: "hidden",
          boxShadow: 24,
          // background: "#fff",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : theme.palette.common.white,
          p: { xs: 0, sm: 0 },
        }),
      }}
      hideBackdrop
    >
      {isLoading ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 4,
          }}
        >
          Loading... &nbsp;
          <CircularProgress />
        </Box>
      ) : (
        <ProfessionalProfileView user={user} onClose={onClose} />
      )}
    </Dialog>
  );
}
