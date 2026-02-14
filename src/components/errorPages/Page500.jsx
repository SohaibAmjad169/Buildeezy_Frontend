import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button } from "@mui/material";

import error500 from "../../assets/images/errorPages/error500.png";
import MuiTypography from "../common/MuiTypography";
import { ROUTES } from "../../utils/constants/route";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";

function Page500() {
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
        <Box>
          <Box
            component="img"
            src={error500}
            alt="error-illustration"
            sx={{
              width: "70%",
              height: "70%",
            }}
          />
          <MuiTypography variant="h1" sx={{ mt: 2, mb: 2 }}>
            {t("errors.server_error")}
          </MuiTypography>
          <MuiTypography variant="body2">
            {t("errors.something_wrong")}
          </MuiTypography>
        </Box>

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
}

export default Page500;
