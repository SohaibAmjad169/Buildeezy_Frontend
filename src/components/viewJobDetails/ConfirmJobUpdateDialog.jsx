import PropTypes from "prop-types";
import MuiDialog from "../common/MuiDialog";

function ConfirmJobUpdateDialog({ open, onClose, onConfirm, talentName }) {
  return (
    <MuiDialog
      open={open}
      handleClose={onClose}
      handleSuccess={onConfirm}
      title="Confirm Update"
      description={`Are you sure you want to post job and invite ${talentName} to bid?`}
      successTitle="Yes"
      cancelTitle="No"
    />
  );
}

ConfirmJobUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  talentName: PropTypes.string.isRequired,
};

export default ConfirmJobUpdateDialog;
