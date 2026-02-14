import { Box, IconButton } from "@mui/material";
import { CallStats } from "@stream-io/video-react-sdk";
import { CloseCircle } from "iconsax-react";

const CallStatsPanel = ({ isDarkMode, onClose, isCloseIcon = true }) => (
    <Box
        sx={{
            backgroundColor: isDarkMode ? "#19232D" : "#f9fafb",
            color: isDarkMode ? "white" : "black",
            flex: 1,
            overflowY: "auto",
            height: { xs: "100%", md: "calc(100% - 70px)" },
            width: { xs: "100%", sm: "100%", md: "auto" },
            position: "relative",
            padding: { xs: 0, sm: 1, md: 1.5 },
            boxSizing: "border-box",
        }}
    >
        {/* Close Button */}
        {isCloseIcon && (
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                }}
            >
                <CloseCircle size={22} />
            </IconButton>
        )}

        {/* Call Stats */}
        <CallStats />
    </Box>
);

export default CallStatsPanel;
