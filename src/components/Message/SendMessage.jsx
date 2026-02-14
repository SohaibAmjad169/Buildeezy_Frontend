import { Box } from "@mui/material";
import { Send2 } from "iconsax-react";
import DescriptionType from "../onboardingQuestions/DescriptionType";
import ActionButton from "../common/ActionButton";
import { useTranslation } from "react-i18next";

function SendMessage({ msg, handleValueChange, handleSendMessage }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "end",
      }}
    >
      <Box
        sx={{
          py: 2.5,
          pl: 2.5,
          pr: 1.5,
          width: "91%",
        }}
      >
        <DescriptionType
          id="current-msg"
          label=""
          placeholder={t("message.send_a_message")}
          onValueChange={handleValueChange}
          value={msg}
        />
      </Box>
      <ActionButton
        onClick={handleSendMessage}
        sx={{ mr: 2.5, width: "9%", height: "fit-content", mb: 5.5 }}
        startIcon={<Send2 size={16} />}
      >
        {t("message.send")}
      </ActionButton>
    </Box>
  );
}
export default SendMessage;
