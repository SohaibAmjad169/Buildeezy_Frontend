import React, { useState, useEffect } from "react";
import { Box, Divider, Typography, Chip, Button, IconButton, Card, CardContent, CardMedia } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Edit, DocumentText } from "iconsax-react";
import SelectBox from "../common/SelectBox";
import UploadDoc from "../upload/UploadDoc";
import MuiTypography from "../common/MuiTypography";
import { 
  mapDocOptions, 
  VERIFICATION_DOC, 
  VERIFICATION_TYPE,
  veriffStatusObj
} from "../../utils/constants/profile";
import { ALL_FILE_TYPES, getFileFormat, getFileName } from "../../utils/file";
import { USER_TYPES } from "../../utils/constants/login";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const IdDocumentUpload = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  const { profileData, veriffStatus } = useSelector((state) => state.profile);
  
  const [verificationType, setVerificationType] = useState("");
  const [verificationDoc, setVerificationDoc] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (value) {
      setVerificationType(value.verificationType || "");
      setVerificationDoc(value.verificationDoc || "");
      // Set editing state based on whether we have existing data
      setIsEditing(!value.verificationType && !value.verificationDoc);
    } else {
      // If no value, start in editing mode
      setIsEditing(true);
    }
  }, [value]);

  // Separate useEffect to handle profile data changes
  useEffect(() => {
    if (profileData?.vendorAdditionalInfo) {
      const { verificationType: profType, verificationDoc: profDoc } = profileData.vendorAdditionalInfo;
      // Only update if we don't have current values or if profile data has changed
      if (!verificationType && !verificationDoc && (profType || profDoc)) {
        setVerificationType(profType || "");
        setVerificationDoc(profDoc || "");
      }
    }
  }, [profileData?.vendorAdditionalInfo, verificationType, verificationDoc]);

  const handleTypeChange = (id, selectedValue) => {
    setVerificationType(selectedValue);
    const newValue = {
      verificationType: selectedValue,
      verificationDoc
    };
    onChange && onChange(newValue);
  };

  const handleDocChange = (id, docValue) => {
    // UploadDoc passes a function that needs to be called with the previous value
    const newDoc = typeof docValue === 'function' ? docValue(verificationDoc) : docValue;
    setVerificationDoc(newDoc);
    const newValue = {
      verificationType,
      verificationDoc: newDoc
    };
    onChange && onChange(newValue);
  };

  // Helper functions
  const getDocumentTypeLabel = (type) => {
    const option = mapDocOptions[profileData?.userType]?.find(opt => opt.value === type);
    return option?.label || type;
  };

  const getDocumentFileName = (docPath) => {
    if (!docPath) return '';
    return getFileName(docPath) || docPath.split('/').pop() || 'Document';
  };

  const getDocumentFormat = (docPath) => {
    if (!docPath) return '';
    return getFileFormat(docPath);
  };

  const getDocumentUrl = (docPath) => {
    if (!docPath) return '';
    // If the path already includes https:, return as is, otherwise append base URL
    return docPath.includes("https:") ? docPath : IMAGE_URL + docPath;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values from profile data
    if (profileData?.vendorAdditionalInfo) {
      const { verificationType: profType, verificationDoc: profDoc } = profileData.vendorAdditionalInfo;
      setVerificationType(profType || "");
      setVerificationDoc(profDoc || "");
      // Update parent component with original values
      const originalValue = {
        verificationType: profType || "",
        verificationDoc: profDoc || ""
      };
      onChange && onChange(originalValue);
    } else if (value) {
      setVerificationType(value.verificationType || "");
      setVerificationDoc(value.verificationDoc || "");
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // The onChange is already called by individual handlers
  };

  // Only show for vendor users
  if (profileData?.userType !== USER_TYPES.vendor) {
    return null;
  }

  // Check if we have existing document data
  const hasExistingDocument = verificationType && verificationDoc;

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <MuiTypography variant="h5">
          {t("profile.id_documents")} 
          <Typography component="span" sx={{ color: 'text.secondary', ml: 1, fontSize: '0.85em' }}>
            ({t("common.optional")})
          </Typography>
        </MuiTypography>
        
        {/* Show verification status if available */}
        {veriffStatus && veriffStatusObj[veriffStatus] && (
          <Chip
            label={t(veriffStatusObj[veriffStatus]?.chipLabel)}
            size="small"
            sx={{
              backgroundImage: veriffStatusObj[veriffStatus]?.bgColor,
              color: veriffStatusObj[veriffStatus]?.color,
              fontWeight: 500,
            }}
          />
        )}

        {/* Edit button when not in editing mode and has existing document */}
        {!isEditing && hasExistingDocument && (
          <IconButton onClick={handleEdit} size="small">
            <Edit size={20} />
          </IconButton>
        )}
      </Box>
      
      <MuiTypography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {t("profile.id_documents_description")}
      </MuiTypography>

      <Divider sx={{ mb: 3 }} />

      {/* Show existing document photo card when not editing */}
      {!isEditing && hasExistingDocument ? (
        <Box sx={{ mb: 3 }}>
          {/* Document Info Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DocumentText size={24} color="#719c40" />
              <Box>
                <MuiTypography variant="body1" sx={{ fontWeight: 500 }}>
                  {getDocumentTypeLabel(verificationType)}
                </MuiTypography>
                <MuiTypography variant="body2" sx={{ color: 'text.secondary' }}>
                  {getDocumentFileName(verificationDoc)}
                  {getDocumentFormat(verificationDoc) && (
                    <Typography component="span" sx={{ ml: 1, textTransform: 'uppercase', fontWeight: 500 }}>
                      ({getDocumentFormat(verificationDoc)})
                    </Typography>
                  )}
                </MuiTypography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit size={16} />}
              onClick={handleEdit}
              disabled={disabled}
            >
              {t("edit")}
            </Button>
          </Box>

          {/* Verification Photo Card */}
          <Card 
            sx={{ 
              maxWidth: { xs: '100%', sm: 400 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 1
            }}
          >
            <CardMedia
              component="img"
              image={getDocumentUrl(verificationDoc)}
              alt={`${getDocumentTypeLabel(verificationType)} Document`}
              sx={{
                height: { xs: 200, sm: 250 },
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => window.open(getDocumentUrl(verificationDoc), '_blank')}
            />
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MuiTypography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t("profile.verification_document")}
                </MuiTypography>
                <Chip
                  label={t("profile.verified_id")}
                  size="small"
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        /* Show edit form when editing or no existing document */
        <>
          {/* ID Type Selection */}
          <Box sx={{ mb: 3 }}>
            <MuiTypography variant="body1" sx={{ mb: 1.5 }}>
              {t("profile.id_type")}
            </MuiTypography>
            <Box sx={{ width: { xs: "100%", md: "50%" } }}>
              <SelectBox
                id={VERIFICATION_TYPE.id}
                placeholder={VERIFICATION_TYPE.placeholder}
                options={mapDocOptions[profileData?.userType] || []}
                onSelectChange={handleTypeChange}
                value={verificationType}
                disabled={disabled}
              />
            </Box>
          </Box>

          {/* Document Upload */}
          <Box sx={{ mb: 3 }}>
            <MuiTypography variant="body1" sx={{ mb: 1.5 }}>
              {t("profile.upload_document")}
            </MuiTypography>
            <UploadDoc
              id={VERIFICATION_DOC?.id}
              value={verificationDoc}
              onSelectFiles={handleDocChange}
              acceptedFileTypes={ALL_FILE_TYPES}
              showTitle={false}
              isHorizontal={true}
              disabled={disabled}
            />
          </Box>

          {/* Action buttons when editing existing document */}
          {hasExistingDocument && isEditing && (
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelEdit}
                disabled={disabled}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveEdit}
                disabled={disabled}
              >
                {t("common.save")}
              </Button>
            </Box>
          )}
        </>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <MuiTypography variant="body2" sx={{ color: 'text.secondary' }}>
          <strong>{t("common.note")}:</strong> {t("profile.id_documents_note")}
        </MuiTypography>
      </Box>
    </Box>
  );
};

export default IdDocumentUpload;