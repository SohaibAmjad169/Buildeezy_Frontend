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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import MuiTypography from "../../../../components/common/MuiTypography";
import { colors } from "../../../../styles/theme";
import { SearchNormal1 } from "iconsax-react";
import { gridClasses } from "@mui/x-data-grid";
import Table from "../../../../components/Table";
import { IOSSwitch } from "../../../../components/dashboard/IOSSwitch";
import { Trash, Edit2 } from "iconsax-react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useCallback } from "react";
import { setAlert, setLoading } from "../../../../redux/configSlice";
import {
  getAdminCategoriesUrl,
  createAdminCategoryUrl,
  updateAdminCategoryUrl,
  deleteAdminCategoryUrl,
} from "../../../../apis/apiEndPoints";
import { useEffect } from "react";
import { useState } from "react";
import { ALERT_TYPE } from "../../../../utils/constants/config";
import { Close } from "@mui/icons-material";
import { FormField } from "../../../../components/dashboard/AdminSharedComponent";

function Categories() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: 1, // Default to active
  });

  const handleClickOpen = () => {
    setOpenModal(true);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      type: "",
      status: 1,
    });
  };

  const handleClose = () => {
    setOpenModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      type: "",
      status: 1,
    });
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setEditingId(row.id);
    setFormData({
      name: row.name,
      type: row.type,
      status: row.status,
    });
    setOpenModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      try {
        dispatch(setLoading(true));
        await deleteAdminCategoryUrl(row.id);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Category deleted successfully",
          })
        );
        fetchCategoriesData();
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
    }
  };

  const handleStatusToggle = async (row) => {
    try {
      dispatch(setLoading(true));
      const updatedStatus = row.status === 1 ? 0 : 1;
      await updateAdminCategoryUrl(row.id, {
        name: row.name,
        type: row.type,
        status: updatedStatus,
      });
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Status updated successfully",
        })
      );
      fetchCategoriesData();
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
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.type) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Please fill in all required fields",
        })
      );
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      if (isEditing) {
        await updateAdminCategoryUrl(editingId, formData);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Category updated successfully",
          })
        );
      } else {
        await createAdminCategoryUrl(formData);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Category created successfully",
          })
        );
      }

      fetchCategoriesData();
      handleClose();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.response?.data?.message || err.message,
        })
      );
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const fetchCategoriesData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getAdminCategoriesUrl();
      const formatedRows = res.data.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      }));
      setRows(formatedRows);
      setFilteredRows(formatedRows);
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

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRows(filtered);
    }
  }, [searchTerm, rows]);

  const columns = [
    { field: "name", headerName: "Category Name", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "createdAt", headerName: "Register Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => handleStatusToggle(params.row)}>
            <IOSSwitch checked={params.row.status === 1} />
          </IconButton>
          <MuiTypography
            variant="h6"
            sx={{
              fontWeight: 500,
              lineHeight: 1.6,
              color: params.row.status === 1 ? "green" : "red",
            }}
          >
            {params.row.status === 1 ? "Active" : "Inactive"}
          </MuiTypography>
        </Box>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Edit2
            fontSize="small"
            color={mode === "dark" ? "#4caf50" : "#131A47"}
            style={{ cursor: "pointer" }}
            onClick={() => handleEdit(params.row)}
          />
          <Trash
            fontSize="small"
            color="red"
            style={{ cursor: "pointer" }}
            onClick={() => handleDelete(params.row)}
          />
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

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
          {t("settings.categories")}
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
              placeholder="Search Vendor Categories"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            Create Category
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
          rows={filteredRows}
          totalRecords={filteredRows.length}
          paginationModel={{ page: 0, pageSize: 5 }}
          setPaginationModel={() => { }}
          loading={loading}
        />
      </Box>
      <Dialog
        open={openModal}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, minHeight: 300 } }}
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
            {isEditing ? "Edit Category" : "Create New Category"}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 5 }}>
          <FormField
            label="Category Name"
            required
            input={
              <TextField
                fullWidth
                name="name"
                placeholder="Input Category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
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
            label="Select Category type"
            required
            sx={{ mt: 2 }}
            input={
              <FormControl fullWidth>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: theme.palette.text.secondary }}>
                      Choose option
                    </span>
                  </MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Contractor">Contractor</MenuItem>
                  <MenuItem value="Specialist">Specialist</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Vendor">Vendor</MenuItem>
                </Select>
              </FormControl>
            }
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
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
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: "#709A1C",
              fontWeight: 500,
              borderRadius: 1,
              "&:hover": { backgroundColor: "#5a7d16" },
            }}
          >
            {isSubmitting ? t("common.submiting") : isEditing ? t("common.update") : t("common.submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Categories;
