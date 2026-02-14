import { Box } from "@mui/material";
import MuiTypography from "./MuiTypography";
import { useTranslation } from "react-i18next";

function NoData({ sx }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 4,
        mb: 2,
        ...sx
      }}
    >
      <MuiTypography variant="h5" sx={{ color: "disabledColor" }}>
        {t("profile.no_data")}
      </MuiTypography>
    </Box>
  );
}

export default NoData;
