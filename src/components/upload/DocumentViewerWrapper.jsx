import PropTypes from "prop-types";
import ModernDocumentViewer from "./ModernDocumentViewer";
import MuiActionDialog from "../common/MuiActionDialog";
import { t } from "i18next";

function DocumentViewerWrapper({ open, handleClose, type, name, path }) {

  return (
    <MuiActionDialog
      open={open}
      handleClose={handleClose}
      width={750}
      title={name}
      // actionTitle2={'close'}
      actionTitle={t("common.close")}
      handleSuccess={handleClose}
    >
      <ModernDocumentViewer type={type} name={name} path={path} />
    </MuiActionDialog>
  );
}

DocumentViewerWrapper.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  type: PropTypes.any,
  name: PropTypes.any,
  path: PropTypes.string,
};

export default DocumentViewerWrapper;
