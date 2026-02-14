import { Stack, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import MuiTypography from "../../common/MuiTypography";
import ChatAvatar from "../../common/ChatAvatar";
import { getAvatarName, getFirstCharUpperCase } from "../../../utils/common";
import { colors } from "../../../styles/theme";
import { useDispatch, useSelector } from "react-redux";
import { archiveChat, unarchiveChat } from "../../../redux/pubnubSlice";
import { PUBNUB_CHANNEL } from "../../../utils/constants/config";
import ActionButton from "../../common/ActionButton";
import { t } from "i18next";

function MobileChatHeader({
  user,
  showArchived,
  setShowArchived,
  setSelectedChat,
  onViewProfile,
}) {
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.profile);
  const [firstName, lastName] = user.chatUserName
    ? user.chatUserName.split(" ")
    : ["", ""];

  function handleArchiveChat() {
    const users = [profileData.id, user.chatUserId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    dispatch(archiveChat({ channelId }));
    setSelectedChat && setSelectedChat(null);
  }

  function handleUnarchiveChat() {
    const users = [profileData.id, user.chatUserId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    dispatch(unarchiveChat({ channelId }));
    setSelectedChat && setSelectedChat(null);
    setShowArchived && setShowArchived(false);
  }

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <ChatAvatar
          src={user.avatar}
          alt={user.chatUserName}
          sx={{ width: 32, height: 32 }}
        >
          {getAvatarName(firstName, lastName)}
        </ChatAvatar>
        <MuiTypography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {getFirstCharUpperCase(firstName) +
            " " +
            getFirstCharUpperCase(lastName)}
        </MuiTypography>
      </Stack>
      <Stack direction="row" spacing={2} mt={2} alignItems="center">
        {showArchived ? (
          <ActionButton
            startIcon={<UnarchiveIcon />}
            variant="outlined"
            onClick={handleUnarchiveChat}
            color="primary"
            size="small"
            sx={{
              flex: 1,
              borderRadius: "8px",
              color: colors.grey700,
              borderColor: colors.grey300,
              fontWeight: 500,
              fontSize: "0.95rem",
              height: 36,
              "&:hover": {
                borderColor: colors.grey400,
                backgroundColor: colors.grey500,
              },
            }}
          >
            {t("message.un_archive")}
          </ActionButton>
        ) : (
          <ActionButton
            startIcon={<ArchiveIcon />}
            variant="outlined"
            onClick={handleArchiveChat}
            color="primary"
            size="small"
            sx={{
              flex: 1,
              borderRadius: "8px",
              color: colors.grey700,
              borderColor: colors.grey300,
              fontWeight: 500,
              fontSize: "0.95rem",
              height: 36,
              "&:hover": {
                borderColor: colors.grey400,
                backgroundColor: colors.grey500,
              },
            }}
          >
            {t("message.archive")}
          </ActionButton>
        )}
        <ActionButton
          startIcon={<PersonIcon />}
          variant="contained"
          onClick={onViewProfile}
          size="small"
          sx={{
            flex: 1,
            borderRadius: "8px",
          }}
        >
          {t("message.profile")}
        </ActionButton>
      </Stack>
    </Box>
  );
}

export default MobileChatHeader;
