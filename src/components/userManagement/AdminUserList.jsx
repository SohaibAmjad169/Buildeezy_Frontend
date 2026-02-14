import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import UserListSkeleton from "../skeleton/UserListSkeleton";
import NoData from "../common/NoData";
import AdminUserCard from "./AdminUserCard";

function AdminUserList({
  adminUserList,
  handleActivateUser,
  handleDeactivateUser,
  handleBanUser,
}) {
  const { loading } = useSelector((state) => state.config);

  return (
    <Box>
      {loading ? (
        <UserListSkeleton />
      ) : adminUserList.length > 0 ? (
        adminUserList.map((user, index) => (
          <AdminUserCard
            key={user}
            user={user}
            userIndex={index}
            onActivateUser={handleActivateUser}
            onDeactivateUser={handleDeactivateUser}
            onBanUser={handleBanUser}
          />
        ))
      ) : (
        <NoData />
      )}
    </Box>
  );
}

export default AdminUserList;
