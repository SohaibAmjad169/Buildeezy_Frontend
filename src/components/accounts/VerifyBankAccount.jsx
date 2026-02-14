import { Alert, Button, useTheme } from "@mui/material";
import { t } from "i18next";
import React from "react";

function VerifyBankAccount({handleNavigate}) {

  const theme = useTheme()

  return (
    <div>
      <Alert
        severity="error"
        action={
          <Button
            onClick={handleNavigate}
            variant="outlined"
            size="small"
            color="error"
            sx={{
              borderRadius: "50px",
              fontWeight: 600,
              px: 2,
            }}
          >
            {t("accounts.verify_now")}
          </Button>
        }
        sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#2a0000" : undefined,
        color: theme.palette.mode === "dark" ? "#ffb3b3" : undefined,
        border: '1px solid',
        borderColor: theme.palette.mode === "dark" ? theme.palette.error.dark : 'transparent',
         marginBottom: "20px"
      }}
      >
        {t("accounts.verify_bank_account")}
      </Alert>
    </div>
  );
}

export default VerifyBankAccount;
