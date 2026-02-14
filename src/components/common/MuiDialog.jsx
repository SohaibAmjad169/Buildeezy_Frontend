import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import SubmitButton from "./SubmitButton";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

function MuiDialog({
  open,
  handleClose,
  title,
  subtitle = "",
  handleSuccess,
  yesLabel = "",
  noLabel = "",
}) {
  const { t } = useTranslation();
  const { loading } = useSelector((state) => state.config);
  const { stateLoading } = useSelector((state) => state.milestone);

  return (
    <>
      <Dialog
        open={open}
        className="mui-confirmation-dialog"
        sx={{
          "&.mui-confirmation-dialog .MuiPaper-root": {
            width: "370px !important",
          },
          "& .MuiTypography-root": {
            padding: "8px 16px 8px 16px",
            textAlign: "center",
            fontSize: "0.875rem",
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          {subtitle && (
            <DialogContentText id="alert-dialog-description">
              {subtitle}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading || stateLoading}
          >
            {noLabel ? noLabel : t("no")}
          </Button>
          <SubmitButton
            onClick={handleSuccess}
            disabled={loading || stateLoading}
            loading={loading || stateLoading}
          >
            {yesLabel ? yesLabel : t("yes")}
          </SubmitButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MuiDialog;
