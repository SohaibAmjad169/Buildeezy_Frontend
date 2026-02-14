import { Close } from "@mui/icons-material";
import { gridClasses } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import Table from "../../../../components/Table";
import { colors } from "../../../../styles/theme";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { SearchNormal1, Edit2, Trash } from "iconsax-react";
import { ALERT_TYPE } from "../../../../utils/constants/config";
import { setAlert, setLoading } from "../../../../redux/configSlice";
import MuiTypography from "../../../../components/common/MuiTypography";
import { FormField } from "../../../../components/dashboard/AdminSharedComponent";
import {
  getAdminRolesUrl,
  createAdminRoleUrl,
  updateAdminRoleUrl,
  getAllPermissionsUrl,
  deleteAdminRoleUrl,
} from "../../../../apis/apiEndPoints";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  Checkbox,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";
import { Eye } from "iconsax-react";
import { IOSSwitch } from "../../../../components/dashboard/IOSSwitch";

function AdminRoles() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);

  // State management
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    type: "",
    description: "",
    permissionIds: [],
    userEmail: "",
    userPassword: "",
    createUserAccount: false,
  });
  const [rows, setRows] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    role: undefined,
  });

  // Handle modal events
  const handleClickOpen = () => {
    setFormData({
      id: null,
      userEmail: "",
      userPassword: "",
      createUserAccount: false,
      name: "",
      type: "",
      description: "",
      permissionIds: [],
    });
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setViewModal(false);
    setFormData({
      id: null,
      userEmail: "",
      userPassword: "",
      createUserAccount: false,
      name: "",
      type: "",
      description: "",
      permissionIds: [],
    });
  };

  // Fetch data from API
  const fetchAdminRolesData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAdminRolesUrl();
      const formattedRows = response.data.data.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description || "",
        permissionsCount: item.permissionsCount || 0,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        permissions: item.permissions || [], // Store permissions for view mode
      }));
      setRows(formattedRows);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.response?.data?.message || err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      const response = await getAllPermissionsUrl();
      let permissions = [];

      if (response.data.data) {
        // Flatten the permissions object into a single array
        permissions = Object.values(response.data.data).flat();
      }

      const formattedPermissions = permissions.map((permission) => ({
        ...permission,
        id: Number(permission.id),
      }));

      setAllPermissions(formattedPermissions);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setAllPermissions([]);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Failed to fetch permissions",
        })
      );
    }
  };

  // Get role details including permissions
  const getRoleDetails = (roleId) => {
    const role = rows.find((r) => r.id === roleId);
    if (!role) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Role not found",
        })
      );
      return null;
    }

    return {
      id: role.id,
      name: role.name,
      type: role.type,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.id) || [],
    };
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle permission selection
  const handlePermissionChange = (event) => {
    const { value } = event.target;
    const numericValues = Array.isArray(value)
      ? value.map((id) => Number(id))
      : [];

    setFormData((prev) => ({
      ...prev,
      permissionIds: numericValues,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: "Name and Type are required fields",
          })
        );
        return;
      }

      if (formData.permissionIds.length === 0) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: "Please select at least one permission",
          })
        );
        return;
      }

      dispatch(setLoading(true));

      if (formData.createUserAccount) {
        if (!formData.userEmail || !formData.userPassword) {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message:
                "Email and Password are required when creating user account",
            })
          );
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.userEmail)) {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: "Please enter a valid email address",
            })
          );
          return;
        }
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        permissionIds: formData.permissionIds.map((id) => Number(id)),
        createUserAccount: formData.createUserAccount,
      };

      if (formData.createUserAccount) {
        payload.userEmail = formData.userEmail;
        payload.userPassword = formData.userPassword;
      }

      console.log("Submitting payload:", payload);

      if (formData.id) {
        // Update existing role
        await updateAdminRoleUrl(formData.id, payload);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Role updated successfully",
          })
        );
      } else {
        // Create new role
        await createAdminRoleUrl(payload);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Role created successfully",
          })
        );
      }
      console.log("API response:", payload);
      // Refresh data and close modal
      await fetchAdminRolesData();
      handleClose();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.response?.data?.message || "Operation failed",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle edit role
  const handleEdit = (row) => {
    const roleDetails = getRoleDetails(row.id);
    if (roleDetails) {
      setFormData(roleDetails);
      setOpenModal(true);
    }
  };

  // Handle view role
  const handleView = (row) => {
    const roleDetails = getRoleDetails(row.id);
    if (roleDetails) {
      setFormData(roleDetails);
      setViewModal(true);
    }
  };

  const openDelete = (row) => {
    setDeleteModal({ open: true, role: row });
  };

  const closeDelete = () => setDeleteModal({ open: false, role: undefined });

  const handleDelete = async () => {
    if (!deleteModal.role?.id) return;
    try {
      dispatch(setLoading(true));
      await deleteAdminRoleUrl(deleteModal.role.id);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Role deleted successfully",
        })
      );
      await fetchAdminRolesData();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to delete role",
        })
      );
    } finally {
      dispatch(setLoading(false));
      closeDelete();
    }
  };

  const columns = [
    { field: "name", headerName: "Role Name", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "permissionsCount", headerName: "Permissions Count", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Eye
              fontSize="small"
              color={mode === "dark" ? "#4caf50" : "#709a1c"}
              onClick={() => handleView(row)}
              style={{ cursor: "pointer" }}
            />
            <Edit2
              fontSize="small"
              color={mode === "dark" ? "#4caf50" : "#131A47"}
              onClick={() => handleEdit(row)}
              style={{ cursor: "pointer" }}
            />
            <Trash
              fontSize="small"
              color="#b71c1c"
              onClick={() => openDelete(row)}
              style={{ cursor: "pointer" }}
              title="Delete"
            />
          </Box>
        );
      },
    },
  ];

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
    fetchAdminRolesData();
    fetchAllPermissions();
  }, [fetchAdminRolesData]);

  return (
    <>
      <Box
        sx={{
          color: theme.palette.text.primary,
          minHeight: "100vh",
        }}
      >
        <MuiTypography
          variant="h1"
          sx={{
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          {t("settings.admin_roles")}
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
              placeholder="Search admin roles"
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

          <Button
            variant="contained"
            sx={{
              ml: 2,
              height: 40,
              fontWeight: 600,
              borderRadius: 3,
            }}
            onClick={handleClickOpen}
          >
            Create Role
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
          rows={paginatedRows}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          totalRecords={filteredRows.length}
        />
      </Box>

      {/* Create/Edit Role Modal */}
      <Dialog
        open={openModal}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {formData.id ? "Edit Role" : "Create New Role"}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {!formData.id && (
            <>
              {formData.createUserAccount && (
                <>
                  <FormField
                    label="User Email"
                    required={formData.createUserAccount}
                    sx={{ mt: 2 }}
                    input={
                      <TextField
                        fullWidth
                        name="userEmail"
                        placeholder="johndoe@gmail.com"
                        value={formData.userEmail}
                        onChange={handleChange}
                        variant="outlined"
                        size="medium"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                            backgroundColor: mode === "dark" ? "#333" : "#fff",
                          },
                        }}
                      />
                    }
                  />

                  <FormField
                    label="User Password"
                    required={formData.createUserAccount}
                    sx={{ mt: 2 }}
                    input={
                      <TextField
                        fullWidth
                        name="userPassword"
                        placeholder="********"
                        type="password"
                        value={formData.userPassword}
                        onChange={handleChange}
                        variant="outlined"
                        size="medium"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                            backgroundColor: mode === "dark" ? "#333" : "#fff",
                          },
                        }}
                      />
                    }
                  />
                </>
              )}

              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <IOSSwitch
                  checked={formData.createUserAccount}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      createUserAccount: e.target.checked,
                      // Clear email/password when toggling off
                      userEmail: e.target.checked ? prev.userEmail : "",
                      userPassword: e.target.checked ? prev.userPassword : "",
                    }));
                  }}
                />
                <Typography sx={{ ml: 2 }}>Create user account</Typography>
              </Box>
            </>
          )}

          <FormField
            label="Role Name"
            required
            sx={{ mt: 2 }}
            input={
              <TextField
                fullWidth
                name="name"
                placeholder="Input role name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  },
                }}
              />
            }
          />

          <FormField
            label="Role Type"
            required
            sx={{ mt: 2 }}
            input={
              <FormControl fullWidth>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={!!formData.id}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  }}
                >
                  <MenuItem value="" disabled>
                    Select role type
                  </MenuItem>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                </Select>
              </FormControl>
            }
          />

          <FormField
            label="Description"
            sx={{ mt: 2 }}
            input={
              <TextField
                fullWidth
                name="description"
                placeholder="Input description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  },
                }}
              />
            }
          />

          <FormField
            label="Permissions"
            required
            sx={{ mt: 2 }}
            input={
              <FormControl fullWidth>
                <Select
                  multiple
                  name="permissionIds"
                  value={formData.permissionIds}
                  onChange={handlePermissionChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => {
                        const permission = allPermissions.find(
                          (p) => Number(p.id) === Number(id)
                        );
                        return (
                          <Chip
                            key={id}
                            label={permission?.name || `Permission ${id}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{
                    minHeight: 150,
                    maxHeight: 300,
                    overflowY: "auto",
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  }}
                >
                  {allPermissions.map((permission) => (
                    <MenuItem key={permission.id} value={permission.id}>
                      <Checkbox
                        checked={formData.permissionIds.includes(
                          Number(permission.id)
                        )}
                      />
                      <ListItemText
                        primary={permission.name}
                        secondary={permission.description || ""}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", p: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: "#d0d0d0",
              color: theme.palette.text.secondary,
              fontWeight: 500,
              borderRadius: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#709A1C",
              fontWeight: 500,
              borderRadius: 1,
              "&:hover": { backgroundColor: "#5a7d16" },
            }}
          >
            {formData.id ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Role Modal */}
      <Dialog
        open={viewModal}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Role Details
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Name:
            </Typography>
            <Typography>{formData.name}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Type:
            </Typography>
            <Typography>{formData.type}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Description:
            </Typography>
            <Typography>{formData.description || "N/A"}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Permissions ({formData.permissionIds?.length || 0}):
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                maxHeight: 300,
                overflowY: "auto",
                p: 1,
              }}
            >
              {formData.permissionIds?.length > 0 ? (
                formData.permissionIds.map((permissionId) => {
                  const permission = allPermissions.find(
                    (p) => Number(p.id) === Number(permissionId)
                  );
                  return (
                    <Chip
                      key={permissionId}
                      label={permission?.name || `Permission ${permissionId}`}
                      sx={{
                        backgroundColor: mode === "dark" ? "#333" : "#f5f5f5",
                        color: mode === "dark" ? "#fff" : "inherit",
                      }}
                    />
                  );
                })
              ) : (
                <Typography variant="body2">No permissions assigned</Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: "#709A1C",
              fontWeight: 500,
              borderRadius: 1,
              "&:hover": { backgroundColor: "#5a7d16" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteModal.open}
        onClose={closeDelete}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Delete Role
          </Typography>
          <IconButton onClick={closeDelete} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          <Typography sx={{ mt: 1 }}>
            Are you sure you want to delete{" "}
            <strong>{deleteModal.role?.name}</strong>? This action cannot be undo.
          </Typography>
          {deleteModal.role?.type === "Super Admin" && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Heads up: deleting a <strong>Super Admin</strong> role may lock you out
              if no other super admin exists.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDelete} variant="outlined" sx={{ borderRadius: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#d32f2f",
              borderRadius: 1,
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminRoles;
