import { useMemo } from "react";
import { cloneDeep } from "lodash";
import { FIELD_TYPES, USER_TYPES } from "../utils/constants/login";

/**
 * Maps profileData from the API to the localFields structure for the profile form.
 * @param {Array} fields - The fields array (from PROFILE_DATA) to populate.
 * @param {Object} profileData - The user profile data from the API.
 * @param {Array} countryOptions - The list of all country objects for the dropdown.
 * @param {Array} cityOptions - The list of all city objects for the dropdown.
 * @returns {Array} - The new fields array with values populated from profileData.
 */
export default function useMapProfileFields(
  fields,
  profileData,
  countryOptions = [],
  cityOptions = []
) {
  return useMemo(() => {
    console.log('=== useMapProfileFields Debug ===');
    console.log('fields length:', fields?.length);
    console.log('profileData exists:', !!profileData);
    console.log('profileData.id:', profileData?.id);
    
    if (!profileData || !fields) {
      console.log('Early return: missing profileData or fields');
      return fields;
    }
    const newFields = cloneDeep(fields);
    console.log('Processing', newFields.length, 'fields');

    newFields.forEach((item) => {
      let additionalInfo = {};
      if (profileData.userType === USER_TYPES.vendor) {
        additionalInfo = profileData?.vendorAdditionalInfo || {};
      } else if (profileData.userType === USER_TYPES.specialist) {
        additionalInfo = profileData?.specialistAdditionalInfo || {};
      } else if (profileData.userType === USER_TYPES.contractor) {
        additionalInfo = profileData?.contractorAdditionalInfo || {};
      }
      if (item.id === "country") {
        // Find the country object in options that matches the isoCode
        const countryObj = countryOptions.find(
          (c) => c.isoCode === profileData.country?.isoCode
        );
        item.value = countryObj || profileData.country || "";
        item.options = countryOptions;
      } else if (item.id === "city") {
        // Find the city object in options that matches the name
        const cityObj = cityOptions.find(
          (c) => c.name === profileData.city?.name
        );
        item.value = cityObj || profileData.city || "";
        item.options = cityOptions;
      } else if (item.id === "name") {
        item.value = {
          first: profileData.firstName || "",
          second: profileData.lastName || "",
        };
      } else if (item.id === "avatar") {
        item.value = profileData.avatar || "";
      } else if (item.id === "email") {
        item.value = profileData.email || "";
      } else if (item.id === "phoneNumber") {
        item.value = profileData.phoneNumber || "";
      } else if (item.id === "description") {
        item.value = profileData.description || "";
      } else if (item.id === "category") {
        item.value =
          profileData.category ||
          profileData.specialistAdditionalInfo?.category ||
          "";
      } else if (
        item.id === "contactType" ||
        item.id === "preferContactedTime"
      ) {
        // Always set as array of IDs for SelectBox
        let arr = [];
        if (profileData?.contactType && item.id === "contactType") {
          arr = profileData?.contactType;
        } else if (profileData?.preferContactedTime && item.id === "preferContactedTime") {
          arr = profileData?.preferContactedTime;
        } else {
          arr = Array.isArray(additionalInfo[item.id])
            ? additionalInfo[item.id]
            : additionalInfo[item.id]
              ? [additionalInfo[item.id]]
              : [];
        }
        item.value = arr;
      } else if (item.id === "currency") {
        // Always set as array of IDs for SelectBox
        let currencyArr = [];
        if (profileData?.currency) {
          currencyArr = profileData?.currency;
        } else {
          currencyArr = Array.isArray(additionalInfo.currency)
          ? additionalInfo.currency
          : additionalInfo.currency
            ? [additionalInfo.currency]
            : [];
        }
        item.value = currencyArr;
      } else if (item.id === "professionalAffiliations") {

        let professionalAffiliations = profileData?.professionalAffiliations || [];
        if (profileData?.professionalAffiliations) {
          professionalAffiliations = profileData?.professionalAffiliations;
        } else {
          professionalAffiliations = Array.isArray(
            additionalInfo.professionalAffiliations
          )
          ? additionalInfo.professionalAffiliations.map(
              (affiliation) => ({
                title: affiliation.title || "",
                memberSince: affiliation.memberSince || "",
                licenceNumber: affiliation.licenceNumber || "",
                description: affiliation.description || "",
                validation: {},
              })
            )
          : []
        }
        item.value = professionalAffiliations;
      } else if (item.id === "companyDetails") {
        let companyDetails = [];
        if (profileData?.companyDetails) {
          companyDetails = profileData?.companyDetails;
        } else {
          companyDetails = additionalInfo.companyDetails;
        }
        item.value = companyDetails;
      } else if (item.id === "openingHours") {
        // Opening hours handling varies by user type
        let openingHours = [];
        console.log('useMapProfileFields - profileData.userType:', profileData.userType);
        console.log('useMapProfileFields - profileData.openingHours:', profileData.openingHours);
        console.log('useMapProfileFields - profileData.vendorAdditionalInfo?.openingHours:', profileData.vendorAdditionalInfo?.openingHours);
        console.log('useMapProfileFields - additionalInfo.openingHours:', additionalInfo.openingHours);
        
        if (profileData.userType === USER_TYPES.vendor) {
          // For vendors, check top level first, then vendorAdditionalInfo
          openingHours = profileData.openingHours || profileData.vendorAdditionalInfo?.openingHours || [];
        } else {
          // For contractors/specialists, check additionalInfo
          if (profileData?.openingHours) {
            openingHours = profileData.openingHours;
          } else {
            openingHours = additionalInfo.openingHours || [];
          }
        }
        console.log('useMapProfileFields - final openingHours:', openingHours);
        item.value = openingHours;
      } else if (item.id === "isDeliver") {
        // Handle isDeliver field - for vendors check vendorAdditionalInfo
        if (profileData.userType === USER_TYPES.vendor) {
          item.value = profileData.vendorAdditionalInfo?.isDeliver || "";
        } else {
          item.value = profileData.companyDetails?.isDeliver || profileData[item.id] || "";
        }
      } else if (item.type === FIELD_TYPES.multipleSelect) {
        const apiValue = profileData[item.id];
        item.value = Array.isArray(apiValue)
          ? apiValue
          : apiValue
            ? [apiValue]
            : [];
      } else {
        // Default mapping for other fields
        item.value = profileData[item.id] || "";
      }
    });

    return newFields;
  }, [fields, profileData, countryOptions, cityOptions]);
}
