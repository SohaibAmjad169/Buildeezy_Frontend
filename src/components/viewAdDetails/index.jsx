import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
} from "@mui/material";
import { Eye } from "iconsax-react";
import dayjs from "dayjs";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiTypography from "../common/MuiTypography";
import { getAllFirstCharUpperCase } from "../../utils/common";
import logoPlaceholder from "../../assets/images/logo_placeholder.svg";
import DocList from "../upload/DocList";
import SingleDocView from "../common/SingleDocView";
import { colors } from "../../styles/theme";
import AdActionButtons from "../myAds/AdActionButtons";
import MuiDialog from "../common/MuiDialog";
import { setAlert, setLoading } from "../../redux/configSlice";
import moment from "moment-timezone";
import {
  deleteAdUrl,
  notifyForNewMessage,
  registerForWebinar,
  grantAccessToRoom,
} from "../../apis/apiEndPoints";
import { ALERT_TYPE, PUBNUB_CHANNEL } from "../../utils/constants/config";
import ActionButton from "../common/ActionButton";
import LearningAdDetails from "./LearningAdDetails";
import LearningAdDetailsMobile from "./LearningAdDetailsMobile";
import ViewJobDetailsSkeleton from "../skeleton/ViewJobDetailsSkeleton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { addMessage } from "../../redux/pubnubSlice";
import useAdAnalytics from "../../hooks/useAdAnalytics";
import AdAnalyticsChart from "./AdAnalyticsChart";
import AdStatus from "../myAds/AdStatus";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function getThemeColor(theme) {
  switch (theme) {
    case "green":
      return { bg: "#F7FFE6", main: "#709a1c" };
    case "white":
      return { bg: colors.white, main: colors.black800 };
    case "blue":
      return { bg: colors.blue300, main: "#20335F" };
    case "grey":
      return { bg: colors.grey400, main: colors.black800 };
    case "purple":
      return { bg: "#F8F4F8", main: "#5f4a61" };
    case "yellow":
      return { bg: colors.orange200, main: "#DB7121" };
    case "rose":
      return { bg: colors.red300, main: "#8C3849" };
    default:
      return { bg: "#F7FFE6", main: "#709a1c" };
  }
}

const FONT_MAP = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  oswald: "'Oswald', sans-serif",
  playfair: "'Playfair Display', serif",
  anton: "'Anton', sans-serif",
  courier: "'Courier New', Courier, monospace",
  lora: "'Lora', serif",
  montserrat: "'Montserrat', sans-serif",
  orbitron: "'Orbitron', sans-serif",
  pacifico: "'Pacifico', cursive",
  dancing: "'Dancing Script', cursive", 
};
function getFontFamily(fontValue) {
  return FONT_MAP[fontValue] || FONT_MAP["inter"];
}

function ViewAdDetails({
  adDetails,
  isMyAd = false,
  isPreview = false,
  isMobile,
  isSaved = false,
  onSave,
  webinarId,
  authorId,
  authorName,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pubnubInstance } = useSelector((state) => state.pubnub);
  const [isLocallySaved, setIsLocallySaved] = useState(isSaved);
  const [activeTab, setActiveTab] = useState(0);
  const [registeredToWebinar, setRegisteredToWebinar] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const themeValue = adDetails?.theme || "green";
  const themeColors = getThemeColor(themeValue);

  const fontValue = adDetails?.font || "inter";
  const fontFamily = getFontFamily(fontValue);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { userList } = useSelector((state) => state.pubnub);
  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";
  const isLearningAd =
    adDetails?.adType === "learningSolution" ||
    adDetails?.type === "learningSolution";

  const isMobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  // Analytics hook
  const { analyticsData, analyticsLoading, fetchAnalytics, refreshAnalytics } =
    useAdAnalytics();

  // Update local state when prop changes
  useEffect(() => {
    setIsLocallySaved(isSaved);
  }, [isSaved]);

  // Fetch analytics when component mounts (only for my ads) - default to 7 days
  useEffect(() => {
    if (isMyAd && adDetails?.id && !isPreview) {
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultEndDate.getDate() - 7);

      fetchAnalytics(adDetails.id, {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
    }
  }, [isMyAd, adDetails?.id, isPreview, fetchAnalytics]);

  // Handle date range change for analytics
  const handleDateRangeChange = useCallback(
    (dateRange) => {
      if (adDetails?.id) {
        refreshAnalytics(adDetails.id, dateRange);
      }
    },
    [adDetails?.id, refreshAnalytics]
  );

  const handleSave = (e) => {
    e.stopPropagation();
    setIsLocallySaved(!isLocallySaved);
    onSave();
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Guard: show skeleton if adDetails is missing or empty
  if (!adDetails || Object.keys(adDetails).length === 0) {
    return (
      <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", py: 8, textAlign: "center" }}>
        <ViewJobDetailsSkeleton />
      </Box>
    );
  }

  // All existing functions remain exactly the same
  function onReactiveAd(e) {
    e.stopPropagation();
    navigate("/my-ads/reactive/" + adDetails.id);
  }

  function onEditAd(e) {
    e.stopPropagation();
    navigate("/my-ads/edit/" + adDetails.id);
  }

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }

  function onDeleteAd() {
    setOpenDeleteDialog(true);
  }

  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteAdUrl(adDetails.id);
      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("ad.deleted_successfully"),
        })
      );
      navigate("/my-ads");
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

  function onViewProfile() {
    if (adDetails?.author?.id) {
      navigate(
        `${
          !isAdmin
            ? `/dashboard/view/${adDetails.author.id}/profile`
            : `/admin/view/${adDetails.author.id}/profile`
        }`
      );
    }
  }

  // TODO: Call to action for learning ad
  async function handleCallToAction() {
    if (adDetails.callToAction === "learn_more" && adDetails.url) {
      window.open(adDetails.url, "_blank");
    }
    else if (adDetails.callToAction === "register") {
      await handleRegister();
    } else if (
      adDetails.state === "contact" ||
      adDetails.type === "advertisement"
    ) {
      // Handle contact action
      const chatUser = userList?.find(
        (u) => String(u.id) === String(adDetails.author?.id)
      );
      if (!chatUser) {
        console.warn(
          "[Contact Button] User not found in userList:",
          adDetails.author?.id
        );
      } else {
        console.log("[Contact Button] Found user in userList:", chatUser);
      }
      const navState = chatUser
        ? {
            chatUserId: chatUser.id,
            chatUserName: `${chatUser.firstName || ""} ${
              chatUser.lastName || ""
            }`.trim(),
            avatar: chatUser.avatar,
          }
        : {
            chatUserId: adDetails.author?.id,
            chatUserName: `${adDetails?.author?.firstName || ""} ${
              adDetails?.author?.lastName || ""
            }`.trim(),
            avatar: adDetails?.author?.avatar,
          };
      navigate("/message", { state: navState });
    }
  }

  const handleRegister = async () => {
    try {
      let btnDisabledStates = ["registered", "already_registered"];
      let response = await registerForWebinar({ webinarId });
      setRegisteredToWebinar(
        btnDisabledStates.includes(response?.data?.status) ? true : false
      );
      if (response?.data?.status === "registered") {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: "Registration successfull",
          })
        );
        //Send invitation link via message

        await sendMeetingInvitation(response?.data);
      } else {
        //show appropriate error message
        let errorMessage =
          response?.data?.status === "already_registered"
            ? "Already Registered"
            : "Registration failed";
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: errorMessage,
          })
        );
      }
    } catch (err) {
      console.log("error", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Registration failed",
        })
      );
    }
    return;
  };
  const sendMeetingInvitation = async (meetingInfo) => {
    if (pubnubInstance) {
      const users = [profileData.id, authorId].sort();
      const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;
      let callId = meetingInfo?.callId;
      const inviteLink = `${window.location.origin}/webinar/meeting/${callId}`;
      //convert utc time to timezone selected while creating webinar
      let startDateTimeUTC = meetingInfo.startDate;
      let selectedTimeZone = meetingInfo.timeZone;
      const localTime = moment
        .utc(startDateTimeUTC)
        .tz(selectedTimeZone)
        .format("MMMM D, YYYY h:mm A");
      const inviteMessage = `
Hello ${profileData.firstName},

Thank you for registering for the upcoming meeting! 🎉  

📅 Date & Time: ${localTime} (${selectedTimeZone})  
🔗 Join Link: ${inviteLink}  

We look forward to having you join us.  

Best regards,  
${authorName}
`;
      const message = {
        text: inviteMessage,
        senderId: authorId,
        sender: authorName,
        receiverId: profileData.id,
        receiver: `${profileData.firstName} ${profileData.lastName}`,
        time: new Date().getTime(),
      };

      try {
        await grantAccessToRoom({
          roomName: channelId,
          user1: authorId,
          user2: profileData.id,
        });
        await subscribeToChannel(channelId);
        // Await publish
        await pubnubInstance.publish({
          channel: channelId,
          message,
          storeInHistory: true,
        });

        if (profileData.id && authorId) {
          await notifyNewMessage({
            fromUser: authorId,
            toUser: profileData.id,
            content: `Hi ${profileData.firstName}, Thank you for registering for webinar. you can join webinar here - ${meetingLink}`,
          });
        }

        // Dispatch immediately (not async)
        dispatch(addMessage({ channelId, message }));
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.info,
            message: "Invitation Sent",
          })
        );
      } catch (error) {
        console.error(`Failed to send to ${profileData.id}:`, error);
      }
    }
  };

  async function notifyNewMessage(payload) {
    try {
      const response = await notifyForNewMessage(payload);
    } catch (err) {
      console.error("Error notifyNewMessage:", err);
    }
  }
  async function subscribeToChannel(channelId) {
    if (!pubnubInstance) {
      console.warn("⚠️ PubNub instance not ready, skipping subscribeToChannel");
      return;
    }

    try {
      await pubnubInstance.subscribe({
        channels: [channelId],
      });
      // Listen
      pubnubInstance.addListener({
        message: (event) => {
          console.log("New message received:", event.message);
        },
      });
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channelId}:`, error);
    }
  }
  // Learning Ad Handler
  if (isLearningAd) {
    if (isMobileScreen) {
      return (
        <LearningAdDetailsMobile
          adDetails={adDetails}
          isMyAd={isMyAd}
          isPreview={isPreview}
          handleSave={handleSave}
          isLocallySaved={isLocallySaved}
        />
      );
    }
    return (
      <LearningAdDetails
        adDetails={adDetails}
        isMyAd={isMyAd}
        isPreview={isPreview}
        handleSave={handleSave}
        isLocallySaved={isLocallySaved}
      />
    );
  }

  function isApproachEmpty(approach) {
    if (!approach) return true;
    const trimmed = approach.trim();
    return trimmed === "<p></p>" || /^<p>\s*<\/p>$/.test(trimmed);
  }

  const renderSection = (title, children) => (
    <Box sx={{ mb: 4 }}>
      {title && (<Typography
        variant="h2"
        sx={{
          mb: 2,
          color: themeColors.main,
          fontWeight: 600,
          fontFamily,
        }}
      >
        {title}
      </Typography>)}
      <Box id="ads-preview-section" sx={{ fontFamily }}>{children}</Box>
    </Box>
  );

  // Main Return Statement with MINIMAL improvements
  return (
    <Box
      id="ads-preview-container"
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 1, md: 3 },
        fontFamily
      }}
    >
      {/* FIXED: Tab Navigation - Simple and clean like Figma */}
      {isMyAd && !isPreview && (
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              minHeight: "auto",
              "& .MuiTab-root": {
                minHeight: "auto",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                px: 3,
                py: 1.5,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 2,
              },
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Tab label={t("ad.details.overview") || "Overview"} />
            <Tab label={t("analytics.title") || "Analytics"} />
          </Tabs>
        </Box>
      )}

      {/* Overview Tab Content */}
      {(currentTab === 0 || !isMyAd || isPreview) && (
        <>
          <Box
            id="ads-preview-header"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "flex-end",
              mt: 2,
              mb: 3,
              maxWidth: "800px",
              ml: "auto",
              mr: "auto",
            }}
          >
            {isMyAd && (
              <>
              <AdStatus reason={adDetails?.reason} />
              <Box
                sx={{
                  display: "flex",
                  mt: { xs: 2, md: 0 },
                  width: { xs: "100%", sm: "50%", md: "40%" },
                  gap: 1,
                }}
              >

                <AdActionButtons
                  onEditAd={onEditAd}
                  onReactiveAd={onReactiveAd}
                  onDeleteAd={onDeleteAd}
                  
                  disabledReactiveAd={
                    dayjs(adDetails.expireAt) > dayjs(new Date())
                  }
                />
              </Box>
              </>
              
            )}
            {!isMyAd && !isPreview && !isAdmin && (
              <ActionButton
                variant="contained"
                onClick={onViewProfile}
                startIcon={<Eye />}
                sx={{
                  mt: { xs: 2, md: 0 },
                  mb: { xs: 1, md: 0 },
                }}
              >
                {t("ad.details.view_profile")}
              </ActionButton>
            )}
          </Box>

          <Box
            id="ads-preview-content"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              width: "100%",
              pb: { xs: 10, md: 0 },
            }}
          >
            {/* FIXED: Hero Image - Simple without extra wrapper */}
            <Box
              sx={{
                mt: { xs: 1, md: 3 },
                position: "relative",
              }}
            >
              <SingleDocView
                file={adDetails?.banner || adDetails?.documents?.[0]}
                isMobile={isMobile}
              />
              {/* Ad Type Badge */}
              <Chip
                label={getAllFirstCharUpperCase(adDetails?.adType)}
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  bgcolor: themeColors.main,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              />
            </Box>

            {/* FIXED: Content - No cards, simple sections like Figma */}
            <Box sx={{ width: "100%", mt: 3 }}>
              <MuiTypography
                variant="h1"
                sx={{
                  mt: 3,
                  mb: 3,
                  color: themeColors.main,
                  fontWeight: 600,
                  fontFamily,
                }}
              >
                {getAllFirstCharUpperCase(adDetails?.adType)}
              </MuiTypography>

              <Box sx={{ maxWidth: "800px", ml: 0 }}>
                <MuiTypography
                  variant="h1"
                  sx={{
                    mt: 3,
                    mb: 3,
                    color: themeColors.main,
                    fontWeight: 600,
                    fontFamily,
                  }}
                >
                  {getAllFirstCharUpperCase(adDetails?.headline)}
                </MuiTypography>

                {/* Description Section - No card */}
                <Box sx={{ my: 5 }}>
                  <MuiTypography
                    variant="h2"
                    sx={{
                      color: themeColors.main,
                      fontWeight: 600,
                      mt: 3,
                      mb: 3,
                      fontFamily,
                    }}
                  >
                    Description
                  </MuiTypography>
                  {adDetails?.description ? (
                    <MuiTypography variant="h3" sx={{ color: themeColors.main, fontFamily }}>
                      {adDetails?.description}
                    </MuiTypography>
                  ) : (
                    <MuiTypography
                      variant="subtitle2"
                      sx={{ color: themeColors.main, fontFamily }}
                    >
                      {t("ad.details.no_description")}
                    </MuiTypography>
                  )}
                </Box>

                <DocList documents={adDetails?.documents} isMobile={isMobile} />

                {/* Business Details Section - No card */}
                <Box sx={{ my: 5 }}>
                  <MuiTypography
                    variant="h2"
                    sx={{
                      color: themeColors.main,
                      fontWeight: 600,
                      mt: 3,
                      fontFamily,
                    }}
                  >
                    {t("ad.details.business_details")}
                  </MuiTypography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      pt: 2,
                      borderRadius: "8px",
                      alignItems: "center",
                    }}
                  >
                    {adDetails?.logo ? (
                      <Box
                        component="img"
                        src={
                          adDetails.logo.includes("https:")
                            ? adDetails.logo
                            : IMAGE_URL + adDetails.logo
                        }
                        alt="logo"
                        sx={{
                          height: 80,
                          width: 80,
                          borderRadius: "40px",
                          border: `1px solid ${colors.white}`,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={logoPlaceholder}
                        alt="logo"
                        sx={{
                          height: 46,
                          color: colors.primary,
                          width: 46,
                          borderRadius: "40px",
                          border: `1px solid ${colors.white}`,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <Box>
                      <MuiTypography
                        variant="h2"
                        sx={{
                          fontWeight: 600,
                          color: themeColors.main,
                          mb: 2,
                          pl: 0.5,
                        }}
                      >
                        {adDetails?.businessName}
                      </MuiTypography>
                      <MuiTypography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 500,
                          color: themeColors.main,
                          pl: 0.5,
                        }}
                      >
                        {adDetails?.url}
                      </MuiTypography>
                    </Box>
                  </Box>
                </Box>

                {/* How it Works Section - No card */}
                <MuiTypography
                  variant="h2"
                  sx={{
                    fontWeight: 600,
                    color: themeColors.main,
                    mb: 2,
                    fontFamily,
                  }}
                >
                  {t("ad.how_it_works")}
                </MuiTypography>

                <Box>
                  {adDetails?.approach &&
                    !isApproachEmpty(adDetails?.approach) &&
                    renderSection(
                      null,
                      <Typography
                        variant="h6"
                        sx={{
                          color: themeColors.main,
                          mb: 2,
                          fontWeight: 500,
                          fontFamily,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: adDetails?.approach,
                        }}
                      />
                    )}

                  {adDetails?.faq?.length > 0 &&
                    renderSection(
                      t("user_profile.frequently_asked_questions"),
                      <Box>
                        {adDetails?.faq?.map((value, index) => (
                          <Box
                            key={index}
                            sx={{
                              borderBottom:
                                index !== adDetails?.faq.length - 1
                                  ? `1px solid ${themeColors.main}`
                                  : "none",
                            }}
                            p={0}
                          >
                            <Box
                              onClick={() =>
                                setActiveTab(activeTab === index ? null : index)
                              }
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 2,
                                cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  color: themeColors.main,
                                  fontWeight: activeTab === index ? 600 : 400,
                                  fontFamily,
                                }}
                              >
                                {value.question}
                              </Typography>
                              <IconButton
                                size="small"
                                sx={{
                                  color: themeColors.main,
                                  border: `1px solid ${themeColors.main}`,
                                }}
                              >
                                {activeTab === index ? (
                                  <RemoveIcon />
                                ) : (
                                  <AddIcon />
                                )}
                              </IconButton>
                            </Box>

                            {activeTab === index && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: themeColors.main,
                                  pb: 2,
                                  pl: 0.5,
                                  fontFamily,
                                }}
                              >
                                {value.answer}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                </Box>

                {/* Call to Action Section - No card */}
                {adDetails?.state && (
                  <Box sx={{ width: "100%", my: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {!isAdmin && adDetails?.callToAction ? (
                        <ActionButton
                          variant="contained"
                          onClick={handleCallToAction}
                          disabled={registeredToWebinar}
                          
                          sx={{
                            backgroundColor: themeColors.main,
                            color: colors.white,
                            fontSize: "0.75rem",
                            padding: "8px 16px",
                            minWidth: "120px",
                            height: "32px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: colors.primary800,
                              transform: "translateY(-1px)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                            },
                            "&:active": {
                              transform: "translateY(0)",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            },
                          }}
                        >
                          {t(
                            `ad.details.${
                              adDetails.callToAction || "contact_only"
                            }`
                          )}
                        </ActionButton>
                      ) : null}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Bottom Action Buttons */}
          {isMyAd && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "flex-end",
                mt: 4,
                mb: 2,
                maxWidth: "800px",
                ml: "auto",
                mr: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  mt: { xs: 2, md: 0 },
                  width: { xs: "100%", sm: "50%", md: "40%" },
                  gap: 1,
                }}
              >
                <AdActionButtons
                  onEditAd={onEditAd}
                  onReactiveAd={onReactiveAd}
                  onDeleteAd={onDeleteAd}
                  disabledReactiveAd={
                    dayjs(adDetails.expireAt) > dayjs(new Date())
                  }
                />
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Analytics Tab Content */}
      {isMyAd && !isPreview && currentTab === 1 && (
        <AdAnalyticsChart
          analyticsData={analyticsData}
          loading={analyticsLoading}
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {/* Delete Dialog */}
      <MuiDialog
        title={t("ad.delete_ad")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

ViewAdDetails.propTypes = {
  adDetails: PropTypes.object,
  isMyAd: PropTypes.bool,
  isPreview: PropTypes.bool,
  isMobile: PropTypes.bool,
  isSaved: PropTypes.bool,
  onSave: PropTypes.func,
  webinarId: PropTypes.string,
  authorId: PropTypes.number,
  authorName: PropTypes.string,
};

export default ViewAdDetails;
