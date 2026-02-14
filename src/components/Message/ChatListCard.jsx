import { Box, Divider, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import ChatAvatar from "../common/ChatAvatar";
import {
  getAvatarName,
  getFirstCharUpperCase,
  convertDateTime,
} from "../../utils/common";
import dayjs from "dayjs";
import { colors } from "../../styles/theme";

function ChatListCard({ chat, onClick, selected }) {
  const { chatUserName, text, time, unreadCount } = chat;
  const [firstName, lastName] = chatUserName
    ? chatUserName.split(" ")
    : ["", ""];

  return (
    <>
      <Stack
        onClick={onClick}
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          ...(selected && {
            backgroundColor: "action.selected",
          }),
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          p={2}
        >
          <Stack direction="row" spacing={2} flex={1}>
            <ChatAvatar
              src={chat.avatar}
              alt={chatUserName}
              sx={{ width: 48, height: 48 }}
            >
              {getAvatarName(firstName, lastName)}
            </ChatAvatar>

            <Stack spacing={0.5} flex={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <MuiTypography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {getFirstCharUpperCase(firstName) +
                    " " +
                    getFirstCharUpperCase(lastName)}
                </MuiTypography>
                <MuiTypography variant="caption" color="text.secondary">
                  {convertDateTime(dayjs(time))}
                </MuiTypography>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <MuiTypography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                  >
                  {text}
                </MuiTypography>
                {unreadCount > 0 && (
                <Box sx={{ 
                  width: "24px", 
                  height: "24px",
                  position: "absolute",
                  right: 0, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: `${colors.primary}`,
                  color: "#fff",
                  borderRadius: "50%",
                }}>
                  <MuiTypography variant="body1">
                  {unreadCount ?? 0}
                  </MuiTypography>
                </Box>
                )}
              </Box>
             
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
    </>
  );
}

export default ChatListCard;
