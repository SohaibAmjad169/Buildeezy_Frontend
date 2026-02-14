import { Box, Divider, CircularProgress } from "@mui/material";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import DesignField from "../../common/DesignField";
import { LAYOUT_FIELDS } from "./DesignTab.constants";
import ThemeSelect from "./ThemeSelect";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { setProfileData } from "../../../redux/profileSlice";

const LayoutSection = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.profile);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const designLayout = profileData?.profileDesign?.layout || {};
    const defaultValues = {};
    LAYOUT_FIELDS.forEach((field) => {
      defaultValues[field.id] =
        designLayout[field.id] !== undefined
          ? designLayout[field.id]
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

    // Update the global profile state if the field is font
    if (fieldId === "font") {
      // Clone the profileData object
      const updatedProfileData = {
        ...profileData,
        profileDesign: {
          ...profileData.profileDesign,
          layout: {
            ...profileData.profileDesign?.layout,
            font: value,
          },
        },
      };
      // Import the setProfileData action
      // (automatic import if it's in the slice)
      // Dispatch the action to update the global state
      dispatch(setProfileData(updatedProfileData));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    let isValid = true;

    LAYOUT_FIELDS.forEach((field) => {
      if (field.validation?.required) {
        const value = values[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = "This field is required";
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

  const renderField = (field, isLast) => {
    if (field.id === "theme") {
      return (
        <>
          <Box
           data-tour="theme-selector" 
            sx={{
              display: { xs: "block", sm: "block", md: "block", lg: "flex" },
              flexDirection: {
                xs: "column",
                sm: "column",
                md: "column",
                lg: "row",
              },
              alignItems: {
                xs: "stretch",
                sm: "stretch",
                md: "stretch",
                lg: "center",
              },
              height: { xs: "auto", sm: "auto", md: "auto", lg: 72 },
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "100%", md: "100%", lg: "52%" },
                typography: "h5",
                mb: { xs: 1, sm: 1, md: 1, lg: 0 },
              }}
            >
              {field.translationKey}
            </Box>
            <Box
              sx={{ width: { xs: "100%", sm: "100%", md: "100%", lg: "50%" } }}
            >
              <ThemeSelect
                value={values[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
              />
              {errors[field.id] && (
                <Box sx={{ color: "error.main", mt: 1, fontSize: "0.75rem" }}>
                  {errors[field.id]}
                </Box>
              )}
            </Box>
          </Box>
          {!isLast && <Divider sx={{ borderColor: theme.palette.divider }} />}
        </>
      );
    }
    return (
      <DesignField
        key={field.id}
        field={field}
        value={values[field.id]}
        onChange={handleFieldChange}
        error={errors[field.id]}
        isLast={isLast}
      />
    );
  };

  return (
    <Box sx={{ p: 0, backgroundColor: "transparent" }}>
      <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />
      <Box>
        {LAYOUT_FIELDS.map((field, index) => (
          <Box key={field.id}>
            {renderField(field, index === LAYOUT_FIELDS.length - 1)}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

LayoutSection.displayName = "LayoutSection";
export default LayoutSection;
