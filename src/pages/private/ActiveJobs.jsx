import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import ActiveJobCardList from "../../components/activeJobs/ActiveJobCardList";
import MuiTypography from "../../components/common/MuiTypography";

function ActiveJobs() {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: "100%" }}>
      <MuiTypography variant="h2" sx={{ mb: 2 }}>
        {t("job.active_jobs_title")}
      </MuiTypography>
      <Divider sx={{ mb: 2.5 }} />

      <ActiveJobCardList />
    </Box>
  );
}

export default ActiveJobs;
