import { gridClasses } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import Table from "../../../../components/Table";
import { colors } from "../../../../styles/theme";
import { initPubNub } from "../../../../services/pubnub/pubnubConfig";
import { useDispatch, useSelector } from "react-redux";
import Chat from "../../../../components/Message/Chat";
import { useCallback, useEffect, useState } from "react";
import { setAlert, setLoading } from "../../../../redux/configSlice";
import { MessageText1, SearchNormal1, TickCircle } from "iconsax-react";
import MuiTypography from "../../../../components/common/MuiTypography";
import AdListSkeleton from "../../../../components/skeleton/AdListSkeleton";
import { PUBNUB_CHANNEL, ALERT_TYPE } from "../../../../utils/constants/config";
import {
  Box,
  IconButton,
  InputBase,
  useTheme,
  Tooltip,
  Badge,
  Dialog,
  DialogContent,
  CircularProgress,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  setPubNubInstance,
  addAllMessage,
} from "../../../../redux/pubnubSlice";
import {
  getAdminEscrowUrl,
  grantAccessToRoom,
  releaseEscrowAmountRequest,
} from "../../../../apis/apiEndPoints";

const ELIGIBLE_MILESTONE_STATES = [
  "active",
  "payment_requested",
  "partial",
  "disputed",
];

function PaymentManagment() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { loading } = useSelector((state) => state.config);

  const { profileData, pubnubInstance, messages } = useSelector((state) => ({
    profileData: state.profile.profileData,
    pubnubInstance: state.pubnub.pubnubInstance,
    messages: state.pubnub.messages,
  }));

  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedMilestoneToRelease, setSelectedMilestoneToRelease] =
    useState(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  // Initialize PubNub when component mounts
  useEffect(() => {
    if (profileData?.id && !pubnubInstance) {
      const pubnub = initPubNub(profileData.id, dispatch);
      dispatch(setPubNubInstance(pubnub));
    }
  }, [profileData?.id, dispatch, pubnubInstance]);

  // Check for unread messages
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

  const handleChatClick = async (user) => {
    try {
      setChatError(null);
      setChatLoading(true);
      setChatLoadingId(user.id);

      if (!profileData?.id || !user?.initiatorId) {
        throw new Error("Missing user data for chat initiation");
      }

      const chatUserId = user.initiatorId;
      const chatUserName = user.initiator || "Unknown User";
      const avatar = user.documents?.[0]
        ? `${IMAGE_BASE_URL}${user.documents[0]}`
        : null;

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

      // Subscribe to channel
      await pubnubInstance.subscribe({
        channels: [channelId],
      });

      // Fetch message history
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

      // Open chat dialog
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

  const handleReleaseEscrow = async () => {
    console.log("Attempting to release milestone:", {
      milestoneId: selectedMilestoneToRelease?.id,
      milestoneData: selectedMilestoneToRelease,
      rowId: selectedRow?.id,
    });
    if (!selectedMilestoneToRelease || !selectedMilestoneToRelease.id) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "No valid milestone selected for release",
        })
      );
      setConfirmOpen(false);
      return;
    }

    setReleaseLoading(true);
    try {
      // First verify the milestone exists in the current data
      const currentRow = rows.find((row) => row.id === selectedRow?.id);
      const milestoneExists = currentRow?.milestones?.some(
        (m) => m.id === selectedMilestoneToRelease.id
      );

      if (!milestoneExists) {
        throw new Error("Milestone not found in current data");
      }

      const response = await releaseEscrowAmountRequest(
        selectedMilestoneToRelease.id
      );

      if (response.status === 200 || response.status === 204) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: `Successfully released escrow for ${selectedRow?.job}`,
          })
        );
        await fetchEscrowData(); // Refresh data
      } else {
        throw new Error(response.data?.message || "Release failed");
      }
    } catch (err) {
      console.error("Release error:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message:
            err.response?.data?.errors?.[0]?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Failed to release escrow",
        })
      );
    } finally {
      setReleaseLoading(false);
      setConfirmOpen(false);
      setSelectedMilestoneToRelease(null);
      setSelectedRow(null);
    }
  };

  const handleConfirmOpen = (row) => {
    setSelectedRow(row);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setSelectedRow(null);
    setSelectedMilestoneToRelease(null);
  };

  const fetchEscrowData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { page, pageSize } = paginationModel;

      const { data: res } = await getAdminEscrowUrl({
        page: page + 1,
        limit: pageSize,
      });

      const transformedRows = res.data.map((item) => ({
        id: item.id,
        job: item.jobTitle || "N/A",
        initiator: item.initiator || "N/A",
        initiatorId: item.initiatorId,
        category: item.category || "N/A",
        totalValue: item.totalValue || "$0.00",
        milestoneEscrow: `${item.completedMilestones || 0}/${
          item.milestoneCount || 0
        }`,
        finshDate: item.finishDate || "N/A",
        market: item.market?.name || "Unknown",
        paymentRequestDate:
          item.paymentReleased === "$0.00" ? "No request" : item.updatedAt,
        releaseEscrowAmountRequest: item.releaseEscrow ? "Yes" : "No",
        automatedPaymentReleaseDate: item.automate
          ? item.updatedAt
          : "Not automated",
        documents: item.documents || [],
        hasUnreadMessages: hasUnreadMessages(item.initiatorId),
        milestones: item.milestones || [],
        originalData: item,
      }));

      setRows(transformedRows);
      setMeta({
        page: res.meta.page,
        totalPages: res.meta.totalPages,
        totalRecords: res.meta.totalRecords,
      });
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
  }, [dispatch, paginationModel]);

  const filteredRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const paginatedRows = filteredRows;

  useEffect(() => {
    fetchEscrowData();
  }, [paginationModel]);

  const renderMilestones = (params) => {
    return (
      <Box sx={{ width: "100%" }}>
        {params.value.length} milestone(s)
        {params.value.map((milestone, index) => (
          <Box key={index} sx={{ mt: 1 }}>
            {milestone.title}: ${milestone.amount} ({milestone.state})
          </Box>
        ))}
      </Box>
    );
  };

  const columns = [
    { field: "job", headerName: t("admin_escrow.job"), flex: 1 },
    { field: "initiator", headerName: t("admin_escrow.initiator"), flex: 1 },
    { field: "category", headerName: t("admin_escrow.category"), flex: 1 },
    { field: "totalValue", headerName: t("admin_escrow.total_value"), flex: 1 },
    {
      field: "milestoneEscrow",
      headerName: t("admin_escrow.milestone_escrow"),
      flex: 1,
    },

    { field: "finshDate", headerName: t("admin_escrow.finsh_date"), flex: 1 },
    { field: "market", headerName: t("admin_escrow.market"), flex: 1 },
    {
      field: "paymentRequestDate",
      headerName: t("admin_escrow.payment_request_date"),
      flex: 1,
    },
    {
      field: "milestones",
      headerName: "Milestones",
      flex: 3,
      renderCell: renderMilestones,
      sortable: false,
    },
    {
      field: "releaseEscrowAmountRequest",
      headerName: t("admin_escrow.release_escrow_amount_request"),
      flex: 1,
      renderCell: (params) => {
        // Find all eligible milestones (only ACTIVE, PAYMENT_REQUESTED, PARTIAL, or DISPUTED)
        const eligibleMilestones = params.row.milestones?.filter(
          (milestone) =>
            milestone.paymentStatus === "paid" &&
            ELIGIBLE_MILESTONE_STATES.includes(milestone.state.toLowerCase())
        );

        return (
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Tooltip title={"Release escrow"}>
              <span>
                <IconButton
                  size="large"
                  onClick={() => {
                    if (eligibleMilestones?.length) {
                      setSelectedMilestoneToRelease(eligibleMilestones[0]);
                      setSelectedRow(params.row);
                      setConfirmOpen(true);
                    }
                    handleConfirmOpen(params.row);
                  }}
                  sx={{ color: "#709A1C" }}
                >
                  {releaseLoading && selectedRow?.id === params.row.id ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <TickCircle size={20} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "automatedPaymentReleaseDate",
      headerName: t("admin_escrow.automated_payment_Release_date"),
      flex: 1,
    },
    {
      field: "message",
      headerName: t("admin_escrow.message"),
      flex: 1,
      renderCell: (params) => {
        const hasUnread = hasUnreadMessages(params.row.initiatorId);
        const isLoading = chatLoading && chatLoadingId === params.row.id;
        return (
          <Tooltip title="Message Initiator">
            <IconButton
              size="large"
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
                  <MessageText1 size={20} />
                )}
              </Badge>
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  if (loading) {
    return <AdListSkeleton />;
  }

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
        <MuiTypography
          variant="h1"
          sx={{
            fontWeight: 500,
            lineHeight: 1.6,
            color: mode === "dark" ? colors.white : colors.black,
            fontSize: 20,
          }}
        >
          {t("admin_escrow.title")}
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
            placeholder={t("admin_escrow.search")}
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
        setPaginationModel={setPaginationModel}
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

      {/* Chat Dialog - Same as Verification/Adpost Pages */}
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
      {/* Confirmation Dialog for Escrow Release */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Escrow Release
        </DialogTitle>
        <DialogContent>
          <MuiTypography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to release escrow for:
          </MuiTypography>

          {selectedRow && (
            <Box sx={{ mb: 2 }}>
              <MuiTypography variant="h2">
                <strong>Job:</strong> {selectedRow.job}
              </MuiTypography>
              <MuiTypography variant="h2">
                <strong>Initiator:</strong> {selectedRow.initiator}
              </MuiTypography>
            </Box>
          )}

          {selectedMilestoneToRelease && (
            <Box
              sx={{
                p: 2,
                backgroundColor: theme.palette.grey[800],
                borderRadius: 1,
              }}
            >
              <MuiTypography variant="subtitle1">
                <strong>Milestone Amount:</strong> $
                {selectedMilestoneToRelease.amount}
              </MuiTypography>
              {selectedMilestoneToRelease.title && (
                <MuiTypography variant="body2">
                  {selectedMilestoneToRelease.title}
                </MuiTypography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleReleaseEscrow}
            color="primary"
            autoFocus
            disabled={releaseLoading}
            startIcon={releaseLoading ? <CircularProgress size={20} /> : null}
          >
            Confirm Release
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaymentManagment;

// Add this constant at the top of your file if not already present
const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL ||
  "https://useruploads-development.buildeezy.com/";
