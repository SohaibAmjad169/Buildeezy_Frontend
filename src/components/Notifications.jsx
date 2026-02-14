import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  IconButton,
  Stack,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ArrowLeft } from "iconsax-react";

import MuiTypography from "./common/MuiTypography";
import { ROUTES } from "../utils/constants/route";
import {
  getAllNotifications,
  setReadNotifications,
} from "../apis/apiEndPoints";
import { setIsLoading, setNotifications } from "../redux/notificationsSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import { setAlert } from "../redux/configSlice";
import noNotificationsBell from "../assets/images/no_notifications.svg";
import NotificationSkeleton from "./skeleton/NotificationSkeleton";
import BidInvitations from "./BidInvitations";
import { CustomSwitch } from "./common/SwitchOption";
import { t } from "i18next";

dayjs.extend(relativeTime);

export const NOTIFICATIONS_TYPES = {
  "NOTIFICATION/JOB_COMPLETED": {
    title: t("milestone.job_completed"),
    navigateTo: "",
  },
  "NOTIFICATION/JOB_UPDATED": {
    title: t("milestone.job_updated"),
    navigateTo: "/all-jobs/view/",
  },
  "NOTIFICATION/JOB_DELETED": {
    title: t("milestone.job_deleted"),
    navigateTo: "/all-jobs",
  },
  "NOTIFICATION/BID_POSTED": {
    title: t("milestone.new_bid_posted"),
    navigateTo: "",
  },
  "NOTIFICATION/BID_ACCEPTED": {
    title: t("milestone.bid_accepted"),
    navigateTo: "",
  },
  "NOTIFICATION/BID_REJECTED": {
    title: t("milestone.bid_rejected"),
    navigateTo: "/my-bids/view/",
  },
  "NOTIFICATION/BID_UPDATED": {
    title: t("milestone.bid_updated"),
    navigateTo: "",
  },
  "NOTIFICATION/BID_CANCELLED": {
    title: t("milestone.bid_withdraw"),
    navigateTo: "",
  },
  "NOTIFICATION/MILESTONE_CREATED": {
    title: t("milestone.milestone_created"),
    navigateTo: "/my-contracts/view/",
  },
  "NOTIFICATION/MILESTONE_UPDATED": {
    title: t("milestone.milestone_updated"),
    navigateTo: "/my-contracts/view/",
  },
  "NOTIFICATION/MILESTONE_ACCEPTED": {
    title: t("milestone.milestone_accepted"),
    navigateTo: "/my-contracts/view/",
  },
  "NOTIFICATION/MILESTONE_REJECTED": {
    title: t("milestone.milestone_rejected"),
    navigateTo: "/my-contracts/view/",
  },
  "NOTIFICATION/MILESTONE_PAID_PARTIALLY": {
    title: t("milestone.milestone_paid_partially"),
    navigateTo: "/my-contracts/view/",
  },
  "NOTIFICATION/MILESTONE_PAID_COMPLETELY": {
    title: t("milestone.milestone_paid_completely"),
    navigateTo: "/my-contracts/view/",
  },
  "NOTIFICATION/MILESTONE_IN_DISPUTE": {
    title: t("milestone.milestone_in_dispute"),
    navigateTo: "/my-contracts/view/",
  },
};

const mapRoutes = {
  active: "/active-jobs/view/",
  filled: "/my-contracts/view/",
  completed: "/my-contracts/view/",
};

export default function Notifications({
  titleSx,
  isShort = false,
  handleCloseNotifications,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notificationsList, isLoading } = useSelector(
    (state) => state.notifications
  );

  const [pushEnabled, setPushEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  const handleTogglePush = async () => {
    if (typeof Notification === "undefined") return;

    if (!pushEnabled) {
      // Try to enable
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushEnabled(true);
        // Optionally call requestForToken()
      } else if (permission === "denied") {
        setPushEnabled(false);
        alert(
          "You have blocked notifications. Please enable them in your browser settings."
        );
      }
    } else {
      // User wants to turn off in UI (but can't revoke browser permission programmatically)
      setPushEnabled(false);
      // Optionally show a message: "To fully disable, turn off in browser settings."
    }
  };

  function navigateBack() {
    navigate(-1);
  }

  async function handleMarkReadNotification(notificationId) {
    const selectedNotification = notificationsList.find(
      (notification) =>
        notification.id === notificationId && notification.readAt === null
    );
    if (selectedNotification) {
      await setReadNotifications(notificationId);
    }
  }

  function viewNotificationsDetails(notificationId, job, bidId, type) {
    isShort && handleCloseNotifications?.();
    handleMarkReadNotification(notificationId);

    if (NOTIFICATIONS_TYPES[type].navigateTo) {
      if (type === "NOTIFICATION/JOB_DELETED") {
        navigate(`${NOTIFICATIONS_TYPES[type].navigateTo}`);
      } else if (type === "NOTIFICATION/BID_REJECTED") {
        navigate(`${NOTIFICATIONS_TYPES[type].navigateTo}${bidId}`);
      } else {
        navigate(`${NOTIFICATIONS_TYPES[type].navigateTo}${job.id}`);
      }
    } else {
      navigate(`${mapRoutes[job.state]}${job.id}`);
    }
  }

  function handleViewAllNotifications() {
    isShort && handleCloseNotifications?.();
    navigate("/" + ROUTES.notifications);
  }

  const fetchAllNotifications = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const { data: res } = await getAllNotifications();
      const resData = res.data;
      dispatch(setNotifications(resData));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  return (
    <>
      <Box
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          minWidth: notificationsList?.length > 0 ? 400 : 300,
          mb: 2,
        }}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={2}>
          {!isShort && (
            <ArrowLeft
              size="20"
              style={{ cursor: "pointer" }}
              onClick={navigateBack}
            />
          )}
          <MuiTypography variant={"h2"} sx={titleSx}>
            {t("notifications.title")}
          </MuiTypography>
          <Box sx={{ ml: 2 }}>
            <CustomSwitch checked={pushEnabled} onClick={handleTogglePush} />
          </Box>
        </Stack>

        {isShort && (
          <IconButton
            onClick={handleCloseNotifications}
            sx={{ translate: "0.75rem 0" }}
          >
            <Close />
          </IconButton>
        )}
      </Box>
      <Box sx={{ width: "100%" }}>
        {isLoading ? (
          <NotificationSkeleton />
        ) : (
          <>
            {notificationsList?.length > 0 ? (
              (isShort
                ? notificationsList?.slice(0, 3)
                : notificationsList
              )?.map((notification, i) => {
                const notificationTitle =
                  NOTIFICATIONS_TYPES[notification.type?.toUpperCase()]
                    ?.title || t("notifications.message_from") + " " +
                  `${notification.actor?.firstName || ""} ${
                    notification.actor?.lastName || ""
                  }`.trim();

                return (
                  <Box
                    key={notification.id}
                    sx={{
                      ...(i > 0 && {
                        borderTop: (theme) =>
                          `1px solid ${theme.palette.mode === "dark"
                            ? alpha(theme.palette.common.white, 0.1)
                            : theme.palette.borderColor100
                          }`,
                        mt: 3,
                        pt: 3,
                      }),
                      display: "flex",
                      gap: 1.5,
                    }}
                  >
                    {notification.readAt === null ? (
                      <Box
                        sx={{
                          backgroundColor: "primary.main",
                          translate: "0 3px",
                          borderRadius: 3,
                          height: "10px",
                          width: "10px",
                        }}
                      />
                    ) : null}
                    <ButtonBase
                      // onClick={() =>
                      //   viewNotificationsDetails(
                      //     notification.id,
                      //     notification.job,
                      //     notification.bid?.id,
                      //     notification.type?.toUpperCase()
                      //   )
                      // }

                      onClick={(e) => {
                        e.stopPropagation();
                        const type = notification?.type?.toUpperCase();

                        if (NOTIFICATIONS_TYPES[type]?.title) {
                          viewNotificationsDetails(
                            notification.id,
                            notification.job,
                            notification.bid?.id,
                            type
                          );
                        } else {
                          isShort && handleCloseNotifications?.();
                          handleMarkReadNotification(notification?.id);

                          navigate("/message", {
                            state: {
                              chatUserId: notification?.actor?.id,
                              chatUserName: `${
                                notification?.actor?.firstName || ""
                              } ${notification?.actor?.lastName || ""}`.trim(),
                              avatar: notification?.actor?.avatar,
                            },
                          });
                        }
                      }}
                      sx={{
                        textAlign: "left",
                        display: "block",
                        width: "100%",
                        flex: 1,
                      }}
                    >
                      <MuiTypography variant={"h3"}>
                       {notificationTitle}
                      </MuiTypography>
                      <MuiTypography
                        variant={"subtitle1"}
                        sx={{ lineHeight: 2.25 }}
                      >
                        {notification.fallbackMessage}
                      </MuiTypography>

                      <MuiTypography variant={"subtitle2"}>
                        {dayjs(notification?.createdAt).fromNow()}
                      </MuiTypography>
                    </ButtonBase>
                  </Box>
                );
              })
            ) : (
              <Box sx={{ textAlign: "center", py: 1 }}>
                <Box
                  component="img"
                  src={noNotificationsBell}
                  alt="Notifications"
                  sx={{ width: 90, my: 2 }}
                />
                <MuiTypography variant={"h3"} sx={{ my: 2 }}>
                  {t("notifications.empty.title")}
                </MuiTypography>
                <MuiTypography variant={"subtitle2"} sx={{ mb: 1.75 }}>
                  {t("notifications.empty.subtitle")}
                  <br />
                  {t("notifications.empty.subtitle2")}
                </MuiTypography>
              </Box>
            )}
            {notificationsList?.length > 0 && isShort && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Button onClick={handleViewAllNotifications}>{t("notifications.view_all")}</Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
}
