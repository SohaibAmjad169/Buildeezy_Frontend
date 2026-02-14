import { Box, Button, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";

function UpdateJobAndInviteDialog({ open, onClose, onConfirm, talentName }) {
  const { t } = useTranslation();

  if (!open) return null;

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
        zIndex: 1400,
      }}
    >
      <Box
        sx={{
          backgroundColor: "background.paper",
          borderRadius: "8px",
          p: "24px",
          width: "100%",
          maxWidth: "400px",
          mx: 2,
          position: "relative",
        }}
      >
        {/* Top row with icons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {/* Warning Icon */}
          <Box
            sx={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 237, 213, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& svg": {
                fontSize: "24px",
                color: "#FB923C",
              },
            }}
          >
            <ErrorOutlineIcon />
          </Box>

          {/* Close button */}
          <Box
            onClick={onClose}
            sx={{
              cursor: "pointer",
              color: "text.secondary",
              "& svg": {
                fontSize: "20px",
              },
            }}
          >
            <CloseIcon />
          </Box>
        </Box>

        <Stack spacing={1} alignItems="center">
          {/* Main title */}
          <MuiTypography
            variant="h4"
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "text.primary",
              mb: 1,
              textAlign: "center",
            }}
          >
            {t("job.details.invite_to_bid_title", { names: talentName })}
          </MuiTypography>

          {/* Subtitle */}
          <MuiTypography
            variant="body2"
            sx={{
              fontSize: "14px",
              color: "text.secondary",
              mb: 3,
              textAlign: "center",
            }}
          >
            {t("job.details.invite_to_bid_subtitle")}
          </MuiTypography>

          {/* Action buttons */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: "100%",
              pt: 2, // 32px spacing before buttons
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "text.primary",
                textTransform: "none",
                border: "1px solid #D1D5DB",
                height: "40px",
                "&:hover": {
                  backgroundColor: "transparent",
                  opacity: 0.8,
                  border: "1px solid #D1D5DB",
                },
              }}
            >
              {t("no_cancel")}
            </Button>
            <Button
              onClick={onConfirm}
              variant="contained"
              fullWidth
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "#709A1C",
                color: "white",
                textTransform: "none",
                borderRadius: "4px",
                height: "40px",
                "&:hover": {
                  backgroundColor: "#5C8017",
                },
              }}
            >
              {t("yes_continue")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default UpdateJobAndInviteDialog;
