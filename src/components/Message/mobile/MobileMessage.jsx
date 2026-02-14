import {
  Box,
  Stack,
  IconButton,
  InputAdornment,
  TextField,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowLeft from "@mui/icons-material/ArrowLeft";

import MuiTypography from "../../common/MuiTypography";
import ChatList from "../ChatList";
import UserList from "../UserList";
import { useState } from "react";
import { useSelector } from "react-redux";
import BackButton from "../../../components/common/BackButton";
import { useTranslation } from "react-i18next";

function MobileMessage({ onChatClick, onNewMessage, onArchiveList, activeChat }) {
  const { userList } = useSelector((state) => state.pubnub);

  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [showUserList, setShowUserList] = useState(false);
  const { t } = useTranslation();

  const filteredUsers = userList.filter(
    (user) =>
      user.firstName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleUserSelect = (user) => {
    onChatClick(user);
    setShowUserList(false);
  };

  const handleNewMessageClick = () => {
    setShowUserList(true);
    onNewMessage();
  };

  const handleArchiveClick = () => {
    setActiveTab(1);
    onArchiveList();
  };

  const handleBackToMessages = () => {
    setActiveTab(0);
    setShowUserList(false);
  };

  return (
    <Box
      sx={{
        border: "solid 1px",
        borderColor: "uploadBorder",
        width: "100%",
        height: "calc(100vh - 118px)",
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Stack spacing={2} p={2}>
          <BackButton
            sx={{
              marginBottom: "0.2rem",
            }}
          />
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
                    onClick={handleBackToMessages}
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
                    <IconButton size="small" onClick={handleArchiveClick}>
                      <ArchiveIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleNewMessageClick}>
                      <EditIcon />
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
                  onClick={handleBackToMessages}
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
                  users={filteredUsers}
                  handleUserClick={handleUserSelect}
                />
              </Box>
            </Stack>
          </Box>
        ) : (
          <ChatList
            handleChatClick={onChatClick}
            searchQuery={searchQuery}
            showArchived={activeTab === 1}
            activeChat={activeChat}
          />
        )}
      </Box>
    </Box>
  );
}

export default MobileMessage;
