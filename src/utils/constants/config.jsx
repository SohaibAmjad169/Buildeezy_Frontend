import { Error as ErrorIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";

import { colors } from "../../styles/theme";
import i18next from "../../i18n";

export const PUBNUB_CHANNEL = "user";

export const MAPPED_USER_STATUS = [
  "Registered",
  "Unverified",
  "Verified",
  "Deactivated",
  "Banned",
];

export const ALERT_TYPE = {
  error: "error",
  warning: "warning",
  info: "info",
  success: "success",
};

export const ALERTS = {
  error: {
    color: colors.red,
    title: "",
    subTitle: i18next.t("errors.default_error_subtitle"),
    icon: <ErrorIcon />,
  },
  success: {
    color: colors.green,
    title: i18next.t("success_title"),
    subTitle: i18next.t("success_subtitle"),
    icon: <CheckCircleIcon />,
  },
  info: {
    title: i18next.t("new_notification"),
  },
};
