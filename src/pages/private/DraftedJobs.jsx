import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import DraftedCardList from "../../components/draftedJobs/DraftedCardList";
import MuiTypography from "../../components/common/MuiTypography";

function DraftedJobs() {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: "100%" }}>
      <MuiTypography variant="h2" sx={{ mb: 2 }}>
        {t("job.drafted_jobs_title")}
      </MuiTypography>
      <Divider sx={{ mb: 2.5 }} />
      <DraftedCardList />
    </Box>
  ); 
}

export default DraftedJobs;
