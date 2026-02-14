import { Close } from "@mui/icons-material";
import Table from "../../../components/Table";
import { gridClasses } from "@mui/x-data-grid";
import { colors } from "../../../styles/theme";
import { useTranslation } from "react-i18next";
import { SearchNormal1, Eye } from "iconsax-react";
import { useDispatch, useSelector } from "react-redux";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { useState, useCallback, useEffect } from "react";
import { setAlert, setLoading } from "../../../redux/configSlice";
import MuiTypography from "../../../components/common/MuiTypography";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import AdminMailModal from "../../../components/dashboard/AdminMailModal";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import {
  createMailAdminMarketingUrl,
  getAdminMarketingUrl,
} from "../../../apis/apiEndPoints";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/constants/route";

const Marketing = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);

  // States
  const [view, setView] = useState("#");
  const [createMailModal, setCreateMailModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const navigate = useNavigate();
  // Redirect to create post page
  const redirectToCreatePost = () => {
    navigate("/" + ROUTES.adminPostAd);
  };

  // Handle events
  const handleToggle = (newView) => {
    setView(newView);
  };

  const handleSubmitMail = async (formData) => {
    try {
      dispatch(setLoading(true));
      formData.append("send_immediately", "true");

      const response = await createMailAdminMarketingUrl({
        data: formData,
        isFormData: true,
      });
      setCreateMailModal(false);
      fetchMarketingData();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Mail campaign created successfully!",
        })
      );
    } catch (error) {
      console.error(
        "Mail campaign creation error:",
        error.response?.data || error
      );
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message:
            error.response?.data?.message || "Failed to create mail campaign",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handlePreview = (campaign) => {
    setPreviewData(campaign);
    setPreviewOpen(true);
  };

  const handleMenuOpen = (event, ad) => {
    setAnchorEl(event.currentTarget);
    setSelectedAd(ad);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAd(null);
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Fetch data from API - Updated to support pagination and search
  const fetchMarketingData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getAdminMarketingUrl();

      const formatDate = (dateString) => {
        if (!dateString) return "Not edited yet";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        });
      };

      const transformedRows = res.data.campaigns.map((item) => ({
        id: item.id,
        title: item.name,
        status: item.status,
        date: formatDate(item.sent_at),
        sent_at: formatDate(item.sent_at),
        updated_at: formatDate(item.updated_at),
        total: item.stats?.delivered || 0,
        uniqueOpens: item.unique_opens,
        uniqueClicks: item.unique_clicks,
        response: item.response_rate,
        description: item.name,
      }));
      setRows(transformedRows);
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

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      minWidth: 500,
      renderCell: (params) => (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  params.row.status === "draft" ? "#9e9e9e" : "#4CAF50",
              }}
            />
            <MuiTypography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
              }}
            >
              {params.row.status === "draft"
                ? "draft"
                : `Sent on ${params.row.sent_at}`}
            </MuiTypography>
          </Box>

          <MuiTypography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              color: "#1976d2",
              textDecoration: "none",
            }}
          >
            {params.row.title}
          </MuiTypography>

          <MuiTypography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
            }}
          >
            Edited {params.row.updated_at}
          </MuiTypography>
        </Box>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      width: 100,
      renderCell: (params) => (
        <Box>{view === "#" ? params.row.total : `${calculatePercentage(params.row.total, params.row.total)}%`}</Box>
      ),
    },
    {
      field: "uniqueOpens",
      headerName: "Unique Opens",
      width: 130,
      renderCell: (params) => (
        <Box>
          {view === "#"
            ? params.row.uniqueOpens
            : `${calculatePercentage(
              params.row.uniqueOpens,
              params.row.total
            )}%`}
        </Box>
      ),
    },
    {
      field: "uniqueClicks",
      headerName: "Unique clicks",
      width: 130,
      renderCell: (params) => (
        <Box>
          {view === "#"
            ? params.row.uniqueClicks
            : `${calculatePercentage(
              params.row.uniqueClicks,
              params.row.total
            )}%`}
        </Box>
      ),
    },
    {
      field: "response",
      headerName: "Response",
      width: 100,
      renderCell: (params) => (
        <Box>
          {view === "#" ? params.row.response : `${params.row.response}%`}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            borderRadius: 2,
            backgroundColor: "#E4E7EC",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            overflow: "hidden",
            width: 80,
            height: 35,
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            onClick={() => handleToggle("#")}
            sx={{
              flex: 1,
              textAlign: "center",
              backgroundColor: view === "#" ? "#fff" : "transparent",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: 14,
              color: "#333",
              p: 1,
              transition: "background-color 0.2s ease",
            }}
          >
            #
          </Box>
          <Box
            onClick={() => handleToggle("%")}
            sx={{
              flex: 1,
              textAlign: "center",
              backgroundColor: view === "%" ? "#fff" : "transparent",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: 14,
              color: "#333",
              p: 1,
              transition: "background-color 0.2s ease",
            }}
          >
            %
          </Box>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          sx={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, params.row);
          }}
        >
          <strong>⋮</strong>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedAd?.id === params.row.id}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            disableAutoFocusItem={true}
            MenuListProps={{
              onClick: (e) => e.stopPropagation(),
              onMouseDown: (e) => e.stopPropagation(),
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handlePreview(params.row); // Your preview function
              }}
            >
              <ListItemIcon>
                <Eye fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Preview Campaign</Typography>
            </MenuItem>
          </Menu>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchMarketingData();
  }, [fetchMarketingData]);

  if (loading) {
    return <AdListSkeleton />;
  }

  return (
    <Box
      sx={{
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
      <MuiTypography variant="h3" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
        {t("marketing.title")}
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
            placeholder="Search By Description / Title"
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
          onClick={() => setCreateMailModal(true)}
        >
          Create Mail
        </Button>
        <Button
          variant="contained"
          sx={{
            ml: 2,
            height: 40,
            fontWeight: 600,
            borderRadius: 3,
          }}
          onClick={redirectToCreatePost}
        >
          Create Post
        </Button>
      </Box>

      <Table
        sx={{
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#709A1C",
            color: "#ffffff",
            fontWeight: "bold",
          },
          [`& .${gridClasses.cell}`]: {
            display: "flex",
            alignItems: "flex-start",
            paddingTop: "12px",
            paddingBottom: "12px",
          },
        }}
        columns={columns}
        rows={paginatedRows}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        totalRecords={filteredRows.length}
        getRowHeight={() => "auto"}
      />

      {/* Modals */}
      <AdminMailModal
        open={createMailModal}
        onClose={() => setCreateMailModal(false)}
        onSubmit={handleSubmitMail}
      />

      {previewOpen && (
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#709A1C",
              color: "#fff",
            }}
          >
            <Typography variant="h6">Campaign Preview</Typography>
            <IconButton
              onClick={() => setPreviewOpen(false)}
              sx={{ color: "#fff" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h3" gutterBottom>
                  {previewData?.title}
                </Typography>
                <Chip
                  label={previewData?.status}
                  sx={{
                    backgroundColor:
                      previewData?.status === "draft" ? "#9e9e9e" : "#4CAF50",
                    color: "#fff",
                    mb: 2,
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Sent Date:
                </Typography>
                <Typography variant="body1">
                  {previewData?.sent_at || "Not sent yet"}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Last Updated:
                </Typography>
                <Typography variant="body1">
                  {previewData?.updated_at}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Total Sent:
                </Typography>
                <Typography variant="h6">{previewData?.total}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Unique Opens:
                </Typography>
                <Typography variant="h6">
                  {view === "#"
                    ? previewData?.uniqueOpens
                    : `${calculatePercentage(
                      previewData?.uniqueOpens,
                      previewData?.total
                    )}%`}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Unique Clicks:
                </Typography>
                <Typography variant="h6">
                  {view === "#"
                    ? previewData?.uniqueClicks
                    : `${calculatePercentage(
                      previewData?.uniqueClicks,
                      previewData?.total
                    )}%`}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Response Rate:
                </Typography>
                <Typography variant="h6">
                  {view === "#"
                    ? previewData?.response
                    : `${previewData?.response}%`}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setPreviewOpen(false)}
              variant="outlined"
              sx={{
                borderColor: "#709A1C",
                color: "#709A1C",
                "&:hover": { borderColor: "#5a7d16" },
              }}
            >
              {t("common.close")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Marketing;
