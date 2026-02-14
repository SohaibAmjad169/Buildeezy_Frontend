import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ShieldCross, Lock } from "iconsax-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../utils/constants/route";
import ActionButton from "../common/ActionButton";

const VerificationRequired = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleVerifyAccount = () => {
    navigate("/" + ROUTES.verification);
  };

  const handleGoToDashboard = () => {
    navigate("/" + ROUTES.dashboard);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          maxWidth: 500,
          width: "100%",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCross
              size={64}
              color="#FF6B6B"
              variant="Bulk"
            />
            <Lock
              size={24}
              color="#FF6B6B"
              variant="Bold"
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                backgroundColor: "white",
                borderRadius: "50%",
                padding: 2,
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {t("verification.verification_required")}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {t("verification.verification_required_message")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
          }}
        >
          <ActionButton
            variant="outlined"
            onClick={handleGoToDashboard}
            sx={{ minWidth: 120 }}
          >
            {t("common.go_to_dashboard")}
          </ActionButton>
          
          <ActionButton
            onClick={handleVerifyAccount}
            sx={{ minWidth: 120 }}
          >
            {t("profile.verify_account")}
          </ActionButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerificationRequired;