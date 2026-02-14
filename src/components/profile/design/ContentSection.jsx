import { Box, CircularProgress, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import DesignField from "../../common/DesignField";
import { CONTENT_FIELDS } from "./DesignTab.constants";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { uploadFileUrl } from "../../../apis/apiEndPoints";

const MEDIA_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ContentSection = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { profileData } = useSelector((state) => state.profile);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [videoUploading, setVideoUploading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const designContent = profileData?.profileDesign?.content || {};
    const defaultValues = {};
    CONTENT_FIELDS.forEach((field) => {
      defaultValues[field.id] =
        designContent[field.id] !== undefined
          ? designContent[field.id]
          : field.defaultValue;
      if (field.type === "list" && !defaultValues[field.id]) {
        defaultValues[field.id] = [];
      }
      // Special mapping for certifications.organization
      if (
        field.id === "certifications" &&
        Array.isArray(defaultValues[field.id])
      ) {
        defaultValues[field.id] = defaultValues[field.id].map((cert) => ({
          ...cert,
          organization:
            cert.organization?.extraData?.id || cert.organization?.id || "",
        }));
      }
    });
    setValues(defaultValues);
    setIsLoading(false);
  }, [profileData]);

  const handleFieldChange = async (fieldId, value, file = null) => {
    if (fieldId === "introVideo" && file !== null) {      
      setVideoUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file); // 👈 actual video file
        formData.append("folderName", profileData?.id); // 👈 user or profile ID

        const response = await uploadFileUrl(formData);        
        value = response?.data?.data[0]?.key; // 🔁 adjust if your API response shape differs
        setVideoUploading(false);
      } catch (err) {
        setVideoUploading(false);
        console.error("Video upload failed:", err);
        alert("Error uploading video.");
      }
    }
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

    CONTENT_FIELDS.forEach((field) => {
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
        {CONTENT_FIELDS.map((field, index) => (
          <DesignField
            key={field.id}
            field={field}
            value={
              field.id === "introVideo"
                ? values[field.id] == null || values[field.id] == ""
                  ? null
                  : values[field.id].includes("https:")
                  ? values[field.id]
                  : MEDIA_URL + values[field.id]
                : values[field.id]
            }
            onChange={handleFieldChange}
            error={errors[field.id]}
            isLast={index === CONTENT_FIELDS.length - 1}
          />
        ))}
        {videoUploading ? (
          <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center", p: 3 }}>
            {t("profile.design.content.intro_video_uploading")} &nbsp; 
            <CircularProgress />
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
});

ContentSection.displayName = "ContentSection";
export default ContentSection;
