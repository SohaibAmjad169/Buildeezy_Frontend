import { Stack, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { colors } from "../../styles/theme";

const SubmitCancelButtons = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      <Button
        variant="outlined"
        onClick={onCancel}
        sx={{
          borderRadius: "8px",
          color: colors.grey700,
          borderColor: colors.grey300,
          "&:hover": {
            borderColor: colors.grey400,
            backgroundColor: colors.grey500,
          },
        }}
      >
        {t("profile.design.cancel")}
      </Button>
      <Button
        variant="contained"
        onClick={onSubmit}
        sx={{
          borderRadius: "8px",
          backgroundColor: colors.primary,
          "&:hover": {
            backgroundColor: colors.primary800,
          },
        }}
      >
        {t("common.submit")}
      </Button>
    </Stack>
  );
};

export default SubmitCancelButtons;
