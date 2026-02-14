import { Alert, Button, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { mapStatus, profileStatus } from "../../utils/constants/profile";
import { ROUTES } from "../../utils/constants/route";
import { colors } from "../../styles/theme";

function ProfileStatus({ status, isVerified }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Use isVerified flag to override status if verified
  // If isVerified is true, treat as status 3 (verified)
  // Otherwise, use the original status
  const effectiveStatus = isVerified ? 3 : status;
  
  // Don't render anything if user is verified (status 3 or isVerified = true)
  if (effectiveStatus === 3 || isVerified) {
    return null;
  }

  function navigateToVerification() {
    navigate("/" + ROUTES.verification);
  }

  return (
    <Alert
      severity={mapStatus[effectiveStatus]}
      action={
        profileStatus[effectiveStatus]?.isBtn && (
          <Button
            onClick={navigateToVerification}
            variant="outlined"
            size="small"
            color="error"
            sx={{
              borderRadius: "50px",
              fontWeight: 600,
              px: 2,
            }}
          >
            {t("dashboard.verify_now")}
          </Button>
        )
      }
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#2a0000" : undefined,
        color: theme.palette.mode === "dark" ? "#ffb3b3" : undefined,
        border: '1px solid',
        borderColor: theme.palette.mode === "dark" ? theme.palette.error.dark : 'transparent',
      }}
    >
      {t(profileStatus[effectiveStatus]?.label)}
    </Alert>
  );
}

export default ProfileStatus;