import React from "react";
import { Snackbar, Alert as MuiAlert } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";

import { setAlert } from "../../redux/configSlice";
import { ALERTS } from "../../utils/constants/config";
import MuiTypography from "./MuiTypography";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={0} ref={ref} variant="filled" {...props} />;
});

function MuiSnackbar() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { show, type, message, subMessage } = useSelector(
    (state) => state.config.alert
  );
  const alertConfig = ALERTS[type] || ALERTS.error;
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(
      setAlert({
        show: false,
        type: type,
        message: message,
        subMessage: subMessage,
      })
    );
  };
  return (
    <Snackbar
      open={show}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert
        variant="outlined"
        onClose={handleClose}
        severity={type}
        sx={{
          width: "488px",
          borderRadius: "6px",
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "common.white",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0px 4px 43.1px 0px #00000080"
              : "0px 4px 43.099998474121094px 0px #00000040",
          border: `solid 1px ${theme.palette.mode === "dark" ? theme.palette.divider : "white"}`,
          "& .MuiAlert-icon": {
            padding: "9px 0",
            color: alertConfig.color,
          },
        }}
        icon={alertConfig.icon || ""}
      >
        <MuiTypography
          sx={{
            fontWeight: 500,
            fontSize: "1rem",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.primary
                : alertConfig.color,
            marginBottom: "0.5rem",
          }}
        >
          {message || alertConfig.title}
        </MuiTypography>
        <MuiTypography
          variant="subtitle2"
          sx={{
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.secondary
                : undefined,
          }}
        >
          {subMessage || alertConfig.subTitle}
        </MuiTypography>
      </Alert>
    </Snackbar>
  );
}
export default MuiSnackbar;
