import { useState } from "react";
import PropTypes from "prop-types";
import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FileUpload, FormField } from "./AdminSharedComponent";
import { t } from "i18next";

const AdminMailModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  isSubmitting = false,
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [formState, setFormState] = useState({
    mailSubject: initialValues.mailSubject || "",
    audienceType: initialValues.audienceType || "",
    description: initialValues.description || "",
    uploadedFile: initialValues.uploadedFile || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormState((prev) => ({ ...prev, uploadedFile: file }));
    }
  };

  const handleSubmit = () => {
    // Create new FormData instance
    const formData = new FormData();

    // Append all form fields
    formData.append("subject", formState.mailSubject);
    formData.append("audience_type", formState.audienceType);
    formData.append("description", formState.description);

    // Append file if exists
    if (formState.uploadedFile) {
      formData.append("uploaded_files", formState.uploadedFile);
    }

    // Call onSubmit with the FormData instance
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2, minHeight: 500 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: 600 }}>
          {t("admin_marketing.create_mail")}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Mail Subject */}
          <FormField
            label={t("admin_marketing.mail_subject")}
            required
            input={
              <TextField
                fullWidth
                name="mailSubject"
                placeholder={t("admin_marketing.input_mail_subject")}
                value={formState.mailSubject}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  },
                }}
              />
            }
          />

          {/* Audience Type */}
          <FormField
            label={t("admin_marketing.audience_type")}
            required
            input={
              <FormControl fullWidth>
                <Select
                  name="audienceType"
                  value={formState.audienceType}
                  onChange={handleChange}
                  displayEmpty
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderRadius: 1,
                    backgroundColor: mode === "dark" ? "#333" : "#fff",
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: theme.palette.text.secondary }}>
                      {t("admin_marketing.choose_option")}
                    </span>
                  </MenuItem>
                  <MenuItem value="all">{t("admin_marketing.all")}</MenuItem>
                  <MenuItem value="client">
                    {t("admin_marketing.client")}
                  </MenuItem>
                  <MenuItem value="contractor">
                    {t("admin_marketing.contractor")}
                  </MenuItem>
                  <MenuItem value="specialist">
                    {t("admin_marketing.specialist")}
                  </MenuItem>
                  <MenuItem value="vendor">
                    {t("admin_marketing.vendor")}
                  </MenuItem>
                </Select>
              </FormControl>
            }
          />

          {/* Description */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {t("admin_marketing.add_description")}{" "}
              <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>
            <Box
              component="textarea"
              name="description"
              value={formState.description}
              onChange={handleChange}
              placeholder={t("admin_marketing.add_description_here")}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "1rem",
                borderRadius: "4px",
                fontFamily: "inherit",
                backgroundColor: mode === "dark" ? "#333" : "#fff",
                color: mode === "dark" ? "#fff" : "#000",
              }}
            />
          </Box>

          {/* File Upload */}
          <FormField
            label={t("admin_marketing.upload_file")}
            input={
              <FileUpload
                file={formState.uploadedFile}
                onFileChange={handleFileUpload}
                accept="image/*,.svg,.png,.jpg,.jpeg,.gif"
                id="mail-file-upload"
              />
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#d0d0d0",
            color: theme.palette.text.secondary,
            fontWeight: 500,
            borderRadius: 1,
          }}
        >
          {t("admin_marketing.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: "#709A1C",
            fontWeight: 500,
            borderRadius: 1,
            "&:hover": { backgroundColor: "#5a7d16" },
          }}
        >
          {isSubmitting ? t("common.submiting") : t("common.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AdminMailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  isSubmitting: PropTypes.bool,
};

export default AdminMailModal;
