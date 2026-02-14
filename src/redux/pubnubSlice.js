import { createSlice } from "@reduxjs/toolkit";

// Initial state for PubNub
const initialState = {
  pubnubInstance: null,
  messages: {},
  userList: [],
  msgLoading: false,
  archivedChats: {},
  onlineUsers: {},
  presenceChannels: [],
  channelsLastSeen: JSON.parse(localStorage.getItem("channelsLastSeen")) || {},
  channelsUnreadCount: {},
};

// Helper function to create unique message identifier
const getMessageId = (message) => {
  if (message.timetoken) {
    return message.timetoken.toString();
  }
  // For sent messages, use a combination that's more unique
  return `${message.time}_${message.senderId}_${message.text}_${message.receiverId}`;
};

// Helper function to deduplicate messages
const deduplicateMessages = (messages) => {
  const seen = new Set();
  return messages.filter(message => {
    const id = getMessageId(message);
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

// Create slice to manage PubNub state
const pubnubSlice = createSlice({
  name: "pubnub",
  initialState,
  reducers: {
    setPubNubInstance: (state, action) => {
      state.pubnubInstance = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const { channelId, message, isFromSend = false } = action.payload;
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      
      // For sent messages, always add immediately (less strict checking)
      if (isFromSend) {
        state.messages[channelId].push(message);
        state.messages[channelId].sort((a, b) => a.time - b.time);
        return;
      }
      
      // For received messages, check for duplicates more carefully
      const messageId = getMessageId(message);
      const existingMessage = state.messages[channelId].find(msg => {
        const existingId = getMessageId(msg);
        return existingId === messageId;
      });
      
      if (!existingMessage) {
        state.messages[channelId].push(message);
        state.messages[channelId].sort((a, b) => a.time - b.time);
      }
    },
    addAllMessage: (state, action) => {
      const { channelId, messages, currentUser } = action.payload;
      
      if (!Array.isArray(messages) || messages.length === 0) {
        return;
      }

      const existingMessages = state.messages[channelId] || [];
      const allMessages = [...existingMessages, ...messages];
      const uniqueMessages = deduplicateMessages(allMessages);
      uniqueMessages.sort((a, b) => a.time - b.time);
      
      // update channelsUnreadCount

      const lastSeen = state.channelsLastSeen[channelId] ?? 0;
      let unreadCount = 0;
      for (let i = uniqueMessages.length - 1; i >= 0; i--) {
        if ((!currentUser || uniqueMessages[i].senderId !== currentUser) && uniqueMessages[i].time > lastSeen) {
          unreadCount = unreadCount + 1;
        } else {
          break;
        }
      }

      state.channelsUnreadCount[channelId] = unreadCount; 
      
      state.messages[channelId] = uniqueMessages;
    },
    replaceChannelMessages: (state, action) => {
      const { channelId, messages } = action.payload;
      const uniqueMessages = deduplicateMessages(messages || []);
      uniqueMessages.sort((a, b) => a.time - b.time);
      state.messages[channelId] = uniqueMessages;
    },
    setUserList: (state, action) => {
      state.userList = action.payload;
    },
    setMsgLoading: (state, action) => {
      state.msgLoading = action.payload;
    },
    // Online status management
    setUserOnlineStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;
      state.onlineUsers[userId] = {
        isOnline,
        lastSeen: lastSeen || new Date().getTime()
      };
    },
    updateMultipleUsersOnlineStatus: (state, action) => {
      const { usersStatus } = action.payload;
      Object.keys(usersStatus).forEach(userId => {
        state.onlineUsers[userId] = usersStatus[userId];
      });
    },
    addPresenceChannel: (state, action) => {
      const { channelId } = action.payload;
      if (!state.presenceChannels.includes(channelId)) {
        state.presenceChannels.push(channelId);
      }
    },
    removePresenceChannel: (state, action) => {
      const { channelId } = action.payload;
      state.presenceChannels = state.presenceChannels.filter(ch => ch !== channelId);
    },
    archiveChat: (state, action) => {
      const { channelId } = action.payload;
      if (state.messages[channelId]) {
        state.archivedChats[channelId] = state.messages[channelId];
        delete state.messages[channelId];
      }
    },
    unarchiveChat: (state, action) => {
      const { channelId } = action.payload;
      if (state.archivedChats[channelId]) {
        state.messages[channelId] = state.archivedChats[channelId];
        delete state.archivedChats[channelId];
      }
    },
    clearChannelMessages: (state, action) => {
      const { channelId } = action.payload;
      delete state.messages[channelId];
    },
    setChannelsLastSeen: (state, action) => {
      state.channelsLastSeen = {...state.channelsLastSeen, [action.payload.channelId]: action.payload.lastSeen};
      // update channelsUnreadCount
      const lastSeen = state.channelsLastSeen[action.payload.channelId] ?? 0;
      const unreadCount = state.messages[action.payload.channelId].filter(msg => msg.time > lastSeen).length;
      state.channelsUnreadCount[action.payload.channelId] = unreadCount;
      localStorage.setItem("channelsLastSeen", JSON.stringify(state.channelsLastSeen));
    },
    incrementChannelsUnreadCount: (state, action) => {
      state.channelsUnreadCount[action.payload.channelId] = state.channelsUnreadCount[action.payload.channelId] + 1;
    },
  },
});

export const {
  setPubNubInstance,
  setMessages,
  addMessage,
  setUserList,
  addAllMessage,
  replaceChannelMessages,
  setMsgLoading,
  setUserOnlineStatus,
  updateMultipleUsersOnlineStatus,
  addPresenceChannel,
  removePresenceChannel,
  archiveChat,
  unarchiveChat,
  clearChannelMessages,
  setChannelsLastSeen,
  incrementChannelsUnreadCount,
} = pubnubSlice.actions;

export default pubnubSlice.reducer;