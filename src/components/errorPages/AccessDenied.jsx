import { Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import AccessDeniedImg from "../../assets/images/errorPages/access_denied.jpeg";
import { ROUTES } from "../../utils/constants/route";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";

const AccessDenied = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAdmin = getLocalStorage(IS_ADMIN);

  function onBackToHome() {
    const dashboardRoute = isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard;
    navigate("/" + dashboardRoute);
  }

  return (
    <Box
      sx={{
        p: 5,
        height: "calc(100vh - 71px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="img"
        src={AccessDeniedImg}
        alt="access-denied"
        sx={{
          height: "19em",
        }}
      />
      <Button
        variant="contained"
        sx={{ mt: 2, borderRadius: 10, width: 150 }}
        onClick={onBackToHome}
      >
        {t("errors.go_home")}
      </Button>
    </Box>
  );
};

export default AccessDenied;
