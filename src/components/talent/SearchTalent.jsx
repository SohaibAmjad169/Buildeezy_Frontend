import { useState, useEffect } from "react";
import { Box, Stack, TextField, InputAdornment, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { SearchNormal1 } from "iconsax-react";
import { useDispatch } from "react-redux";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import MuiTypography from "../common/MuiTypography";
import MuiBreadcrumbs from "../common/Breadcrumbs";
import { searchUserUrl, getUsers } from "../../apis/apiEndPoints";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { USER_TYPES } from "../../utils/constants/login";
import { ROUTES } from "../../utils/constants/route";
import UsersList from "./UsersList";
import FindMoreTalentsDialog from "./FindMoreTalentsDialog";

function SearchTalent({ onSelectTalent, jobDetails }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dialogUsers, setDialogUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        const professionals = response.data.data.filter(
          (user) =>
            user.userType === USER_TYPES.specialist ||
            user.userType === USER_TYPES.contractor
        );
        setAllUsers(professionals);
        setFilteredUsers(professionals);
        setDialogUsers(professionals);
      } catch (error) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error.message,
          })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [dispatch]);

  const handleSearch = async (query, updateDialog = false) => {
    if (query.length < 3) {
      if (updateDialog) {
        setDialogUsers(allUsers);
      } else {
        setFilteredUsers(allUsers);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await searchUserUrl(query);
      const professionals = response.data.data.filter(
        (user) =>
          user.userType === USER_TYPES.specialist ||
          user.userType === USER_TYPES.contractor
      );
      if (updateDialog) {
        setDialogUsers(professionals);
      } else {
        setFilteredUsers(professionals);
      }
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setFilteredUsers(allUsers);
    }
  }, [searchQuery, allUsers]);

  useEffect(() => {
    if (dialogSearchQuery.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleSearch(dialogSearchQuery, true);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setDialogUsers(allUsers);
    }
  }, [dialogSearchQuery, allUsers]);

  const handleInviteToBid = async (user) => {
    if (onSelectTalent) {
      onSelectTalent(user);
    }
    setDialogOpen(false);

    // Redirect to job details page with update dialog open and selected talent info
    const jobDetailsPath = window.location.pathname.replace("/add-talent", "");
    navigate(`${jobDetailsPath}?tab=job_details&openUpdateDialog=true`, {
      state: { selectedTalent: user },
    });
  };

  const pastLinks = [
    {
      label: t("breadcrumbs.my_contracts"),
      path: "/" + ROUTES.myContracts,
    },
    {
      label: t("details"),
      path:
        window.location.pathname.replace("/add-talent", "") +
        "?tab=job_details",
    },
    {
      label: t("milestone.milestone"),
      path:
        window.location.pathname.replace("/add-talent", "") + "?tab=milestone",
    },
  ];

  const activeLink = {
    label: t("milestone.add_talent"),
  };

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
            width: { xs: "100%", lg: "70%" },
          }}
        >
          <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            my={2}
          >
            <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
              {t("milestone.add_talent")}
            </MuiTypography>
          </Stack>

          <Divider />

          <Box sx={{ mt: 3 }}>
            {/* Mobile layout */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  bgcolor: "background.paper",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "#D0D5DD",
                  boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                  p: "4px 4px 4px 12px",
                  height: "44px",
                }}
              >
                <TextField
                  fullWidth
                  placeholder={t("milestone.search_talent")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchNormal1
                          size={20}
                          color="#667085"
                          style={{ marginRight: "8px" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      border: "none",
                      height: "36px",
                      "& fieldset": {
                        border: "none",
                      },
                      "& input": {
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#101828",
                        "&::placeholder": {
                          color: "#667085",
                          opacity: 1,
                          fontSize: "14px",
                        },
                      },
                    },
                  }}
                />
              </Box>
              <Box
                component="button"
                onClick={() => setDialogOpen(true)}
                sx={{
                  bgcolor: "#709a1c10",
                  color: "#709a1c",
                  px: "12px",
                  height: "44px",
                  width: "100%",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  border: "solid 1px #709a1c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Find more talents
              </Box>
            </Box>

            {/* Desktop layout */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1.5,
                bgcolor: "background.paper",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "#D0D5DD",
                boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                p: "4px 4px 4px 12px",
                height: "44px",
              }}
            >
              <TextField
                fullWidth
                placeholder={t("milestone.search_talent")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchNormal1
                        size={20}
                        color="#667085"
                        style={{ marginRight: "8px" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    border: "none",
                    height: "36px",
                    "& fieldset": {
                      border: "none",
                    },
                    "& input": {
                      padding: "8px 0",
                      fontSize: "14px",
                      color: "#101828",
                      "&::placeholder": {
                        color: "#667085",
                        opacity: 1,
                        fontSize: "14px",
                      },
                    },
                  },
                }}
              />
              <Box
                component="button"
                onClick={() => setDialogOpen(true)}
                sx={{
                  bgcolor: "#709a1c10",
                  color: "#709a1c",
                  px: "12px",
                  height: "32px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  border: "solid 1px #709a1c",
                  display: "flex",
                  alignItems: "center",
                  mr: "2px",
                }}
              >
                Find more talents
              </Box>
            </Box>
          </Box>

          {/* Results section */}
          <Box sx={{ mt: 3 }}>
            <UsersList
              users={filteredUsers}
              onSelectUser={handleInviteToBid}
              loading={loading}
              searchQuery={searchQuery}
              jobDetails={jobDetails}
            />
            {filteredUsers.length === 0 && (
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "#6B7280",
                  mt: 4,
                }}
              >
                {t("talent_filters.no_talents_found")}
              </Typography>
            )}
          </Box>

          <FindMoreTalentsDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            users={dialogUsers}
            onSelectUser={handleInviteToBid}
            loading={loading}
            searchQuery={dialogSearchQuery}
            onSearchChange={setDialogSearchQuery}
          />
        </Box>
      </Box>
    </Box>
  );
}

SearchTalent.propTypes = {
  onSelectTalent: PropTypes.func,
  jobDetails: PropTypes.object,
};

export default SearchTalent;
