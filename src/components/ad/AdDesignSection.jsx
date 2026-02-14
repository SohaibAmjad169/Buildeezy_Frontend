import { Box, Card, Divider, CircularProgress } from "@mui/material";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import FormFields from "../common/FormFields";
import { DESIGN_QUESTIONS } from "../../utils/constants/ad";
import i18next from "i18next";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const AdDesignSection = forwardRef((props, ref) => {
  const { onPreview, onSave, onCancel } = props;
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const defaultValues = {};
    DESIGN_QUESTIONS.forEach((field) => {
      defaultValues[field.id] = field.value;
      if (field.child) {
        defaultValues[`${field.id}_child`] = field.child;
      }
    });
    setValues(defaultValues);
    setIsLoading(false);
  }, []);

  const handleFieldChange = (fieldId, value, childData) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
      ...(childData && { [`${fieldId}_child`]: childData }),
    }));
    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
        ...(childData &&
          childData.data.reduce((acc, field) => {
            acc[`${fieldId}_${field.id}`] = "";
            return acc;
          }, {})),
      }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    let isValid = true;

    DESIGN_QUESTIONS.forEach((field) => {
      // Validate main field
      if (field.validation?.required) {
        const value = values[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = i18next.t("errors.field_required");
          isValid = false;
        }
      }

      // Validate child fields if present and shown
      if (field.child && field.child.show && values[field.id] === "pickADate") {
        const childData = values[`${field.id}_child`];
        if (childData) {
          childData.data.forEach((childField) => {
            if (childField.validation?.required && !childField.value) {
              newErrors[`${field.id}_${childField.id}`] = i18next.t(
                "errors.field_required"
              );
              isValid = false;
            }
          });
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  useImperativeHandle(ref, () => ({
    validateFields,
    getValues: () => {
      // Transform values to include child field data
      const transformedValues = { ...values };
      DESIGN_QUESTIONS.forEach((field) => {
        if (field.child && field.child.show && values[`${field.id}_child`]) {
          const childData = values[`${field.id}_child`];
          childData.data.forEach((child) => {
            transformedValues[child.id] = child.value;
          });
        }
      });
      return transformedValues;
    },
    resetValues: () => {
      const defaultValues = {};
      DESIGN_QUESTIONS.forEach((field) => {
        defaultValues[field.id] = field.value;
        if (field.child) {
          defaultValues[`${field.id}_child`] = field.child;
        }
      });
      setValues(defaultValues);
    },
  }));

  const ActionButtons = () => (
    <Stack direction="row" spacing={1.5}>
      <Button
        variant="outlined"
        color="primary"
        onClick={onPreview}
        startIcon={<VisibilityOutlinedIcon />}
        sx={{
          height: "36px",
          minWidth: "103px",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          textTransform: "none",
          borderColor: "#D0D5DD",
          color: "#344054",
          "&:hover": {
            borderColor: "#D0D5DD",
            backgroundColor: "#F9FAFB",
          },
        }}
      >
        {i18next.t("common.preview")}
      </Button>
      <Button
        variant="outlined"
        onClick={onCancel}
        sx={{
          height: "36px",
          minWidth: "103px",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          textTransform: "none",
          borderColor: "#D0D5DD",
          color: "#344054",
          "&:hover": {
            borderColor: "#D0D5DD",
            backgroundColor: "#F9FAFB",
          },
        }}
      >
        {i18next.t("common.cancel")}
      </Button>
      <Button
        variant="contained"
        onClick={onSave}
        sx={{
          height: "36px",
          minWidth: "103px",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          textTransform: "none",
          backgroundColor: "#88B51A",
          "&:hover": {
            backgroundColor: "#7CA318",
          },
        }}
      >
        {i18next.t("common.save")}
      </Button>
    </Stack>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: 0 }}>
      <Divider sx={{ mb: 2 }} />
      <Box>
        {DESIGN_QUESTIONS.map((field) => (
          <Box key={field.id}>
            <FormFields
              id={field.id}
              title={i18next.t(`ad.design.${field.id}.title`)}
              placeholder={i18next.t(`ad.design.${field.id}.placeholder`, {
                defaultValue: field.placeholder,
              })}
              value={values[field.id]}
              options={field.options?.map((opt) => ({
                ...opt,
                label: i18next.t(`ad.design.${field.id}.options.${opt.id}`, {
                  defaultValue: opt.label,
                }),
              }))}
              onValueChange={handleFieldChange}
              type={field.type}
              validation={{
                ...field.validation,
                error:
                  errors[field.id] ||
                  (field.child &&
                  field.child.show &&
                  field.child.data?.some(
                    (child) => errors[`${field.id}_${child.id}`]
                  )
                    ? i18next.t("errors.field_required")
                    : null),
              }}
              child={values[`${field.id}_child`] || field.child}
              fileTypes={field.fileTypes}
              multipleFiles={field.multipleFiles}
              isAssets={field.isAssets}
              isLogo={field.isLogo}
              description={field.description}
              maxSize={field.maxSize}
              mobileConfig={field.mobileConfig}
              fields={field.fields?.map((f) => ({
                ...f,
                title: i18next.t(`ad.design.${field.id}.${f.id}.title`),
                placeholder: i18next.t(
                  `ad.design.${field.id}.${f.id}.placeholder`
                ),
              }))}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #EAECF0" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <ActionButtons />
        </Box>
      </Box>
    </Card>
  );
});

AdDesignSection.displayName = "AdDesignSection";

export default AdDesignSection;
