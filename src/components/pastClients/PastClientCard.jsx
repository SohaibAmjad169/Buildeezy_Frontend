import { useState } from "react";
import { Box, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Trash, Sms, Call } from "iconsax-react";

import MuiTypography from "../common/MuiTypography";
import { useThemeMode } from "../../context/ThemeContext";
import { getInitial } from "../../utils/common";
import { deleteClientUrl } from "../../apis/apiEndPoints";
import { setLoading, setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import MuiDialog from "../common/MuiDialog";
import { colors } from "../../styles/theme";

function PastClientCard({ client, handleDeleteClient }) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();

  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  function onOpenDialog() {
    setOpen(true);
  }

  function onClose() {
    setOpen(false);
  }

  async function onDeleteClient() {
    try {
      dispatch(setLoading(true));
      await deleteClientUrl(client.id);
      handleDeleteClient(client.id);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("profile.client_deleted"),
        })
      );
      onClose(false);
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

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: 230, md: 250 },
        minHeight: { xs: 117, sm: 137 },
        border: "1px solid",
        borderColor: mode === "dark" ? "iconBorder" : "uploadBorder",
        borderRadius: "6px",
        padding: "20px 24px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 35,
            height: 35,
            backgroundColor: "primary.main",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MuiTypography variant="subtitle3" sx={{ color: "common.white" }}>
            {getInitial(client.name || "-")}
          </MuiTypography>
        </Box>

        <Tooltip title={t("profile.delete_client")} placement="bottom">
          <Trash
            onClick={onOpenDialog}
            size={20}
            color={colors.red}
            style={{
              cursor: "pointer",
              fontSize: "1.3rem",
            }}
          />
        </Tooltip>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Tooltip
          title={client.name || t("n/a")}
          placement="bottom"
          className="text-ellipsis"
        >
          <Box>
            <MuiTypography variant="h5" className="text-ellipsis">
              {client.name || t("n/a")}
            </MuiTypography>
          </Box>
        </Tooltip>
        <Box sx={{ display: "flex", mt: 0.5 }}>
          <Tooltip
            title={client.email || t("n/a")}
            placement="bottom"
            className="text-ellipsis"
          >
            <Sms
              size={16}
              style={{
                position: "relative",
                marginBottom: "-3px",
                marginRight: "8px",
                width: 15,
              }}
            />
            <MuiTypography variant="span" sx={{ fontSize: "0.80rem" }}>
              {client.email || t("n/a")}
            </MuiTypography>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <Call
            size={16}
            style={{
              marginRight: "8px",
              width: 15,
            }}
          />
          <MuiTypography variant="h5" sx={{ fontWeight: 400 }}>
            {client.phoneNumber || t("n/a")}
          </MuiTypography>
        </Box>
      </Box>
      <MuiDialog
        title={t("profile.client_delete_title")}
        open={open}
        handleClose={onClose}
        handleSuccess={onDeleteClient}
      />
    </Box>
  );
}

export default PastClientCard;
