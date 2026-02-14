import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector } from "react-redux";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import RoundButton from "./RoundButton";

function MuiActionDialog({
  width,
  open,
  handleClose,
  title,
  children,
  handleSuccess,
  handleSecondaryAction,
  actionTitle,
  showClose = true,
  showActions = true,
  actionTitle2 = "",
  disabled = false,
  actionTitle1,
  handlePrimaryAction,
}) {
  const { loading } = useSelector((state) => state.config);
  const { isUploading } = useSelector((state) => state.onboarding);

  return (
    <>
      <Dialog
        open={open}
        sx={{
          "& .MuiPaper-root": {
            maxWidth: width,
            width: width,
          },
          "& .MuiTypography-root": {
            p: 0,
          },
          "& #header-bar": { display: "none" },
          "& #proxy-renderer": { pt: 2 },
          "& #no-renderer-download": {
            textDecoration: "underline",
            textUnderlineOffset: 6,
            color: "primary.main",
            alignItems: "center",
            width: "fit-content",
            boxShadow: "none",
            display: "flex",
            gap: 2,
            "&:hover": { textDecoration: "none" },
          },
          "& #jfif-renderer": {
            textAlign: "center",
            "& #jfif-img": { marginInline: "auto" },
          },
          "& #video-renderer": {
            textAlign: "center",
            "& #video-video": { marginInline: "auto" },
          },
          "& #proxy-renderer iframe": {
            minHeight: 500,
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            mt: 1,
          }}
        >
          {title}
        </DialogTitle>
        {showClose && (
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "closeIcon",
              mt: 1.5,
              mr: 1.5,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <DialogContent>{children}</DialogContent>
        {showActions && (
          <DialogActions
            sx={{
              justifyContent: "center",
              mt: 1,
            }}
          >
            {actionTitle1 && (
              <RoundButton
                variant="outlined"
                onClick={handlePrimaryAction}
                disabled={loading || isUploading.status || disabled}
                isLoading={loading || isUploading.status}
                color="error"
                sx={{
                  mr: "26px !important",
                }}
              >
                {actionTitle1}
              </RoundButton>
            )}
            <RoundButton
              onClick={handleSuccess}
              disabled={loading || isUploading.status || disabled}
              isLoading={loading || isUploading.status}
            >
              {actionTitle}
            </RoundButton>
            {actionTitle2 && (
              <RoundButton
                variant="outlined"
                onClick={handleSecondaryAction}
                disabled={loading || isUploading.status || disabled}
                isLoading={loading || isUploading.status}
                sx={{ ml: "26px !important" }}
              >
                {actionTitle2}
              </RoundButton>
            )}
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}

MuiActionDialog.propTypes = {
  width: PropTypes.any,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,
  handleSuccess: PropTypes.func,
  handleSecondaryAction: PropTypes.func,
  actionTitle: PropTypes.string,
  showClose: PropTypes.bool,
  showActions: PropTypes.bool,
};

export default MuiActionDialog;
