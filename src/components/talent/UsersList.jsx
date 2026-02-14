import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Skeleton,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import ActionButton from "../common/ActionButton";
import { USER_TYPES } from "../../utils/constants/login";
import { useNavigate, useLocation } from "react-router-dom";
import UpdateJobDialog from "../viewJobDetails/UpdateJobDialog";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { useTranslation } from "react-i18next";

function UsersList({ users, loading, emptyMessage, searchQuery, jobDetails }) {
  const { t } = useTranslation();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const truncateEmail = (email) => {
    if (email.length > 30) {
      return `${email.substring(0, 27)}...`;
    }
    return email;
  };

  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        if (prev.length >= 5) {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.warning,
              message: t("milestone.max_users_reached"),
            })
          );
          return prev;
        }
        return [...prev, user];
      }
    });
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
  };

  const handleUpdateJob = (jobData) => {
    // Get the contract ID from the current path
    const pathParts = location.pathname.split("/");
    const contractId = pathParts[2];

    // Close the dialog after updating
    setOpenUpdateDialog(false);

    // Optionally navigate back to the contract details page
    navigate(`/my-contracts/view/${contractId}?tab=job_details`);
  };

  // Ensure handlePreview passes both formData and jobDetails to preview page
  const handlePreview = (formData) => {
    const pathParts = location.pathname.split("/");
    const contractId = pathParts[2];
    navigate(`/my-contracts/view/${contractId}/preview`, {
      state: {
        formData,
        originalJobDetails: jobDetails,
        selectedUsers,
        isInviteToBid: true,
      },
    });
  };

  const handleAvatarClick = (user) => {
    // navigate(`/profile/${user.id}`);
    navigate(`/dashboard/view/${user.id}/profile`);
  };

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        {Array.from(new Array(3)).map((_, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="rectangular" width={100} height={36} />
            </Stack>
          </Box>
        ))}
      </Box>
    );
  }

  if (!users?.length) {
    return (
      <Typography variant="body1" color="text.secondary" align="center">
        {emptyMessage || "No results found"}
      </Typography>
    );
  }

  return (
    <Box sx={{ height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", lg: "100%" },
            maxWidth: "1200px",
          }}
        >
          {/* Title and Invite to Bid button in one line */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: "1.125rem", fontWeight: 500, color: "#101828" }}
            >
              {searchQuery && searchQuery.length >= 3
                ? t("milestone.search_results")
                : t("milestone.available_talent")}
            </Typography>
            <ActionButton
              variant="contained"
              onClick={() => setOpenUpdateDialog(true)}
              disabled={selectedUsers.length === 0}
              sx={{
                bgcolor: "#709a1c",
                color: "white",
                "&:hover": { bgcolor: "#5c8017" },
                "&.Mui-disabled": { bgcolor: "grey.300", color: "grey.500" },
              }}
            >
              Invite to Bid
            </ActionButton>
          </Stack>
          <Box sx={{ mt: 3 }}>
            {users.map((user) => (
              <Box
                key={user.id}
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow:
                    "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
                  border: "1px solid #E4E7EC",
                  "&:hover": {
                    boxShadow:
                      "0px 4px 8px rgba(16, 24, 40, 0.1), 0px 2px 4px rgba(16, 24, 40, 0.06)",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      sx={{
                        width: 48,
                        height: 48,
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8,
                        },
                      }}
                      onClick={() => handleAvatarClick(user)}
                    >
                      {user.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          mb: 0.5,
                          fontSize: "1.125rem",
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 1, sm: 1 }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Tooltip
                          title={user.email}
                          placement="top"
                          arrow
                          enterTouchDelay={0}
                          leaveTouchDelay={3000}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              color: "text.secondary",
                              fontSize: { sm: "0.8rem" },
                              maxWidth: { xs: "100%", sm: "300px" },
                              fontWeight: 400,
                              cursor: "pointer",
                              display: "block",
                              "& .mobile-email": {
                                display: { xs: "block", sm: "none" },
                              },
                              "& .desktop-email": {
                                display: { xs: "none", sm: "block" },
                              },
                              "&:hover": {
                                color: "text.primary",
                              },
                            }}
                          >
                            <span className="mobile-email">
                              {truncateEmail(user.email)}
                            </span>
                            <span className="desktop-email">{user.email}</span>
                          </Typography>
                        </Tooltip>
                        {user.userType === USER_TYPES.specialist && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.875rem",
                                display: { xs: "none", sm: "block" },
                              }}
                            >
                              •
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "primary.main",
                                bgcolor: "primary.lighter",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                alignSelf: { xs: "flex-start", sm: "center" },
                              }}
                            >
                              Professional
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <ActionButton
                      variant={
                        selectedUsers.some((u) => u.id === user.id)
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => handleSelectUser(user)}
                      sx={{
                        borderRadius: "8px",
                        minWidth: "100px",
                        ...(selectedUsers.some((u) => u.id === user.id)
                          ? {
                            bgcolor: "#709a1c",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#5c8017",
                            },
                          }
                          : {
                            color: "grey.700",
                            borderColor: "grey.300",
                            "&:hover": {
                              borderColor: "grey.400",
                              backgroundColor: "grey.50",
                            },
                          }),
                      }}
                    >
                      {selectedUsers.some((u) => u.id === user.id)
                        ? "Selected"
                        : "Select"}
                    </ActionButton>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>

          <UpdateJobDialog
            open={openUpdateDialog}
            onClose={handleCloseUpdateDialog}
            onSubmit={handleUpdateJob}
            onPreview={handlePreview}
            selectedUsers={selectedUsers}
            isInviteToBid={true}
            jobDetails={jobDetails}
          />
        </Box>
      </Box>
    </Box>
  );
}

UsersList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      userType: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  emptyMessage: PropTypes.string,
  searchQuery: PropTypes.string,
  jobDetails: PropTypes.object,
};

export default UsersList;
