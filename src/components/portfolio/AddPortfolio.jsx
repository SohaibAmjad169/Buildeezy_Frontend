import { useState } from "react";
import { Box, Button, Typography, Breadcrumbs, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { OVERVIEW_FIELDS, RESULTS_FIELDS } from "./Portfolio.constants";
import { PreviewPage } from "../../components/preview";
import DesignField from "../common/DesignField";
import { createPortfolioUrl } from "../../apis/apiEndPoints";
import { FIELD_TYPES } from "../../utils/constants/login";

function AddPortfolio({ onSave, onCancel, initialData }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [overviewFields, setOverviewFields] = useState(
    cloneDeep(OVERVIEW_FIELDS).map((field) => ({
      ...field,
      value: initialData?.[field.id] || field.defaultValue,
    }))
  );
  const [resultsFields, setResultsFields] = useState(
    cloneDeep(RESULTS_FIELDS).map((field) => ({
      ...field,
      value: initialData?.[field.id] || field.defaultValue,
    }))
  );

  const handleFieldChange = async (section, id, value, error) => {
    const fields = section === "overview" ? overviewFields : resultsFields;
    const setFields =
      section === "overview" ? setOverviewFields : setResultsFields;

    const newFields = cloneDeep(fields);
    const fieldIndex = newFields.findIndex((el) => el.id === id);

    if (fieldIndex !== -1) {
      const field = newFields[fieldIndex];
      ("Field change:", {
        id,
        type: field.type,
        value,
        currentValue: field.value,
      });

      if (field.type === FIELD_TYPES.upload) {
        // Handle file uploads from UploadDoc component
        if (typeof value === "function") {
          const currentValue = field.value || (field.multipleFiles ? [] : null);
          field.value = value(currentValue);
        } else {
          field.value = value;
        }
      } else {
        field.value = value;
      }

      field.error = error;

      // Update character count for description field
      if (id === "description") {
        const remainingChars = field.maxLength - (value?.length || 0);
        field.helperText = `${remainingChars} ${t("profile.characters_left")}`;
      }

      setFields(newFields);
    }
  };

  const prepareFormData = async (status) => {
    try {
      const thumbnailField = resultsFields.find((f) => f.id === "thumbnail");
      const filesField = resultsFields.find((f) => f.id === "files");

      // No upload for thumbnail, just send the value (file object or base64 string)
      let thumbnailData = thumbnailField.value || null;

      // Upload files if any (keep this logic for files)
      let filesData = [];
      if (filesField.value && Array.isArray(filesField.value)) {
        filesData = await Promise.all(
          filesField.value.map(async (file) => {
            // If file is a File object, upload it
            if (file instanceof File) {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("folderName", "portfolio");
              const response = await import("../../apis/apiEndPoints").then(
                (m) => m.uploadFileUrl(formData)
              );
              const uploaded = response.data;
              return {
                name: file.name,
                url: uploaded.url,
                type: uploaded.type,
                size: Number(uploaded.size) || 0,
              };
            } else if (typeof file === "object" && file.url) {
              // Already an object with url
              return {
                name: file.name,
                url: file.url,
                type: file.type,
                size: Number(file.size) || 0,
              };
            } else if (typeof file === "string" && file) {
              // If file is a string (URL/key), wrap as object
              return {
                name: file.split("/").pop(),
                url: file,
                type: "",
                size: 0,
              };
            }
            return null;
          })
        );
        filesData = filesData.filter(Boolean);
      }

      // Prepare the form data
      const formData = {
        title: overviewFields.find((f) => f.id === "title")?.value || "",
        role: overviewFields.find((f) => f.id === "role")?.value || "",
        project_description:
          overviewFields.find((f) => f.id === "project_description")?.value ||
          "",
        skills: resultsFields.find((f) => f.id === "skills")?.value || [],
        jobLinkId:
          overviewFields.find((f) => f.id === "jobLink")?.value || null,
        thumbnail: thumbnailData, // Send file object or base64 string directly
        files: filesData,
        status: status.toLowerCase(),
      };

      // Convert any remaining number fields
      Object.entries(formData).forEach(([key, value]) => {
        const field = [...overviewFields, ...resultsFields].find(
          (f) => f.id === key
        );
        if (
          field &&
          (field.type === "number" || field.validation?.type === "number")
        ) {
          formData[key] = Number(value) || 0;
        }
      });

      return { data: formData };
    } catch (error) {
      console.error("Error preparing form data:", error);
      throw error;
    }
  };

  const handleSave = async (status) => {
    try {
      setIsLoading(true);
      const formData = await prepareFormData(status);
      const response = await createPortfolioUrl(formData);
      onSave(response.data);
    } catch (error) {
      console.error("Error saving portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => handleSave("draft");
  const handlePublish = () => handleSave("published");

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  if (isPreviewMode) {
    return (
      <PreviewPage
        data={{
          project: {
            ...overviewFields.reduce((acc, field) => {
              acc[field.id] = field.value;
              return acc;
            }, {}),
            ...resultsFields.reduce((acc, field) => {
              acc[field.id] = field.value;
              return acc;
            }, {}),
          },
        }}
        onExitPreview={handleExitPreview}
      />
    );
  }

  const isFormValid = [...overviewFields, ...resultsFields].every(
    (field) => !field.isRequired || (field.value && !field.error)
  );

  return (
    <Box
      sx={{
        margin: "0 auto",
      }}
    >
      <Divider sx={{ mt: 4, mb: 4 }} />
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator="›"
        aria-label="breadcrumb"
        sx={{
          mb: 3,
          "& .MuiBreadcrumbs-separator": {
            mx: 1,
            color: "text.primary",
            fontSize: "h5.fontSize",
          },
          "& .MuiBreadcrumbs-li": {
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        <Typography
          color="inherit"
          href="#"
          onClick={(e) => e.preventDefault()}
          variant="h5"
        >
          {t("profile.title")}
        </Typography>
        <Typography
          color="inherit"
          href="#"
          onClick={(e) => e.preventDefault()}
          variant="h5"
        >
          {t("profile.portfolio.title")}
        </Typography>
        <Typography color="text.primary" variant="h5">
          {t("profile.portfolio.add_title")}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          mt: 6,
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h2">
            {t("profile.portfolio.add_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("profile.portfolio.add_description")}
          </Typography>
        </Box>
        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Button
            startIcon={<VisibilityOutlinedIcon />}
            onClick={handlePreview}
            variant="outlined"
            color="primary"
            disabled={isLoading}
          >
            {t("common.preview")}
          </Button>
          <Button onClick={onCancel} variant="outlined" disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSaveDraft}
            variant="outlined"
            color="primary"
            disabled={isLoading}
          >
            {t("common.save_draft")}
          </Button>
          <Button
            onClick={handlePublish}
            variant="contained"
            color="primary"
            disabled={!isFormValid || isLoading}
          >
            {t("common.publish")}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Overview Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 6 }}>
          {t("profile.portfolio.sections.overview")}
        </Typography>
        <Box sx={{ mb: 3 }}>
          {overviewFields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 3 }}>
              <DesignField
                field={field}
                value={field.value}
                onChange={(id, value) =>
                  handleFieldChange("overview", id, value, "")
                }
                error={field.error}
                isLast={index === overviewFields.length - 1}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Results Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 6 }}>
          {t("profile.portfolio.sections.results")}
        </Typography>
        <Box sx={{ mb: 3 }}>
          {resultsFields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 3 }}>
              <DesignField
                field={field}
                value={field.value}
                onChange={(id, value) =>
                  handleFieldChange("results", id, value, "")
                }
                error={field.error}
                isLast={index === resultsFields.length - 1}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom Action Buttons */}
      <Box
        sx={{
          mt: 6,
          mb: 4,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button
          startIcon={<VisibilityOutlinedIcon />}
          onClick={handlePreview}
          variant="outlined"
          color="primary"
          disabled={isLoading}
        >
          {t("common.preview")}
        </Button>
        <Button onClick={onCancel} variant="outlined" disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSaveDraft}
          variant="outlined"
          color="primary"
          disabled={isLoading}
        >
          {t("common.save_draft")}
        </Button>
        <Button
          onClick={handlePublish}
          variant="contained"
          color="primary"
          disabled={!isFormValid || isLoading}
        >
          {t("common.publish")}
        </Button>
      </Box>
    </Box>
  );
}

export default AddPortfolio;
