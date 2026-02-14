import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  // Moon,
  // Sun1,
  NotificationBing,
  Profile,
  LogoutCurve,
  Setting2,
  Sun1,
  Moon,
} from "iconsax-react";
import { Divider, Menu, MenuItem, useMediaQuery } from "@mui/material";

import MuiTypography from "./../../components/common/MuiTypography";
import logo from "../../assets/images/buildeezy_logo.svg";
import logoDark from "../../assets/images/buildeezy_logo_dark.svg";
import menu from "../../assets/images/icons/menu.svg";
import menuDark from "../../assets/images/icons/menu_dark.svg";

import IconBtn from "./IconBtn";
import { useThemeMode } from "../../context/ThemeContext";
import { ROUTES } from "../../utils/constants/route";
import Item from "./Item";
import useLogout from "../../hooks/useLogout";
import MuiDialog from "../common/MuiDialog";
import useDeactivateAccount from "../../hooks/useDeactivateAccount";
import { colors } from "../../styles/theme";
import { DRAWER_WIDTH, getToken } from "../../utils/common";
import Notifications from "../Notifications";
import { setIsLoading, setNotifications } from "../../redux/notificationsSlice";
import {
  getAllNotifications,
  getProfileCompletionUrl,
  getPortfolioUrl,
  getUserCategoriesByTypeUrl,
  getUserSettings,
  getUserUrl,
  updateUserSettings,
} from "../../apis/apiEndPoints";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { getLocalStorage } from "../../utils/localStorageUtils";
import {
  ACCESS_TOKEN_KEY,
  IS_ADMIN,
  USER_DATA,
} from "../../utils/constants/auth";
import { mappedUserType, getMappedUserType } from "../../utils/constants/login";
import ChangeProfilePassword from "../profile/ChangeProfilePassword";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import {
  Tab,
  Tabs,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import ActionsMenu from "../Table/ActionsMenu";
import SwitchOption from "../common/SwitchOption";
import i18n from "../../i18n";
import {
  setUserSettings,
  setUserSettingsIsLoading,
} from "../../redux/userSettingsSlice";
import { setProfileData } from "../../redux/profileSlice";
import { Tooltip, CircularProgress } from "@mui/material";
import { Share as ShareIcon } from "@mui/icons-material";
import { TourMenuButton } from "../tour/TourControlPanel";
// Removed unused imports - calculateProfileCompletion and PROFILE_DATA
import ShareProfile from "../profile/ShareProfile";

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  justifyContent: "center",
  [theme.breakpoints.up("md")]: {
    marginLeft: 65,
    width: `calc(100% - 65px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: DRAWER_WIDTH,
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  },
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.common.white,
  boxShadow: "none",
  height: 70,
}));

function TeamDialog({ open, onClose }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  // Mock data
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      auth: "Email",
      lastLogin: "2024-07-01",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Member",
      auth: "Google",
      lastLogin: "2024-07-02",
    },
    {
      id: 3,
      name: "Bob Lee",
      email: "bob@example.com",
      role: "Member",
      auth: "Email",
      lastLogin: "2024-06-30",
    },
  ];
  const tabs = [
    t("team.all"),
    t("team.active"),
    t("team.pending"),
    t("team.inactive"),
  ];
  const handleTabChange = (e, v) => setTab(v);

  const handleMenuClick = (action, id) => {
    // Placeholder for row actions
    alert(`Action: ${action} on user ${id}`);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ fontWeight: 600, color: "primary.main", fontSize: 32, p: 3 }}>
        {t("appbar.team")}
      </Box>
      <DialogContent
        sx={{
          p: 3,
          "::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ mb: 2, display: "flex", width: "100%" }}
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          {tabs.map((label, idx) => (
            <Tab
              key={label}
              label={label}
              value={idx}
              sx={{
                border: idx === tab ? "2px solid #7BAA1D" : "2px solid #ccc",
                borderRadius: 2,
                color: idx === tab ? "primary.main" : "#888",
                fontWeight: idx === tab ? 600 : 400,
                background: idx === tab ? "#fff" : "#f8f8f8",
                flex: 1,
                minWidth: 0,
                mr: idx !== tabs.length - 1 ? 2 : 0,
                maxWidth: "none",
              }}
            />
          ))}
        </Tabs>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" sx={{ borderRadius: "8px" }}>
            {t("team.add_member")}
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <MuiTable>
            <TableHead>
              <TableRow sx={{ background: "#6BA087" }}>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    borderRight: "2px solid #fff",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    borderRight: "2px solid #fff",
                  }}
                >
                  Emails
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    borderRight: "2px solid #fff",
                  }}
                >
                  Roles
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    borderRight: "2px solid #fff",
                  }}
                >
                  Authentication
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    borderRight: "2px solid #fff",
                  }}
                >
                  Last Login
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    background: "#e0f0ea",
                    "&:nth-of-type(even)": { background: "#f7f7f7" },
                    borderBottom: "2px solid #fff",
                  }}
                >
                  <TableCell sx={{ borderRight: "2px solid #fff" }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid #fff" }}>
                    {row.email}
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid #fff" }}>
                    {row.role}
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid #fff" }}>
                    {row.auth}
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid #fff" }}>
                    {row.lastLogin}
                  </TableCell>
                  <TableCell>
                    <ActionsMenu
                      id={row.id}
                      menuItems={[
                        {
                          id: "edit",
                          label: "...",
                          icon: () => <span style={{ fontSize: 24 }}>...</span>,
                        },
                      ]}
                      onMenuItemClick={handleMenuClick}
                      isHorizontal={false}
                      row={row}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: "8px",
            backgroundColor: colors.primary,
            "&:hover": {
              backgroundColor: colors.primary800,
            },
          }}
        >
          {t("appbar.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SettingsDialog({ open, onClose, onChangePassword, onDeactivate }) {
  const { t } = useTranslation();
  const [location, setLocation] = useState("current");
  const [language, setLanguage] = useState(i18n.language);
  const [notification, setNotification] = useState(["all"]);
  const [openTeam, setOpenTeam] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch();

  const { userSettings } = useSelector((state) => state.userSettings);

  // useEffect(() => {
  //   if (userSettings) {
  //     // Sync location
  //     setLocation(userSettings.isGlobalLocation ? "global" : "current");

  //     // Sync language
  //     setLanguage(userSettings.language === "French" ? "fr" : "en");

  //     // Sync notifications
  //     setNotification(userSettings.notificationPreferences || []);
  //   }
  // }, [userSettings]);

  useEffect(() => {
    if (userSettings) {
      // Sync location
      setLocation(userSettings.isGlobalLocation ? "global" : "current");

      // Get language from API
      const apiLang = userSettings.language === "French" ? "fr" : "en";

      // Sync i18n and localStorage
      if (apiLang !== i18n.language) {
        i18n.changeLanguage(apiLang);
        localStorage.setItem("i18nextLng", apiLang);
      }

      setLanguage(apiLang);

      // Sync notifications
      setNotification(userSettings.notificationPreferences || []);
    } else {
      // Fallback to localStorage
      const storedLang = localStorage.getItem("i18nextLng");
      const fallbackLang =
        storedLang === "fr" || storedLang === "en" ? storedLang : "en";

      i18n.changeLanguage(fallbackLang);
      setLanguage(fallbackLang);
    }
  }, [userSettings]);

  const locationOptions = [
    {
      value: "current",
      label: t("appbar.location_current"),
    },
    {
      value: "global",
      label: t("appbar.location_global"),
    },
  ];

  const languageOptions = [
    { value: "en", label: t("appbar.language_en") },
    { value: "fr", label: t("appbar.language_fr") },
  ];

  const notificationOptions = [
    {
      value: "all",
      label: t("appbar.notification_all"),
    },
    {
      value: "whatsapp",
      label: t("appbar.notification_whatsapp"),
    },
    {
      value: "email",
      label: t("appbar.notification_email"),
    },
    { value: "sms", label: t("appbar.notification_sms") },
  ];

  // const handleLanguageChange = (newLang) => {
  //   setLanguage(newLang);
  //   i18n.changeLanguage(newLang);
  //   localStorage.setItem("i18nextLng", newLang);
  // };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);

    handleSettingsUpdate({
      language: newLang === "fr" ? "French" : "English",
    });
  };

  const handleSettingsUpdate = async (custom = {}) => {
    const payload = {
      isGlobalLocation: location === "global" ? true : false,
      language: language === "fr" ? "French" : "English",
      notificationPreferences: notification,
      ...custom,
    };

    try {
      await updateUserSettings(payload);

      fetchUserSettings();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message || "Failed to update settings",
        })
      );
    }
  };

  const fetchUserSettings = async () => {
    try {
      dispatch(setUserSettingsIsLoading(true));
      const { data: res } = await getUserSettings();
      dispatch(setUserSettings(res));
    } catch (err) {
      // dispatch(
      //   setAlert({
      //     show: true,
      //     type: ALERT_TYPE.error,
      //     message: err.message,
      //   })
      // );
      console.error("Failed to fetch");
    } finally {
      dispatch(setUserSettingsIsLoading(false));
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, [dispatch]);

  // Helper for notification multi-select logic
  const notificationOptionValues = ["all", "whatsapp", "email", "sms"];

  const handleNotificationChange = (newValue) => {
    let updatedNotification = [];

    if (!Array.isArray(newValue)) {
      updatedNotification = [newValue];
      setNotification(updatedNotification);
    } else if (
      notification.length === 4 &&
      notification.includes("all") &&
      !newValue.includes("all")
    ) {
      updatedNotification = [];
      setNotification([]);
    } else if (newValue.includes("all") && !notification.includes("all")) {
      updatedNotification = [...notificationOptionValues];
      setNotification(updatedNotification);
    } else if (!newValue.includes("all") && notification.includes("all")) {
      updatedNotification = newValue.filter((v) => v !== "all");
      setNotification(updatedNotification);
    } else {
      const lastThree = ["whatsapp", "email", "sms"];
      const hasAllThree = lastThree.every((v) => newValue.includes(v));
      updatedNotification = hasAllThree
        ? [...notificationOptionValues]
        : newValue.filter((v) => v !== "all");

      setNotification(updatedNotification);
    }

    handleSettingsUpdate({ notificationPreferences: updatedNotification });
  };

  const handleLocationChange = (value) => {
    setLocation(value);
    handleSettingsUpdate({ isGlobalLocation: value === "global" });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <Box sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
          {t("appbar.settings")}
        </Box>
        <Divider sx={{ mt: 1 }} />
        <DialogContent
          sx={{
            p: 0,
            maxHeight: "none",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          <Stack
            spacing={3}
            sx={{
              p: 3,
              overflowY: "auto",
            }}
          >
            <Stack spacing={1}>
              <Link
                component="button"
                onClick={onChangePassword}
                underline="hover"
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "primary.main",
                  p: 0,
                  textAlign: "left",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  maxWidth: "160px",
                  display: "inline-block",
                }}
              >
                {t("appbar.change_password")}
              </Link>
            </Stack>
            <Stack spacing={1}>
              <Box
                sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
              >
                {t("appbar.location")}
              </Box>
              {/* <SwitchOption
                value={location}
                options={locationOptions}
                onChange={setLocation}
              /> */}
              <SwitchOption
                value={location}
                options={locationOptions}
                onChange={handleLocationChange}
              />
            </Stack>
            <Stack spacing={1}>
              <Box
                sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
              >
                {t("appbar.language")}
              </Box>
              {/* <SwitchOption
                value={language}
                options={languageOptions}
                onChange={setLanguage}
              /> */}
              <SwitchOption
                value={language}
                options={languageOptions}
                onChange={handleLanguageChange}
              />
            </Stack>
            <Stack spacing={1}>
              <Box
                sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
              >
                {t("appbar.notification")}
              </Box>
              {/* <SwitchOption
                value={notification}
                options={notificationOptions}
                onChange={handleNotificationChange}
              /> */}
              <SwitchOption
                value={notification}
                options={notificationOptions}
                onChange={handleNotificationChange}
              />
            </Stack>
            <Stack spacing={1}>
              <Box
                sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
              >
                {t("appbar.team")}
              </Box>
              <Link
                component="button"
                onClick={() => setOpenTeam(true)}
                underline="hover"
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "primary.main",
                  p: 0,
                  textAlign: "left",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  maxWidth: "160px",
                  display: "inline-block",
                }}
              >
                {t("appbar.team_manage")}
              </Link>
            </Stack>
            <Stack spacing={1}>
              <Link
                href="https://www.buildeezy.com/terms"
                target="_blank"
                rel="noopener"
                underline="hover"
                sx={{ fontSize: "0.85rem" }}
              >
                {t("appbar.terms")}
              </Link>
              <Link
                href="https://www.buildeezy.com/privacy"
                target="_blank"
                rel="noopener"
                underline="hover"
                sx={{ fontSize: "0.85rem" }}
              >
                {t("appbar.privacy")}
              </Link>
            </Stack>
            <Button
              variant="outlined"
              color="error"
              onClick={onDeactivate}
              sx={{
                fontWeight: 600,
                maxWidth: "160px",
                borderRadius: "8px",
                fontSize: "0.8rem",
              }}
            >
              {t("appbar.close_account")}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              borderRadius: "8px",
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary800,
              },
            }}
          >
            {t("appbar.close")}
          </Button>
        </DialogActions>
      </Dialog>
      <TeamDialog open={openTeam} onClose={() => setOpenTeam(false)} />
    </>
  );
}

function AppBar({ open, onDrawerToggle }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isAdmin = getLocalStorage(IS_ADMIN);
  const mode = theme.palette.mode;
  const { toggleMode } = useThemeMode();
  const { handleLogout } = useLogout();
  const { deactivateAccount } = useDeactivateAccount();

  const { profileData } = useSelector((state) => state.profile);
  const { notificationsList } = useSelector((state) => state.notifications);
  const getNotificationsCount = (() => {
    const unreadNotifications = notificationsList?.filter(
      (notification) => notification.readAt === null
    );
    const count = unreadNotifications?.length;
    return count > 0 ? count : null;
  })();

  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [notificationsEl, setNotificationsEl] = useState(null);
  const openNotifications = Boolean(notificationsEl);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const { user } = JSON.parse(getLocalStorage(USER_DATA));

  // Category label state
  const [categoryLabel, setCategoryLabel] = useState("");
  // Profile completion state
  const [profileCompletion, setProfileCompletion] = useState(0);
  // Share profile state
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    async function fetchCategoryLabel() {
      if (!profileData?.category || !profileData?.userType) {
        setCategoryLabel("");
        return;
      }
      try {
        const res = await getUserCategoriesByTypeUrl(profileData?.userType);
        const categories = res.data.data;
        const found = categories.find(
          (cat) =>
            cat.id === profileData.category ||
            cat.label === profileData.category
        );
        if (found) {
          setCategoryLabel(found.label);
        } else {
          // Fallback: format string
          setCategoryLabel(
            profileData.category
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          );
        }
      } catch {
        setCategoryLabel(
          profileData.category
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        );
      }
    }
    fetchCategoryLabel();
  }, [profileData?.category, profileData?.userType]);

  const fetchProfileData = async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await getUserUrl(user?.id);
      dispatch(setProfileData(res?.data?.data));
      
      // Calculate profile completion
      await calculateAndSetProfileCompletion(res?.data?.data);
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error?.message || "Failed to fetch profile data",
        })
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Calculate profile completion percentage using lightweight API
  const calculateAndSetProfileCompletion = async (userData) => {
    try {
      if (!userData?.id || !userData?.userType) {
        setProfileCompletion(0);
        return;
      }

      // Use lightweight profile completion endpoint instead of heavy profile data
      const completionResponse = await getProfileCompletionUrl();
      
      const percentage = completionResponse?.data?.data?.profileCompletionPercentage || 0;
      setProfileCompletion(percentage);
    } catch (error) {
      console.error('Error calculating profile completion:', error);
      setProfileCompletion(0);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  function navigateToDashboard() {
    const dashboardRoute = isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard;
    navigate("/" + dashboardRoute);
  }
  //deactivate
  function onDeactivateDialogClose() {
    setOpenDeactivateDialog(false);
  }
  const onDeactivateClient = () => {
    deactivateAccount();
  };

  //Notifications
  const fetchAllNotifications = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const { data: res } = await getAllNotifications();
      const resData = res.data;
      dispatch(setNotifications(resData));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAdmin) {
      fetchAllNotifications();
    }
  }, [isAdmin, fetchAllNotifications]);

  function handleNotifications(event) {
    handleClose();
    setNotificationsEl(event.currentTarget);
  }
  const handleCloseNotifications = () => {
    setNotificationsEl(null);
  };

  //profile
  function handleProfile() {
    handleClose();
    navigate("/" + ROUTES.profile);
    if (isAdmin) {
      navigate("/" + ROUTES.adminProfile);
    }
  }

  //menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //logout
  function handleOpenLogoutDialog() {
    handleClose();
    setOpenLogoutDialog(true);
  }
  function onLogoutDialogClose() {
    setOpenLogoutDialog(false);
  }
  const onLogout = () => {
    handleLogout();
  };

  const renderUserName = (
    <Box sx={{ mr: { xs: 0.5, sm: 1 } }}>
      <MuiTypography
        variant="subtitle1"
        sx={{
          fontSize: "0.85rem",
          fontWeight: 500,
          marginBottom: isMobile ? "-5px" : "-10px",
          whiteSpace: "nowrap",
        }}
      >
        {profileData?.firstName} {profileData?.lastName}
      </MuiTypography>
      <MuiTypography variant="subtitle3">
        {categoryLabel || getMappedUserType(profileData.userType)}
      </MuiTypography>
    </Box>
  );

  return (
    <StyledAppBar position="fixed" open={open}>
      <Toolbar sx={{ mt: "3.25px", mb: "3.25px", minHeight: "57px" }}>
        <IconButton
          aria-label="open drawer"
          onClick={onDrawerToggle}
          edge="start"
          size="small"
          sx={{
            backgroundColor: mode === "dark" ? colors.black300 : colors.white,
            marginRight: { xs: 0, md: 3 },
            p: 1.2,
            marginLeft: { md: "-43px" },
            boxShadow:
              "0px 4px 3.15px 0px #29489803,0px 8.15px 6.52px 0px #29489805,0px 20px 13px 0px #29489806,0px 38.52px 25.48px 0px #29489808,0px 64.81px 46.85px 0px #2948980A,0px 100px 80px 0px #2948980D,2px 2px 30px 0px #FFFFFF24 inset",
          }}
        >
          <Box
            component="img"
            src={mode === "dark" ? menuDark : menu}
            alt="menu"
            sx={{
              width: 16,
              height: 16,
            }}
          />
        </IconButton>

        {user?.userType !== "admin" && <TourMenuButton />}

        {isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: { xs: 116, sm: 200 },
            }}
          >
            <Box
              component="img"
              src={mode === "dark" ? logoDark : logo}
              alt="logo"
              onClick={navigateToDashboard}
              sx={{
                width: "110px",
                ml: 1.5,
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1, sm: 2 },
              transition: "gap 0.25s ease",
            }}
          >
            {!isMobile &&
              (mode === "dark" ? (
                <IconBtn icon={Sun1} onClick={toggleMode} />
              ) : (
                <IconBtn icon={Moon} onClick={toggleMode} />
              ))}

            <Box>
              {!isAdmin && (
                <IconBtn
                  badgeCount={getNotificationsCount}
                  icon={NotificationBing}
                  onClick={handleNotifications}
                  id="notifications-button"
                  aria-controls={open ? "notifications-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                />
              )}

              <Menu
                id="notifications-menu"
                anchorEl={notificationsEl}
                open={openNotifications}
                onClose={handleCloseNotifications}
                MenuListProps={{
                  "aria-labelledby": "notifications-button",
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    borderRadius: 3,
                    p: (theme) => theme.spacing(1, 3),
                    "& .MuiMenuItem-root": {
                      minHeight: "auto",
                    },
                  },
                }}
              >
                <Notifications
                  isShort
                  handleCloseNotifications={handleCloseNotifications}
                />
              </Menu>
            </Box>

            <Box
              onClick={handleClick}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Box sx={{ position: "relative" }}>
                {/* Profile Completion Circular Progress */}
                <Tooltip title={`Profile ${profileCompletion}% complete`} arrow>
                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <CircularProgress
                      variant="determinate"
                      value={profileCompletion}
                      size={44}
                      thickness={3}
                      sx={{
                        position: "absolute",
                        top: -4,
                        left: -4,
                        color: profileCompletion >= 50 ? 'success.main' : 'warning.main',
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={44}
                      thickness={3}
                      sx={{
                        position: "absolute",
                        top: -4,
                        left: -4,
                        color: mode === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }}
                    />
                    <Box
                      component="img"
                      data-tour="profile-avatar"
                      src={profileData?.avatar}
                      alt="p"
                      sx={{
                        width: 36,
                        height: 36,
                        objectFit: "cover",
                        scale: profileData?.avatar?.includes("/dafault.png")
                          ? "1.2"
                          : "1",
                        borderRadius: "50%",
                        mr: 1,
                      }}
                    />
                  </Box>
                </Tooltip>
                {profileData?.isVerified && (
                  <Tooltip title="Verified User" arrow>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -2,
                        right: 3,
                        background: "#709a1c",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${
                          mode === "dark" ? colors.black300 : colors.white
                        }`,
                        boxShadow: "0 2px 6px rgba(29, 161, 242, 0.3)",
                      }}
                    >
                      <Box
                        component="svg"
                        viewBox="0 0 24 24"
                        sx={{
                          width: 10,
                          height: 10,
                          color: "white",
                        }}
                      >
                        <path
                          fill="currentColor"
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        />
                      </Box>
                    </Box>
                  </Tooltip>
                )}
              </Box>
              {/* Share Profile Button - Show when profile completion > 50% */}
              {profileCompletion > 50 && (
                <Tooltip title="Share Profile" arrow>
                  <IconButton
                    onClick={() => setShowShareDialog(true)}
                    sx={{
                      ml: 1,
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        opacity: 0.1
                      }
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {!isMobile && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {renderUserName}
                  <KeyboardArrowDownIcon fontSize="small" />
                </Box>
              )}
            </Box>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                "& .MuiPaper-root": {
                  px: 1,
                  "& .MuiMenuItem-root": {
                    minHeight: "auto",
                  },
                },
              }}
            >
              {isMobile && (
                <Box>
                  <MenuItem>{renderUserName}</MenuItem>
                  <Divider sx={{ margin: "4px 0 !important" }} />
                </Box>
              )}

              <MenuItem onClick={handleProfile}>
                <Item
                  label={t("appbar.profile")}
                  icon={Profile}
                  data-tour="profile-menu-item"
                />
              </MenuItem>

              {/* <MenuItem 
                onClick={() => {
                  handleClose();
                  navigate(`/${ROUTES.postAnAd}`, { 
                    state: { type: "profile" } 
                  });
                }}
              >
                <Item 
                  label={t("appbar.publish_my_profile", "Publish My Profile")} 
                  icon={Profile} 
                />
              </MenuItem> */}

              <MenuItem
                onClick={() => {
                  handleClose();
                  setOpenSettings(true);
                }}
              >
                <Item label={t("appbar.settings")} icon={Setting2} />
              </MenuItem>

              <MenuItem onClick={handleOpenLogoutDialog}>
                <Item label={t("appbar.logout")} icon={LogoutCurve} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
      <Divider />

      <MuiDialog
        title={t("navbar.logout_title")}
        open={openLogoutDialog}
        handleClose={onLogoutDialogClose}
        handleSuccess={onLogout}
      />
      <MuiDialog
        title={t(
          "profile.close_account_title",
          "Are you sure you want to close your account?"
        )}
        open={openDeactivateDialog}
        handleClose={onDeactivateDialogClose}
        handleSuccess={onDeactivateClient}
      />
      <ChangeProfilePassword
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
        showButton={false}
      />
      <SettingsDialog
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onChangePassword={() => {
          setOpenSettings(false);
          setOpenChangePassword(true);
        }}
        onDeactivate={() => {
          setOpenSettings(false);
          setOpenDeactivateDialog(true);
        }}
      />
      
      {/* Share Profile Dialog */}
      <ShareProfile
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        profileData={profileData}
        completionPercentage={profileCompletion}
      />
    </StyledAppBar>
  );
}

export default AppBar;
