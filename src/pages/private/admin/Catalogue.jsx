import { useTheme } from "@emotion/react";
import { Close } from "@mui/icons-material";
import Table from "../../../components/Table";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState, useRef } from "react";
import { setAlert, setLoading } from "../../../redux/configSlice";
import MuiTypography from "../../../components/common/MuiTypography";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import AdminDashboardCard from "../../../components/dashboard/AdminDashboardCard";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { SearchNormal1, Edit2, Trash } from "iconsax-react";
import { FormField } from "../../../components/dashboard/AdminSharedComponent";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { colors } from "../../../styles/theme";
import { useTranslation } from "react-i18next";
import { gridClasses } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Grid,
  InputBase,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import {
  getAdminCatalogueUrl,
  createAdminCatalogueCategory,
  getAdminCatalogueCategoryType,
  uploadFileUrl,
} from "../../../apis/apiEndPoints";

function Catalogue() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { loading } = useSelector((state) => state.config);

  const ADMIN_CATALOGUE_CARDS = [
    {
      id: "totalSales",
      title: t("admin_catalogue.total_sales"),
    },
    {
      id: "totalOrders",
      title: t("admin_catalogue.total_orders"),
    },
    {
      id: "ordersPerCategory",
      title: t("admin_catalogue.orders_per_category"),
    },
    {
      id: "ordersPerVendor",
      title: t("admin_catalogue.orders_per_vendors"),
    },
    {
      id: "ordersPerMarket",
      title: t("admin_catalogue.orders_per_market"),
    },
  ];

  const [cards, setCards] = useState(ADMIN_CATALOGUE_CARDS);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [currentImageType, setCurrentImageType] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef();

  const [formData, setFormData] = useState({
    categoryName: "",
    categoryType: "",
    categoryImage: null,
    categoryImagePreview: null,
    typeImage: null,
    typeImagePreview: null,
  });

  const fetchCatalogueData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      };

      const { data: res } = await getAdminCatalogueUrl(params);

      const formattedRows = res.data.catalogues.map((item) => {
        const d = new Date(item.listedDate);
        const formattedDate = `${String(d.getDate()).padStart(2, "0")}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${d.getFullYear()}`;

        return {
          id: item.id,
          product: item.title,
          orders: 1,
          vendor: `${item.vendor.firstName} ${item.vendor.lastName}`,
          category: item.category,
          price: `$${item.price}`,
          listedDate: formattedDate,
          promotions: item.promotionPrice ? ` $${item.promotionPrice}` : "None",
          market: item.market,
          points: item.buildeezyPoint,
        };
      });

      setRows(formattedRows);
      setTotalRecords(res?.data?.total || 0);

      const newCards = ADMIN_CATALOGUE_CARDS.map((card) => ({
        ...card,
        value: res?.[card.id] || 0,
      }));
      setCards(newCards);
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

  const filteredRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleClose = () => {
    setOpenCreateModal(false);
    setFormData({
      categoryName: "",
      categoryId: "",
      categoryImage: null,
      categoryImagePreview: null,
      typeImage: null,
      typeImagePreview: null,
    });
  };

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
        setFormData((prev) => ({
          ...prev,
          categoryImage: croppedFile,
          categoryImagePreview: imageDataUrl,
        }));
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
  }, [completedCrop, currentImageType, dispatch, generateCroppedImage]);

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
    } catch (err) {
      throw new Error(`Image upload failed: ${err.message}`);
    }
  };

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

  const handleCreateCategory = async () => {
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
        uploadImage(formData.categoryImage),
        uploadImage(formData.typeImage),
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
    } catch (err) {
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

  useEffect(() => {
    fetchCatalogueData();
  }, [fetchCatalogueData]);

  useEffect(() => {
    const fetchCategoryTypes = async () => {
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
    };

    fetchCategoryTypes();
  }, [dispatch]);

  if (loading) {
    return <AdListSkeleton />;
  }

  const columns = [
    { field: "product", headerName: t("admin_catalogue.product"), flex: 1 },
    { field: "orders", headerName: t("admin_catalogue.no_of_orders"), flex: 1 },
    { field: "vendor", headerName: t("admin_catalogue.vendor"), flex: 1 },
    { field: "category", headerName: t("admin_catalogue.category"), flex: 1 },
    { field: "price", headerName: t("admin_catalogue.listed_date"), flex: 1 },
    {
      field: "listedDate",
      headerName: t("admin_catalogue.listed_date"),
      flex: 1,
    },
    {
      field: "promotions",
      headerName: t("admin_catalogue.promotions"),
      flex: 1,
    },
    { field: "market", headerName: t("admin_catalogue.market"), flex: 1 },
    {
      field: "points",
      headerName: t("admin_catalogue.buildeezy_points"),
      flex: 1,
    },
  ];

  return (
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
        {t("admin_catalogue.title")}
      </MuiTypography>

      <Grid container spacing={2} mt={1}>
        {cards.map(({ title, value, id }) => (
          <Grid item key={id} xs={12} sm={6} md={2.4}>
            <AdminDashboardCard title={title} value={value} mode={mode} />
          </Grid>
        ))}
      </Grid>
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
            justifySelf: "end",
            backgroundColor:
              mode === "dark" ? theme.palette.grey[900] : theme.palette.grey,
            width: "40%",
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
            placeholder={t("admin_catalogue.search_vendors_categories")}
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
            height: 40,
            fontWeight: 600,
            borderRadius: 3,
          }}
          onClick={() => setOpenCreateModal(true)}
        >
          {t("admin_catalogue.create_category")}
        </Button>
      </Box>

      <Table
        columns={columns}
        rows={filteredRows}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        paginationMode="server"
        totalRecords={totalRecords}
        sx={{
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#709A1C",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
      />
      {/* Create Category Modal */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
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
            {t("admin_catalogue.create_new_category")}
          </Typography>
          <IconButton onClick={() => setOpenCreateModal(false)} size="small">
            <Close size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 5 }}>
          <FormField
            label={t("admin_catalogue.category_name")}
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
            label={t("admin_catalogue.category_type")}
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
                    <span>{t("admin_catalogue.select_category_type")}</span>
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
            label={t("admin_catalogue.catelogue_category_image")}
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
                    {t("admin_catalogue.upload_image")}
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
            label={t("admin_catalogue.catalogue_category_type_image")}
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
                    {t("admin_catalogue.upload_type_image")}
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
          <Button onClick={() => setOpenCreateModal(false)} variant="outlined">
            {t("admin_catalogue.cancel")}
          </Button>
          <Button onClick={handleCreateCategory} variant="contained">
            {t("admin_catalogue.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop Modal */}
      <Dialog
        open={openCropModal}
        onClose={() => setOpenCropModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {t("admin_catalogue.crop_image")}
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
          <Button onClick={() => setOpenCropModal(false)} variant="outlined">
            {t("admin_catalogue.cancel")}
          </Button>
          <Button onClick={handleCropComplete} variant="contained">
            {t("admin_catalogue.apply_crop")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Catalogue;
