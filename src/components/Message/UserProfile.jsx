import { Box, Stack, Divider, IconButton } from "@mui/material";
import { CloseCircle, Location } from "iconsax-react";
import MuiTypography from "../common/MuiTypography";
import ChatAvatar from "../common/ChatAvatar";
import { getAvatarName, getFirstCharUpperCase } from "../../utils/common";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { getUserUrl } from "../../apis/apiEndPoints";
import ActionButton from "../common/ActionButton";
import { useNavigate } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";
import { t } from "i18next";
import { useSelector } from "react-redux";

function UserProfile({ user, onClose, sx = {} }) {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const currentRole = useSelector(
    (state) => state.profile?.profileData?.userType
  );
  const isAdminOrSuperAdmin = ["admin", "super admin"].includes(
    currentRole?.toLowerCase().trim()
  );

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.chatUserId) return;

      try {
        const response = await getUserUrl(user.chatUserId);
        const fetchedUserData = response.data.data;
        setUserData(fetchedUserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error.message || "Failed to fetch user data",
          })
        );
      }
    };

    fetchUserData();
  }, [user?.chatUserId, dispatch]);

  if (!user) {
    return null;
  }

  // Get name parts from chatUserName for avatar (using chat data while full data loads)
  const getNameParts = () => {
    if (!user.chatUserName) return { firstName: "", lastName: "" };
    const parts = user.chatUserName.split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  // Get avatar name safely
  const getAvatarNameSafely = () => {
    if (userData) {
      return getAvatarName(userData.firstName || "", userData.lastName || "");
    }
    const { firstName, lastName } = getNameParts();
    return getAvatarName(firstName || "", lastName || "");
  };

  // Get full name safely
  const getFullName = () => {
    if (userData) {
      return [
        getFirstCharUpperCase(userData.firstName || ""),
        getFirstCharUpperCase(userData.lastName || ""),
      ]
        .filter(Boolean)
        .join(" ");
    }
    const { firstName, lastName } = getNameParts();
    return [
      getFirstCharUpperCase(firstName || ""),
      getFirstCharUpperCase(lastName || ""),
    ]
      .filter(Boolean)
      .join(" ");
  };

  // Get category based on user type
  const getUserCategory = () => {
    if (!userData?.userType) return "Client";
    const additionalInfo =
      userData[`${userData.userType.toLowerCase()}AdditionalInfo`];
    return additionalInfo?.category || userData.userType;
  };

  // Get timezone info
  const timezone = userData?.country?.timezones?.[0];

  // Format time based on user's timezone
  const getCurrentTimeInfo = () => {
    if (!timezone) {
      return new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
      });
    }

    const now = new Date();
    const gmtOffset = timezone.gmtOffset;
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const userTime = new Date(utcTime + gmtOffset * 3600000);

    const hours = userTime.getHours();
    const minutes = userTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes} ${ampm} UTC (${timezone.gmtOffsetName})`;
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: 200, md: 260, lg: 400 },
        maxWidth: { xs: "100%", sm: 200, md: 260, lg: 400 },
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        p: 0,
        ...sx,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
          flexShrink: 0,
        }}
      >
        <MuiTypography variant="h6">
          {isTablet ? t("message.PROFILE") : t("message.profile")}
        </MuiTypography>
        <IconButton onClick={onClose}>
          <CloseCircle size={24} />
        </IconButton>
      </Stack>
      <Divider sx={{ width: "100%", m: 0 }} />

      {/* Profile Content */}
      <Box sx={{ px: 2, py: 3, width: "100%", flex: 1, overflow: "auto" }}>
        <Stack spacing={3} sx={{ width: "100%", mx: "auto" }}>
          {/* Avatar and Name */}
          <Stack alignItems="center" spacing={2}>
            <ChatAvatar
              src={userData?.avatar || user.avatar}
              alt={getFullName()}
              sx={{
                width: isMobile ? 48 : 72,
                height: isMobile ? 48 : 72,
                cursor: "pointer",
              }}
              onClick={() => {
                const id = userData?.id || user?.chatUserId;
                if (id) navigate(`/dashboard/view/${id}/profile`);
              }}
            >
              {getAvatarNameSafely()}
            </ChatAvatar>
            <Stack alignItems="center">
              <MuiTypography variant="h4" sx={{ fontWeight: 600 }}>
                {getFullName()}
              </MuiTypography>
              <MuiTypography variant="subtitle1" color="text.secondary">
                {getUserCategory()}
              </MuiTypography>
            </Stack>
          </Stack>

          <Divider sx={{ width: "100%" }} />

          {/* Current Time */}
          <Stack spacing={1}>
            <MuiTypography variant="h4" sx={{ fontWeight: 600 }}>
              {t("message.current_time")}
            </MuiTypography>
            <MuiTypography variant="h4" color="text.secondary">
              {getCurrentTimeInfo()}
            </MuiTypography>
          </Stack>

          {/* Location */}
          <Stack spacing={1}>
            <MuiTypography variant="h4" sx={{ fontWeight: 600 }}>
              {t("message.city")}
            </MuiTypography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Location size={20} />
              <MuiTypography variant="h4" color="text.secondary">
                {userData
                  ? [userData.city?.name, userData.country?.name]
                    .filter(Boolean)
                    .join(", ") || "Location not specified"
                  : "Loading location..."}
              </MuiTypography>
            </Stack>
          </Stack>

          {/* About */}
          <Stack spacing={1}>
            <MuiTypography variant="h4" sx={{ fontWeight: 600 }}>
              {t("message.about")}
            </MuiTypography>
            <MuiTypography variant="h4" color="text.secondary">
              {userData?.description || "No description available"}
            </MuiTypography>
          </Stack>

          <Divider sx={{ width: "100%" }} />
          <Box>
            <ActionButton
              variant="contained"
              sx={{
                borderRadius: "8px",
                fontSize: "0.7rem",
              }}
              onClick={() => {
                const id = userData?.id || user?.chatUserId;
                if (id) navigate(`/dashboard/view/${id}/profile`);
              }}
            >
              {t("message.view_more")}
            </ActionButton>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default UserProfile;
