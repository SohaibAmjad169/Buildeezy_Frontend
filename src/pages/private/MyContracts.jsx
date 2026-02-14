import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import ContractCardList from "../../components/myContracts/ContractCardList";
import MuiTypography from "../../components/common/MuiTypography";

function MyContracts() {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: "100%" }}>
      <MuiTypography variant="h2" sx={{ mb: 2 }}>
        {t("job.my_contracts")}
      </MuiTypography>
      <Divider sx={{ mb: 2.5 }} />
      <ContractCardList />
    </Box>
  );
}

export default MyContracts;

