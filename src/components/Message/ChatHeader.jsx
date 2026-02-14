import { IconButton, Stack, Button, Divider } from "@mui/material";
import ArrowLeft from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import MuiTypography from "../common/MuiTypography";
import ChatAvatar from "../common/ChatAvatar";
import { getAvatarName, getFirstCharUpperCase } from "../../utils/common";
import { useDispatch, useSelector } from "react-redux";
import { archiveChat, unarchiveChat } from "../../redux/pubnubSlice";
import { PUBNUB_CHANNEL } from "../../utils/constants/config";
import { colors } from "../../styles/theme";
import { useTheme, useMediaQuery } from "@mui/material";
import { t } from "i18next";

function ChatHeader({
  user,
  onBack,
  setSelectedChat,
  showArchived,
  setShowArchived,
  onViewProfile,
}) {
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.profile);
  const [firstName, lastName] = user.chatUserName
    ? user.chatUserName.split(" ")
    : ["", ""];

  const theme = useTheme();
  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down("md"));

  function handleArchiveChat() {
    const users = [profileData.id, user.chatUserId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    dispatch(archiveChat({ channelId }));
    setSelectedChat(null);
  }

  function handleUnarchiveChat() {
    const users = [profileData.id, user.chatUserId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    dispatch(unarchiveChat({ channelId }));
    setSelectedChat(null);
    setShowArchived(false);
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {onBack && (
            <IconButton
              onClick={onBack}
              size={isTabletOrSmaller ? "small" : "medium"}
            >
              <ArrowLeft />
            </IconButton>
          )}

          <ChatAvatar
            src={user.avatar}
            alt={user.chatUserName}
            sx={{
              width: isTabletOrSmaller ? 32 : 40,
              height: isTabletOrSmaller ? 32 : 40,
            }}
          >
            {getAvatarName(firstName, lastName)}
          </ChatAvatar>

          <Stack>
            <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>
              {getFirstCharUpperCase(firstName) +
                " " +
                getFirstCharUpperCase(lastName)}
            </MuiTypography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2}>
          {showArchived ? (
            <Button
              startIcon={<UnarchiveIcon />}
              variant="outlined"
              onClick={handleUnarchiveChat}
              color="primary"
              size={isTabletOrSmaller ? "small" : "medium"}
              sx={{
                borderRadius: "8px",
                minWidth: { xs: 36, md: 100 },
                height: 36,
                fontSize: { xs: "0.8rem", md: "0.85rem" },
                px: { xs: 1, md: 2 },
                "@media (width:1024px)": {
                  fontSize: "0.75rem",
                  px: 1,
                },
              }}
            >
              Unarchive
            </Button>
          ) : (
            <Button
              startIcon={<ArchiveIcon />}
              variant="outlined"
              onClick={handleArchiveChat}
              color="primary"
              size={isTabletOrSmaller ? "small" : "medium"}
              sx={{
                borderRadius: "8px",
                minWidth: { xs: 36, md: 100 },
                height: 36,
                fontSize: { xs: "0.8rem", md: "0.85rem" },
                px: { xs: 1, md: 2 },
                color: colors.grey700,
                borderColor: colors.grey300,
                "&:hover": {
                  borderColor: colors.grey400,
                  backgroundColor: colors.grey500,
                  color: "white"
                },
                "@media (width:1024px)": {
                  fontSize: "0.75rem",
                  px: 1,
                },
              }}
            >
              Archive
            </Button>
          )}
          <Button
            startIcon={<PersonIcon />}
            variant="contained"
            onClick={onViewProfile}
            color="primary"
            size={isTabletOrSmaller ? "small" : "medium"}
            sx={{
              borderRadius: "8px",
              height: 36,
              fontSize: { xs: "0.8rem", md: "0.85rem" },
              px: { xs: 2, md: 3 },
              whiteSpace: "nowrap",
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary800,
              },
              "@media (width:1024px)": {
                fontSize: "0.75rem",
                px: 2,
              },
            }}
          >
            {t("message.view_profile")}
          </Button>
        </Stack>
      </Stack>
      <Divider sx={{ width: "100%", m: 0 }} />
    </>
  );
}

export default ChatHeader;
