import { Box, CircularProgress, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import DesignField from "../../common/DesignField";
import { INTERACTIVE_FIELDS } from "./DesignTab.constants";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";

const InteractiveSection = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { profileData } = useSelector((state) => state.profile);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const designInteractive = profileData?.profileDesign?.interactive || {};
    const defaultValues = {};
    INTERACTIVE_FIELDS.forEach((field) => {
      defaultValues[field.id] =
        designInteractive[field.id] !== undefined
          ? designInteractive[field.id]
          : field.defaultValue;
    });
    setValues(defaultValues);
    setIsLoading(false);
  }, [profileData]);

  const handleFieldChange = (fieldId, value) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    let isValid = true;

    INTERACTIVE_FIELDS.forEach((field) => {
      if (field.validation?.required) {
        const value = values[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = t("errors.field_required");
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    validateFields,
    getValues: () => values,
  }));

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, backgroundColor: "transparent" }}>
      <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />
      <Box>
        {INTERACTIVE_FIELDS.map((field, index) => (
          <DesignField
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={handleFieldChange}
            error={errors[field.id]}
            isLast={index === INTERACTIVE_FIELDS.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
});

InteractiveSection.displayName = "InteractiveSection";
export default InteractiveSection;
