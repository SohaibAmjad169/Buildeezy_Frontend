import { Delete } from "@mui/icons-material";
import { Close } from "@mui/icons-material";
import { PlusOne } from "@mui/icons-material";
import {
  Box,
  Button,
  DialogActions,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Add } from "iconsax-react";
import { Eye } from "iconsax-react";
import { DocumentUpload } from "iconsax-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// FormField.jsx
export const FormField = ({ label, required, input, sx = {} }) => {
  const theme = useTheme();

  return (
    <Box sx={sx}>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: theme.palette.text.primary }}
      >
        {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
      </Typography>
      {input}
    </Box>
  );
};

// FileUpload.jsx
export const FileUpload = ({ file, onFileChange, accept, id }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;

  return (
    <Box
      sx={{
        border: "2px dashed #d0d0d0",
        borderRadius: 2,
        p: 4,
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={() => document.getElementById(id).click()}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onFileChange}
        style={{ display: "none" }}
      />
      <DocumentUpload size={32} color="#90a955" style={{ marginBottom: 8 }} />
      <Typography variant="body2" sx={{ color: "#90a955", fontWeight: 500 }}>
        {t("common.click_to_upload")}
      </Typography>
      <Typography variant="body2">{t("common.drag_and_drop")}</Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          mt: 1,
          display: "block",
        }}
      >
        {t("common.file_upload_info")}
      </Typography>
      {file && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.main, mt: 1 }}
        >
          {t("common.selected")}: {file.name}
        </Typography>
      )}
    </Box>
  );
};

// TabHeader.jsx
export const TabHeader = ({
  title,
  description,
  onPreview,
  onCancel,
  onSave,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {description}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Eye size={16} />}
          onClick={onPreview}
          sx={{
            borderColor: "#90a955",
            color: "#90a955",
            fontWeight: 500,
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {t("common.preview")}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: "#d0d0d0",
            color: theme.palette.text.secondary,
            fontWeight: 500,
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            backgroundColor: "#90a955",
            fontWeight: 500,
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {t("common.save")}
        </Button>
      </Box>
    </Box>
  );
};

// DialogFooter.jsx
export const DialogFooter = ({
  onPreview,
  onCancel,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <DialogActions sx={{ justifyContent: "flex-end", px: 3, pb: 3 }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Eye size={16} />}
          onClick={onPreview}
          sx={{
            borderColor: "#90a955",
            color: "#90a955",
            fontWeight: 500,
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {t("common.preview")}
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: "#d0d0d0",
            color: theme.palette.text.secondary,
            fontWeight: 500,
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: "#90a955",
            fontWeight: 500,
            borderRadius: 1,
            textTransform: "none",
            "&:hover": { backgroundColor: "#7a8f4a" },
          }}
        >
          {isSubmitting ? t("common.saving") : t("common.save")}
        </Button>
      </Box>
    </DialogActions>
  );
};

export const FAQSection = ({ faqs, onFaqChange, onAddFaq, onRemoveFaq }) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      {faqs.map((faq, index) => (
        <Box
          key={faq.id || index}
          sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
        >
          <TextField
            placeholder={t("common.question")}
            fullWidth
            value={faq.question}
            onChange={(e) =>
              onFaqChange(faq.id || index, "question", e.target.value)
            }
          />
          <TextField
            placeholder={t("common.answer")}
            fullWidth
            value={faq.answer}
            onChange={(e) =>
              onFaqChange(faq.id || index, "answer", e.target.value)
            }
          />
        </Box>
      ))}

      {/* Add & Remove Buttons at bottom right */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {faqs.length > 1 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() =>
              onRemoveFaq(faqs[faqs.length - 1].id || faqs.length - 1)
            }
          >
            {t("common.remove")}
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onAddFaq}
          sx={{
            color: "#3c763d",
            borderColor: "#3c763d",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#e6f4ea",
              borderColor: "#3c763d",
            },
          }}
        >
          {t("common.add_more")}
        </Button>
      </Box>
    </Stack>
  );
};


// Image Preview Component
export const ImagePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result);
  };
  reader.readAsDataURL(file);

  return (
    <Box sx={{ position: "relative", display: "inline-block", mr: 2 }}>
      <img
        src={preview}
        alt="Preview"
        style={{
          width: "150px",
          height: "150px",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
      <IconButton
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.7)",
          },
        }}
      >
        <Close fontSize="small" />
      </IconButton>
    </Box>
  );
};

export  const ImagePreviewPost = ({ file, onRemove }) => {
    if (!file) return null;

    if (file.type.startsWith('video/')) {
      return (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <video controls style={{ maxWidth: '100%', maxHeight: '200px' }}>
            <source src={URL.createObjectURL(file)} type={file.type} />
            Your browser does not support the video tag.
          </video>
          <IconButton
            onClick={onRemove}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          style={{ maxWidth: '100%', maxHeight: '200px' }}
        />
        <IconButton
          onClick={onRemove}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'black',
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    );
  };
