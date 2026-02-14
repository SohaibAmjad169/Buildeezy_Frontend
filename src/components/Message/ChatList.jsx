import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import ChatListCard from "./ChatListCard";
import NoData from "../common/NoData";

function ChatList({ handleChatClick, searchQuery, showArchived, activeChat }) {
  const { loading } = useSelector((state) => state.config);
  const { messages, archivedChats, userList, channelsUnreadCount } = useSelector(
    (state) => state.pubnub
  );
  const { profileData } = useSelector((state) => state.profile);

  // Get all unique users from messages
  const allChats = Object.entries(
    showArchived ? archivedChats : messages
  ).reduce((acc, [channelId, channelMessages]) => {
    if (!channelMessages || channelMessages.length === 0) return acc;

    // Get the last message for this channel
    const lastMessage = channelMessages.reduce(
      (latest, msg) => (msg.time > latest.time ? msg : latest),
      channelMessages[0]
    );

    // Determine the other user in the conversation
    const otherUserId =
      lastMessage.senderId === profileData.id
        ? lastMessage.receiverId
        : lastMessage.senderId;

    const otherUserName =
      lastMessage.senderId === profileData.id
        ? lastMessage.receiver
        : lastMessage.sender;

    // Find user details from userList
    const userDetails = userList.find((user) => user.id === otherUserId);

    if (userDetails) {
      acc[otherUserId] = {
        ...lastMessage,
        chatUserId: otherUserId,
        chatUserName: otherUserName,
        avatar: userDetails?.avatar,
        channelId: channelId,
        unreadCount: channelsUnreadCount[channelId] || 0,
      };
    }

    return acc;
  }, {});

  // Convert to array and sort by latest message
  const sortedChats = Object.values(allChats)
    .sort((a, b) => b.time - a.time)
    .filter((chat) => {
      if (!searchQuery) return true;
      return (
        chat.chatUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <Box
      sx={{
        maxHeight: "calc(100vh - 280px)", // Adjusted for tabs, search and header
        overflow: "auto",
      }}
    >
      {loading ? (
        <NoData />
      ) : sortedChats.length > 0 ? (
        sortedChats.map((chat) => (
          <ChatListCard
            key={chat.chatUserId}
            chat={chat}
            onClick={() => handleChatClick(chat)}
            selected={activeChat?.chatUserId === chat.chatUserId}
          />
        ))
      ) : (
        <NoData />
      )}
    </Box>
  );
}

export default ChatList;
