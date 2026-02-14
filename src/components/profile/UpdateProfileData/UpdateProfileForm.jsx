import { useEffect, useState, useCallback } from "react";
import { Box, Divider } from "@mui/material";
import { cloneDeep } from "lodash";
import ProfileFields from "../../profile/ProfileFields";
import { QUESTION_TYPES } from "../../../utils/constants/onboarding";
import MuiTypography from "../../common/MuiTypography";
import ProfessionalAffiliationsContainer from "../../profile/ProfessionalAffiliationsContainer";
import IdDocumentUpload from "../../profile/IdDocumentUpload";
import SaveCancelButtons from "../../common/SaveCancelButtons";
import { useSelector } from "react-redux";
import { t } from "i18next";
import { USER_TYPES } from "../../../utils/constants/login";

function UpdateProfileForm({
  fields,
  onSaveChanges,
  handleCancel,
  onFieldChange,
  onIdDocumentsChange,
}) {
  const [profileFields, setProfileFields] = useState(cloneDeep(fields));
  const [idDocuments, setIdDocuments] = useState({
    verificationType: "",
    verificationDoc: ""
  });
  const userId = useSelector((state) => state.profile.profileData?.id);
  const profileData = useSelector((state) => state.profile.profileData);

  useEffect(() => {
    setProfileFields(cloneDeep(fields));
    // Initialize ID documents from profile data (for vendors only)
    if (profileData && profileData.userType === "vendor") {
      const newIdDocuments = {
        verificationType: profileData.verificationType || profileData.vendorAdditionalInfo?.verificationType || "",
        verificationDoc: profileData.verificationDoc || profileData.vendorAdditionalInfo?.verificationDoc || ""
      };
      setIdDocuments(newIdDocuments);
      // Pass initial values to parent to ensure sync
      onIdDocumentsChange && onIdDocumentsChange(newIdDocuments);
    }
  }, [fields, profileData]);

  // Field change handler
  const handleValueChange = (id, value) => {
    onFieldChange(id, value);
  };

  // ID Documents change handler
  const handleIdDocumentsChange = (value) => {
    setIdDocuments(value);
    // Pass the data up to the parent component
    onIdDocumentsChange && onIdDocumentsChange(value);
  };

  // Save handler - just call the parent's save function
  const handleSaveProfile = async () => {
    return await onSaveChanges();
  };

  const handleCancelClick = useCallback(() => {
    setProfileFields(cloneDeep(fields));
    handleCancel?.();
  }, [fields, handleCancel]);

  if (!profileFields) return null;

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {profileFields.map((field, index) => (
          <Box key={field.id} data-field-id={field.id} sx={{ mb: 3 }}>
            <Box
              sx={{
                my: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "flex-start" },
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: "50%" },
                  pr: { xs: 0, sm: 3 },
                  mb: { xs: 1, sm: 0 },
                  pt: { sm: 1 },
                }}
              >
                <MuiTypography variant="h5">
                  {field.title}
                  {field.validation?.required && (
                    <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                      *
                    </Box>
                  )}
                </MuiTypography>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                {field.type === QUESTION_TYPES.professionalAffiliation ? (
                  <ProfessionalAffiliationsContainer
                    value={field.value}
                    onChange={(newValue) =>
                      handleValueChange(field.id, newValue)
                    }
                  />
                ) : (
                  <ProfileFields
                    id={field.id}
                    title={field.title}
                    placeholder={field.placeholder || field.title}
                    value={field.value}
                    options={field.options}
                    onValueChange={handleValueChange}
                    type={field.type}
                    validation={field.validation}
                    disabled={field.disabled}
                  />
                )}
              </Box>
            </Box>
            {index < profileFields.length - 1 && (
              <Divider sx={{ width: "100%" }} />
            )}
          </Box>
        ))}
      </Box>

      {/* ID Documents Upload Section - Only for non-admin users */}
      {profileData?.userType !== USER_TYPES.admin && (
        <>
          <Divider sx={{ width: "100%", my: 3 }} />
          <IdDocumentUpload
            value={idDocuments}
            onChange={handleIdDocumentsChange}
          />
        </>
      )}

      <Box sx={{ mt: 3 }}>
        <Divider sx={{ width: "100%", mb: 3 }} />
        <SaveCancelButtons
          onSave={handleSaveProfile}
          onCancel={handleCancelClick}
          label={t("common.save")}
        />
      </Box>
    </>
  );
}

export default UpdateProfileForm;
