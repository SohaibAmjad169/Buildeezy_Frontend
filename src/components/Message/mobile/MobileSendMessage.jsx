import { Box } from "@mui/material";
import { Send2 } from "iconsax-react";
import DescriptionType from "../../onboardingQuestions/DescriptionType";
import ActionButton from "../../common/ActionButton";
import { useTranslation } from "react-i18next";

function MobileSendMessage({ msg, handleValueChange, handleSendMessage }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "end",

        pb: 1,
      }}
    >
      <Box
        sx={{
          py: 1,
          pl: 1,
          pr: 1,
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
        sx={{ mr: 1, width: "9%", height: "fit-content", mb: 4 }}
        startIcon={<Send2 size={16} />}
      >
        {t("message.send")}
      </ActionButton>
    </Box>
  );
}
export default MobileSendMessage;
