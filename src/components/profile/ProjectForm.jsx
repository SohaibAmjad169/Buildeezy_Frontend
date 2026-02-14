import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, TextField, Grid } from "@mui/material";
import Typography from "../common/MuiTypography";
import { PreviewPage } from "../../components/preview";

function AddPortfolio({ onSave, onCancel, initialData }) {
  const { t } = useTranslation();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      project_description: "",
      role: "",
      skills: [],
      jobLink: "",
      thumbnail: null,
      files: [],
      status: "draft",
    }
  );

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (isPreviewMode) {
    return (
      <PreviewPage
        data={{
          user: {
            name: formData.title,
            description: formData.project_description,
            role: formData.role,
            skills: formData.skills,
          },
          layout: {
            theme: "default",
            font: "inter",
          },
        }}
        onExitPreview={handleExitPreview}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {t("profile.portfolio.add_title")}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("profile.portfolio.fields.project_title.label")}
            placeholder={t(
              "profile.portfolio.fields.project_title.placeholder"
            )}
            value={formData.title}
            onChange={handleFieldChange("title")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("profile.portfolio.fields.your_role.label")}
            placeholder={t("profile.portfolio.fields.your_role.placeholder")}
            value={formData.role}
            onChange={handleFieldChange("role")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t("profile.portfolio.fields.project_description.label")}
            placeholder={t(
              "profile.portfolio.fields.project_description.placeholder"
            )}
            value={formData.project_description}
            onChange={handleFieldChange("project_description")}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button variant="outlined" onClick={handlePreview}>
          {t("common.preview")}
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {t("common.save")}
        </Button>
      </Box>
    </Box>
  );
}

export default AddPortfolio;
