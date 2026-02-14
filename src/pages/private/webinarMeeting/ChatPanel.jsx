import React from "react";
import {
    Chat,
    Channel,
    MessageList,
    MessageInput,
} from "stream-chat-react";
import {
    Box,
    IconButton,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


const ChatPanel = ({ chatClient, channel, onClose, isDarkMode, i18nInstance }) => {
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    backgroundColor: isDarkMode ? "#19232D" : "#f9fafb",
                    borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                }}
            >
                <Typography variant="h6" sx={{ color: isDarkMode ? "white" : "#111827" }}>
                    Chat
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon fontSize="small" sx={{ color: isDarkMode ? "white" : "#374151" }} />
                </IconButton>
            </Box>
            <Chat
                client={chatClient}
                i18nInstance={i18nInstance}
                theme={`str-chat__theme-light custom-chat-theme ${isDarkMode ? "dark" : "light"}`}
            >
                <Channel channel={channel}>
                    <Box sx={{
                        display: "flex", flexDirection: "column",
                        height: "100%"
                    }}>
                        <Box sx={{
                            flexGrow: 1,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { display: "none" },
                            scrollbarWidth: "none",
                        }}>
                            <MessageList />
                        </Box>
                        <Box sx={{
                            borderTop: isDarkMode ? "1px solid #374151" : "1px solid #E5E7EB",
                            backgroundColor: isDarkMode ? "#0f172a" : "#fff",
                        }}>
                            <MessageInput />
                        </Box>
                    </Box>
                </Channel>
            </Chat>
        </>
    );
};

export default ChatPanel;
