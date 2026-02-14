import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";
import { useNavigate } from "react-router-dom";
import { Share as ShareIcon } from "@mui/icons-material";

import MuiTypography from "../../components/common/MuiTypography";
import {
  getProductCategoriesUrl,
  getProfileUrl,
  getPortfolioUrl,
  getUserCategoriesByTypeUrl,
  getProfileCompletionUrl,
} from "../../apis/apiEndPoints";
import { USER_TYPES, FIELD_TYPES } from "../../utils/constants/login";
import { setLocalStorage } from "../../utils/localStorageUtils";
import { USER_DATA } from "../../utils/constants/auth";
import { PROFILE_DATA } from "../../utils/constants/profile";
import { setProfileData } from "../../redux/profileSlice";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
// Removed useCountry import - not needed for profile load
import useCity from "../../hooks/useCity";
import ActionButton from "../../components/common/ActionButton";
import UpdateData from "../../components/profile/UpdateProfileData/index.jsx";
import { PreviewPage } from "../../components/preview";
import AddPortfolio from "../../components/portfolio/AddPortfolio";
import useReviews from "../../hooks/useReviews";
import useVeriffVerification from "../../hooks/useVeriffVerification.jsx";
import ProfileCompletionProgress from "../../components/profile/ProfileCompletionProgress";
import ShareProfile from "../../components/profile/ShareProfile";
import { calculateProfileCompletion } from "../../utils/profileCompletion";

function Profile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Removed getCountries - only needed when editing location
  // Removed getCities - only needed when editing location
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
  const [portfolioData, setPortfolioData] = useState([]);
  const [designData, setDesignData] = useState({});
  const [pastClientsData, setPastClientsData] = useState([]);
  // Removed lastFetchedCountry - no longer needed since cities load lazily
  const hasFetchedInitialData = useRef(false);
  const isCurrentlyFetching = useRef(false);
  const [isCompletionDataLoaded, setIsCompletionDataLoaded] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const [quickCompletionPercentage, setQuickCompletionPercentage] = useState(0);
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);

  const { handleVeriffVerification } = useVeriffVerification();

  // Function to refresh specific data needed for completion calculation
  const refreshCompletionData = async () => {
    try {
      const userId = profileData?.id;
      if (!userId) return false;

      // Fetch the latest data in parallel
      const [
        profileResponse,
        portfolioResponse,
      ] = await Promise.all([
        getProfileUrl(userId),
        getPortfolioUrl(userId).catch(() => ({ data: { data: [] } })),
      ]);

      // Update the data states
      if (profileResponse?.data?.data) {
        setDesignData(profileResponse.data.data.profileDesign || {});
        setPastClientsData(profileResponse.data.data.pastClients || []);
      }
      
      if (portfolioResponse?.data?.data) {
        setPortfolioData(portfolioResponse.data.data);
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing completion data:', error);
      return false;
    }
  };

  // Function to recalculate completion percentage locally for immediate feedback
  const recalculateCompletionLocal = () => {
    if (!profileData || !isCompletionDataLoaded) return;
    
    console.log('Recalculating completion locally for immediate UI feedback...');
    const completion = calculateProfileCompletion(
      profileFields,
      designData,
      portfolioData,
      pastClientsData,
      profileData
    );
    
    const newPercentage = completion.percentage;
    console.log('Local completion percentage:', newPercentage, 'Previous:', profileCompletionPercentage);
    
    setProfileCompletionPercentage(newPercentage);
    
    // Record when profile first reaches 100% completion for reminder system
    if (newPercentage >= 100 && !localStorage.getItem('profileCompletionTime')) {
      localStorage.setItem('profileCompletionTime', new Date().getTime().toString());
    }
  };

  // Function for portfolio/past client updates that need data refresh first
  const handleDataSpecificUpdateComplete = async () => {
    console.log('Data-specific update completed, refreshing specific data first...');
    setProfileUpdateTrigger(prev => prev + 1);
    
    // Step 1: Refresh specific data (portfolio, past clients, design)
    const dataRefreshed = await refreshCompletionData();
    
    // Step 2: Immediate local calculation with refreshed data
    if (dataRefreshed) {
      setTimeout(() => {
        recalculateCompletionLocal();
      }, 200);
    }
    
    // Step 3: Full backend sync for consistency (longer delay)
    setTimeout(async () => {
      await fetchQuickCompletion(); // Quick completion update
      fetchProfileData();
    }, 1500);
  };

  // Function to refetch completion percentage after profile updates  
  const refreshCompletion = async () => {
    await fetchQuickCompletion();
  };

  // Function to trigger completion recalculation after profile updates
  // Hybrid approach: immediate local calculation + backend sync
  const handleProfileUpdateComplete = () => {
    console.log('Profile update completed, using hybrid completion update approach...');
    setProfileUpdateTrigger(prev => prev + 1);
    
    // Step 1: Immediate local calculation for fast UI feedback
    setTimeout(() => {
      recalculateCompletionLocal();
    }, 100);
    
    // Step 2: Refresh from backend to ensure data consistency (slower but accurate)
    setTimeout(async () => {
      await fetchQuickCompletion(); // Quick completion update
      fetchProfileData();
    }, 1000); // Longer delay to allow backend processing
  };


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

  const handleEditProject = (projectId) => {
    // Find the project in portfolioData
    const project = portfolioData.find(p => p.projectId === projectId);
    if (project) {
      setEditingProject(project);
      setIsPortfolioMode(true);
    }
  };

  const handlePortfolioDataUpdate = (newPortfolioData) => {
    setPortfolioData(newPortfolioData);
  };

  const handleSaveProject = () => {
    setIsPortfolioMode(false);
    setEditingProject(null);
    
    // Show success message
    dispatch(
      setAlert({
        show: true,
        type: ALERT_TYPE.success,
        message: editingProject 
          ? "Portfolio project updated successfully!" 
          : "Portfolio project added successfully!",
      })
    );
    
    // Trigger completion recalculation after saving portfolio project
    handleDataSpecificUpdateComplete();
  };

  const handleCancelProject = () => {
    setIsPortfolioMode(false);
    setEditingProject(null);
    navigate(`/profile`); // go one step back in browser history
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

  // Auto-open ShareProfile modal after any profile update that results in 100% completion
  useEffect(() => {
    if (isCompletionDataLoaded && profileCompletionPercentage >= 100 && profileUpdateTrigger > 0) {
      console.log('Profile update resulted in 100% completion, showing share modal');
      
      // Check if user hasn't shared recently (using sharing attempt tracking)
      const lastShareAttempt = localStorage.getItem('profileShareAttempt');
      const currentTime = new Date().getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      // Auto-open after profile update if user hasn't attempted to share recently
      if (!lastShareAttempt || (currentTime - parseInt(lastShareAttempt)) > oneDayInMs) {
        setShowShareDialog(true);
      }
    }
  }, [profileUpdateTrigger, profileCompletionPercentage, isCompletionDataLoaded]);

  // Note: Removed automatic recalculation on profileData changes since we now get 
  // completion percentage from backend. Only recalculate after profile updates.

  // Share reminder system for users with 100% completion
  useEffect(() => {
    if (!isCompletionDataLoaded || profileCompletionPercentage < 100) return;

    const checkShareReminder = () => {
      const lastShareAttempt = localStorage.getItem('profileShareAttempt');
      const lastShareReminder = localStorage.getItem('lastShareReminder');
      const currentTime = new Date().getTime();
      
      // Reminder intervals (configurable)
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      // If user has never attempted to share, remind after 3 days of having 100% completion
      if (!lastShareAttempt) {
        const profileCompletionTime = localStorage.getItem('profileCompletionTime');
        if (!profileCompletionTime) {
          // Set completion time if not already set
          localStorage.setItem('profileCompletionTime', currentTime.toString());
          return;
        }
        
        const timeSinceCompletion = currentTime - parseInt(profileCompletionTime);
        const timeSinceLastReminder = lastShareReminder ? currentTime - parseInt(lastShareReminder) : threeDaysInMs + 1;
        
        // Show reminder if 3+ days since completion and no reminder in last day
        if (timeSinceCompletion >= threeDaysInMs && timeSinceLastReminder >= (24 * 60 * 60 * 1000)) {
          setShowShareDialog(true);
          localStorage.setItem('lastShareReminder', currentTime.toString());
        }
        return;
      }
      
      // If user attempted to share but it was more than 7 days ago, remind again
      const timeSinceLastShare = currentTime - parseInt(lastShareAttempt);
      const timeSinceLastReminder = lastShareReminder ? currentTime - parseInt(lastShareReminder) : sevenDaysInMs + 1;
      
      // Show reminder if 7+ days since last share attempt and no reminder in last 2 days
      if (timeSinceLastShare >= sevenDaysInMs && timeSinceLastReminder >= (2 * 24 * 60 * 60 * 1000)) {
        setShowShareDialog(true);
        localStorage.setItem('lastShareReminder', currentTime.toString());
      }
    };

    // Check for reminder on component mount and profile visits
    const timeoutId = setTimeout(checkShareReminder, 2000); // Small delay to avoid overwhelming user
    
    return () => clearTimeout(timeoutId);
  }, [isCompletionDataLoaded, profileCompletionPercentage]);

  // Fetch lightweight profile completion percentage
  const fetchQuickCompletion = async () => {
    try {
      const response = await getProfileCompletionUrl();
      const percentage = response?.data?.data?.profileCompletionPercentage || 0;
      setQuickCompletionPercentage(percentage);
      setProfileCompletionPercentage(percentage); // Set as initial value
      return percentage;
    } catch (error) {
      console.error('Error fetching quick completion:', error);
      return 0;
    }
  };

  async function fetchProfileData() {
    console.log('fetchProfileData called');
    
    // Prevent concurrent API calls
    if (isCurrentlyFetching.current) {
      console.log('fetchProfileData already in progress, skipping duplicate call');
      return;
    }
    
    try {
      isCurrentlyFetching.current = true;
      
      // Reset completion data loaded state
      setIsCompletionDataLoaded(false);
      
      let response;
      const userId = profileData?.id;
      if (!userId) throw new Error("User ID not found");

      // Fetch all data in parallel
      const [
        profileResponse,
        fetchedCategories,
        fetchedProductCategories,
        reviewsResponse,
        portfolioResponse,
      ] = await Promise.all([
        getProfileUrl(userId),
        getUserCategoriesByTypeUrl(profileData.userType),
        getProductCategoriesUrl(),
        fetchReviews(userId),
        getPortfolioUrl(userId).catch(() => ({ data: { data: [] } })), // Catch portfolio errors
      ]);

      response = profileResponse;

      // Validate required data
      if (!response?.data?.data) {
        throw new Error("Invalid profile data received");
      }

      setCategories(fetchedCategories.data.data || []);
      setProductCategories(fetchedProductCategories.data.data || []);
      
      // Set additional data for comprehensive profile completion
      setPortfolioData(portfolioResponse?.data?.data || []);
      setDesignData(response.data.data.profileDesign || {});
      setPastClientsData(response.data.data.pastClients || []);

      // Removed city fetching - only needed when editing location
      // Cities will be loaded lazily in CountryCityBox component when needed

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
        
        // Use completion percentage from backend if available, otherwise calculate
        const backendCompletionPercentage = response.data.data.profileCompletionPercentage;
        let completionPercentage;
        
        if (backendCompletionPercentage !== null && backendCompletionPercentage !== undefined) {
          // Use backend value - this is much faster!
          completionPercentage = backendCompletionPercentage;
          console.log('Using backend completion percentage:', completionPercentage);
        } else {
          // Only calculate if not available from backend (for existing users)
          console.log('Backend completion percentage not available, calculating...');
          const completion = calculateProfileCompletion(
            newProfileFields, 
            designData, 
            portfolioData, 
            pastClientsData,
            response.data.data
          );
          completionPercentage = completion.percentage;
        }
        
        setProfileCompletionPercentage(completionPercentage);
        
        // Record when profile first reaches 100% completion for reminder system
        if (completionPercentage >= 100 && !localStorage.getItem('profileCompletionTime')) {
          localStorage.setItem('profileCompletionTime', new Date().getTime().toString());
        }
        
        // Mark completion data as loaded after all data is set
        setIsCompletionDataLoaded(true);
      } catch (error) {
        console.error("Error updating profile fields:", error);
        // Even on error, mark as loaded to avoid infinite loading
        setIsCompletionDataLoaded(true);
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
      // Even on error, mark as loaded to avoid infinite loading
      setIsCompletionDataLoaded(true);
    } finally {
      // Reset fetching state
      isCurrentlyFetching.current = false;
    }
  }

  useEffect(() => {
    // Prevent duplicate calls on initial mount (React StrictMode or double mounting)
    if (!hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      
      // First: Fetch lightweight completion percentage (fast)
      fetchQuickCompletion();
      
      // Then: Fetch full profile data (slower)
      fetchProfileData();
    }
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
              <>
                <ActionButton
                  onClick={handleVeriffVerification}
                  variant="outlined"
                  disabled={profileData.isVerified}
                >
                  {t("profile.verification")}
                </ActionButton>
                
                {/* Share Profile Button - Show when completion is 100% */}
                {profileCompletionPercentage >= 100 && (
                  <ActionButton
                    onClick={() => setShowShareDialog(true)}
                    variant="contained"
                    startIcon={<ShareIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      }
                    }}
                  >
                    Share Profile
                  </ActionButton>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Profile Completion Progress */}
        {!isPreviewMode && !isPortfolioMode && (
          isCompletionDataLoaded ? (
            <ProfileCompletionProgress
              profileFields={profileFields}
              designData={designData}
              portfolioData={portfolioData}
              pastClientsData={pastClientsData}
              profileData={profileData}
              compact={true}
              onFieldClick={(fieldId) => {
                // Handle different field categories
                if (fieldId === 'banner' || fieldId === 'skills' || fieldId === 'certifications' || fieldId === 'introVideo') {
                  // Navigate to Design tab (index 2)
                  setCurrentTabIndex(2);
                } else if (fieldId === 'portfolio') {
                  // Navigate to Portfolio tab (index 3)  
                  setCurrentTabIndex(3);
                } else if (fieldId === 'pastClients') {
                  // Navigate to Past Clients tab (index 4 for contractors/specialists)
                  setCurrentTabIndex(4);
                } else if (fieldId === 'avatar') {
                  // Navigate to Personal Information tab (index 0) for profile photo
                  setCurrentTabIndex(0);
                } else {
                  // Scroll to basic profile field in Personal Information tab
                  setCurrentTabIndex(0);
                  setTimeout(() => {
                    const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
                    if (fieldElement) {
                      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      fieldElement.focus();
                    }
                  }, 100); // Small delay to let tab switch complete
                }
              }}
          />
        ) : (
          // Loading skeleton for profile completion
          <Box sx={{ mb: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ minWidth: 80 }}>
                <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, opacity: 0.7 }} />
              </Box>
              <Box sx={{ width: '100%', mr: 1 }}>
                <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 3, opacity: 0.7 }} />
              </Box>
              <Box sx={{ width: 80, height: 24, bgcolor: 'grey.200', borderRadius: 1, opacity: 0.7 }} />
            </Box>
          </Box>
        )
        )}

        {isPreviewMode ? (
          <PreviewPage data={previewData} onExitPreview={handleExitPreview} />
        ) : isPortfolioMode ? (
          <AddPortfolio
            initialData={editingProject}
            onSave={handleSaveProject}
            onCancel={handleCancelProject}
          />
        ) : (
          <UpdateData
            fields={profileFields}
            onPreview={handlePreview}
            bannerImage={bannerImage}
            onBannerUpdate={handleBannerUpdate}
            onValueChange={handleFieldChange}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            initialTabIndex={currentTabIndex}
            onProfileUpdateComplete={handleProfileUpdateComplete}
            onDataSpecificUpdateComplete={handleDataSpecificUpdateComplete}
            designData={designData}
            portfolioData={portfolioData}
            onPortfolioDataUpdate={handlePortfolioDataUpdate}
            pastClientsData={pastClientsData}
          />
        )}
        
        {/* Share Profile Dialog */}
        <ShareProfile
          open={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          profileData={profileData}
          completionPercentage={profileCompletionPercentage}
        />
      </Box>
    </Box>
  );
}

export default Profile;
