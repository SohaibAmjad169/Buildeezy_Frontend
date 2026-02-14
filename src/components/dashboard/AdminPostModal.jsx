import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import AdminPostAd from "./AdminPostAd";

export default function AdminPostModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 600,
          maxHeight: "90vh",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#709A1C",
          color: "#fff",
          py: 2,
          px: 3,
        }}
      >
        Create Advertisement
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "auto" }}>
        <AdminPostAd onClose={onClose} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
