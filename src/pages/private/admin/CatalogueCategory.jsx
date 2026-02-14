import { useTheme } from "@emotion/react";
import { Close } from "@mui/icons-material";
import "react-image-crop/dist/ReactCrop.css";
import Table from "../../../components/Table";
import { colors } from "../../../styles/theme";
import { gridClasses } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { Edit2, Trash, SearchNormal1 } from "iconsax-react";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { useEffect, useState, useCallback, useRef } from "react";
import { setAlert, setLoading } from "../../../redux/configSlice";
import { IOSSwitch } from "../../../components/dashboard/IOSSwitch";
import MuiTypography from "../../../components/common/MuiTypography";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import { FormField } from "../../../components/dashboard/AdminSharedComponent";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  DialogActions,
} from "@mui/material";
import {
  getAllAdminCatalogueCategory,
  createAdminCatalogueCategory,
  updateAdminCatalogueCategory,
  deleteAdminCatalogueCategory,
  getAdminCatalogueCategoryType,
  uploadFileUrl,
} from "../../../apis/apiEndPoints";
import { useTranslation } from "react-i18next";

function CatalogueCategory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);

  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Crop related states
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageType, setCurrentImageType] = useState(null); // 'category' or 'type'
  const imageRef = useRef();
  const [imageUploadProgress, setImageUploadProgress] = useState({
    category: 0,
    type: 0,
  });
  // Form states for Create
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryType: "",
    categoryId: "",
    categoryImage: null,
    categoryImagePreview: null,
    typeImage: null,
    typeImagePreview: null,
  });

  // Form states for Edit
  const [editFormData, setEditFormData] = useState({
    categoryName: "",
    categoryImage: null,
    categoryImagePreview: null,
    status: true,
  });

  const fetchData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllAdminCatalogueCategory();
      const formattedRows = response.data.data.map((item) => ({
        id: item.id,
        categoryId: item.id,
        categoryName: item.title,
        status: item.isActive,
        image: item.image,
        createdAt: item.createdAt,
        types: item.types,
      }));
      setRows(formattedRows);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message || "Failed to fetch categories",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchCategoryTypes = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAdminCatalogueCategoryType();
      setCategoryTypes(response.data.data);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Failed to fetch category types",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

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

  // --- Image Crop Handlers ---
  const onImageLoaded = (e) => {
    imageRef.current = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop(
          { unit: "%", width: 50 },
          0,
          e.currentTarget.width,
          e.currentTarget.height
        ),
        e.currentTarget.width,
        e.currentTarget.height
      )
    );
  };

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imageRef.current) return null;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    return blob;
  }, [completedCrop]);

  // Modify your handleCropComplete to handle both image types
  const handleCropComplete = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const blob = await generateCroppedImage();
      if (!blob) return;

      const croppedFile = new File([blob], `cropped-${Date.now()}.jpeg`, {
        type: "image/jpeg",
      });

      const imageDataUrl = URL.createObjectURL(croppedFile);

      if (currentImageType === "category") {
        if (openEditModal) {
          setEditFormData((prev) => ({
            ...prev,
            categoryImage: croppedFile,
            categoryImagePreview: imageDataUrl,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            categoryImage: croppedFile,
            categoryImagePreview: imageDataUrl,
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          typeImage: croppedFile,
          typeImagePreview: imageDataUrl,
        }));
      }

      setOpenCropModal(false);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message || "Failed to process image",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    completedCrop,
    currentImageType,
    openEditModal,
    dispatch,
    generateCroppedImage,
  ]);
  const handleCloseCropModal = () => {
    setOpenCropModal(false);
    setImagePreview(null);
    setCurrentImageType(null);
  };

  // --- Image Upload Handlers ---
  const handleCategoryImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCurrentImageType("category");
        setOpenCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypeImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCurrentImageType("type");
        setOpenCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Replace your current uploadImage function with this:
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderName", "catalogue_categories");

      const response = await uploadFileUrl(formData);

      // Handle the actual nested response structure
      if (!response?.data?.data?.[0]?.url) {
        console.error("Invalid response structure:", response);
        throw new Error("Server returned unexpected response format");
      }

      // Return either the CDN URL or S3 URL
      return response.data.data[0].url;
      // OR if you prefer S3 URL:
      // return response.data.data[0].s3Url;
    } catch (err) {
      console.error("Upload error details:", {
        error: err,
        response: err.response?.data,
      });
      throw new Error(`Image upload failed: ${err.message}`);
    }
  };

  // --- Modal Handlers ---
  const handleClickOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setFormData({
      categoryName: "",
      categoryId: "",
      categoryImage: null,
      categoryImagePreview: null,
      typeImage: null,
      typeImagePreview: null,
    });
  };

  const handleEditOpen = (category) => {
    setSelectedCategory(category);
    setEditFormData({
      categoryName: category.categoryName,
      categoryImage: null,
      categoryImagePreview: category.image,
      status: category.status,
    });
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setSelectedCategory(null);
    setEditFormData({
      categoryName: "",
      categoryImage: null,
      categoryImagePreview: null,
      status: true,
    });
  };

  const handleDeleteOpen = (categoryId) => {
    setDeleteId(categoryId);
    setOpenDeleteModal(true);
  };

  const handleDeleteClose = () => {
    setOpenDeleteModal(false);
    setDeleteId(null);
  };

  // --- CRUD Operations ---
  const handleCreate = async () => {
    try {
      // Validation checks
      if (!formData.categoryName || !formData.categoryType) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: "Category name and type are required",
          })
        );
        return;
      }

      if (!formData.categoryImage || !formData.typeImage) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: "Both images are required",
          })
        );
        return;
      }

      dispatch(setLoading(true));

      // Upload both images
      const [categoryImageUrl, typeImageUrl] = await Promise.all([
        uploadImage(formData.categoryImage).catch((e) => {
          console.error("Category image upload failed:", e);
          return null;
        }),
        uploadImage(formData.typeImage).catch((e) => {
          console.error("Type image upload failed:", e);
          return null;
        }),
      ]);

      if (!categoryImageUrl || !typeImageUrl) {
        throw new Error("Failed to upload one or more images");
      }

      // Create payload with all required fields
      const payload = {
        categoryName: formData.categoryName,
        categoryType: formData.categoryType, // Required by API
        categoryId: formData.categoryType, // If still needed
        categoryImage: categoryImageUrl,
        typeImage: typeImageUrl,
        isActive: true,
      };

      const response = await createAdminCatalogueCategory(payload);

      if (response.error) {
        throw new Error(response.message || "Category creation failed");
      }

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Category created successfully",
        })
      );

      handleClose();
      fetchData();
    } catch (err) {
      console.error("Creation Error:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message || "Failed to create category",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editFormData.categoryName) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: "Category name is required",
          })
        );
        return;
      }

      dispatch(setLoading(true));

      // Prepare payload
      const payload = {
        categoryName: editFormData.categoryName.trim(),
        isActive: editFormData.status,
      };

      // Only include image if changed
      if (editFormData.categoryImage) {
        const uploadedUrl = await uploadImage(editFormData.categoryImage);
        if (uploadedUrl) {
          payload.image = uploadedUrl;
        }
      }

      const response = await updateAdminCatalogueCategory(
        selectedCategory.categoryId,
        payload
      );

      // Check if the update was acknowledged by the server
      if (!response || response.error) {
        throw new Error(response?.message || "Update failed");
      }

      // Success - regardless of whether response contains updated data
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Category updated successfully",
        })
      );

      // Force refresh from server
      await fetchData();

      handleEditClose();
    } catch (err) {
      console.error("Update failed:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message || "Failed to update category",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(setLoading(true));
      await deleteAdminCatalogueCategory(deleteId);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Category deleted successfully",
        })
      );

      handleDeleteClose();
      fetchData();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message || "Failed to delete category",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleStatusToggle = async (categoryId, currentStatus) => {
    try {
      dispatch(setLoading(true));
      const payload = {
        isActive: !currentStatus,
      };
      await updateAdminCatalogueCategory(categoryId, payload);
      fetchData();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Category status updated successfully",
        })
      );
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message:
            "Failed to update status: " + (err.message || "Unknown error"),
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategoryTypes();
  }, [fetchData, fetchCategoryTypes]);

  const columns = [
    {
      field: "categoryName",
      headerName: t("admin_catalogue_category.category_name"),
      flex: 1,
    },
    {
      field: "status",
      headerName: t("admin_catalogue_category.status"),
      flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IOSSwitch
              checked={params.row.status}
              onChange={() =>
                handleStatusToggle(params.row.categoryId, params.row.status)
              }
            />
          </Box>
        );
      },
    },
    {
      field: "action",
      headerName: t("admin_catalogue_category.action"),
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Edit2
            style={{ cursor: "pointer" }}
            onClick={() => handleEditOpen(params.row)}
          />
          <Trash
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteOpen(params.row.categoryId)}
          />
        </Box>
      ),
    },
  ];

  if (loading) {
    return <AdListSkeleton />;
  }

  return (
    <Box sx={{ color: theme.palette.text.primary, minHeight: "100vh" }}>
      <MuiTypography variant="h1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
        {t("admin_catalogue_category.title")}
      </MuiTypography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            m: 2,
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[200],
            borderRadius: 5,
            px: 2,
            height: 40,
            backgroundColor:
              mode === "dark" ? theme.palette.grey[900] : theme.palette.grey,
            width: "40%",
          }}
        >
          <SearchNormal1
            size={18}
            style={{ marginRight: 8, color: colors.grey500 }}
          />
          <InputBase
            placeholder={t(
              "admin_catalogue_category.search_catalogue_categories"
            )}
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: mode === "dark" ? colors.white : colors.black }}
          />
        </Box>
        <Button
          variant="contained"
          sx={{ height: 40, fontWeight: 600, borderRadius: 3 }}
          onClick={handleClickOpen}
        >
          {t("admin_catalogue_category.create_category")}
        </Button>
      </Box>

      <Table
        columns={columns}
        rows={paginatedRows}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        totalRecords={filteredRows.length}
        paginationMode="client"
        sx={{
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#709A1C",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
      />

      {/* Create Modal */}
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
            {t("admin_catalogue_category.create_new_category")}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 5 }}>
          <FormField
            label={t("admin_catalogue_category.category_name")}
            required
            input={
              <TextField
                fullWidth
                name="categoryName"
                placeholder="Input Category name"
                variant="outlined"
                size="medium"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
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
            label={t("admin_catalogue_category.category_type")}
            required
            sx={{ mt: 2 }}
            input={
              <FormControl fullWidth>
                <Select
                  value={formData.categoryType}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryType: e.target.value })
                  }
                  displayEmpty
                  sx={{
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  }}
                >
                  <MenuItem value="">
                    <span>
                      {t("admin_catalogue_category.select_category_type")}
                    </span>
                  </MenuItem>
                  {categoryTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />
          <FormField
            label={t("admin_catalogue_category.catelogue_category_image")}
            required
            sx={{ mt: 2 }}
            input={
              <Box>
                <input
                  accept="image/*"
                  id="category-image-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleCategoryImageChange(file);
                  }}
                />
                <label htmlFor="category-image-upload">
                  <Button variant="outlined" component="span">
                    {t("admin_catalogue_category.upload_image")}
                  </Button>
                </label>
                {formData.categoryImagePreview && (
                  <Box mt={2}>
                    <img
                      src={formData.categoryImagePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  </Box>
                )}
              </Box>
            }
          />
          <FormField
            label={t("admin_catalogue_category.catalogue_category_type_image")}
            required
            sx={{ mt: 2 }}
            input={
              <Box>
                <input
                  accept="image/*"
                  id="type-image-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleTypeImageChange(file);
                    e.target.value = ""; // Reset input to allow re-upload
                  }}
                />
                <label htmlFor="type-image-upload">
                  <Button variant="outlined" component="span" sx={{ mt: 1 }}>
                    {t("admin_catalogue_category.upload_type_image")}
                  </Button>
                </label>
                {formData.typeImagePreview && (
                  <Box mt={2}>
                    <img
                      src={formData.typeImagePreview}
                      alt="Type Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            {t("admin_catalogue_category.cancel")}
          </Button>
          <Button onClick={handleCreate} variant="contained">
            {t("admin_catalogue_category.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={openEditModal}
        onClose={handleEditClose}
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
            {t("admin_catalogue_category.edit_category")}
          </Typography>
          <IconButton onClick={handleEditClose} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 5 }}>
          <FormField
            label={t("admin_catalogue_category.category_name")}
            required
            input={
              <TextField
                fullWidth
                name="categoryName"
                placeholder="Input Category name"
                variant="outlined"
                size="medium"
                value={editFormData.categoryName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    categoryName: e.target.value,
                  })
                }
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
            label={t("admin_catalogue_category.catelogue_category_image")}
            sx={{ mt: 2 }}
            input={
              <Box>
                {/* Current Image Display */}
                {selectedCategory?.image && !editFormData.categoryImage && (
                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t("admin_catalogue_category.current_image")}:
                    </Typography>
                    <img
                      src={selectedCategory.image}
                      alt="Current Category"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "4px",
                        border: "1px solid #eee",
                      }}
                    />
                  </Box>
                )}

                {/* Image Upload with Crop */}
                <input
                  accept="image/*"
                  id="edit-category-image-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setImagePreview(reader.result);
                        setCurrentImageType("category");
                        setOpenCropModal(true);
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = "";
                  }}
                />
                <label htmlFor="edit-category-image-upload">
                  <Button variant="outlined" component="span" sx={{ mb: 2 }}>
                    {editFormData.categoryImage
                      ? t("admin_catalogue_category.replace_image")
                      : t("admin_catalogue_category.upload_new_image")}
                  </Button>
                </label>

                {/* New Image Preview */}
                {editFormData.categoryImagePreview && (
                  <Box mt={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t("admin_catalogue_category.new_image_preview")} :
                    </Typography>
                    <Box position="relative" display="inline-block">
                      <img
                        src={editFormData.categoryImagePreview}
                        alt="New Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "4px",
                          border: "1px solid #eee",
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* Upload Progress */}
                {imageUploadProgress.category > 0 && (
                  <Box mt={1}>
                    <LinearProgress
                      variant="determinate"
                      value={imageUploadProgress.category}
                    />
                    <Typography variant="caption">
                      {t("admin_catalogue_category.uploading")}:{" "}
                      {imageUploadProgress.category}%
                    </Typography>
                  </Box>
                )}
              </Box>
            }
          />
          <FormField
            label={t("admin_catalogue_category.status")}
            input={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IOSSwitch
                  checked={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.checked,
                    })
                  }
                />
                <Typography sx={{ ml: 2 }}>
                  {editFormData.status
                    ? t("admin_catalogue_category.active")
                    : t("admin_catalogue_category.inactive")}
                </Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleEditClose} variant="outlined">
            {t("admin_catalogue_category.cancel")}
          </Button>
          <Button onClick={handleUpdate} variant="contained">
            {t("admin_catalogue_category.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={handleDeleteClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {t("admin_catalogue_category.confirm_delete")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>{t("admin_catalogue_category.are_you_sure")}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDeleteClose} variant="outlined">
            {t("admin_catalogue_category.cancel")}
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            {t("admin_catalogue_category.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop Modal */}
      <Dialog
        open={openCropModal}
        onClose={handleCloseCropModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {t("admin_catalogue_category.crop_image")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {imagePreview && (
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
            >
              <img
                src={imagePreview}
                alt="Crop"
                onLoad={onImageLoaded}
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseCropModal} variant="outlined">
            {t("admin_catalogue_category.cancel")}
          </Button>
          <Button onClick={handleCropComplete} variant="contained">
            {t("admin_catalogue_category.apply_crop")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CatalogueCategory;
