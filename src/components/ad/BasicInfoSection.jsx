import { Box, Card, Divider, CircularProgress } from "@mui/material";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import FormFields from "../common/FormFields";
import { AD_QUESTIONS, DESIGN_QUESTIONS } from "../../utils/constants/ad";

const BasicInfoSection = forwardRef((props, ref) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default values
    const defaultValues = {};
    AD_QUESTIONS.forEach((field) => {
      defaultValues[field.id] = field.value;
      if (field.child) {
        defaultValues[`${field.id}_child`] = field.child;
      }
    });
    setValues(defaultValues);
    setIsLoading(false);
  }, []);

  const handleFieldChange = (fieldId, value, childData) => {
    const newValues = {
      ...values,
      [fieldId]: value,
      ...(childData && { [`${fieldId}_child`]: childData }),
    };

    // If ad type changes, update visibility-dependent fields
    if (fieldId === "adType") {
      // Clear URL field if Learning & Solutions is selected
      if (value === "learningSolution") {
        newValues.url = "";
        // Clear all design fields except call to action
        DESIGN_QUESTIONS.forEach((field) => {
          if (field.id !== "callToAction") {
            newValues[field.id] = field.value || "";
          }
        });
      }
    }

    setValues(newValues);

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

    AD_QUESTIONS.forEach((field) => {
      // Validate main field
      if (field.validation?.required) {
        const value = values[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = "errors.field_required";
          isValid = false;
        }
      }

      // Validate child fields if present and shown
      if (field.child && field.child.show && values[field.id] === "pickADate") {
        const childData = values[`${field.id}_child`];
        if (childData) {
          childData.data.forEach((childField) => {
            if (childField.validation?.required && !childField.value) {
              newErrors[`${field.id}_${childField.id}`] =
                "This field is required";
              isValid = false;
            }
          });
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    validateFields,
    getValues: () => {
      // Transform values to include child field data
      const transformedValues = { ...values };
      AD_QUESTIONS.forEach((field) => {
        if (field.child && field.child.show && values[`${field.id}_child`]) {
          const childData = values[`${field.id}_child`];
          childData.data.forEach((child) => {
            transformedValues[child.id] = child.value;
          });
        }
      });
      return transformedValues;
    },
  }));

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
        {AD_QUESTIONS.map((field) => {
          // Check if field should be shown based on current values
          const shouldShow = field.show ? field.show(values) : true;
          if (!shouldShow) return null;

          return (
            <Box key={field.id}>
              <FormFields
                id={field.id}
                title={field.title}
                placeholder={field.placeholder}
                value={values[field.id]}
                options={field.options}
                onValueChange={handleFieldChange}
                type={field.type}
                validation={field.validation}
                child={values[`${field.id}_child`] || field.child}
                error={
                  errors[field.id] ||
                  (field.child &&
                  field.child.show &&
                  field.child.data.some(
                    (child) => errors[`${field.id}_${child.id}`]
                  )
                    ? "errors.required_dates"
                    : null)
                }
                fileTypes={field.fileTypes}
                multipleFiles={field.multipleFiles}
                isAssets={field.isAssets}
                isLogo={field.isLogo}
                subtitle={field.subtitle}
              />
            </Box>
          );
        })}
      </Box>
    </Card>
  );
});

BasicInfoSection.displayName = "BasicInfoSection";
export default BasicInfoSection;
