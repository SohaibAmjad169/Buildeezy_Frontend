import { Box } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants/route";

function RegisterLink({ sx }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function navigateToRegister() {
    navigate("/" + ROUTES.register);
  }

  return (
    <Box sx={{ display: "flex", mb: { xs: 4, md: 0 }, ...sx }}>
      <MuiTypography variant="subtitle1" component="h3">{t("login.new_user")}</MuiTypography>
      &nbsp;
      <MuiTypography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "primary.main",
          cursor: "pointer",
        }}
        onClick={navigateToRegister}
        component="h4"
      >
        {t("login.create_account")}
      </MuiTypography>
    </Box>
  );
}

export default RegisterLink;
