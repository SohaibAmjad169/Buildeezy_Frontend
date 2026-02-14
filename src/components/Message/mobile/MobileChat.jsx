import { useState, useRef, useEffect, useTransition } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Stack, Card, Button } from "@mui/material";
import ArrowLeft from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";

import MobileChatHeader from "./MobileChatHeader";
import ReceivedMsg from "../ReceivedMsg";
import SentMsg from "../SentMsg";
import MobileSendMessage from "./MobileSendMessage";
import { PUBNUB_CHANNEL } from "../../../utils/constants/config";
import {
  addAllMessage,
  addMessage,
  setMsgLoading,
} from "../../../redux/pubnubSlice";
import { getTimetokenDaysAgo } from "../../../utils/common";

function MobileChat({
  activeChat,
  onBack,
  showArchived,
  setShowArchived,
  onProfileVisibilityChange,
}) {
  const dispatch = useDispatch();
  const chatContainerRef = useRef(null);
  const { t } = useTranslation();

  const { messages, archivedChats, pubnubInstance } = useSelector(
    (state) => state.pubnub
  );
  const { profileData } = useSelector((state) => state.profile);

  const [newMessage, setNewMessage] = useState("");

  // Get the channel ID for the current chat
  const users = [profileData.id, activeChat.chatUserId].sort();
  const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;

  // Get messages for the current chat and create a sorted copy
  const chatMessages = [
    ...(showArchived
      ? archivedChats[channelId] || []
      : messages[channelId] || []),
  ].sort((a, b) => a.time - b.time);

  function onMessageChange(id, value) {
    setNewMessage(value);
  }

  function onSendMessage() {
    if (newMessage.trim() !== "" && pubnubInstance) {
      const message = {
        text: newMessage,
        senderId: profileData.id,
        sender: profileData.firstName + " " + profileData.lastName,
        receiverId: activeChat.chatUserId,
        receiver: activeChat.chatUserName,
        time: new Date().getTime(),
      };

      pubnubInstance.publish({
        channel: channelId,
        message: message,
        storeInHistory: true,
      });

      dispatch(addMessage({ channelId, message }));
      setNewMessage("");
    }
  }

  function handleViewProfile() {
    onProfileVisibilityChange?.(true);
  }

  function fetchMessages() {
    dispatch(setMsgLoading(true));

    pubnubInstance.history(
      {
        channel: channelId,
        reverse: true,
        start: getTimetokenDaysAgo(8), // Fetch messages from the last 8 days
      },
      (status, response) => {
        if (status.error) {
          console.error("Error fetching messages:", status);
          dispatch(setMsgLoading(false));
        } else {
          const allMessages = response.messages.map((msg) => ({
            ...msg.entry,
            time: msg.timetoken / 10000,
          }));
          dispatch(addAllMessage({ channelId, messages: allMessages }));
          dispatch(setMsgLoading(false));
        }
      }
    );
  }

  useEffect(() => {
    if (activeChat.chatUserId) {
      fetchMessages();
    }
  }, [activeChat.chatUserId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Stack sx={{ height: "80vh", width: "100%", p: 0, m: 0 }}>
      <Button
        startIcon={<ArrowLeft />}
        onClick={onBack}
        size="small"
        sx={{
          mt: 2,
          ml: 2,
          color: "success.main",
          background: "none",
          boxShadow: "none",
          p: 0,
          minWidth: 0,
          fontWeight: 500,
          fontSize: "1.1rem",
          mb: 2,
          alignSelf: "flex-start",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        {t("message.all_messages")}
      </Button>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 1,
          p: 0,
          width: "100%",
          maxWidth: "100%",
          mx: 0,
          my: 0,
          background: "#fff",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          height: "calc(100vh - 118px)",
          position: "relative",
        }}
      >
        <MobileChatHeader
          user={activeChat}
          onBack={onBack}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          onViewProfile={handleViewProfile}
        />

        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            minHeight: 200,
            maxHeight: "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pb: 2,
            mb: 8,
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          }}
        >
          {chatMessages.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{ color: "#bbb", fontSize: "0.8rem", fontWeight: 400 }}
              >
                No Data Found
              </span>
            </Box>
          ) : (
            chatMessages.map(({ senderId, sender, text, time }, index) => {
              if (senderId === profileData.id) {
                return <SentMsg key={index} msg={text} time={time} />;
              } else {
                return (
                  <ReceivedMsg
                    key={index}
                    sender={sender}
                    msg={text}
                    time={time}
                    avatar={activeChat.avatar}
                    channelId={channelId}
                  />
                );
              }
            })
          )}
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "#fff",
            zIndex: 10,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <MobileSendMessage
            msg={newMessage}
            handleValueChange={onMessageChange}
            handleSendMessage={onSendMessage}
          />
        </Box>
      </Card>
    </Stack>
  );
}

export default MobileChat;
