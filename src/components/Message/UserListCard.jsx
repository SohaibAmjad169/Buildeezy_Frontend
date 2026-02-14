import { Checkbox, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { getAvatarName, getFirstCharUpperCase } from "../../utils/common";
import ChatAvatar from "../common/ChatAvatar";

function UserListCard({
  user,
  onUserClick,
  isLast,
  isCheckBoxRequired = false,
}) {
  return (
    <Stack
      onClick={onUserClick}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
      p={2}
      sx={{
        cursor: "pointer",
        width: "100%",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        borderBottom: !isLast ? "1px solid #E0E0E0" : "none",
        boxSizing: "border-box",
      }}
    >
      <ChatAvatar
        src={user.avatar}
        alt="profile"
        sx={{ width: 48, height: 48 }}
        active={user.isOnline}
      >
        {getAvatarName(user.firstName, user.lastName)}
      </ChatAvatar>
      <Stack spacing={0.5} flex={1}>
        <MuiTypography
          variant="h6"
          sx={{
            fontWeight: 600,
          }}
        >
          {getFirstCharUpperCase(user.firstName) +
            " " +
            getFirstCharUpperCase(user.lastName)}
        </MuiTypography>
        <MuiTypography variant="body2" color="text.secondary">
          {user.userType}
        </MuiTypography>
      </Stack>

      {isCheckBoxRequired && <Checkbox checked={user.isChecked} />}
    </Stack>
  );
}

export default UserListCard;
