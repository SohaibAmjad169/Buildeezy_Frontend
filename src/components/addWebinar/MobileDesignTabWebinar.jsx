import { Box, Stack } from "@mui/material";
import PreviewButton from "../profile/design/PreviewButton";
import SaveCancelButtons from "../common/SaveCancelButtons";
import MuiTypography from "../common/MuiTypography";
import RoundButton from "../common/RoundButton";
import FormFields from "../common/FormFields";
import PaginationCard from "../common/PaginationCard";
import ThemeSelect from "../profile/design/ThemeSelect";
import DescriptionWithQuill from "../common/DescriptionWithQuill";
import { useState, useEffect } from "react";
import i18next from "i18next";
import { t } from "i18next";
import { FONT_OPTIONS } from "../profile/design/DesignTab.constants";

function MobileDesignTabWebinar({
  onPreview,
  values,
  onValueChange,
  errors,
  page,
  goToPreviousStep,
  goToNextStep,
  handlePageChange,
  onSave,
  onCancel,
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
    if (onValueChange) {
      onValueChange(fieldId, value);
    }
  };


  const renderFormFields = (field) => {
    if (!field) return null;

    // Show "Description" instead of "Agenda" for the 'approach' field
    if (field.type === "quillEditor" && field.id === "approach") {
      return (
        <Box key={field.id} sx={{ mb: 4 }}>
          <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
            <MuiTypography variant="h6" sx={{}}>
              {i18next.t("webinar.design.approach.title", "Description")}
            </MuiTypography>
            {field?.validation?.required && (
              <MuiTypography variant="h6" sx={{ color: "error.main" }}>*</MuiTypography>
            )}
          </Stack>
          <Box sx={{ width: "100%" }}>
            <DescriptionWithQuill
              value={localValues[field.id] || ""}
              onChange={(content) => handleFieldChange(field.id, content)}
              placeholder={i18next.t("webinar.design.approach.placeholder", "How we will spend the time")}
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
            />
            {field.validation?.maxLength && (
              <MuiTypography variant="caption" sx={{
                display: "block",
                textAlign: "left",
                mt: 0.5,
                color: errors[field.id] ? "#F04438" : "#667085",
              }}>
                {field.validation.maxLength -
                  (localValues[field.id]?.length || 0)}{" "}
                {t("profile.characters_left")}
              </MuiTypography>
            )}
            {errors[field.id] && (
              <MuiTypography variant="caption" sx={{
                color: "error.main",
                mt: 0.5,
                display: "block",
              }}>
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
              {i18next.t(`webinar.design.${field.id}.title`)}
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
            {i18next.t(`webinar.design.${field.id}.title`)}
          </MuiTypography>
          {field?.validation?.required && (
            <MuiTypography sx={{ color: "error.main" }}>*</MuiTypography>
          )}
        </Stack>
        <FormFields
          id={field.id}
          placeholder={i18next.t(`webinar.design.${field.id}.placeholder`, {
            defaultValue: field.placeholder,
          })}
          value={localValues[field.id]}
          options={
            field.id === "font"
              ? FONT_OPTIONS
              : field.options?.map((opt) => ({
                  ...opt,
                  label: i18next.t(`webinar.design.${field.id}.options.${opt.id}`, {
                    defaultValue: opt.label,
                  }),
                }))
          }
          onValueChange={(id, val) => {
            let realValue = val;
            if (typeof val === "function") {
              try {
                realValue = val();
              } catch (e) {
                // ignore
              }
            }
            handleFieldChange(id, realValue);
          }}
          type={field.type}
          multipleFiles={field.multipleFiles}
          fileTypes={field.fileTypes}
          showTitle={false}
          isAssets={field.isAssets}
          isLogo={field.isLogo}
          fields={field.fields?.map((f) => ({
            ...f,
            title: i18next.t(`webinar.design.${field.id}.${f.id}.title`),
            placeholder: i18next.t(`webinar.design.${field.id}.${f.id}.placeholder`),
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
      {/* End buttons only at the end of the flow, same as desktop */}
      {page >= values.length - 1 ? (
        <Box
          sx={{
            mt: 2,
            mb: { xs: 4, sm: 2 },
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <PreviewButton onClick={onPreview} />
          <SaveCancelButtons
            onSave={() => {
              if (onSave) {
                onSave(localValues);
              }
            }}
            onCancel={() => {
              if (onCancel) {
                onCancel();
              }
            }}
            label={t("common.submit")}
          />
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
            mb: { xs: 4, sm: 2 },
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <RoundButton
            variant="outlined"
            onClick={goToPreviousStep}
            sx={{ minWidth: 120, fontWeight: 500, fontSize: 16, borderRadius: 2 }}
            disabled={page === 0}
          >
            {i18next.t("previous")}
          </RoundButton>
          <RoundButton
            color="primary"
            onClick={goToNextStep}
            disabled={page >= values.length - 1}
            sx={{ minWidth: 120, fontWeight: 500, fontSize: 16, borderRadius: 2, ml: 1 }}
          >
            {i18next.t("next")}
          </RoundButton>
        </Box>
      )}
      {currentField && (
        <PaginationCard
          count={values.length}
          page={page + 1}
          onPageChange={handlePageChange}
          title={
            currentField.id === "approach"
              ? i18next.t("webinar.design.approach.title", "Description")
              : i18next.t(`webinar.design.${currentField.id}.title`)
          }
          subtitle={
            currentField.id === "approach"
              ? i18next.t("webinar.design.approach.subtitle", "Let people know what to expect in the webinar session. Include agenda and any expectations from attendees.")
              : i18next.t(`webinar.design.${currentField.id}.subtitle`)
          }
          subtitleHtml={undefined}
        />
      )}
    </Box>
  );
}

export default MobileDesignTabWebinar;
