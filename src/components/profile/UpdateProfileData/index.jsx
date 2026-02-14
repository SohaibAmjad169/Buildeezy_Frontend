import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { cloneDeep } from "lodash";
import React from "react";

import useUpdateProfile from "../../../hooks/useUpdateProfile";
import ProfileTabs from "./ProfileTabs";
import PersonalInformation from "./TabPanels/PersonalInformation";
import DesignTab from "../DesignTab";
import ReviewsTab from "../ReviewsTab";
import PastClients from "../../../pages/private/PastClients";
import { USER_TYPES } from "../../../utils/constants/login";
import PortfolioTab from "../portfolio/PortfolioTab";
import useMapProfileFields from "../../../hooks/useMapProfileFields";
import useCountry from "../../../hooks/useCountry";
import useCity from "../../../hooks/useCity";
import useUpdateDesignFields from "../../../hooks/useUpdateDesignFields";
import { useSearchParams } from "react-router-dom";
import { calculateProfileCompletion } from "../../../utils/profileCompletion";

function UpdateData({ 
  fields, 
  onPreview, 
  onAddProject,
  onEditProject,
  initialTabIndex = 0, 
  onProfileUpdateComplete,
  onDataSpecificUpdateComplete,
  designData,
  portfolioData,
  pastClientsData,
  onPortfolioDataUpdate
}) {

  const { t } = useTranslation();
  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === USER_TYPES.admin;
  const { updateProfile } = useUpdateProfile();
  const { loading } = useSelector((state) => state.config);
  const reviews = useSelector((state) => state.profile.reviews);


  // Country and city options state
  const { getCountries } = useCountry();
  const { getCities } = useCity();
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      const countries = await getCountries();
      setCountryOptions(countries || []);
      if (profileData?.country?.isoCode) {
        const cities = await getCities(profileData.country.isoCode);
        setCityOptions(cities || []);
      } else {
        setCityOptions([]);
      }
    }
    fetchOptions();
  }, [profileData?.country?.isoCode]);

  // Use the mapping hook to always get up-to-date fields from profileData
  const mappedFields = useMapProfileFields(
    fields,
    profileData,
    countryOptions,
    cityOptions
  );
  const [profileFields, setProfileFields] = useState(cloneDeep(mappedFields));
  const [profileKey, setProfileKey] = useState();
  const [tempAvatar, setTempAvatar] = useState(null);
  const [value, setValue] = useState(0);
  const [loadingDesign] = useState(false);
  const [searchParams] = useSearchParams();
  const [idDocuments, setIdDocuments] = useState({
    verificationType: "",
    verificationDoc: ""
  });
  const portfolio = searchParams.get("portfolio");
  // Debug logging
  React.useEffect(() => {
    console.log('=== UpdateProfileData Debug ===');
    console.log('profileData:', profileData);
    console.log('profileData.id:', profileData?.id);
    console.log('loading:', loading);
    console.log('mappedFields length:', mappedFields?.length);
    console.log('profileFields length:', profileFields?.length);
  }, [profileData, loading, mappedFields, profileFields]);

  React.useEffect(() => {
    console.log('Main initialization useEffect triggered');
    console.log('profileData?.id:', profileData?.id);
    console.log('mappedFields length:', mappedFields?.length);
    
    // Wait for profile data to be available
    if (!profileData?.id) {
      console.log('Waiting for profileData...');
      return;
    }
    
    // Wait for fields to be mapped
    if (!mappedFields || mappedFields.length === 0) {
      console.log('Waiting for mappedFields...');
      return;
    }
    
    console.log('🚀 Always initializing form fields with profileData:', profileData?.id);
    
    // Always use the latest mapped fields
    const fieldsWithProfileId = mappedFields.map(field => ({
      ...field,
      profileId: profileData?.id
    }));
    
    // Log specific field values for debugging
    const phoneField = fieldsWithProfileId.find(f => f.id === 'phoneNumber');
    const isDeliverField = fieldsWithProfileId.find(f => f.id === 'isDeliver');
    const openingHoursField = fieldsWithProfileId.find(f => f.id === 'openingHours');
    
    console.log('phoneNumber field value:', phoneField?.value);
    console.log('isDeliver field value:', isDeliverField?.value);
    console.log('openingHours field value:', openingHoursField?.value);
    
    setProfileFields(cloneDeep(fieldsWithProfileId));
    
    // Initialize ID documents from profile data (for vendors only)
    if (profileData && profileData.userType === "vendor") {
      const idDocs = {
        verificationType: profileData.verificationType || profileData.vendorAdditionalInfo?.verificationType || "",
        verificationDoc: profileData.verificationDoc || profileData.vendorAdditionalInfo?.verificationDoc || ""
      };
      console.log('Setting ID documents:', idDocs);
      setIdDocuments(idDocs);
    }
  }, [mappedFields]);

  const { updateDesignFields } = useUpdateDesignFields();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (portfolio) {
      setValue(3);
    }
  }, [portfolio]);

  // Update tab when initialTabIndex changes (from navigation)
  useEffect(() => {
    if (initialTabIndex !== value) {
      setValue(initialTabIndex);
    }
  }, [initialTabIndex]);

  // Handle field changes
  const handleFieldChange = async (id, value) => {
    const newFields = cloneDeep(profileFields);
    const fieldIndex = newFields.findIndex((field) => field.id === id);
    if (fieldIndex !== -1) {
      if (id === "country") {
        // Reset city when country changes
        const cityIndex = newFields.findIndex((field) => field.id === "city");
        if (cityIndex !== -1) {
          newFields[cityIndex].value = { name: "" };
          if (value?.isoCode) {
            const cities = await getCities(value.isoCode);
            newFields[cityIndex].options = cities || [];
          } else {
            newFields[cityIndex].options = [];
          }
        }
      }
      newFields[fieldIndex].value = value;
      setProfileFields(newFields);
    }
  };

  // Avatar change handler
  const handlePicChange = (pic, avatarKey) => {
    setTempAvatar(pic);
    setProfileKey(avatarKey);
    setProfileFields((fields) =>
      fields.map((f) => (f.id === "avatar" ? { ...f, value: avatarKey } : f))
    );
  };

  // Handle ID documents change
  const handleIdDocumentsChange = (docs) => {
    setIdDocuments(docs);
  };

  // Save handler
  const onSaveProfile = async () => {
    // Flatten fields into a single object, mapping 'name' to 'firstName' and 'lastName', and ensuring openingHours is an array of objects
    const profileDataObj = {};
    const additionalInfoObj = {};
    
    profileFields.forEach((f) => {
      if (f.id === "name" && typeof f.value === "object") {
        profileDataObj.firstName = f.value.first || "";
        profileDataObj.lastName = f.value.second || "";
      } else if (f.id === "openingHours") {
        let value = f.value;
        console.log('Original openingHours value:', value);
        
        // Handle different formats of openingHours data
        let filteredHours = [];
        if (Array.isArray(value)) {
          // If it's already an array, use it directly
          filteredHours = value;
        } else if (value && typeof value === "object") {
          // If it's an object, it might be the numbered key format from onboarding
          // Extract the actual hours data from numbered keys like openingHours1, openingHours2, etc.
          const entries = Object.entries(value)
            .filter(([key]) => key.startsWith("openingHours"))
            .map(([, val]) => val)
            .filter(entry => entry && (
              (Array.isArray(entry.daysOfWeek) && entry.daysOfWeek.length > 0) ||
              entry.startTime ||
              entry.endTime
            ));
          filteredHours = entries;
        }
        console.log('Filtered openingHours:', filteredHours);
        // Store openingHours at the top level for vendors, in additionalInfo for contractors/specialists
        if (profileData?.userType === "vendor") {
          profileDataObj.openingHours = filteredHours;
        } else if (profileData?.userType === "contractor" || 
                   profileData?.userType === "specialist") {
          additionalInfoObj.openingHours = filteredHours;
        } else {
          profileDataObj.openingHours = filteredHours;
        }
      } else {
        profileDataObj[f.id] = f.value;
      }
    });
    
    // Prepare additional info for different user types
    const hasIdDocuments = idDocuments.verificationType || idDocuments.verificationDoc;
    const isVendor = profileData?.userType === "vendor";
    const isContractor = profileData?.userType === "contractor";
    const isSpecialist = profileData?.userType === "specialist";
    const hasOpeningHours = additionalInfoObj.openingHours;
    
    let vendorAdditionalInfo = null;
    let contractorAdditionalInfo = null;
    let specialistAdditionalInfo = null;
    
    // For vendors, we keep existing vendorAdditionalInfo but don't add openingHours or ID docs to it
    if (isVendor) {
      vendorAdditionalInfo = profileData?.vendorAdditionalInfo;
    }
    
    if (isContractor && hasOpeningHours) {
      contractorAdditionalInfo = {
        ...(profileData?.contractorAdditionalInfo || {}),
        ...(additionalInfoObj.openingHours && { openingHours: additionalInfoObj.openingHours }),
      };
    } else if (isContractor) {
      contractorAdditionalInfo = profileData?.contractorAdditionalInfo;
    }
    
    if (isSpecialist && hasOpeningHours) {
      specialistAdditionalInfo = {
        ...(profileData?.specialistAdditionalInfo || {}),
        ...(additionalInfoObj.openingHours && { openingHours: additionalInfoObj.openingHours }),
      };
    } else if (isSpecialist) {
      specialistAdditionalInfo = profileData?.specialistAdditionalInfo;
    }

    // Calculate profile completion percentage with current form data
    const updatedProfileData = {
      ...profileData,
      ...profileDataObj,
      ...(profileKey && { avatar: profileKey })
    };

    const completion = calculateProfileCompletion(
      profileFields,
      designData,
      portfolioData,
      pastClientsData,
      updatedProfileData
    );

    console.log('Calculated completion percentage for save:', completion.percentage);

    const profilePayload = {
      data: {
        type: !isAdmin ? "user_profile" : "admin_profile",
        id: profileData?.id,
        ...(profileKey && { avatar: profileKey }),
        ...profileDataObj,
        profileCompletionPercentage: completion.percentage,
        // For vendors, include ID documents and opening hours at the top level
        ...(isVendor && idDocuments.verificationType && { verificationType: idDocuments.verificationType }),
        ...(isVendor && idDocuments.verificationDoc && { 
          verificationDoc: idDocuments.verificationDoc.includes('http') 
            ? idDocuments.verificationDoc.split('/').pop() 
            : idDocuments.verificationDoc 
        }),
        // Include additional info for different user types (for other fields)
        ...(vendorAdditionalInfo && { vendorAdditionalInfo }),
        ...(contractorAdditionalInfo && { contractorAdditionalInfo }),
        ...(specialistAdditionalInfo && { specialistAdditionalInfo }),
      },
    };
    const success = await updateProfile(
      profilePayload,
      t("profile.profile_updated")
    );
    if (success) {
      setTempAvatar(null);
      setProfileKey(undefined);
      // Trigger completion recalculation in parent component
      if (onProfileUpdateComplete) {
        onProfileUpdateComplete();
      }
    }
    return success;
  };

  const handleSaveClick = async () => {
    await onSaveProfile();
  };

  const handleCancel = () => {
    // Reset initialization state to allow form reset
    setIsInitialized(false);
    setProfileFields(cloneDeep(mappedFields));
    setTempAvatar(null);
  };

  const renderTabPanel = (index) => {
    switch (index) {
      case 0:
        return (
          <PersonalInformation
            loading={loading}
            tempAvatar={tempAvatar}
            onPicChange={handlePicChange}
            fields={profileFields}
            onSaveProfile={onSaveProfile}
            onFieldChange={handleFieldChange}
            setSaveProfile={() => {}}
            handleSaveClick={handleSaveClick}
            handleCancel={handleCancel}
            onIdDocumentsChange={handleIdDocumentsChange}
          />
        );
      case 1:
        return <ReviewsTab reviews={reviews} loading={loading} />;
      case 2:
        if (profileData?.userType === USER_TYPES.client) {
          return <PastClients />;
        }
        if (
          profileData?.userType === USER_TYPES.vendor ||
          profileData?.userType === USER_TYPES.contractor ||
          profileData?.userType === USER_TYPES.specialist
        ) {
          return (
            <DesignTab
              onSave={(designData, successMsg, callAction) => {
                // Wrap the original updateDesignFields to include our callback
                const wrappedCallAction = () => {
                  if (callAction) callAction();
                  if (onProfileUpdateComplete) onProfileUpdateComplete();
                };
                return updateDesignFields(designData, successMsg, wrappedCallAction);
              }}
              onCancel={handleCancel}
              onPreview={onPreview}
              loading={loadingDesign}
            />
          );
        }
        return null;
      case 3:
        if (
          profileData?.userType === USER_TYPES.vendor ||
          profileData?.userType === USER_TYPES.contractor ||
          profileData?.userType === USER_TYPES.specialist
        ) {
          return (
            <PortfolioTab 
              onPreview={onPreview} 
              onAddProject={onAddProject}
              onEditProject={onEditProject}
              onProfileUpdateComplete={onDataSpecificUpdateComplete || onProfileUpdateComplete}
              portfolioData={portfolioData}
              onPortfolioDataUpdate={onPortfolioDataUpdate}
            />
          );
        }
        return null;
      case 4:
        if (
          profileData?.userType === USER_TYPES.contractor ||
          profileData?.userType === USER_TYPES.specialist
        ) {
          return <PastClients onProfileUpdateComplete={onDataSpecificUpdateComplete || onProfileUpdateComplete} />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <ProfileTabs
        value={value}
        onChange={handleChange}
        profileData={profileData}
      />
      <Box sx={{ mt: 2 }}>{renderTabPanel(value)}</Box>
    </Box>
  );
}

export default UpdateData;
