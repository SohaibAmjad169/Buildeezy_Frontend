import {
  Box,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
  TextField,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowLeft from "@mui/icons-material/ArrowLeft";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MuiTypography from "../../components/common/MuiTypography";
import Chat from "../../components/Message/Chat";
import BlankChat from "../../components/Message/BlankChat";
import ChatList from "../../components/Message/ChatList";
import UserList from "../../components/Message/UserList";
import MobileChat from "../../components/Message/mobile/MobileChat";
import MobileMessage from "../../components/Message/mobile/MobileMessage";
import UserProfile from "../../components/Message/UserProfile";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMediaQuery, useTheme } from "@mui/material";
import { setLoading, setAlert } from "../../redux/configSlice";
import { PUBNUB_CHANNEL, ALERT_TYPE } from "../../utils/constants/config";
import {
  getUsers,
  grantAccessToRoom,
  getSubscribedChannels,
} from "../../apis/apiEndPoints";
import BackButton from "../../components/common/BackButton";
import { People } from "iconsax-react";
import { initPubNub } from "../../services/pubnub/pubnubConfig";
import {
  addMessage,
  setUserList,
  incrementChannelsUnreadCount,
  addAllMessage 
} from "../../redux/pubnubSlice";


function Message() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const { t } = useTranslation();

  const { pubnubInstance, userList } = useSelector((state) => state.pubnub);
  const { profileData } = useSelector((state) => state.profile);

  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [showUserList, setShowUserList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState(JSON.parse(localStorage.getItem("subscribedChannels")) || []); // get subscribed channels from local storage to improve pubnub subscription startup time

  async function getUserList() {
    try {
      dispatch(setLoading(true));
      const response = await getUsers();
      const userList = response.data.data;
      dispatch(setUserList(userList));
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

  async function grantAccessToSubscribeRooms() {
    try {
      subscribedChannels?.map((channelName) => {
        const parts = channelName.split("_"); // ['user', '74', '75']
        const user1 = profileData.id;
        const user2 =
          Number(parts[1]) === user1 ? Number(parts[2]) : Number(parts[1]);

        return grantAccessToRoom({
          roomName: channelName,
          user1,
          user2,
        })
          .then((res) => {
            return res;
          })
          .catch((err) => {
            console.error(`Failed to grant access to ${channelName}`, err);
            return null;
          });
      });
    } catch (err) {
      dispatch(setLoading(false));
      console.error("Error grantAccessToSubscribeRooms:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function fetchSubscribedChannels() {
    try {
      dispatch(setLoading(true));
      const response = await getSubscribedChannels();
      const channelList = [...new Set(response.data?.channels || [])];
      setSubscribedChannels(channelList);
      // store the updated subscribed channels in local storage
      localStorage.setItem("subscribedChannels", JSON.stringify(channelList));
      await grantAccessToSubscribeRooms();
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setLoading(false));
      console.error("Error fetching subscribed channels:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }

  useEffect(() => {
    getUserList();
    fetchSubscribedChannels();
  }, []);

  useEffect(() => {
    
    const listener = {
      message: (event) => {
        const channelId = event.channel;
        const message = event.message;
        if (message.senderId !== profileData.id) {
          dispatch(addMessage({ channelId, message }));
          const subscribedChannel = event.subscribedChannel;
          dispatch(
            incrementChannelsUnreadCount({ channelId: subscribedChannel })
          );
        }
      },
    };

    const subscribeToChannels = async () => {
      if (userList.length === 0) {
        return;
      }
      if (profileData.id && !pubnubInstance) {
        const pubnubInstance = initPubNub(profileData.id.toString(), dispatch);

        if (pubnubInstance) {
          // Subscribe to the channel and listen for messages
          await pubnubInstance.unsubscribeAll();
          await Promise.all(subscribedChannels.map(channel => pubnubInstance.subscribe({
            channels: [channel],
          })));
          pubnubInstance?.addListener(listener);
        }

        // fetch message history
        subscribedChannels.forEach(async channelId => {
          const response = await new Promise((resolve, reject) => {
            pubnubInstance.history(
              {
                channel: channelId,
                reverse: false,
                // start: getTimetokenDaysAgo(8), // Fetch messages from the last 8 days
                count: 20,
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
                timetoken: msg.timetoken,
              }));
              dispatch(addAllMessage({ channelId, messages: formattedMessages, currentUser: profileData.id }));
            }
                            
          });
        }
      }

    subscribeToChannels();

  }, [profileData.id, pubnubInstance, dispatch, userList, subscribedChannels]);

useEffect(() => {
  if (location.state && location.state.chatUserId) {
    const user = userList.find(
      (u) => u.id === Number(location.state.chatUserId)
    );
    if (user) {
      onChatClick({
        chatUserId: user.id,
        chatUserName: user.firstName + " " + user.lastName,
        avatar: user.avatar,
      });
    } else {
     // If not in userList, use state data
      onChatClick({
        chatUserId: location.state.chatUserId,
        chatUserName: location.state.chatUserName,
        avatar: location.state.avatar,
      });
    }
  }
}, [location.state, userList]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await getUsers();
        if (response?.data?.data) {
          dispatch({ type: "pubnub/setUserList", payload: response.data.data });
        }
      } catch (err) {
        console.error("Failed to fetch users for messages", err);
      }
    }
    fetchUsers();
  }, [dispatch]);


  async function onChatClick(user) {
    // Grant access to the channel
    const chatUserId = user?.chatUserId || user.id;
    const chatUserName =
      user?.chatUserName || user.firstName + " " + user.lastName;
    const avatar = user?.avatar || user.avatar;
    const users = [profileData.id, chatUserId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    try {
      await grantAccessToRoom({
        roomName: channelId,
        user1: profileData.id,
        user2: chatUserId,
      });
    } catch (error) {
      console.error("Error while requesting access to channel", error);
    } finally {
    }
    setSelectedChat({
      chatUserId: chatUserId,
      chatUserName: chatUserName,
      avatar: avatar,
    });
  }

  // useEffect(() => {
  //   if (chatUserId && chatUserId !== selectedChat?.chatUserId) {
  //     const user = userList.find((user) => user.id === Number(chatUserId));
  //     if (user) {
  //       onChatClick(user);
  //     }
  //   }
  // }, [chatUserId, userList, selectedChat]);

  function handleNewMessage() {
    setShowUserList(true);
    setActiveTab(0);
  }

  function handleArchiveList() {
    setActiveTab(1);
    setShowUserList(false);
  }

  function handleProfileVisibilityChange(isVisible) {
    setShowProfile(isVisible);
  }

  if (isMobile) {
    const mobileContainerProps = {
      sx: {
        height: "80vh",
        maxHeight: "80vh",
        minHeight: "80vh",
        border: "solid 1px",
        borderColor: "uploadBorder",
        width: "100%",
        borderRadius: "8px",
      },
    };
    return (
      <Box {...mobileContainerProps}>
        {showProfile && selectedChat ? (
          <UserProfile
            user={selectedChat}
            onClose={() => setShowProfile(false)}
            sx={{ height: "100%" }}
          />
        ) : selectedChat ? (
          <MobileChat
            activeChat={selectedChat}
            onBack={() => setSelectedChat(null)}
            showArchived={activeTab === 1}
            setShowArchived={(value) => setActiveTab(value ? 1 : 0)}
            onProfileVisibilityChange={handleProfileVisibilityChange}
            sx={{ height: "100%" }}
          />
        ) : (
          <MobileMessage
            onChatClick={onChatClick}
            onNewMessage={handleNewMessage}
            onArchiveList={handleArchiveList}
            sx={{ height: "100%" }}
            activeChat={selectedChat}
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{ height: "calc(100vh - 118px)", width: "100%" }}
    >
      <BackButton
        sx={{
          marginBottom: "0.2rem",
        }}
      />
      <Stack
        direction="row"
        spacing={2}
        sx={{
          border: "solid 1px",
          borderColor: "uploadBorder",
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            width: "30%",
            display: showProfile ? "none" : "block",
            height: "100%",
          }}
        >
          <Stack spacing={2} p={2}>
            <Stack spacing={1}>
              <Stack alignItems="flex-start">
                {activeTab === 1 ? (
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <MuiTypography variant="h3">{t("message.archives")}</MuiTypography>
                    </Stack>
                    <Button
                      startIcon={<ArrowLeft sx={{ color: "success.main" }} />}
                      onClick={() => setActiveTab(0)}
                      sx={{
                        justifyContent: "flex-start",
                        color: "success.main",
                        p: 0,
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      {t("message.all_messages")}
                    </Button>
                  </Stack>
                ) : !showUserList ? (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <MuiTypography variant="h3">{t("message.title")}</MuiTypography>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={handleArchiveList}>
                        <ArchiveIcon />
                      </IconButton>
                      <IconButton size="small" onClick={handleNewMessage}>
                        {/* <EditIcon /> */}
                        <People size={22} variant="Bold" />
                      </IconButton>
                    </Stack>
                  </Stack>
                ) : null}
              </Stack>
            </Stack>

            {!showUserList && (
              <TextField
                size="small"
                placeholder={
                  activeTab === 1
                    ? t("message.search_archived", "Search archived messages")
                    : t("message.search", "Search")
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            )}
          </Stack>

          {showUserList ? (
            <Box
              sx={{
                height: "calc(100vh - 230px)",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Stack spacing={2} px={3}>
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <MuiTypography variant="h3">{t("message.new_chat")}</MuiTypography>
                  </Stack>
                  <Button
                    startIcon={<ArrowLeft sx={{ color: "success.main" }} />}
                    onClick={() => setShowUserList(false)}
                    sx={{
                      justifyContent: "flex-start",
                      color: "success.main",
                      p: 0,
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    {t("message.all_messages")}
                  </Button>
                </Stack>
                <TextField
                  size="small"
                  placeholder={t("message.search_users")}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <Box sx={{ mx: -2 }}>
                  <UserList
                    users={userList.filter(
                      (user) =>
                        user.firstName
                          .toLowerCase()
                          .includes(userSearchQuery.toLowerCase()) ||
                        user.lastName
                          .toLowerCase()
                          .includes(userSearchQuery.toLowerCase())
                    )}
                    handleUserClick={onChatClick}
                  />
                </Box>
              </Stack>
            </Box>
          ) : (
            <ChatList
              handleChatClick={onChatClick}
              searchQuery={searchQuery}
              showArchived={activeTab === 1}
              activeChat={selectedChat}
            />
          )}
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ height: "100%", alignSelf: "stretch", m: 0 }}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            height: "100%",
            ml: 0,
          }}
        >
          <Box sx={{ flex: 1, height: "100%" }}>
            {selectedChat ? (
              <Stack sx={{ height: "100%" }}>
                <Chat
                  activeChat={selectedChat}
                  showArchived={activeTab === 1}
                  setShowArchived={(value) => setActiveTab(value ? 1 : 0)}
                />
              </Stack>
            ) : (
              <BlankChat />
            )}
          </Box>
          {showProfile && selectedChat && (
            <Box
              sx={{
                width: 400,
                minWidth: 320,
                maxWidth: 400,
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <UserProfile
                user={selectedChat}
                onClose={() => setShowProfile(false)}
                sx={{ height: "100%" }}
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default Message;
