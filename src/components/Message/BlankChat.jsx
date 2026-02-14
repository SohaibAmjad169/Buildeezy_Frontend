import { Box } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";
import { Message } from "iconsax-react";

function BlankChat() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Message size={34} />
      <MuiTypography variant="h6" sx={{ mt: 1 }}>
        {t("message.choose_message")}
      </MuiTypography>
      <MuiTypography variant="subtitle2">
        {t("message.choose_message_subtitle")}
      </MuiTypography>
    </Box>
  );
}
export default BlankChat;
