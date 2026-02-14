import { gridClasses } from "@mui/x-data-grid";
import { SearchNormal1 } from "iconsax-react";
import { useTranslation } from "react-i18next";
import Table from "../../../../components/Table";
import { colors } from "../../../../styles/theme";
import { initPubNub } from "../../../../services/pubnub/pubnubConfig";
import { useDispatch, useSelector } from "react-redux";
import Chat from "../../../../components/Message/Chat";
import { useCallback, useEffect, useState } from "react";
import { setLoading, setAlert } from "../../../../redux/configSlice";
import MuiTypography from "../../../../components/common/MuiTypography";
import AdListSkeleton from "../../../../components/skeleton/AdListSkeleton";
import AdminDashboardCard from "../../../../components/dashboard/AdminDashboardCard";
import { PUBNUB_CHANNEL, ALERT_TYPE } from "../../../../utils/constants/config";
import {
  Box,
  Grid,
  IconButton,
  useTheme,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Badge,
  Tooltip,
  Avatar,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoIcon,
} from "@mui/icons-material";
import {
  approveAdpostUrl,
  getAdminAdpostUrl,
  grantAccessToRoom,
  rejectAdpostUrl,
} from "../../../../apis/apiEndPoints";
import {
  setPubNubInstance,
  addAllMessage,
} from "../../../../redux/pubnubSlice";

const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL ||
  "https://useruploads-development.buildeezy.com/";

const getSafeAvatarName = (name) => {
  if (!name || typeof name !== "string") return "?";

  const parts = name.trim().split(" ");
  let initials = parts[0].charAt(0).toUpperCase();

  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  }

  return initials;
};

function Adpost() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);
  const { profileData } = useSelector((state) => state.profile);
  const { pubnubInstance, messages } = useSelector((state) => state.pubnub);

  const ADMIN_ADPOST_CARDS = [
    { id: "totalPost", title: t("admin_ads.total_ads_posts") },
    { id: "adsForApproval", title: t("admin_ads.ads_for_approval") },
    { id: "flaggedAds", title: t("admin_ads.flagged_ads") },
  ];

  const [chatError, setChatError] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  const [cards, setCards] = useState(ADMIN_ADPOST_CARDS);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdData, setSelectedAdData] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Initialize PubNub when component mounts
  useEffect(() => {
    if (profileData?.id && !pubnubInstance) {
      const pubnub = initPubNub(profileData.id, dispatch);
      dispatch(setPubNubInstance(pubnub));
    }
  }, [profileData?.id, dispatch, pubnubInstance]);

  const hasUnreadMessages = (userId) => {
    if (!profileData?.id || !messages) return false;

    const users = [profileData.id, userId].sort();
    const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
    const channelMessages = messages[channelId];

    return (
      channelMessages &&
      channelMessages.some(
        (msg) => msg.senderId !== profileData.id && !msg.read
      )
    );
  };

  const getUserAvatar = (initiatorId) => {
    const ad = rows.find((row) => row.initiatorId === initiatorId);
    if (ad?.documents?.[0]?.path?.includes(`${initiatorId}/`)) {
      return constructFileUrl(ad.documents[0].path);
    }
    return null;
  };

  const handleChatClick = async (user) => {
    try {
      setChatError(null);
      setChatLoading(true);
      setChatLoadingId(user.id);

      if (!profileData?.id || !user?.initiatorId) {
        throw new Error("Missing user data for chat initiation");
      }

      const chatUserId = user.initiatorId;
      const chatUserName = user.postInitiator || "Unknown User";
      const avatar = getUserAvatar(chatUserId);

      const users = [profileData.id, chatUserId].sort();
      const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;

      try {
        await grantAccessToRoom({
          roomName: channelId,
          user1: users[0],
          user2: users[1],
        });
      } catch (apiError) {
        console.warn(
          "Channel access grant failed, proceeding anyway",
          apiError
        );
      }

      await pubnubInstance.subscribe({
        channels: [channelId],
      });

      const response = await new Promise((resolve, reject) => {
        pubnubInstance.history(
          {
            channel: channelId,
            reverse: true,
            count: 100,
          },
          (status, response) => {
            if (status.error) reject(status);
            else resolve(response);
          }
        );
      });

      if (response.messages.length > 0) {
        const formattedMessages = response.messages.map((msg) => ({
          ...msg.entry,
          time: msg.timetoken / 10000,
        }));
        dispatch(addAllMessage({ channelId, messages: formattedMessages }));
      }

      setSelectedChatUser({
        chatUserId,
        chatUserName,
        avatar,
      });
    } catch (error) {
      setChatError(error.message);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: `Could not start chat: ${error.message}`,
        })
      );
    } finally {
      setChatLoading(false);
      setChatLoadingId(null);
    }
  };

  const fetchAdpostData = useCallback(async () => {
    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    };

    try {
      dispatch(setLoading(true));
      const backendPage = paginationModel.page + 1;
      const params = {
        page: backendPage,
        limit: paginationModel.pageSize,
      };

      const { data: res } = await getAdminAdpostUrl(params);

      const transformedRows = res.data.map((item) => ({
        id: item.id,
        adPost: item.adPost || "N/A",
        postInitiator: item.postInitiator || "Unknown User",
        initiatorId: item.initiatorId,
        category: item.category || "N/A",
        startDate: formatDate(item.startDate),
        finishDate: formatDate(item.finishDate),
        flagged: item.flagged ? "Yes" : "No",
        spend: item.spend || "0",
        market: item.market || "N/A",
        documents: Array.isArray(item.documents)
          ? item.documents.map((docPath, index) => ({
              path: docPath,
              name: docPath.split("/").pop() || `Document ${index + 1}`,
            }))
          : [],
        hasUnreadMessages: hasUnreadMessages(item.initiatorId),
      }));

      setMeta({
        page: res.meta.page,
        totalPages: res.meta.totalPages,
        totalRecords: res.meta.totalRecords,
      });

      const newCards = ADMIN_ADPOST_CARDS.map((card) => {
        let value;
        switch (card.id) {
          case "totalPost":
            value = res.statistics?.totalPosts || 0;
            break;
          case "adsForApproval":
            value = res.statistics?.adsForApproval || 0;
            break;
          case "flaggedAds":
            value = res.statistics?.flaggedAds || 0;
            break;
          default:
            value = 0;
        }
        return {
          ...card,
          value: value.toString(),
        };
      });

      setCards(newCards);
      setRows(transformedRows);
    } catch (err) {
      console.error(err.message);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Failed to load ad posts",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, paginationModel]);

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handleApproveClick = (id) => {
    setSelectedAdId(id);
    setActionType("approve");
    setConfirmationModalOpen(true);
  };

  const handleRejectClick = (id) => {
    setSelectedAdId(id);
    setActionType("reject");
    setConfirmationModalOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      dispatch(setLoading(true));

      if (actionType === "approve") {
        await approveAdpostUrl(selectedAdId);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Ad approved successfully",
          })
        );
      } else if (actionType === "reject") {
        if (!rejectionReason.trim()) {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: "Please enter a rejection reason",
            })
          );
          return;
        }
        await rejectAdpostUrl(selectedAdId, rejectionReason);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Ad rejected successfully",
          })
        );
      }

      fetchAdpostData();
    } catch (err) {
      console.error(err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: `Failed to ${actionType} ad`,
        })
      );
    } finally {
      dispatch(setLoading(false));
      setConfirmationModalOpen(false);
      setRejectionReason("");
    }
  };

  const handleViewAdDetails = (row) => {
    setSelectedAdData(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAdData(null);
  };

  const getFileExtension = (path) => {
    return path?.split(".").pop()?.toLowerCase() || "";
  };

  const getFileType = (path) => {
    const extension = getFileExtension(path);
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    } else if (["mp4", "webm", "ogg", "avi", "mov"].includes(extension)) {
      return "video";
    }
    return "unknown";
  };

  const constructFileUrl = (path) => {
    if (!path) return "";
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${IMAGE_BASE_URL}${cleanPath}`;
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <ImageIcon />;
      case "pdf":
        return <PdfIcon />;
      case "video":
        return <VideoIcon />;
      default:
        return <FileIcon />;
    }
  };

  const renderDocument = (document, index) => {
    const documentPath =
      typeof document === "string" ? document : document.path;
    const documentName =
      typeof document === "string"
        ? document.split("/").pop()
        : document.name ||
          document.path?.split("/").pop() ||
          `Document ${index + 1}`;

    if (!documentPath) {
      return null;
    }

    const fileType = getFileType(documentPath);
    const fullUrl = constructFileUrl(documentPath);

    return (
      <Card key={index} sx={{ mb: 2, maxWidth: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            {getFileIcon(fileType)}
            <MuiTypography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
              {documentName}
            </MuiTypography>
            <Chip
              label={fileType.toUpperCase()}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {fileType === "image" && (
            <CardMedia
              component="img"
              sx={{
                maxHeight: 400,
                objectFit: "contain",
                width: "100%",
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
              }}
              image={fullUrl}
              alt={documentName}
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = "block";
                }
              }}
            />
          )}

          {fileType === "pdf" && (
            <Box
              sx={{
                width: "100%",
                height: 500,
                border: "1px solid #ddd",
                borderRadius: 1,
              }}
            >
              <iframe
                src={fullUrl}
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: 4 }}
                title={documentName}
              />
            </Box>
          )}

          {fileType === "video" && (
            <Box sx={{ width: "100%", maxHeight: 400 }}>
              <video
                controls
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                  borderRadius: 4,
                }}
              >
                <source
                  src={fullUrl}
                  type={`video/${getFileExtension(documentPath)}`}
                />
                Your browser does not support the video tag.
              </video>
            </Box>
          )}

          {fileType === "unknown" && (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                border: "2px dashed #ddd",
              }}
            >
              <FileIcon sx={{ fontSize: 48, color: "#999", mb: 2 }} />
              <MuiTypography variant="body2" color="textSecondary">
                File type not supported for preview
              </MuiTypography>
            </Box>
          )}

          <Box
            sx={{
              display: "none",
              p: 3,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: "#999", mb: 2 }} />
            <MuiTypography variant="body2" color="textSecondary">
              Failed to load image
            </MuiTypography>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <MuiTypography variant="caption" color="textSecondary">
              {fullUrl}
            </MuiTypography>
            <IconButton
              size="small"
              onClick={() => window.open(fullUrl, "_blank")}
              title="Download/Open in new tab"
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    fetchAdpostData();
  }, [paginationModel.page, paginationModel.pageSize]); // ✅ explicit watch

  useEffect(() => {
    setChatError(null);
  }, []);

  if (loading) {
    return <AdListSkeleton />;
  }

  const columns = [
    {
      field: "adPost",
      headerName: t("admin_ads.ads_title"),
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
          <MuiTypography
            variant="body2"
            sx={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.row.adPost}
          </MuiTypography>
          <IconButton
            size="small"
            onClick={() => handleViewAdDetails(params.row)}
            sx={{
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main + "10",
              },
            }}
            title="View ad details"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "postInitiator",
      headerName: t("admin_ads.post_initiaor"),
      flex: 1,
    },
    { field: "category", headerName: t("admin_ads.category"), flex: 1 },
    { field: "startDate", headerName: t("admin_ads.start_date"), flex: 1 },
    { field: "finishDate", headerName: t("admin_ads.finish_date"), flex: 1 },
    { field: "flagged", headerName: t("admin_ads.flagged"), flex: 1 },
    { field: "spend", headerName: t("admin_ads.spend"), flex: 1 },
    { field: "market", headerName: t("admin_ads.market"), flex: 1 },
    {
      field: "approval",
      headerName: t("admin_ads.approve_reject"),
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Reject">
            <IconButton
              size="small"
              sx={{ color: theme.palette.error.main }}
              onClick={() => handleRejectClick(params.row.id)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Approve">
            <IconButton
              size="small"
              sx={{ color: theme.palette.success.main }}
              onClick={() => handleApproveClick(params.row.id)}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "message",
      headerName: t("admin_ads.message"),
      flex: 1,
      renderCell: (params) => {
        const hasUnread = hasUnreadMessages(params.row.initiatorId);
        const isLoading = chatLoading && chatLoadingId === params.row.id;
        return (
          <Tooltip title="Message Initiator">
            <IconButton
              size="small"
              onClick={() => handleChatClick(params.row)}
              sx={{
                color: theme.palette.info.main,
                "&:hover": {
                  backgroundColor: theme.palette.info.main + "10",
                },
              }}
            >
              <Badge color="error" variant="dot" invisible={!hasUnread}>
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <MessageIcon fontSize="small" />
                )}
              </Badge>
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ color: theme.palette.text.primary, minHeight: "100vh", p: 3 }}>
      <MuiTypography
        variant="h1"
        sx={{ fontWeight: 500, lineHeight: 1.6, mb: 3 }}
      >
        {t("admin_ads.title")}
      </MuiTypography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {cards.map(({ title, value }, idx) => (
          <Grid item key={idx} xs={12} sm={6} md={4}>
            <AdminDashboardCard title={title} value={value} mode={mode} />
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
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
            placeholder={t("admin_ads.search")}
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
        columns={columns}
        rows={filteredRows}
        paginationModel={paginationModel}
        setPaginationModel={handlePaginationModelChange}
        totalRecords={meta.totalRecords}
        paginationMode="server"
        loading={loading}
        sx={{
          [`& .${gridClasses.columnHeader}`]: {
            backgroundColor: "#709A1C",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
      />

      {/* Ad Details Dialog */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "60vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MuiTypography variant="h6">
            {t("admin_ads.ad_details")} :{selectedAdData?.adPost}
          </MuiTypography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedAdData && (
            <>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <MuiTypography variant="body2" color="textSecondary">
                      {t("admin_ads.post_initiaor")}
                    </MuiTypography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        src={getUserAvatar(selectedAdData.initiatorId)}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                          backgroundColor: theme.palette.primary.main,
                        }}
                      >
                        {getSafeAvatarName(selectedAdData.postInitiator)}
                      </Avatar>
                      <MuiTypography variant="body1">
                        {selectedAdData.postInitiator}
                      </MuiTypography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MuiTypography variant="body2" color="textSecondary">
                      {t("admin_ads.category")}
                    </MuiTypography>
                    <MuiTypography variant="body1">
                      {selectedAdData.category}
                    </MuiTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MuiTypography variant="body2" color="textSecondary">
                      {t("admin_ads.start_date")}
                    </MuiTypography>
                    <MuiTypography variant="body1">
                      {selectedAdData.startDate}
                    </MuiTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MuiTypography variant="body2" color="textSecondary">
                      {t("admin_ads.finish_date")}
                    </MuiTypography>
                    <MuiTypography variant="body1">
                      {selectedAdData.finishDate}
                    </MuiTypography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <MuiTypography variant="h6" sx={{ mb: 2 }}>
                  {t("admin_ads.documents")} (
                  {selectedAdData.documents?.length || 0})
                </MuiTypography>

                {selectedAdData.documents?.length > 0 ? (
                  <Box>
                    {selectedAdData.documents.map((document, index) =>
                      renderDocument(document, index)
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                      border: "2px dashed #ddd",
                    }}
                  >
                    <FileIcon sx={{ fontSize: 48, color: "#999", mb: 2 }} />
                    <MuiTypography variant="body1" sx={{ color: "#333" }}>
                      {t("admin_ads.no_documents")}
                    </MuiTypography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} variant="outlined">
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Approve/Reject */}
      <Dialog
        open={confirmationModalOpen}
        onClose={() => {
          setConfirmationModalOpen(false);
          setRejectionReason("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === "approve"
            ? t("admin_ads.approve")
            : t("admin_ads.reject")}
        </DialogTitle>
        <DialogContent>
          {actionType === "approve" ? (
            <MuiTypography variant="body1">
              {t("admin_ads.are_you_sure_approve")}
            </MuiTypography>
          ) : (
            <>
              <MuiTypography variant="body1" sx={{ mb: 2 }}>
                {t("admin_ads.are_you_sure_reject")}
              </MuiTypography>
              <TextField
                fullWidth
                variant="outlined"
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmationModalOpen(false);
              setRejectionReason("");
            }}
            color="secondary"
          >
            {t("admin_ads.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === "approve" ? "success" : "error"}
            variant="contained"
            disabled={actionType === "reject" && !rejectionReason.trim()}
          >
            {actionType === "approve"
              ? t("admin_ads.approve")
              : t("admin_ads.reject")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog
        fullScreen
        open={!!selectedChatUser}
        onClose={() => setSelectedChatUser(null)}
        PaperProps={{ sx: { backgroundColor: "background.default" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedChatUser && (
            <Box
              sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <Chat
                  activeChat={selectedChatUser}
                  onBack={() => setSelectedChatUser(null)}
                  showArchived={false}
                  setShowArchived={() => {}}
                  onProfileVisibilityChange={() => {}}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Adpost;
