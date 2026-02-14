import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { setAlert, setLoading } from "../../../redux/configSlice";
import { ALERT_TYPE } from "../../../utils/constants/config";
import AdminUserList from "../../../components/userManagement/AdminUserList";
import {
  activateUserUrl,
  banUserUrl,
  deactivateUserUrl,
  getAdminUsersUrl,
} from "../../../apis/apiEndPoints";
import MuiTypography from "../../../components/common/MuiTypography";
import { useSelector } from "react-redux";
import {
  setAdminUserList,
  setUserStateLoading,
} from "../../../redux/userManagementSlice";
import { cloneDeep } from "lodash";
import { colors } from "../../../styles/theme";
import { Box, Button, InputBase, useTheme } from "@mui/material";
import { SearchNormal1 } from "iconsax-react";
import Table from "../../../components/Table";
import { gridClasses } from "@mui/x-data-grid";
import { Edit2 } from "iconsax-react";
import { Trash } from "iconsax-react";

function UserManagement() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { adminUserList } = useSelector((state) => state.userManagement);

  async function fetchAdminUserList() {
    try {
      dispatch(setLoading(true));
      const response = await getAdminUsersUrl();
      dispatch(setAdminUserList(response.data.data));
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

  useEffect(() => {
    fetchAdminUserList();
  }, []);

  async function onActivateUser(userId, userIndex) {
    try {
      dispatch(setUserStateLoading(true));
      await activateUserUrl(userId);
      const newAdminUserList = cloneDeep(adminUserList);
      newAdminUserList[userIndex].status = 1;
      dispatch(setAdminUserList(newAdminUserList));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setUserStateLoading(false));
    }
  }

  async function onDeactivateUser(userId, userIndex) {
    try {
      dispatch(setUserStateLoading(true));
      await deactivateUserUrl(userId);
      const newAdminUserList = cloneDeep(adminUserList);
      newAdminUserList[userIndex].status = 3;
      dispatch(setAdminUserList(newAdminUserList));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setUserStateLoading(false));
    }
  }

  async function onBanUser(userId, userIndex) {
    try {
      dispatch(setUserStateLoading(true));
      await banUserUrl(userId);
      const newAdminUserList = cloneDeep(adminUserList);
      newAdminUserList[userIndex].status = 4;
      dispatch(setAdminUserList(newAdminUserList));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setUserStateLoading(false));
    }
  }

  const columns = [
    { field: "sl", headerName: "SL", flex: 1 },
    { field: "roleName", headerName: "Role Name", flex: 1 },
    { field: "permissions", headerName: "Permissions", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Edit2
            fontSize="small"
            color={mode === "dark" ? "#4caf50" : "#131A47"}
            onClick={() => handleEdit(params.row)}
          />
          <Trash
            fontSize="small"
            color="red"
            onClick={() => handleDelete(params.row)}
          />
        </Box>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      sl: 1,
      roleName: "Super Admin",
      permissions: 1,
      createdAt: "01-04-2024",
    },
  ];

  return (
    <>
      <MuiTypography variant="h1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
        {t("user_management.title")}
      </MuiTypography>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[300],
            borderRadius: 5,
            px: 2,
            height: 40,
            backgroundColor:
              mode === "dark" ? theme.palette.grey[900] : colors.white,
            flex: 1,
            maxWidth: 400,
          }}
        >
          <SearchNormal1
            size={18}
            style={{
              marginRight: 8,
              color: colors.grey500,
            }}
          />
          <InputBase
            placeholder="Search By Name Or Verification Select"
            fullWidth
            sx={{
              color: mode === "dark" ? colors.white : colors.black,
              "&::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
            }}
          />
        </Box>

        <Button
          variant="contained"
          sx={{
            ml: 2,
            height: 40,
            fontWeight: 600,
            borderRadius: 3,
          }}
        >
          Create Roles
        </Button>
      </Box>
      <Table
        sx={{
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#709A1C",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
        columns={columns}
        rows={rows}
        totalRecords={rows.length}
        paginationModel={{ page: 0, pageSize: 5 }}
        setPaginationModel={() => {}}
      />
      {/* <AdminUserList
        adminUserList={adminUserList}
        handleActivateUser={onActivateUser}
        handleDeactivateUser={onDeactivateUser}
        handleBanUser={onBanUser}
      /> */}
    </>
  );
}

export default UserManagement;
