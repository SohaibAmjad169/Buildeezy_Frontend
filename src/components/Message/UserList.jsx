import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";

import UserListCard from "./UserListCard";
import UserListSkeleton from "../skeleton/UserListSkeleton";
import NoData from "../common/NoData";
import { useOnlineStatus } from "../../hooks/useOnlineStatus"; // Import the hook

function UserList({ users, handleUserClick, isCheckBoxRequired = false }) {
  const { loading } = useSelector((state) => state.config);
  const { onlineUsers } = useSelector((state) => state.pubnub);
  const [userList, setUserList] = useState(users);

  // Use the online status hook
  useOnlineStatus();

  useEffect(() => {
    // Merge users with their online status
    const usersWithOnlineStatus = users.map(user => ({
      ...user,
      isOnline: onlineUsers[user.id]?.isOnline || false,
      lastSeen: onlineUsers[user.id]?.lastSeen || 0
    }));
    
    setUserList(usersWithOnlineStatus);
  }, [users, onlineUsers]);

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "visible",
        maxHeight: "none",
        "::-webkit-scrollbar": { display: "none" },
      }}
    >
      {loading ? (
        <UserListSkeleton />
      ) : userList.length > 0 ? (
        userList.map((user, idx) => (
          <UserListCard
            key={user.id}
            user={user}
            onUserClick={() => handleUserClick(user)}
            isLast={idx === userList.length - 1}
            isCheckBoxRequired={isCheckBoxRequired}
          />
        ))
      ) : (
        <NoData />
      )}
    </Box>
  );
}

export default UserList;