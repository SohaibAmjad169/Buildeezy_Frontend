import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

import MuiTypography from "../../components/common/MuiTypography";
import ViewJobDetails from "../../components/viewJobDetails";
import RoundButton from "../common/RoundButton";
import ViewJobDetailsSkeleton from "../skeleton/ViewJobDetailsSkeleton";
import MuiDialog from "../common/MuiDialog";

function PreviewJobDetails({ jobDetails, handleJobEdit, handleJobSubmit }) {
  const { t } = useTranslation();

  const { loading } = useSelector((state) => state.config);

  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  function onSubmitDialogClose() {
    setOpenSubmitDialog(false);
  }
  async function onSubmitDialog() {
    setOpenSubmitDialog(true);
  }

  return (
    <Box sx={{ height: "100%" }}>
      {loading ? (
        <ViewJobDetailsSkeleton />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", lg: "70%" },
            }}
          >
            <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
              {t("job.details.job_details")}
            </MuiTypography>

            <ViewJobDetails jobDetails={jobDetails} showClient={false} />

            <Box sx={{ textAlign: "right" }}>
              <RoundButton
                variant="outlined"
                onClick={handleJobEdit}
                sx={{
                  mr: 2,
                  mt: 2,
                }}
              >
                {t("edit")}
              </RoundButton>
              <RoundButton onClick={onSubmitDialog} sx={{ mt: 2 }}>
                {t("submit")}
              </RoundButton>
            </Box>
          </Box>
        </Box>
      )}
      <MuiDialog
        title={t("job.details.submit_job")}
        open={openSubmitDialog}
        handleClose={onSubmitDialogClose}
        handleSuccess={handleJobSubmit}
        yesLabel={t("submit")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

export default PreviewJobDetails;
