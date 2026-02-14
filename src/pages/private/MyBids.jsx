import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "../../components/common/MuiTypography";
import BidCardList from "../../components/myBids/BidCardList";

function MyBids() {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: "100%" }}>
      <MuiTypography variant="h2" sx={{ mb: 2 }}>
        {t("job.my_bids")}
      </MuiTypography>
      <Divider sx={{ mb: 2.5 }} />
      <BidCardList />
    </Box>
  );
}

export default MyBids;
