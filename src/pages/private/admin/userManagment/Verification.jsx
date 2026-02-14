import {
  Box,
  InputBase,
  useTheme,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  Badge,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setAlert, setLoading } from "../../../../redux/configSlice";
import {
  activateUserUrl,
  banUserUrl,
  deactivateUserUrl,
  getAdminUsersUrl,
  grantAccessToRoom,
} from "../../../../apis/apiEndPoints";
import {
  setAdminUserList,
  setUserStateLoading,
} from "../../../../redux/userManagementSlice";
import { ALERT_TYPE } from "../../../../utils/constants/config";
import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import MuiTypography from "../../../../components/common/MuiTypography";
import { SearchNormal1, Slash, Eye, MessageText } from "iconsax-react";
import { colors } from "../../../../styles/theme";
import { getAvatarName, getFirstCharUpperCase } from "../../../../utils/common";
import UserListSkeleton from "../../../../components/skeleton/UserListSkeleton";
import NoData from "../../../../components/common/NoData";
import { PUBNUB_CHANNEL } from "../../../../utils/constants/config";
import {
  addAllMessage,
  setPubNubInstance,
} from "../../../../redux/pubnubSlice";
import Chat from "../../../../components/Message/Chat";
import { initPubNub } from "../../../../services/pubnub/pubnubConfig";

function Verification() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { adminUserList } = useSelector((state) => state.userManagement);
  const { loading } = useSelector((state) => state.config);
  const { userStateLoading } = useSelector((state) => state.userManagement);
  const { profileData, pubnubInstance, messages } = useSelector((state) => ({
    profileData: state.profile.profileData,
    pubnubInstance: state.pubnub.pubnubInstance,
    messages: state.pubnub.messages,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  // Initialize PubNub when component mounts
  useEffect(() => {
    if (profileData?.id && !pubnubInstance) {
      const pubnub = initPubNub(profileData.id, dispatch);
      dispatch(setPubNubInstance(pubnub));
    }
  }, [profileData?.id, dispatch, pubnubInstance]);

  const hasUnreadMessages = (userId) => {
    if (!profileData?.id || !messages) return false;

    const users = [profileData.id, userId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    const channelMessages = messages[channelId];

    return (
      channelMessages &&
      channelMessages.some(
        (msg) => msg.senderId !== profileData.id && !msg.read
      )
    );
  };

  async function fetchAdminUserList() {
    try {
      dispatch(setLoading(true));
      const response = await getAdminUsersUrl();
      dispatch(setAdminUserList(response.data.data));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  useEffect(() => {
    fetchAdminUserList();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!adminUserList) {
      setFilteredUsers([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredUsers(adminUserList);
    } else {
      const filtered = adminUserList.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email?.toLowerCase() || "";
        const phone = user.phoneNumber?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();

        return (
          fullName.includes(search) ||
          email.includes(search) ||
          phone.includes(search)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [adminUserList, searchTerm]);

  // async function onActivateUser(userId, userIndex) {
  //   try {
  //     dispatch(setUserStateLoading(true));
  //     await activateUserUrl(userId);
  //     const newAdminUserList = cloneDeep(adminUserList);
  //     newAdminUserList[userIndex].status = 1;
  //     dispatch(setAdminUserList(newAdminUserList));
  //   } catch (err) {
  //     dispatch(
  //       setAlert({
  //         show: true,
  //         type: ALERT_TYPE.error,
  //         message: err.message,
  //       })
  //     );
  //   } finally {
  //     dispatch(setUserStateLoading(false));
  //   }
  // }

  // async function onDeactivateUser(userId, userIndex) {
  //   try {
  //     dispatch(setUserStateLoading(true));
  //     await deactivateUserUrl(userId);
  //     const newAdminUserList = cloneDeep(adminUserList);
  //     newAdminUserList[userIndex].status = 3;
  //     dispatch(setAdminUserList(newAdminUserList));
  //   } catch (err) {
  //     dispatch(
  //       setAlert({
  //         show: true,
  //         type: ALERT_TYPE.error,
  //         message: err.message,
  //       })
  //     );
  //   } finally {
  //     dispatch(setUserStateLoading(false));
  //   }
  // }

  async function onBanUser(userId, userIndex) {
    try {
      dispatch(setUserStateLoading(true));
      await banUserUrl(userId);
      const newAdminUserList = cloneDeep(adminUserList);
      newAdminUserList[userIndex].status = 4;
      dispatch(setAdminUserList(newAdminUserList));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setUserStateLoading(false));
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVerificationStatus = (user) => {
    if (user.isVerified) {
      return { text: "Verified", color: "success" };
    } else {
      return { text: "Not verified", color: "error" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Active";
      case 2:
        return "Inactive";
      case 3:
        return "Deactivated";
      case 4:
        return "Banned";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "success";
      case 2:
        return "warning";
      case 3:
        return "default";
      case 4:
        return "error";
      default:
        return "default";
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleStartChat = async (user) => {
    if (!pubnubInstance || !profileData?.id) {
      console.error("PubNub instance or profile data not available");
      return;
    }

    try {
      setChatLoading(true);
      setChatLoadingId(user.id);

      const chatUserId = user.id;
      const chatUserName = `${user.firstName} ${user.lastName}`;
      const avatar = user.avatar;

      const users = [profileData.id, chatUserId].sort();
      const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;

      // Grant access to the channel first
      await grantAccessToRoom({
        roomName: channelId,
        user1: profileData.id,
        user2: chatUserId,
      });

      // Subscribe to the channel
      await pubnubInstance.subscribe({
        channels: [channelId],
      });

      // Fetch message history
      const response = await new Promise((resolve, reject) => {
        pubnubInstance.history(
          {
            channel: channelId,
            reverse: true,
            count: 100, // Fetch last 100 messages
          },
          (status, response) => {
            if (status.error) reject(status);
            else resolve(response);
          }
        );
      });

      if (response.messages.length > 0) {
        const formattedMessages = response.messages.map((msg) => ({
          ...msg.entry,
          time: msg.timetoken / 10000,
        }));
        dispatch(addAllMessage({ channelId, messages: formattedMessages }));
      }

      // Set the selected chat user
      setSelectedChatUser({
        chatUserId,
        chatUserName,
        avatar,
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Failed to start chat session",
        })
      );
    } finally {
      setChatLoading(false);
      setChatLoadingId(null);
    }
  };

  const UserCard = ({ user, userIndex }) => {
    const verificationStatus = getVerificationStatus(user);

    return (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            py: 2,
            px: 1,
            backgroundColor:
              mode === "dark" ? theme.palette.background.paper : colors.white,
            borderRadius: 1,
            mb: 1,
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? theme.palette.action.hover
                  : theme.palette.grey[50],
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flex: 1 }}
          >
            <Avatar
              src={user.avatar}
              alt="profile"
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                width: 56,
                height: 56,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {getAvatarName(user.firstName, user.lastName)}
            </Avatar>

            <Stack spacing={0.5}>
              <MuiTypography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {getFirstCharUpperCase(user.firstName) +
                  " " +
                  getFirstCharUpperCase(user.lastName)}
              </MuiTypography>
              <MuiTypography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.875rem",
                }}
              >
                {user.email}
              </MuiTypography>
              <MuiTypography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.875rem",
                }}
              >
                {user.phoneNumber}
              </MuiTypography>
            </Stack>
          </Stack>

          <Box sx={{ minWidth: 100, textAlign: "center" }}>
            <MuiTypography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
              }}
            >
              {formatDate(user.createdAt || user.updatedAt)}
            </MuiTypography>
          </Box>

          <Box sx={{ minWidth: 120, textAlign: "center" }}>
            <MuiTypography
              variant="body2"
              sx={{
                color:
                  verificationStatus.color === "success"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              {verificationStatus.text}
            </MuiTypography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => handleStartChat(user)}
              size="small"
              sx={{
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main + "10",
                },
              }}
            >
              <Tooltip placement="top" title="Message">
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!hasUnreadMessages(user.id)}
                >
                  {chatLoading && chatLoadingId === user.id ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <MessageText size={18} />
                  )}
                </Badge>
              </Tooltip>
            </IconButton>

            <IconButton
              onClick={() => handleViewUser(user)}
              size="small"
              sx={{
                color: theme.palette.info.main,
                "&:hover": {
                  backgroundColor: theme.palette.info.main + "10",
                },
              }}
            >
              <Tooltip placement="top" title="View Details">
                <Eye size={18} />
              </Tooltip>
            </IconButton>

            <IconButton
              onClick={() => onBanUser(user.id, userIndex)}
              disabled={user.status == 4 || userStateLoading}
              size="small"
              sx={{
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: theme.palette.error.main + "10",
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <Tooltip placement="top" title={t("users.ban_user")}>
                <Slash size={18} />
              </Tooltip>
            </IconButton>
          </Stack>
        </Box>
        <Divider sx={{ opacity: 0.3 }} />
      </>
    );
  };

  const UserDetailsDialog = () => {
    if (!selectedUser) return null;

    return (
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor:
              mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.background.default,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: `1px solid ${
              mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[200]
            }`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={selectedUser.avatar}
              alt="profile"
              sx={{
                width: 60,
                height: 60,
                fontSize: "1.2rem",
                fontWeight: 600,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {getAvatarName(selectedUser.firstName, selectedUser.lastName)}
            </Avatar>
            <Box>
              <MuiTypography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {getFirstCharUpperCase(selectedUser.firstName) +
                  " " +
                  getFirstCharUpperCase(selectedUser.lastName)}
              </MuiTypography>
              <Chip
                label={getStatusText(selectedUser.status)}
                color={getStatusColor(selectedUser.status)}
                size="small"
              />
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MuiTypography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.primary.main,
                }}
              >
                {t("admin_verification.basic_information")}
              </MuiTypography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.user_type")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {getFirstCharUpperCase(selectedUser.type || "N/A")}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.user_id")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {selectedUser.id || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.first_name")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {getFirstCharUpperCase(selectedUser.firstName) || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.last_name")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {getFirstCharUpperCase(selectedUser.lastName) || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <MuiTypography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  mt: 2,
                  color: theme.palette.primary.main,
                }}
              >
                {t("admin_verification.contact_information")}
              </MuiTypography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.email_address")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {selectedUser.email || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.phone_number")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {selectedUser.phoneNumber || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <MuiTypography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  mt: 2,
                  color: theme.palette.primary.main,
                }}
              >
                {t("admin_verification.account_information")}
              </MuiTypography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.account_status")}
                </MuiTypography>
                <Chip
                  label={getStatusText(selectedUser.status)}
                  color={getStatusColor(selectedUser.status)}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.verification_status")}
                </MuiTypography>
                <Chip
                  label={getVerificationStatus(selectedUser).text}
                  color={getVerificationStatus(selectedUser).color}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.created_at")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {formatDateTime(selectedUser.createdAt) || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <MuiTypography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {t("admin_verification.last_updated")}
                </MuiTypography>
                <MuiTypography variant="body1">
                  {formatDateTime(selectedUser.updatedAt) || "N/A"}
                </MuiTypography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <MuiTypography
        variant="h1"
        sx={{ fontWeight: 500, lineHeight: 1.6, mb: 3 }}
      >
        {t("admin_verification.title")}
      </MuiTypography>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[300],
            borderRadius: 5,
            px: 2,
            height: 40,
            backgroundColor:
              mode === "dark" ? theme.palette.grey[900] : colors.white,
            flex: 1,
            maxWidth: 400,
          }}
        >
          <SearchNormal1
            size={18}
            style={{
              marginRight: 8,
              color: colors.grey500,
            }}
          />
          <InputBase
            placeholder={t("admin_verification.search")}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              color: mode === "dark" ? colors.white : colors.black,
              "&::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor:
            mode === "dark"
              ? theme.palette.background.default
              : theme.palette.grey[50],
          borderRadius: 2,
          p: 2,
        }}
      >
        {loading ? (
          <UserListSkeleton />
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <UserCard key={user.id || index} user={user} userIndex={index} />
          ))
        ) : (
          <NoData />
        )}
      </Box>

      <UserDetailsDialog />

      <Dialog
        fullScreen
        open={!!selectedChatUser}
        onClose={() => setSelectedChatUser(null)}
        PaperProps={{ sx: { backgroundColor: "background.default" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedChatUser && (
            <Box
              sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <Chat
                  activeChat={selectedChatUser}
                  onBack={() => setSelectedChatUser(null)}
                  showArchived={false}
                  setShowArchived={() => {}}
                  onProfileVisibilityChange={() => {}}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Verification;
