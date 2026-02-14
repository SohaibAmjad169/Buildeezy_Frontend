import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import MuiTypography from "./MuiTypography";

function ComingSoon() {
  const { t } = useTranslation();

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
      <RocketLaunchIcon sx={{ mb: 2, width: "3em", height: "3em" }} />
      <MuiTypography variant="h1">{t("comingSoon")}</MuiTypography>
    </Box>
  );
}

export default ComingSoon;
