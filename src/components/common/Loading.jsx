import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "./MuiTypography";

function Loading() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: "100%",
        textAlign: "center",
        my: 3,
      }}
    >
      <MuiTypography
        variant={"descriptionText"}
        sx={{
          fontWeight: 500,
        }}
      >
        {t("loading")}
      </MuiTypography>
    </Box>
  );
}

export default Loading;
