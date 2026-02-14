import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import MuiTypography from "../common/MuiTypography";
import { ROUTES } from "../../utils/constants/route";
import useEmptyStore from "../../hooks/useEmptyStore";

function LoginLink({ sx }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { emptyStore } = useEmptyStore();

  const { loading } = useSelector((state) => state.config);

  function navigateToLogin() {
    emptyStore();
    navigate("/" + ROUTES.login);
  }

  return (
    <Box
      sx={{
        display: "flex",
        mb: { xs: 4, md: 0 },
        ...sx,
      }}
    >
      <MuiTypography variant="subtitle1">
        {t("login.existing_account")}
      </MuiTypography>
      &nbsp;
      <MuiTypography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "primary.main",
          cursor: "pointer",
        }}
        onClick={navigateToLogin}
        disabled={loading}
      >
        {t("login.login")}
      </MuiTypography>
    </Box>
  );
}

export default LoginLink;
