import { Box, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import RoundButton from "../common/RoundButton";
import FormFields from "../common/FormFields";
import PaginationCard from "../common/PaginationCard";
import ThemeSelect from "../profile/design/ThemeSelect";
import DescriptionWithQuill from "../common/DescriptionWithQuill";
import { useState, useEffect } from "react";
import i18next from "i18next";
import { t } from "i18next";

function MobileDesignTab({
  onPreview,
  values,
  onValueChange,
  errors,
  page,
  goToPreviousStep,
  goToNextStep,
  handlePageChange,
}) {
  // Initialize with values from props
  const [localValues, setLocalValues] = useState(() => {
    const initialValues = {};
    values.forEach((field) => {
      initialValues[field.id] = field.value || field.defaultValue || "";
    });
    return initialValues;
  });

  const [charCount, setCharCount] = useState(0);


  useEffect(() => {
    const newValues = {};
    values.forEach((field) => {
      newValues[field.id] = field.value || field.defaultValue || "";
    });
    setLocalValues(newValues);
  }, [values]);


  const handleFieldChange = (fieldId, value) => {
    setLocalValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    onValueChange?.(fieldId, value);
  };

  const renderFormFields = (field) => {
    if (!field) return null;

    // Handle richText type
    if (field.type === "quillEditor") {

      return (
        <Box key={field.id} sx={{ mb: 4 }}>
          <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
            <MuiTypography variant="h6">
              {i18next.t(`ad.design.${field.id}.title`)}
            </MuiTypography>
            {field?.validation?.required && (
              <MuiTypography sx={{ color: "error.main" }}>*</MuiTypography>
            )}
          </Stack>
          <Box sx={{ width: "100%" }}>
            {/* <DescriptionWithQuill
              value={localValues[field.id] || ""}
              onChange={(content) => handleFieldChange(field.id, content)}
              placeholder={i18next.t(`ad.design.${field.id}.placeholder`)}
              maxLength={field.validation?.maxLength || 300}
              onCharCountChange={(count) => setCharCount(count)}
              error={errors[field.id]}
              sx={{
                "& .ql-toolbar": {
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #D0D5DD",
                  borderBottom: "none",
                },
                "& .ql-container": {
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #D0D5DD",
                  borderTop: "none",
                  minHeight: "200px",
                },
                "& .ql-editor": {
                  minHeight: "200px",
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#101828",
                  textAlign: "left",
                  "&::placeholder": {
                    color: "#667085",
                    textAlign: "left",
                  },
                },
              }}
            />         */}
            {field.validation?.maxLength && (
              <MuiTypography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "left",
                  mt: 0.5,
                  color: errors[field.id] ? "#F04438" : "#667085",
                }}
              >
                {field.validation.maxLength -
                  (localValues[field.id]?.length || 0)}{" "}
                {t("profile.characters_left")}
              </MuiTypography>
            )}
            {errors[field.id] && (
              <MuiTypography
                variant="caption"
                sx={{
                  color: "error.main",
                  mt: 0.5,
                  display: "block",
                }}
              >
                {errors[field.id]}
              </MuiTypography>
            )}
          </Box>
        </Box>
      );
    }

    // Handle theme selection
    if (field.type === "select" && field.id === "theme") {
      return (
        <Box key={field.id} sx={{ mb: 4 }}>
          <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
            <MuiTypography variant="h6">
              {i18next.t(`ad.design.${field.id}.title`)}
            </MuiTypography>
            {field?.validation?.required && (
              <MuiTypography sx={{ color: "error.main" }}>*</MuiTypography>
            )}
          </Stack>
          <Box sx={{ width: "100%" }}>
            <ThemeSelect
              value={localValues[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
            {errors[field.id] && (
              <Box sx={{ color: "error.main", mt: 1, fontSize: "0.75rem" }}>
                {errors[field.id]}
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    // Handle other field types
    return (
      <Box key={field.id} sx={{ mb: 4 }}>
        <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
          <MuiTypography variant="h6">
            {i18next.t(`ad.design.${field.id}.title`)}
          </MuiTypography>
          {field?.validation?.required && (
            <MuiTypography sx={{ color: "error.main" }}>*</MuiTypography>
          )}
        </Stack>
        <FormFields
          id={field.id}
          placeholder={i18next.t(`ad.design.${field.id}.placeholder`, {
            defaultValue: field.placeholder,
          })}
          value={localValues[field.id]}
          options={field.options?.map((opt) => ({
            ...opt,
            label: i18next.t(`ad.design.${field.id}.options.${opt.id}`, {
              defaultValue: opt.label,
            }),
          }))}
          onValueChange={handleFieldChange}
          type={field.type}
          multipleFiles={field.multipleFiles}
          fileTypes={field.fileTypes}
          showTitle={false}
          isAssets={field.isAssets}
          isLogo={field.isLogo}
          fields={field.fields?.map((f) => ({
            ...f,
            title: i18next.t(`ad.design.${field.id}.${f.id}.title`),
            placeholder: i18next.t(`ad.design.${field.id}.${f.id}.placeholder`),
          }))}
          validation={{
            ...field.validation,
            error: errors[field.id],
          }}
          multiline={field.multiline}
          rows={field.rows}
          maxSize={field.maxSize}
          acceptedFormats={field.acceptedFormats}
          mobileConfig={field.mobileConfig}
        />
      </Box>
    );
  };

  // Get current field from values prop
  const currentField = values[page];

  return (
    <Box
      sx={{
        width: "100%",
        my: 4,
      }}
    >
      <MuiTypography variant="h2">Design</MuiTypography>
      <Box sx={{ mt: 3, mb: 4 }}>{renderFormFields(currentField)}</Box>
      <Box
        sx={{
          mt: 2,
          mb: { xs: 4, sm: 2 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 2 },
          width: "100%",
        }}
      >
        <RoundButton
          variant="outlined"
          onClick={goToPreviousStep}
          sx={{
            width: { xs: "100%", sm: "auto" },
          }}
          disabled={page === 0}
        >
          {i18next.t("previous")}
        </RoundButton>
        {page >= values.length - 1 ? (
          <RoundButton
            onClick={onPreview}
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {i18next.t("preview")}
          </RoundButton>
        ) : (
          <RoundButton
            onClick={goToNextStep}
            disabled={page >= values.length - 1}
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {i18next.t("next")}
          </RoundButton>
        )}
      </Box>
      {currentField && (
        <PaginationCard
          count={values.length}
          page={page + 1}
          onPageChange={handlePageChange}
          title={i18next.t(`ad.design.${currentField.id}.title`)}
          subtitle={i18next.t(`ad.design.${currentField.id}.subtitle`)}
        />
      )}
    </Box>
  );
}

export default MobileDesignTab;
