import { Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Error404 from "../../assets/images/errorPages/error404.png";
import { ROUTES } from "../../utils/constants/route";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";

const Page404 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAdmin = getLocalStorage(IS_ADMIN);

  function onBackToHome() {
    const dashboardRoute = isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard;
    navigate("/" + dashboardRoute);
  }

  return (
    <Box>
      <Box
        sx={{
          p: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          component="img"
          src={Error404}
          alt="error-404"
          sx={{
            width: "50%",
            height: "50%",
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
    </Box>
  );
};

export default Page404;
