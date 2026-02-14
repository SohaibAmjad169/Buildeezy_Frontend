import "./styles.scss";
import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@emotion/react";
import { onMessage } from "firebase/messaging";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../../components/navbar";
import AppBar from "../../components/appBar";
import { useThemeMode } from "../../context/ThemeContext";
import useVeriffStatus from "../../hooks/useVeriffStatus";
import { setNotifications } from "../../redux/notificationsSlice";
import { messaging } from "../../notifications/firebaseConfig";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import FallbackSpinner from "../../components/common/FallbackSpinner";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";
import { colors } from "../../styles/theme";

const DrawerHeader = styled("div")(({ theme }) => ({
  height: 70,
  ...theme.mixins.toolbar,
}));

function PrivatePages() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { mode } = useThemeMode();
  const { fetchVeriffStatus } = useVeriffStatus();

  const isAdmin = getLocalStorage(IS_ADMIN);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { notificationsList } = useSelector((state) => state.notifications);

  const [open, setOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  if (messaging) {
    onMessage(messaging, (payload) => {
      dispatch(
        setNotifications([...notificationsList, { payload, readAt: null }])
      );
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("new_notification"),
        })
      );
    });
  }

  useEffect(() => {
    if (!isAdmin) {
      fetchVeriffStatus();
    }
  }, []);

  return (
    <Suspense fallback={<FallbackSpinner />}>
      <Box sx={{ display: "flex", minHeight: "100vh" }} className="navbar">
        <CssBaseline />
        <AppBar open={open} onDrawerToggle={handleDrawerToggle} />
        <Navbar open={open} handleClose={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: mode === "light" && "baseBgColor",
            maxWidth: "100%",
            width: `calc(100vw - ${open ? "288px" : "112px"})`,
          }}
        >
          <DrawerHeader />
          <Box
            sx={{
              py: 3,
              px: 3,
              backgroundColor:
                mode === "dark" ? colors.black[900] : colors.white,
              minHeight: "calc(100vh - 70px)",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Suspense>
  );
}

export default PrivatePages;
