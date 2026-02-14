import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useCountry from "../../../hooks/useCountry";
import useCity from "../../../hooks/useCity";
import useReviews from "../../../hooks/useReviews";
import { useSelector } from "react-redux";
import { useState } from "react";
import { cloneDeep } from "lodash";
import {
  getProductCategoriesUrl,
  getProfileUrl,
  getUserCategoriesByTypeUrl,
} from "../../../apis/apiEndPoints";
import { setProfileData } from "../../../redux/profileSlice";
import { setLocalStorage } from "../../../utils/localStorageUtils";
import { PROFILE_DATA } from "../../../utils/constants/profile";
import { useEffect } from "react";
import { ROUTES } from "../../../utils/constants/route";
import { Box } from "@mui/material";
import MuiTypography from "../../../components/common/MuiTypography";
import ActionButton from "../../../components/common/ActionButton";
import { PreviewPage } from "../../../components/preview";
import AddPortfolio from "../../../components/portfolio/AddPortfolio";
import UpdateData from "../../../components/profile/UpdateProfileData";
import { FIELD_TYPES, USER_TYPES } from "../../../utils/constants/login";
import { IS_ADMIN } from "../../../utils/constants/auth";

function Profile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { getCountries } = useCountry();
  const { getCities } = useCity();
  const { fetchReviews } = useReviews();

  const { profileData } = useSelector((state) => state.profile);

  const [profileFields, setProfileFields] = useState(
    PROFILE_DATA[profileData?.userType] || []
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPortfolioMode, setIsPortfolioMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  const handlePreview = (data) => {
    // Format the data for preview
    const formattedData = {
      user: {
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        avatar: data.avatar,
        description: data.description,
        category: data.category,
        location: data.location,
        website: data.website,
        email: data.email,
        phone: data.phone,
        availability: data.availability,
        delivery: data.delivery,
      },
      profileDesign: {
        layout: {
          banner: data.layout?.banner,
          theme: data.layout?.theme,
          font: data.layout?.font,
        },
        content: {
          slogan: data.layout?.content?.slogan,
          description: data.layout?.content?.description,
          skills: data.layout?.content?.skills,
          certifications: data.layout?.content?.certifications,
          awards: data.layout?.content?.awards,
        },
        engagement: {
          highlightReview: data.layout?.engagement?.highlightReview,
          callToAction: data.layout?.engagement?.callToAction,
        },
        interactive: {
          faq: data.layout?.interactive?.faq,
          approach: data.layout?.interactive?.approach,
        },
        workflow: {
          steps: data.workflowSteps || [],
          additionalInfo: data.workflowAdditionalInfo,
        },
      },
    };

    setPreviewData(formattedData);
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    const currentBanner = previewData?.layout?.banner || bannerImage;
    setBannerImage(currentBanner);
    setIsPreviewMode(false);
    setPreviewData(null);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsPortfolioMode(true);
  };

  const handleSaveProject = (projectData) => {
    setIsPortfolioMode(false);
    setEditingProject(null);
  };

  const handleCancelProject = () => {
    setIsPortfolioMode(false);
    setEditingProject(null);
    navigate(`/admin/profile`); // go one step back in browser history
  };

  const handleBannerUpdate = (newBanner) => {
    setBannerImage(newBanner);
    if (isPreviewMode && previewData) {
      setPreviewData({
        ...previewData,
        layout: {
          ...previewData.layout,
          banner: newBanner,
        },
      });
    }
  };

  const handleFieldChange = async (id, value, error) => {
    const newProfileFields = cloneDeep(profileFields);
    const fieldIndex = newProfileFields.findIndex((el) => el.id === id);
    if (fieldIndex !== -1) {
      if (id === "email") {
        newProfileFields[fieldIndex].value = value?.trim() ?? "";
        newProfileFields[fieldIndex].validation.error = error || "";
        newProfileFields[fieldIndex].validation.valid = !error;
      } else {
        newProfileFields[fieldIndex].value = value;
        newProfileFields[fieldIndex].validation.error = error || "";
        newProfileFields[fieldIndex].validation.valid = !error;
      }
    }
    setProfileFields(newProfileFields);
  };

  useEffect(() => {
    if (profileData?.id) {
      fetchReviews(profileData.id);
    }
  }, [profileData?.id]);

  async function fetchProfileData() {
    try {
      let response;
      const userId = profileData?.id;
      if (!userId) throw new Error("User ID not found");

      // Fetch all data in parallel
      const [
        profileResponse,
        countries,
        fetchedCategories,
        fetchedProductCategories,
        reviewsResponse,
      ] = await Promise.all([
        getProfileUrl(userId),
        getCountries(),
        getUserCategoriesByTypeUrl(profileData.userType),
        getProductCategoriesUrl(),
        fetchReviews(userId),
      ]);

      response = profileResponse;

      // Validate required data
      if (!response?.data?.data) {
        throw new Error("Invalid profile data received");
      }

      setCategories(fetchedCategories.data.data || []);
      setProductCategories(fetchedProductCategories.data.data || []);

      // Handle country and city data
      const countryIsoCode = response.data.data.country?.isoCode;
      let cities = [];
      if (countryIsoCode) {
        try {
          cities = await getCities(countryIsoCode);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      }

      // Map reviews to expected format with error handling
      const mappedReviews = (reviewsResponse || [])
        .map((r) => {
          try {
            return {
              rating: r.ratings?.overallExperience || r.rating || 0,
              date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString()
                : r.startDate || "",
              dateRaw: r.createdAt || r.startDate || "",
              like: r.likes || r.like || "",
              dislike: r.dislikes || r.dislike || "",
              author: r.contractor?.attributes
                ? `${r.contractor.attributes.firstName || ""} ${
                    r.contractor.attributes.lastName || ""
                  }`.trim()
                : r.author || r.name || "",
              highlight: r.highlight || false,
            };
          } catch (error) {
            console.error("Error mapping review:", error);
            return null;
          }
        })
        .filter(Boolean); // Remove any null entries from failed mappings

      // Sort reviews: highlight first, then by date
      const sortedReviews = mappedReviews
        .sort((a, b) => {
          if (a.highlight && !b.highlight) return -1;
          if (!a.highlight && b.highlight) return 1;
          return new Date(b.dateRaw) - new Date(a.dateRaw);
        })
        .slice(0, 10);

      // Update profile data with reviews
      const enrichedProfileData = {
        ...response.data.data,
        reviews: sortedReviews,
      };

      dispatch(setProfileData(enrichedProfileData));
      setLocalStorage(USER_DATA, { user: enrichedProfileData }, true);

      // Always use a fresh clone of PROFILE_DATA for field structure
      const newProfileFields = cloneDeep(
        PROFILE_DATA[profileData?.userType] || []
      );

      // Update field options and values
      try {
        // Update category field
        const findIndexCategory = newProfileFields.findIndex(
          (item) => item.id === "category"
        );
        if (findIndexCategory !== -1) {
          newProfileFields[findIndexCategory].options = categories.map(
            (item) => ({ id: item.id, label: item.label })
          );
        }

        // Update sellingProductType field
        const findIndexProduct = newProfileFields.findIndex(
          (item) => item.id === "sellingProductType"
        );
        if (findIndexProduct !== -1) {
          newProfileFields[findIndexProduct].options = productCategories.map(
            (item) => ({ id: item.id, label: item.label })
          );
        }

        // Update country and city options
        const countryIndex = newProfileFields.findIndex(
          (item) => item.id === "country"
        );
        const cityIndex = newProfileFields.findIndex(
          (item) => item.id === "city"
        );

        if (countryIndex !== -1) {
          newProfileFields[countryIndex].options = countries;
        }

        if (cityIndex !== -1) {
          newProfileFields[cityIndex].options = cities;
        }

        // Update field values from the API response
        newProfileFields.forEach((item) => {
          let additionalInfo = {};
          if (profileData.userType === USER_TYPES.vendor) {
            additionalInfo = response.data.data.vendorAdditionalInfo || {};
          } else if (profileData.userType === USER_TYPES.specialist) {
            additionalInfo = response.data.data.specialistAdditionalInfo || {};
          } else if (profileData.userType === USER_TYPES.contractor) {
            additionalInfo = response.data.data.contractorAdditionalInfo || {};
          } else if (profileData.userType === USER_TYPES.admin) {
            additionalInfo = response.data.data.contractorAdditionalInfo || {};
          }

          try {
            if (item.id === "name") {
              item.value = {
                first: response.data.data.firstName || "",
                second: response.data.data.lastName || "",
              };
            } else if (item.id === "email") {
              const email = response.data.data.email?.trim() || "";
              item.value = email;
              if (item.validation) {
                item.validation.valid = !!email;
                item.validation.error = email ? "" : "Email is required";
              }
            } else if (item.id === "country") {
              item.value = response.data.data.country || {};
            } else if (item.id === "city") {
              item.value = response.data.data.city || {};
            } else if (item.id === "category") {
              item.value =
                additionalInfo.category || response.data.data.category || "";
            } else if (item.id === "experienceLevel") {
              item.value = additionalInfo.experienceLevel || "";
            } else if (item.id === "verificationType") {
              item.value = additionalInfo.verificationType || "";
            } else if (item.id === "verificationDoc") {
              item.value = additionalInfo.verificationDoc || "";
            } else if (
              item.id === "contactType" ||
              item.id === "preferContactedTime"
            ) {
              // Always set as array of IDs for SelectBox
              const arr = Array.isArray(additionalInfo[item.id])
                ? additionalInfo[item.id]
                : additionalInfo[item.id]
                ? [additionalInfo[item.id]]
                : [];
              item.value = arr;
            } else if (item.id === "currency") {
              // Always set as array of IDs for SelectBox
              item.value = Array.isArray(additionalInfo.currency)
                ? additionalInfo.currency
                : additionalInfo.currency
                ? [additionalInfo.currency]
                : [];
            } else if (item.id === "professionalAffiliations") {
              item.value = Array.isArray(
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
                : [];
            } else if (item.id === "companyDetails") {
              const companyDetails = additionalInfo.companyDetails || {};
              item.value = {
                website: companyDetails.website || "",
                address: companyDetails.address || "",
                email: companyDetails.email || "",
              };
            } else if (item.id === "sellingProductType") {
              const sellingProductType = additionalInfo.sellingProductType;
              item.value = Array.isArray(sellingProductType)
                ? sellingProductType
                : sellingProductType
                ? [sellingProductType]
                : [];
            } else if (item.id === "isDeliver") {
              item.value = additionalInfo.isDeliver || "";
            } else if (item.type === FIELD_TYPES.multipleSelect) {
              const apiValue = response.data.data[item.id];
              item.value = Array.isArray(apiValue)
                ? apiValue
                : apiValue
                ? [apiValue]
                : [];
            } else if (item.id === "jobTypePreference") {
              item.value = response.data.data[item.id] || "";
            } else {
              item.value = response.data.data[item.id] || "";
            }
          } catch (error) {
            console.error(`Error updating field ${item.id}:`, error);
            item.value = "";
          }
        });

        setProfileFields(newProfileFields);
      } catch (error) {
        console.error("Error updating profile fields:", error);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      if (
        error.message &&
        error.message.startsWith("No reviews found for user ID")
      ) {
        // Suppress this specific warning from being shown to the user
        return;
      }
    }
  }

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profileData) {
      const newProfileFields = cloneDeep(
        PROFILE_DATA[profileData?.userType] || []
      );

      // Update field values from the latest profileData
      newProfileFields.forEach((item) => {
        let additionalInfo = {};
        if (profileData.userType === USER_TYPES.vendor) {
          additionalInfo = profileData.vendorAdditionalInfo || {};
        } else if (profileData.userType === USER_TYPES.specialist) {
          additionalInfo = profileData.specialistAdditionalInfo || {};
        } else if (profileData.userType === USER_TYPES.contractor) {
          additionalInfo = profileData.contractorAdditionalInfo || {};
        } else if (profileData.userType === USER_TYPES.admin) {
          additionalInfo = profileData.AdditionalInfo || {};
        }

        if (item.id === "name") {
          item.value = {
            first: profileData.firstName || "",
            second: profileData.lastName || "",
          };
        } else if (item.id === "email") {
          const email = profileData.email?.trim() || "";
          item.value = email;
          if (item.validation) {
            item.validation.valid = !!email;
            item.validation.error = email ? "" : "Email is required";
          }
        } else if (item.id === "country") {
          item.value = profileData.country || {};
        } else if (item.id === "city") {
          item.value = profileData.city || {};
        } else if (item.id === "category") {
          item.value = additionalInfo.category || profileData.category || "";
        } else if (item.id === "experienceLevel") {
          item.value = additionalInfo.experienceLevel || "";
        } else if (item.id === "verificationType") {
          item.value = additionalInfo.verificationType || "";
        } else if (item.id === "verificationDoc") {
          item.value = additionalInfo.verificationDoc || "";
        } else if (
          item.id === "contactType" ||
          item.id === "preferContactedTime"
        ) {
          // Always set as array of IDs for SelectBox
          const arr = Array.isArray(additionalInfo[item.id])
            ? additionalInfo[item.id]
            : additionalInfo[item.id]
            ? [additionalInfo[item.id]]
            : [];
          item.value = arr;
        } else if (item.id === "currency") {
          // Always set as array of IDs for SelectBox
          item.value = Array.isArray(additionalInfo.currency)
            ? additionalInfo.currency
            : additionalInfo.currency
            ? [additionalInfo.currency]
            : [];
        } else if (item.id === "professionalAffiliations") {
          item.value = Array.isArray(additionalInfo.professionalAffiliations)
            ? additionalInfo.professionalAffiliations.map((affiliation) => ({
                title: affiliation.title || "",
                memberSince: affiliation.memberSince || "",
                licenceNumber: affiliation.licenceNumber || "",
                description: affiliation.description || "",
                validation: {},
              }))
            : [];
        } else if (item.id === "companyDetails") {
          const companyDetails = additionalInfo.companyDetails || {};
          item.value = {
            website: companyDetails.website || "",
            address: companyDetails.address || "",
            email: companyDetails.email || "",
          };
        } else if (item.id === "sellingProductType") {
          const sellingProductType = additionalInfo.sellingProductType;
          item.value = Array.isArray(sellingProductType)
            ? sellingProductType
            : sellingProductType
            ? [sellingProductType]
            : [];
        } else if (item.id === "isDeliver") {
          item.value = additionalInfo.isDeliver || "";
        } else if (item.type === FIELD_TYPES.multipleSelect) {
          const apiValue = profileData[item.id];
          item.value = Array.isArray(apiValue)
            ? apiValue
            : apiValue
            ? [apiValue]
            : [];
        } else if (item.id === "jobTypePreference") {
          item.value = profileData[item.id] || "";
        } else {
          item.value = profileData[item.id] || "";
        }
      });

      // Update category field options
      const findIndexCategory = newProfileFields.findIndex(
        (item) => item.id === "category"
      );
      if (findIndexCategory !== -1) {
        newProfileFields[findIndexCategory].options = categories.map(
          (item) => ({ id: item.id, label: item.label })
        );
      }

      // Update sellingProductType field options
      const findIndexProduct = newProfileFields.findIndex(
        (item) => item.id === "sellingProductType"
      );
      if (findIndexProduct !== -1) {
        newProfileFields[findIndexProduct].options = productCategories.map(
          (item) => ({ id: item.id, label: item.label })
        );
      }

      setProfileFields(newProfileFields);
    }
  }, [profileData, categories, productCategories]);

  const navigateToVerification = () => {
    navigate("/" + ROUTES.adminVerification);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "70%" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <MuiTypography variant="h2">{t("profile.title")}</MuiTypography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {!isPreviewMode && !isPortfolioMode && (
              <ActionButton onClick={navigateToVerification} variant="outlined">
                {t("profile.verification")}
              </ActionButton>
            )}
          </Box>
        </Box>

        {IS_ADMIN && (
          <UpdateData
            fields={profileFields}
            onPreview={handlePreview}
            bannerImage={bannerImage}
            onBannerUpdate={handleBannerUpdate}
            onValueChange={handleFieldChange}
            onAddProject={handleAddProject}
          />
        )}
      </Box>
    </Box>
  );
}

export default Profile;
