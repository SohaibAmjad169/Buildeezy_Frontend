import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { t } from "i18next";

const AdPreviewModal = ({ open, onClose, ad }) => {
  if (!ad) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Advertisement Preview</Typography>
          <Button onClick={onClose} startIcon={<Close />} />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant="h5" gutterBottom>
            {ad.headline}
          </Typography>
          <Typography variant="body1" paragraph>
            {ad.description}
          </Typography>

          {ad.banner && (
            <Box my={2}>
              <Typography variant="subtitle1" gutterBottom>
                Banner:
              </Typography>
              <img
                src={ad.banner}
                alt="Advertisement banner"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
          )}

          <Typography variant="subtitle1" gutterBottom>
            Details:
          </Typography>
          <Typography variant="body2">Business: {ad.businessName}</Typography>
          <Typography variant="body2">
            URL: {ad.url || "Not provided"}
          </Typography>
          <Typography variant="body2">Duration: {ad.duration}</Typography>
          <Typography variant="body2">
            Start Date: {new Date(ad.startAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            End Date: {new Date(ad.expireAt).toLocaleDateString()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdPreviewModal;
