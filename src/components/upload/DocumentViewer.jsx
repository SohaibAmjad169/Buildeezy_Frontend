import PropTypes from "prop-types";
import DocumentViewerWrapper from "./DocumentViewerWrapper";

function DocumentViewer({ open, handleClose, type, name, path }) {
  return (
    <DocumentViewerWrapper
      open={open}
      handleClose={handleClose}
      type={type}
      name={name}
      path={path}
    />
  );
}

DocumentViewer.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  type: PropTypes.any,
  name: PropTypes.any,
  path: PropTypes.string,
};

export default DocumentViewer;
