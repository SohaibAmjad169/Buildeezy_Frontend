import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "../../components/common/MuiTypography";
import MyAdList from "../../components/myAds/MyAdList";

function MyAds() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{ height: "100%", p: { xs: 2, sm: (theme) => theme.spacing(3, 4) } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <MuiTypography variant="h2">{t("ad.my_ads")}</MuiTypography>
        <Box sx={{ display: "flex", alignItems: "center" }}></Box>
      </Box>
      <MyAdList />
    </Box>
  );
}

export default MyAds;
