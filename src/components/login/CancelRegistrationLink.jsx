import { useState } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import MuiTypography from "../common/MuiTypography";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants/route";
import { cancelRegistrationUrl } from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { removeAll } from "../../utils/localStorageUtils";
import useEmptyStore from "../../hooks/useEmptyStore";
import MuiDialog from "../common/MuiDialog";

function CancelRegistrationLink({ sx }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { emptyStore } = useEmptyStore();

  const { loading } = useSelector((state) => state.config);

  const [open, setOpen] = useState(false);

  async function onCancelRegistration() {
    try {
      dispatch(setLoading(true));
      await cancelRegistrationUrl();
      emptyStore();
      removeAll();
      onClose();
      navigate("/" + ROUTES.register);
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

  function onOpenDialog() {
    setOpen(true);
  }

  function onClose() {
    setOpen(false);
  }

  return (
    <Box
      sx={{
        display: "flex",
        ...sx,
      }}
    >
      <MuiTypography variant="subtitle1">
        {t("login.dont_want_register_now")}
      </MuiTypography>
      &nbsp;
      <MuiTypography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "primary.main",
          cursor: "pointer",
        }}
        onClick={onOpenDialog}
        disabled={loading}
      >
        {t("login.cancel")}
      </MuiTypography>
      <MuiDialog
        title={t("dialog_title")}
        open={open}
        handleClose={onClose}
        handleSuccess={onCancelRegistration}
      />
    </Box>
  );
}

export default CancelRegistrationLink;
