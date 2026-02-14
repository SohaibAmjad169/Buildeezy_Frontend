import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import ActionButton from "../common/ActionButton";

function UpdateJobPreview({ formData, onCancel, onSubmit }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          backgroundColor: "background.paper",
          borderRadius: 2,
          p: 3,
          width: "100%",
          maxWidth: 600,
          mx: 2,
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header with Title */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <MuiTypography variant="h2">{t("job.details.preview")}</MuiTypography>
          <Stack direction="row" spacing={2}>
            <ActionButton variant="text" onClick={onCancel}>
              {t("back")}
            </ActionButton>
            <ActionButton variant="contained" onClick={onSubmit}>
              {t("submit")}
            </ActionButton>
          </Stack>
        </Stack>

        {/* Job Details */}
        <Box sx={{ mt: 4 }}>
          <Stack spacing={3}>
            {/* Title Section */}
            <Box>
              <MuiTypography variant="h3" sx={{ mb: 1 }}>
                {t("job.details.title")}
              </MuiTypography>
              <MuiTypography variant="body1" color="text.secondary">
                {formData.title}
              </MuiTypography>
            </Box>

            {/* Description Section */}
            <Box>
              <MuiTypography variant="h3" sx={{ mb: 1 }}>
                {t("job.details.description")}
              </MuiTypography>
              <MuiTypography variant="body1" color="text.secondary">
                {formData.comments}
              </MuiTypography>
            </Box>

            {/* Budget Section */}
            <Box>
              <MuiTypography variant="h3" sx={{ mb: 1 }}>
                {t("job.details.budget")}
              </MuiTypography>
              <MuiTypography variant="body1" color="text.secondary">
                {formData.budget}
              </MuiTypography>
            </Box>

            {/* Start Date Section */}
            <Box>
              <MuiTypography variant="h3" sx={{ mb: 1 }}>
                {t("job.details.start_date")}
              </MuiTypography>
              <MuiTypography variant="body1" color="text.secondary">
                {formData.startDate}
              </MuiTypography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default UpdateJobPreview;
