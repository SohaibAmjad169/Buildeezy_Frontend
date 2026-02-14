import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Stack, useTheme, useMediaQuery, Typography } from "@mui/material";

import ChatHeader from "./ChatHeader";
import ReceivedMsg from "./ReceivedMsg";
import SentMsg from "./SentMsg";
import SendMessage from "./SendMessage";
import UserProfile from "./UserProfile";
import { PUBNUB_CHANNEL } from "../../utils/constants/config";
import {
  addAllMessage,
  addMessage,
  setMsgLoading,
  replaceChannelMessages,
  setUserOnlineStatus
} from "../../redux/pubnubSlice";
import { getTimetokenDaysAgo } from "../../utils/common";
import { notifyForNewMessage } from "../../apis/apiEndPoints";
import { useCallback } from "react";

function Chat({
  activeChat,
  onBack,
  showArchived,
  setShowArchived,
  onProfileVisibilityChange,
}) {
  if (!activeChat || !activeChat.chatUserId) return null;

  const dispatch = useDispatch();
  const chatContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(null);
  const previousScrollHeight = useRef(0)
  const isFirstLoad = useRef(true);
  const skipScrollEffectRef = useRef(false);

  const [showProfile, setShowProfile] = useState(false);
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [showLoadingText, setShowLoadingText] = useState(false);
  const [oldestMessageToken, setOldestMessageToken] = useState(null);


  const { messages, archivedChats, pubnubInstance, userList } = useSelector(
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
    const messageTime = new Date().getTime();
    const message = {
      text: newMessage,
      senderId: profileData.id,
      sender: profileData.firstName + " " + profileData.lastName,
      receiverId: activeChat.chatUserId,
      receiver: activeChat.chatUserName,
      time: messageTime,
      timetoken: messageTime * 10000, // Convert to PubNub timetoken format
    };

    // Add user to userList if not present
    const exists = userList.some(u => u.id === activeChat.chatUserId);
    if (!exists) {
      const newUser = {
        id: activeChat.chatUserId,
        firstName: activeChat.chatUserName?.split(' ')[0] || activeChat.chatUserName,
        lastName: activeChat.chatUserName?.split(' ').slice(1).join(' ') || '',
        avatar: activeChat.avatar || '',
      };
      dispatch({ type: 'pubnub/setUserList', payload: [...userList, newUser] });
    }

    // Add message to Redux immediately with isFromSend flag
    dispatch(addMessage({ 
      channelId, 
      message, 
      isFromSend: true // This flag tells Redux to add immediately
    }));

    // Clear input immediately
    setNewMessage("");

    // Then publish to PubNub
    pubnubInstance.publish({
      channel: channelId,
      message: message,
      storeInHistory: true,
    }, (status, response) => {
      if (status.error) {
        console.error("Failed to send message:", status);
        // Optionally handle error - maybe show a retry button
      }
    });

    // Send notification
    if (profileData?.id && activeChat?.chatUserId) {
      notifyNewMessage({
        fromUser: profileData?.id,
        toUser: activeChat?.chatUserId,
        content: newMessage,
      });
    }
  }
}


  async function notifyNewMessage(payload) {
    try {
      const response = await notifyForNewMessage(payload);
    } catch (err) {
      console.error("Error notifyNewMessage:", err);
    } finally {
    }
  }

  function handleViewProfile() {
    setShowProfile(true);
    onProfileVisibilityChange?.(true);
  }

  function handleCloseProfile() {
    setShowProfile(false);
    onProfileVisibilityChange?.(false);
  }

 function fetchMessages() {
  if (!pubnubInstance) {
    console.warn("PubNub instance not ready, skipping fetchMessages");
    return;
  }
  dispatch(setMsgLoading(true));

  pubnubInstance.history(
    {
      channel: channelId,
      reverse: false,
      count: 20,
    },
    (status, response) => {
      if (status.error) {
        console.error("Error fetching messages:", status);
        dispatch(setMsgLoading(false));
      } else {
        const allMessages = response.messages.map((msg) => ({
          ...msg.entry,
          time: msg.timetoken / 10000,
          timetoken: msg.timetoken,
        }));
        
        // Use replaceChannelMessages for initial load to prevent duplicates
        dispatch(replaceChannelMessages({ channelId, messages: allMessages }));
        dispatch(setMsgLoading(false));
      }
    }
  );
}

  function fetchOldestMessageToken() {
    if (!pubnubInstance || !channelId) {
      console.warn("PubNub instance or channelId missing.");
      return;
    }

    pubnubInstance.history(
      {
        channel: channelId,
        reverse: true, // fetch oldest first
        count: 1,      // only fetch 1 message (the oldest)
      },
      (status, response) => {
        if (status.error) {
          console.error("Error fetching oldest message:", status);
          return;
        }

        const firstMessage = response.messages[0];

        if (firstMessage) {
          const token = firstMessage.timetoken;
          setOldestMessageToken(token);
        } else {
          console.log("ℹNo messages found in channel.");
        }
      }
    );
  }

  const fetchOldMessageByTimeToken = useCallback(() => {
    if (!pubnubInstance || showLoadingText) return
    if (!chatMessages || chatMessages.length === 0) return

    const chatOldToken = chatMessages[0]?.timetoken
    if (oldestMessageToken === chatOldToken) {
      return
    }

    setShowLoadingText(true)
    setShowLoadingText(true)

    // Store current scroll height before loading new messages
    const container = chatContainerRef.current
    if (container) {
      previousScrollHeight.current = container.scrollHeight
    }

    const oldestChatTimeToken = chatMessages[0]?.timetoken;
    const oldestMessageTimeToken = messages[0]?.timetoken

    pubnubInstance.history(
      {
        channel: channelId,
        reverse: false,
        count: 20,
        start: oldestChatTimeToken - 1,
        end: oldestMessageTimeToken - 1,
      },
      (status, response) => {
        setShowLoadingText(false)
        setShowLoadingText(false)

        if (status.error) {
          console.error("Error fetching messages:", status)
          return
        }

        const newMessages = response.messages.map((msg) => ({
          ...msg.entry,
          time: msg.timetoken / 10000,
          timetoken: msg.timetoken,
        }))

        const existingTimes = new Set(chatMessages.map((msg) => msg.timetoken))
        const uniqueMessages = newMessages.filter((msg) => !existingTimes.has(msg.timetoken))

        if (uniqueMessages.length === 0) {
          skipScrollEffectRef.current = true
          return
        }

        dispatch(addAllMessage({ channelId, messages: uniqueMessages }))
      },
    )
  }, [pubnubInstance, chatMessages, channelId, oldestMessageToken, showLoadingText, dispatch])

  // Handle scroll to load more messages
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current
    if (!container || showLoadingText) return

    // Load more messages when scrolled to top
    if (container.scrollTop <= 5 && chatMessages.length > 0) {
      const chatOldToken = chatMessages[0]?.timetoken
      if (chatOldToken !== oldestMessageToken) {
        fetchOldMessageByTimeToken()
      }
    }
  }, [chatMessages, oldestMessageToken, fetchOldMessageByTimeToken, showLoadingText])

  // Initial load effect
  useEffect(() => {
    if (activeChat.chatUserId && pubnubInstance) {
      fetchMessages()
      fetchOldestMessageToken()
    }
  }, [activeChat.chatUserId, pubnubInstance])

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    if (skipScrollEffectRef.current) {
      skipScrollEffectRef.current = false
      return
    }

    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight
    }

    if (isFirstLoad.current) {
      // First load - scroll to bottom
      requestAnimationFrame(() => {
        scrollToBottom()
        isFirstLoad.current = false
        previousScrollHeight.current = container.scrollHeight
      })
    } else {
      // Subsequent loads - maintain scroll position
      const newScrollHeight = container.scrollHeight
      const heightDiff = newScrollHeight - previousScrollHeight.current

      if (heightDiff > 0) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollTop + heightDiff
          previousScrollHeight.current = newScrollHeight
        })
      }
    }
  }, [chatMessages])

  // Scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Reset first load flag when chat changes
  useEffect(() => {
    isFirstLoad.current = true
    setShowLoadingText(false)
  }, [activeChat.chatUserId])
  

  return (
    <>
      {isTablet && showProfile ? (
        <UserProfile
          user={activeChat}
          onClose={handleCloseProfile}
          sx={{ width: "100%", maxWidth: "100%" }}
        />
      ) : (
        <Stack
          direction="row"
          sx={{ height: "100%", width: "100%", display: "flex" }}
        >
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <ChatHeader
              user={activeChat}
              onBack={onBack}
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              onViewProfile={handleViewProfile}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "calc(100vh - 199px)",
              }}
            >
              <Box
                ref={chatContainerRef}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  my: 1.5,
                  flexGrow: 1,
                  maxHeight: "calc(100vh - 372px)",
                  overflow: "auto",
                }}
              >
                {chatMessages.map(({ senderId, sender, text, time }, index) => {
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
                })}
              </Box>
              {!showArchived && (
                <SendMessage
                  msg={newMessage}
                  handleValueChange={onMessageChange}
                  handleSendMessage={onSendMessage}
                />
              )}
            </Box>
          </Stack>
          {showProfile && (
            <UserProfile user={activeChat} onClose={handleCloseProfile} />
          )}
        </Stack>
      )}
    </>
  );
}

export default Chat;


