import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "iconsax-react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { t } from "i18next";

const LiveCallIcon = () => {
  return (
    <Box textAlign="center" mt={3}>
      <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
        <IconButton
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "10px",
          }}
        >
          <FullscreenIcon />
        </IconButton>
        <IconButton
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "10px",
          }}
        >
          <VideocamOffIcon />
        </IconButton>
        <IconButton
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "10px",
          }}
        >
          <MicOffIcon />
        </IconButton>
        <IconButton
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "10px",
          }}
        >
          <FullscreenIcon />
        </IconButton>
      </Stack>

      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        sx={{
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 500,
          fontSize: "14px",
          paddingX: "16px",
          paddingY: "8px",
        }}
      >
        {t("webinar.copy_invitation_link")}
      </Button>
    </Box>
  );
};

export default LiveCallIcon;
