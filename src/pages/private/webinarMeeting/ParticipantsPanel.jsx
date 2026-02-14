import React from "react";
import { Box, Button, Typography } from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { CallParticipantsList } from "@stream-io/video-react-sdk";

const ParticipantsPanel = ({ onClose, isDarkMode }) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: { xs: 2, lg: 1 },
        pr: 3,
        color: "white",
      }}
    >
      {/* Top scrollable area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          mb: 2, // spacing between list and bottom section
        }}
      >
        <CallParticipantsList onClose={onClose} />
      </Box>

      {/* Bottom sticky section */}
      <Box
        sx={{
          mt: "auto",
        }}
      >
        <Typography sx={{ fontWeight: "bold", mb: 0.5, fontSize: "13px" }}>
          Share the link
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#9ca3af", mb: 1, fontSize: "10px" }}
        >
          Click the button below to copy the call link:
        </Typography>
        <Button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          variant="contained"
          fullWidth
          sx={{
            color: "white",
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 500,
            py: 0.5,
            mb: 3,
          }}
        >
          <GroupOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Copy invite link
        </Button>

        <Typography sx={{ fontWeight: "bold", mb: 0.5, fontSize: "13px" }}>
          Test on mobile
        </Typography>
        <Typography
          variant="body2"
          fontSize="10px"
          sx={{ color: "#9ca3af", mb: 2 }}
        >
          To test on a mobile device, scan the QR Code below:
        </Typography>
        <Box
          sx={{
            display: "flex",
            backgroundColor: "#709a1c",
            p: 2,
            borderRadius: "10px",
          }}
        >
          <Box
            component="img"
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${window.location.href}&size=120x120`}
            sx={{
              mx: "auto",
              bgcolor: "white",
              p: 1,
              borderRadius: "12px",
              width: 120,
              height: 120,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipantsPanel;
