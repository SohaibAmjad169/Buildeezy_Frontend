import { Box, CircularProgress, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import DesignField from "../../common/DesignField";
import { ENGAGEMENT_FIELDS } from "./DesignTab.constants";
import { useSelector } from "react-redux";
import useReviews from "../../../hooks/useReviews";
import { getHighlightReviewOptions } from "./DesignTab.constants";
import { useTheme } from "@mui/material/styles";

const EngagementSection = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { profileData, reviews: reduxReviews } = useSelector(
    (state) => state.profile
  );
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [reviewOptions, setReviewOptions] = useState([]);
  const { fetchReviews } = useReviews();
  const theme = useTheme();

  // Set review options from Redux or fetch if not present
  useEffect(() => {
    let isMounted = true;
    async function ensureReviews() {
      const userId = profileData?.id;
      if (!userId) {
        setIsLoading(false);
        setReviewOptions([]);
        return;
      }
      let reviews = reduxReviews;
      if (!reviews || reviews.length === 0) {
        reviews = await fetchReviews(userId);
        // Optionally: dispatch(setReviews(reviews));
      }
      const options = getHighlightReviewOptions(reviews);
      if (isMounted) {
        setReviewOptions(options);
        setIsLoading(false);
      }
    }
    ensureReviews();
    return () => {
      isMounted = false;
    };
  }, [profileData?.id]);

  // Set default values from profileData
  useEffect(() => {
    const designEngagement = profileData?.profileDesign?.engagement || {};
    const defaultValues = {};
    ENGAGEMENT_FIELDS.forEach((field) => {
      defaultValues[field.id] =
        designEngagement[field.id] !== undefined
          ? designEngagement[field.id]
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
    ENGAGEMENT_FIELDS.forEach((field) => {
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

  // Inject reviewOptions into highlightReview field before rendering
  const fieldsWithReviewOptions = ENGAGEMENT_FIELDS.map((field) => {
    if (field.id === "highlightReview") {
      const highlightReviewOptions = reviewOptions.map((opt) => String(opt.id));
      const currentValue =
        values[field.id] !== undefined ? String(values[field.id]) : "";
      const safeValue = highlightReviewOptions.includes(currentValue)
        ? currentValue
        : "";
      return { ...field, options: reviewOptions, value: safeValue };
    }
    return field;
  });

  return (
    <Box sx={{ p: 0, backgroundColor: "transparent" }}>
      <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />
      <Box>
        {fieldsWithReviewOptions.map((field, index) => (
          <DesignField
            key={field.id}
            field={field}
            value={field.value !== undefined ? field.value : values[field.id]}
            onChange={handleFieldChange}
            error={errors[field.id]}
            isLast={index === fieldsWithReviewOptions.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
});

EngagementSection.displayName = "EngagementSection";
export default EngagementSection;
