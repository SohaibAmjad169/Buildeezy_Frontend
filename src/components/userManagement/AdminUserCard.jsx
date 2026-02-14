import { Avatar, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { getAvatarName, getFirstCharUpperCase } from "../../utils/common";
import { TickCircle } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { Trash } from "iconsax-react";
import { Slash } from "iconsax-react";
import MuiChip from "../common/MuiChip";
import { MAPPED_USER_STATUS } from "../../utils/constants/config";
import { useSelector } from "react-redux";

function AdminUserCard({
  user,
  userIndex,
  onActivateUser,
  onDeactivateUser,
  onBanUser,
}) {
  const { t } = useTranslation();
  const { userStateLoading } = useSelector((state) => state.userManagement);
  return (
    <>
      <Stack
        py={1.5}
        direction={{ xs: "column", md: "row" }}
        alignItems={"center"}
        justifyContent={{ xs: "center", md: "space-between" }}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          spacing={2}
          alignSelf={"start"}
        >
          <Avatar
            src={user.avatar}
            alt="profile"
            sx={{ fontSize: "1rem", fontWeight: 600, width: 71, height: 71 }}
          >
            {getAvatarName(user.firstName, user.lastName)}
          </Avatar>

          <Stack>
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
            <MuiTypography variant="subtitle2">{user.email}</MuiTypography>
            <MuiTypography variant="subtitle2">
              {user.phoneNumber}
            </MuiTypography>
          </Stack>
        </Stack>

        <Stack
          direction={"row"}
          alignItems={"center"}
          width={{ xs: "100%", md: "40%" }}
          justifyContent={"space-between"}
          mt={{ xs: 2, md: 0 }}
        >
          <Stack>
            <MuiChip value={MAPPED_USER_STATUS[user.status]} />
          </Stack>

          <Stack direction={"row"} alignItems={"center"}>
            <IconButton
              onClick={() => onActivateUser(user.id, userIndex)}
              disabled={user.status !== 3 || userStateLoading}
              sx={{
                color: "primary.main",
              }}
            >
              <Tooltip placement="top" title={t("users.activate")}>
                <TickCircle />
              </Tooltip>
            </IconButton>
            <IconButton
              onClick={() => onDeactivateUser(user.id, userIndex)}
              disabled={
                user.status === 3 || user.status === 4 || userStateLoading
              }
              sx={{
                color: "error.main",
              }}
            >
              <Tooltip placement="top" title={t("users.deactivate")}>
                <Trash />
              </Tooltip>
            </IconButton>

            <IconButton
              onClick={() => onBanUser(user.id, userIndex)}
              disabled={user.status == 4 || userStateLoading}
              sx={{
                color: "error.main",
              }}
            >
              <Tooltip placement="top" title={t("users.ban_user")}>
                <Slash />
              </Tooltip>
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
    </>
  );
}

export default AdminUserCard;
