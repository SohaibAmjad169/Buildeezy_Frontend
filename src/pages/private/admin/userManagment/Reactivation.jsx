import { Close } from "@mui/icons-material";
import { SearchNormal1 } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { gridClasses } from "@mui/x-data-grid";
import Table from "../../../../components/Table";
import { colors } from "../../../../styles/theme";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { setAlert, setLoading } from "../../../../redux/configSlice";
import MuiTypography from "../../../../components/common/MuiTypography";
import AdListSkeleton from "../../../../components/skeleton/AdListSkeleton";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  Box,
  InputBase,
  useTheme,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  getAdminReactivationUrl,
  adminActivateUserUrl,
  adminDeactivateUserUrl,
} from "../../../../apis/apiEndPoints";

function Reactivation() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fetchReactivationData = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      const { page, pageSize } = paginationModel;

      const { data: res } = await getAdminReactivationUrl({
        page: page + 1,
        limit: pageSize,
      });

      const formattedRows = res.data.map((item) => ({
        id: item.userId,
        userId: item.userId,
        name: item.name,
        reason: item.reason,
        requestDate: item.requestDate,
        userType: item.userType,
      }));

      setRows(formattedRows);
      setTotalRecords(res.meta.totalRecords);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: "error",
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, paginationModel]);

  const handleActivateUser = async (userId) => {
    try {
      dispatch(setLoading(true));
      await adminActivateUserUrl(userId);
      dispatch(
        setAlert({
          show: true,
          type: "success",
          message: "User activated successfully",
        })
      );
      fetchReactivationData();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: "error",
          message: err.response?.data?.message || err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
      setOpenConfirmDialog(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      dispatch(setLoading(true));
      await adminDeactivateUserUrl(userId);
      dispatch(
        setAlert({
          show: true,
          type: "success",
          message: "User deactivated successfully",
        })
      );
      fetchReactivationData();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: "error",
          message: err.response?.data?.message || err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
      setOpenConfirmDialog(false);
    }
  };

  const handleOpenDialog = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setOpenConfirmDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedUser(null);
    setActionType("");
  };

  const handleConfirmAction = () => {
    if (actionType === "activate" && selectedUser) {
      handleActivateUser(selectedUser.userId);
    } else if (actionType === "deactivate" && selectedUser) {
      handleDeactivateUser(selectedUser.userId);
    }
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const paginatedRows = filteredRows.slice(
    paginationModel.page * paginationModel.pageSize,
    (paginationModel.page + 1) * paginationModel.pageSize
  );

  useEffect(() => {
    fetchReactivationData();
  }, [fetchReactivationData]);

  if (loading) {
    return <AdListSkeleton />;
  }

  const columns = [
    { field: "name", headerName: t("admin_reactivation.name"), flex: 1 },
    { field: "reason", headerName: t("admin_reactivation.reason"), flex: 1 },
    {
      field: "userType",
      headerName: t("admin_reactivation.user_type"),
      flex: 1,
    },
    {
      field: "requestDate",
      headerName: t("admin_reactivation.request_date"),
      flex: 1,
    },
    {
      field: "action",
      headerName: t("admin_reactivation.action"),
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <IconButton
            size="large"
            onClick={() => handleOpenDialog(params.row, "activate")}
            sx={{
              backgroundColor: colors.primaryMain,
              color: "#709A1C",
            }}
          >
            <CheckCircleOutlineIcon size={16} />
          </IconButton>
          <IconButton
            size="large"
            onClick={() => handleOpenDialog(params.row, "deactivate")}
            sx={{
              backgroundColor: colors.errorLight,
              color: colors.red,
            }}
          >
            <Close size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <MuiTypography variant="h1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
          {t("admin_reactivation.title")}
        </MuiTypography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[300],
            borderRadius: 20,
            px: 2,
            height: 40,
            backgroundColor:
              mode === "dark" ? theme.palette.grey[900] : colors.white,
            width: 342,
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
            placeholder={t("admin_reactivation.search")}
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: mode === "dark" ? colors.white : colors.black,
              "&::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>

      <Table
        rows={filteredRows}
        columns={columns}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        totalRecords={totalRecords}
        sx={{
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#709A1C",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MuiTypography variant="h2" fontWeight={600}>
            {t("admin_reactivation.confirm")}{" "}
            {actionType === "activate"
              ? t("admin_reactivation.activation")
              : t("admin_reactivation.deactivation")}
          </MuiTypography>
        </DialogTitle>
        <DialogContent>
          <MuiTypography>
            {t("admin_reactivation.are_you_sure")} {actionType}{" "}
            {selectedUser?.name}?
          </MuiTypography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              color: theme.palette.text.secondary,
              borderColor: theme.palette.grey[300],
            }}
          >
            {t("admin_reactivation.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            sx={{
              backgroundColor:
                actionType === "activate" ? "#709A1C" : colors.errorMain,
              "&:hover": {
                backgroundColor:
                  actionType === "activate" ? "#5a7d16" : colors.errorDark,
              },
            }}
          >
            {t("admin_reactivation.confirm")}{" "}
            {actionType === "activate"
              ? t("admin_reactivation.activate")
              : t("admin_reactivation.deactivate")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Reactivation;
