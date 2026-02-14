import { gridClasses } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import Table from "../../../../components/Table";
import { colors } from "../../../../styles/theme";
import { initPubNub } from "../../../../services/pubnub/pubnubConfig";
import { useDispatch, useSelector } from "react-redux";
import Chat from "../../../../components/Message/Chat";
import { useCallback, useEffect, useState } from "react";
import { MessageText1, SearchNormal1, Sms } from "iconsax-react";
import { setLoading, setAlert } from "../../../../redux/configSlice";
import MuiTypography from "../../../../components/common/MuiTypography";
import { PUBNUB_CHANNEL, ALERT_TYPE } from "../../../../utils/constants/config";
import {
  grantAccessToRoom,
  getAdminDisputeUrl,
} from "../../../../apis/apiEndPoints";
import {
  Box,
  IconButton,
  InputBase,
  useTheme,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  setPubNubInstance,
  addAllMessage,
} from "../../../../redux/pubnubSlice";
import {
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL ||
  "https://useruploads-development.buildeezy.com/";

function Dispute() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { profileData, pubnubInstance, messages } = useSelector((state) => ({
    profileData: state.profile.profileData,
    pubnubInstance: state.pubnub.pubnubInstance,
    messages: state.pubnub.messages,
  }));

  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [chatType, setChatType] = useState(null); // 'initiator' or 'otherParty'
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [chatLoadingType, setChatLoadingType] = useState(null); // 'initiator' or 'otherParty'
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
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
    if (!profileData?.id || !userId || !messages) return false;

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

  const handleChatClick = async (dispute, type) => {
    try {
      setChatError(null);
      setChatLoading(true);
      setChatLoadingId(dispute.id);
      setChatLoadingType(type);
      setChatType(type);

      // Determine which user to chat with based on type
      let chatUserId, chatUserName;

      if (type === "initiator") {
        chatUserId =
          dispute.presolv360EmailData?.claimant?.userId || dispute.initiatorId;
        chatUserName =
          dispute.presolv360EmailData?.claimant?.name || dispute.initiator;
      } else {
        // "otherParty"
        chatUserId =
          dispute.presolv360EmailData?.respondent?.userId ||
          dispute.otherPartyId;
        chatUserName =
          dispute.presolv360EmailData?.respondent?.name || dispute.otherParty;
      }

      if (!profileData?.id || !chatUserId) {
        throw new Error("Missing user data for chat initiation");
      }

      // Create sorted channel ID (important for consistent channel naming)
      const users = [profileData.id, chatUserId].sort();
      const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;

      // Grant access to the channel
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
        avatar: null,
        channelId, // Important to include for message sending
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
      setChatLoadingType(null);
    }
  };

  const generatePresolveEmail = (dispute) => {
    try {
      const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      };
      const emailData = dispute.presolv360EmailData;
      const emailSubject = `Buildeezy Dispute Reference: ${
        emailData.disputeReferenceNumber || dispute.id
      }`;

      // Create the email body with consistent formatting
      const emailBody = [
        `Dear Presolv360 Team (email: info@presolv360.com)`,
        ``,
        `Buildeezy Reference Dispute Reference Number: ${
          emailData.disputeReferenceNumber || dispute.id
        }`,
        ``,
        `Please find details of a dispute between the below Claimant and Respondent(s).`,
        `Buildeezy has tried a mutual settlement to no avail, and thus the parties have`,
        `decided to proceed with an independent arbitration.`,
        ``,
        `The parties have settled the below fees with Buildeezy which will be transferred`,
        `to you separately. This email serves as an introduction of the case to Presolv360.`,
        `A copy of this mail has been shared with both parties, according to the`,
        `"Dispute resolution clause in Terms of service". and they will be expecting to hear from you on next steps.`,
        ``,
        `Agreement Date: ${dispute.startDate || "Not specified"}`,
        ``,
        ``,
        `Claimant:`,
        `Name: ${emailData.claimant.name || "Not specified"}`,
        `Address: ${emailData.claimant.address || "Not specified"}`,
        `Email: ${emailData.claimant.email || "Not specified"}`,
        `Mobile: ${emailData.claimant.mobile || "Not specified"}`,
        ``,
        `Respondent:`,
        `Name: ${emailData.respondent.name || "Not specified"}`,
        `Address: ${emailData.respondent.address || "Not specified"}`,
        `Email: ${emailData.respondent.email || "Not specified"}`,
        `Mobile: ${emailData.respondent.mobile || "Not specified"}`,
        ``,
        `Claim amount: ${emailData.claimAmount?.formatted || "Not specified"}(${
          emailData.claimAmount?.currency || "Not specified"
        })`,
        ``,
        `Fees: ${emailData.arbitrationFees?.formatted || "Not specified"} (${
          emailData.arbitrationFees?.calculation || "Not specified"
        })`,
        ``,
        `Description of the claim:`,
        `${
          emailData.disputeInformation.claimDescription || "No reason provided"
        }`,
        ``,
        `Relief or remedy sought:`,
        `${emailData.disputeInformation.reliefSought || "Not specified"}`,
        ``,
        `Copy of the agreement between the parties:`,
        `[Please attach relevant documents]`,
        ``,
        `Yours sincerely,`,
        `Buildeezy Dispute Team`,
      ].join("\n");

      return {
        subject: encodeURIComponent(emailSubject),
        body: encodeURIComponent(emailBody),
      };
    } catch (error) {
      console.error("Error generating email:", error);
      return {
        subject: "Buildeezy Dispute Reference",
        body: encodeURIComponent(
          "Error generating email content. Please check the dispute details."
        ),
      };
    }
  };

  const fetchDisputeData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getAdminDisputeUrl();
      const transformedRows = res.data.map((item) => ({
        id: item.id,
        job: item.job || "N/A",
        initiator: item.initiator || "N/A",
        initiatorId: item.initiatorId,
        otherParty: item.otherParty || "N/A",
        otherPartyId: item.otherPartyId,
        category: item.category || "N/A",
        totalValue: item.totalJobValue || "$0.00",
        milestoneEscrow: item.milestoneEscrow || "$0.00",
        startDate: item.startDate || "N/A",
        finshDate: item.finishDate || "N/A",
        market: item.market || "N/A",
        paymentRequestDate: item.paymentRequestDate || "N/A",
        initiatorDispute: item.initiatorDispute || "N/A",
        disputeReason: item.disputeReason || "N/A",
        hasUnreadMessagesInitiator: hasUnreadMessages(item.initiatorId),
        hasUnreadMessagesOtherParty: hasUnreadMessages(item.otherPartyId),
        originalData: item,
      }));

      setRows(transformedRows);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.ERROR,
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

  const constructFileUrl = (path) => {
    if (!path) return "";
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${IMAGE_BASE_URL}${cleanPath}`;
  };

  const formatKeyName = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const handleViewDisputeDetails = (row) => {
    setSelectedDispute(row.originalData);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchDisputeData();
  }, [fetchDisputeData]);

  const columns = [
    {
      field: "job",
      headerName: t("admin_dispute.job"),
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
            {params.row.job}
          </MuiTypography>
          <IconButton
            size="small"
            onClick={() => handleViewDisputeDetails(params.row)}
            sx={{
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main + "10",
              },
            }}
            title="View Dispute details"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    { field: "initiator", headerName: t("admin_dispute.client"), flex: 1 },
    { field: "category", headerName: t("admin_dispute.category"), flex: 1 },
    {
      field: "totalValue",
      headerName: t("admin_dispute.total_value"),
      flex: 1,
    },
    {
      field: "milestoneEscrow",
      headerName: t("admin_dispute.milestone_escrow"),
      flex: 1,
    },
    { field: "startDate", headerName: t("admin_dispute.start_date"), flex: 1 },
    { field: "finshDate", headerName: t("admin_dispute.finsh_date"), flex: 1 },
    { field: "market", headerName: t("admin_dispute.market"), flex: 1 },
    {
      field: "paymentRequestDate",
      headerName: t("admin_dispute.payment_request_date"),
      flex: 1,
    },
    {
      field: "initiatorDispute",
      headerName: t("admin_dispute.initiator_dispute"),
      flex: 1,
    },
    {
      field: "responseToInitiator",
      headerName: t("admin_dispute.release_to_initiator"),
      flex: 1,
      renderCell: (params) => {
        const isLoading =
          chatLoading &&
          chatLoadingId === params.row.id &&
          chatLoadingType === "initiator";
        return (
          <Tooltip title="Message Initiator">
            <IconButton
              onClick={() =>
                handleChatClick(params.row.originalData, "initiator")
              }
            >
              <Badge
                color="error"
                variant="dot"
                invisible={!params.row.hasUnreadMessagesInitiator}
              >
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
    {
      field: "responseToOtherParty",
      headerName: t("admin_dispute.response_to_other_party"),
      flex: 1,
      renderCell: (params) => {
        const isLoading =
          chatLoading &&
          chatLoadingId === params.row.id &&
          chatLoadingType === "otherParty";
        return (
          <Tooltip title="Message Respondent">
            <IconButton
              onClick={() =>
                handleChatClick(params.row.originalData, "otherParty")
              }
            >
              <Badge
                color="error"
                variant="dot"
                invisible={!params.row.hasUnreadMessagesOtherParty}
              >
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
    {
      field: "presolve",
      headerName: t("admin_dispute.presolve"),
      flex: 1,
      renderCell: (params) => {
        const handlePresolveClick = () => {
          try {
            const email = generatePresolveEmail(params.row.originalData);
            const mailtoLink = `mailto:info@presolv360.com?subject=${email.subject}&body=${email.body}`;

            // Try to open in new tab first
            const newWindow = window.open(mailtoLink, "_blank");

            // Fallback if popup is blocked
            if (
              !newWindow ||
              newWindow.closed ||
              typeof newWindow.closed === "undefined"
            ) {
              window.location.href = mailtoLink;
            }
          } catch (error) {
            dispatch(
              setAlert({
                show: true,
                type: ALERT_TYPE.error,
                message: "Failed to open email client",
              })
            );
          }
        };

        return (
          <Tooltip title="Send to Presolve 360">
            <IconButton
              size="large"
              onClick={handlePresolveClick}
              sx={{
                color: mode === "dark" ? colors.white : colors.black,
              }}
            >
              <Sms size={20} />
            </IconButton>
          </Tooltip>
        );
      },
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
        <MuiTypography
          variant="h1"
          sx={{
            fontWeight: 500,
            lineHeight: 1.6,
            color: mode === "dark" ? colors.white : colors.black,
            fontSize: 20,
          }}
        >
          {t("admin_dispute.title")}
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
            placeholder={t("admin_dispute.search")}
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
      {/* Dispute details dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
            Dispute Details: {selectedDispute?.job}
          </MuiTypography>
          <IconButton onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedDispute?.disputeDetails && (
            <>
              {/* Basic Info Section */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <MuiTypography variant="subtitle2" color="textSecondary">
                      Status
                    </MuiTypography>
                    <Chip
                      label={selectedDispute.disputeStatus || "Unknown"}
                      color={
                        selectedDispute.disputeStatus === "resolved"
                          ? "success"
                          : selectedDispute.disputeStatus === "in_progress"
                          ? "warning"
                          : "default"
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MuiTypography variant="subtitle2" color="textSecondary">
                      Priority
                    </MuiTypography>
                    <Chip
                      label={selectedDispute.priority || "Not specified"}
                      color={
                        selectedDispute.priority === "high"
                          ? "error"
                          : selectedDispute.priority === "medium"
                          ? "warning"
                          : "default"
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Dispute Details Section */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 2,
                  }}
                >
                  {Object.entries(selectedDispute.disputeDetails)
                    .filter(([_, value]) => value !== null) // Filter out null values
                    .map(([key, value]) => (
                      <Box
                        key={key}
                        sx={{
                          mb: 2,
                          pb: 2,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <MuiTypography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {formatKeyName(key)}:
                        </MuiTypography>
                        {Array.isArray(value) ? (
                          value.length > 0 ? (
                            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                              {value.map((item, i) => (
                                <Box component="li" key={i}>
                                  <MuiTypography variant="body2">
                                    {item.toString()}
                                  </MuiTypography>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <MuiTypography
                              variant="body2"
                              color="textSecondary"
                            >
                              None
                            </MuiTypography>
                          )
                        ) : (
                          <MuiTypography variant="body2">
                            {value.toString()}
                          </MuiTypography>
                        )}
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Documents Section */}
              {selectedDispute.disputeDetails.documents?.length > 0 && (
                <Box>
                  <MuiTypography variant="h6" sx={{ mb: 2 }}>
                    Supporting Documents
                  </MuiTypography>
                  <Grid container spacing={2}>
                    {selectedDispute.disputeDetails.documents.map(
                      (doc, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <FileIcon sx={{ mr: 1 }} />
                                <MuiTypography variant="body2" noWrap>
                                  {doc.split("/").pop()}
                                </MuiTypography>
                              </Box>
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() =>
                                  window.open(constructFileUrl(doc), "_blank")
                                }
                              >
                                Download
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </DialogContent>
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

export default Dispute;
