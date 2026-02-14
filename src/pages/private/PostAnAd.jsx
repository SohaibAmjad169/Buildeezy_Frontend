import { useEffect, useState } from "react";
import { Box, useMediaQuery, useTheme, Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { cloneDeep, isArray } from "lodash";

import {
  setAdsResponse,
  setPostAdData,
  setPostAdDataValue,
} from "../../redux/adSlice";
import { AD_QUESTIONS, DESIGN_QUESTIONS, SUFFIX_AD_QUESTIONS_KEYS } from "../../utils/constants/ad";
import { ROUTES } from "../../utils/constants/route";
import QuestionSkeleton from "../../components/skeleton/QuestionSkeleton";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  editAdUrl,
  getExchangeRate,
  getUserCategoriesByTypeUrl,
  postAdsCalculatefee,
  postAdUrl,
} from "../../apis/apiEndPoints";
import { FIELD_TYPES } from "../../utils/constants/login";
import dayjs from "dayjs";
import PreviewAdDetails from "../../components/previewAdDetails";
import DesktopPostAd from "../../components/postAd/DesktopPostAd";
import MobilePostAd from "../../components/postAd/MobilePostAd";
import MuiTabPanel from "../../components/common/MuiTabPanel";
import MuiTypography from "../../components/common/MuiTypography";
import DesktopDesignTab from "../../components/postAd/DesktopDesignTab";
import SpinnerLoader from "../../components/common/SpinnerLoader";
import { useMemo } from "react";
import { debounce } from "lodash";
import {
  
  IP_LOCAL_DATA,
  MOBILE_AD_DATA,
  USER_DATA,
} from "../../utils/constants/auth";
import {
  getLocalStorage,
  removeLocalStorage,
} from "../../utils/localStorageUtils";

function PostAnAd({ isEdit = false, adId = "", isReactivated = false }) {
  const ipLocation = JSON?.parse(getLocalStorage(IP_LOCAL_DATA));
  const user = JSON?.parse(getLocalStorage(USER_DATA));

  const [showPreview, setShowPreview] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [convertedTotal, setConvertedTotal] = useState(null);

  const { postAdData } = useSelector((state) => state.ad);
  const { loading } = useSelector((state) => state.config);
  const { profileData } = useSelector((state) => state.profile);
  const [loader, setLoader] = useState(false);

  const [page, setPage] = useState(0);
  const [adDetails, setAdDetails] = useState(null);
  const [adField, setAdField] = useState([]);
  const [suffixAdField, setSuffixAdField] = useState([]);
  const [lastChangedFieldId, setLastChangedFieldId] = useState("");

  const [designField, setDesignField] = useState([]);
  const [hasLoadedProfessionalTypes, setHasLoadedProfessionalTypes] =
    useState(false);

  const [isPaymnetCalculator, setIsPaymentCalculator] = useState("");

  const [adsFeeCalculation, setAdsFeeCalculation] = useState({
    nunberOfDays: 0,
    professionalTypesLength: 0,
  });
  const [resultAdsFee, setResultAdsFee] = useState({});

  // Auto-fill function for profile ads
  const handleUseMyProfileData = async () => {
    if (!profileData) return;
    
    try {
      dispatch(setLoading(true));
      
      // Get all available audience types
      const allAudienceTypes = ["client", "contractor", "specialist", "vendor"];
      
      // Get professional types for all audiences
      const response = await getUserCategoriesByTypeUrl(allAudienceTypes.join(","));
      const allProfessionalTypes = response.data.data || [];
      const allProfessionalIds = allProfessionalTypes.map(prof => prof.id);
      
      // Create updated post ad data with profile information
      const newPostAdData = cloneDeep(postAdData);
      
      // Auto-fill fields
      const updateField = (fieldId, value) => {
        const fieldIndex = newPostAdData.findIndex(field => field.id === fieldId);
        if (fieldIndex !== -1) {
          newPostAdData[fieldIndex].value = value;
        }
      };
      
      // Set ad type to profile
      updateField("adType", "profile");
      
      // Set audience to all types
      updateField("audience", allAudienceTypes);
      
      // Set professional types to all available
      const profTypeIndex = newPostAdData.findIndex(field => field.id === "professionalType");
      if (profTypeIndex !== -1) {
        newPostAdData[profTypeIndex].options = allProfessionalTypes;
        newPostAdData[profTypeIndex].value = allProfessionalIds;
      }
      
      // Set headline from profile data
      const headline = profileData.profileDesign?.content?.slogan || 
                      `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() ||
                      'Professional Profile';
      updateField("headline", headline);
      
      // Set description from profile
      const description = profileData.description || 
                         profileData.profileDesign?.content?.description ||
                         'Experienced professional ready to help with your projects';
      updateField("description", description);
      
      // Set business name from profile
      const businessName = profileData.vendorAdditionalInfo?.companyDetails?.name ||
                          profileData.contractorAdditionalInfo?.companyDetails?.name ||
                          profileData.specialistAdditionalInfo?.companyDetails?.name ||
                          `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() ||
                          'Professional Services';
      updateField("businessName", businessName);
      
      // Set upload assets (banner) from profile
      if (profileData.profileDesign?.layout?.banner) {
        updateField("documents", [profileData.profileDesign.layout.banner]);
      }
      
      // Set logo from profile picture
      if (profileData.avatar || profileData.profilePicture) {
        updateField("logo", profileData.avatar || profileData.profilePicture);
      }
      
      // Set default duration
      updateField("duration", "oneMonth");
      
      // Update Redux store
      dispatch(setPostAdData(newPostAdData));
      
      // Show success message
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("ad.profile_data_filled", "Profile data has been auto-filled successfully!"),
        })
      );
      
    } catch (error) {
      console.error('Error auto-filling profile data:', error);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: t("ad.profile_data_error", "Failed to auto-fill profile data. Please try again."),
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    removeLocalStorage(MOBILE_AD_DATA);
  }, [location.pathname]);

  // Get the current ad type
  const currentAdType = postAdData.find(
    (field) => field.id === "adType"
  )?.value;

  // Move these useMemo hooks before the useEffect that uses them
  const selectedProfessions = useMemo(() => {
    return adField.find((item) => item.id === "professionalType")?.value || [];
  }, [adField]);

  const startAt = useMemo(() => {
    return (
      adField
        .find((item) => item.id === "duration")
        ?.child?.data?.find((item) => item.id === "startAt")?.value || ""
    );
  }, [adField]);

  const expireAt = useMemo(() => {
    return (
      adField
        .find((item) => item.id === "duration")
        ?.child?.data?.find((item) => item.id === "expireAt")?.value || ""
    );
  }, [adField]);

  // Local calculation removed - now using API response from debouncedCalculateFee
  // This ensures consistency with backend calculation logic
  useEffect(() => {
    // Only reset if no API call conditions are met
    if (
      !selectedProfessions.length ||
      !startAt ||
      !expireAt
    ) {
      setResultAdsFee({
        totalDays: 0,
        fees: 0,
        servicesFees: 0,
      });
    }
  }, [selectedProfessions, startAt, expireAt]);

  useEffect(() => {
    // Initialize both AD_QUESTIONS and DESIGN_QUESTIONS in Redux store
    if (!isEdit) {
      const initializedDesignQuestions = DESIGN_QUESTIONS.map((question) => ({
        ...question,
        value:
          question.defaultValue ||
          question.value ||
          (question.type === FIELD_TYPES.multipleSelect ? [] : ""),
      }));

      // Get ad type from navigation state if available
      const adTypeFromNav = location.state?.type;
      const initializedAdQuestions = AD_QUESTIONS.map((question) => {
        if (question.id === "adType" && adTypeFromNav) {
          return {
            ...question,
            value: adTypeFromNav,
          };
        }
        return {
          ...question,
          value:
            question.defaultValue ||
            question.value ||
            (question.type === FIELD_TYPES.multipleSelect ? [] : ""),
        };
      });

      const allQuestions = [...initializedAdQuestions, ...initializedDesignQuestions];

      dispatch(
        setPostAdData(allQuestions)

      );
    }
  }, [dispatch, isEdit, location.state]);

  useEffect(() => {
    if (isReactivated) {
      setAdField([postAdData[3]]);
    } else {
      // Separate basic fields and design fields
      const basicFields = postAdData.filter(
        (field) =>
          !DESIGN_QUESTIONS.some(
            (designField) => designField.id === field.id
          ) &&
          (!field.show || field.show({ adType: currentAdType }))
      );

      const designFields = postAdData.filter(
        (field) =>
          DESIGN_QUESTIONS.some((designField) => designField.id === field.id) &&
          (!field.show || field.show({ adType: currentAdType }))
      );

      const suffixAdFields = postAdData.filter(
        (field) =>
          SUFFIX_AD_QUESTIONS_KEYS.includes(field.id) &&
          (!field.show || field.show({ adType: currentAdType }))
      );

      // If ad type is learning solution, move call to action and displayOnDashboard to basic fields
      if (currentAdType === "learningSolution") {
        const displayOnDashboardField = designFields.find(
          (field) => field.id === "displayOnDashboard"
        );
        if (displayOnDashboardField) {
          basicFields.push(displayOnDashboardField);
        }
        setDesignField([]);
      } else {
        setDesignField(designFields);
      }
      setAdField(basicFields);
      setSuffixAdField(suffixAdFields);
    }
  }, [isReactivated, postAdData, currentAdType, t]);

  async function getProfessionalTypes() {
    try {
      dispatch(setLoading(true));
      const audienceField = postAdData.find(
        (question) => question.id === "audience"
      );
      if (!audienceField?.value?.length) {
        return;
      }
      const response = await getUserCategoriesByTypeUrl(
        audienceField.value.join(",")
      );
      const newPostAdData = cloneDeep(postAdData);
      const findIndex = newPostAdData.findIndex(
        (question) => question.id === "professionalType"
      );
      if (findIndex !== -1) {
        newPostAdData[findIndex].options = response.data.data;
        if (audienceField?.value?.length === 4) {
          const responseData = response.data.data;
          if (Array.isArray(responseData)) {
            const ids = responseData.map((item) => item.id);
            newPostAdData[findIndex].value = ids;
            dispatch(setPostAdData(newPostAdData));
          }
        }
        dispatch(setPostAdData(newPostAdData));
      }
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  useEffect(() => {
    const audienceField = postAdData.find(
      (question) => question.id === "audience"
    );

    if (
      !hasLoadedProfessionalTypes &&
      audienceField?.value?.length > 0 &&
      !audienceField.value.every((item) => item === "client")
    ) {
      getProfessionalTypes();
      setHasLoadedProfessionalTypes(true);
    }
  }, [postAdData, hasLoadedProfessionalTypes]);

  function handlePageChange(e, pageValue) {
    setPage(pageValue - 1);
  }

  function goToPreviousStep() {
    if (page > 0) {
      setPage((prevState) => prevState - 1);
    }
  }

  function goToNextStep() {
    setPage((prevState) => prevState + 1);
  }

  function onValueChange(id, value) {
    setLastChangedFieldId(id);

    if (id === "audience") {
      dispatch(setPostAdDataValue({ id, value }));

      if (value.length === 4) {
        const professionalTypeItem = postAdData.find(
          (item) => item.id === "professionalType"
        );

        if (
          professionalTypeItem &&
          Array.isArray(professionalTypeItem.options)
        ) {
          const allIds = professionalTypeItem.options.map((opt) => opt.id);
          dispatch(
            setPostAdDataValue({ id: "professionalType", value: allIds })
          );
        }
      } else {
        dispatch(setPostAdDataValue({ id: "professionalType", value: [] }));
      }
    } else {
      dispatch(setPostAdDataValue({ id, value }));
    }
  }

  function onDateValueChange(id, value, index) {
    setLastChangedFieldId(id);
    const newPostAdData = cloneDeep(postAdData);
    const fieldIndex = newPostAdData.findIndex((el) => el.id === id);
    if (index === 0) {
      newPostAdData[fieldIndex].child.data[index + 1].value = "";
    }
    newPostAdData[fieldIndex].child.data[index].value = value;
    dispatch(setPostAdData(newPostAdData));
  }

  const processUrl = (url) => {
    if (typeof url === "string" && url.includes("https:")) {
      return url.split("/").slice(-2).join("/");
    }
    return url;
  };

  function calculateEndDate(value) {
    const today = dayjs();
    let endDate;

    switch (value) {
      case "oneDay":
        endDate = today.add(1, "day");
        break;
      case "oneWeek":
        endDate = today.add(7, "day");
        break;
      case "oneMonth":
        endDate = today.add(30, "day");
        break;
      case "pickADate":
        // For pickADate, we'll use the selected date or default to 30 days
        endDate = today.add(30, "day");
        break;
      default:
        // Default to 30 days for any other value
        endDate = today.add(30, "day");
    }

    return endDate.format("YYYY-MM-DD");
  }

  function mapAdDetailObj() {
    const mappedFields = postAdData.map((item) => {
      let itemValue = item.value;

      // Keep arrays as arrays for specific fields
      if (
        Array.isArray(itemValue) &&
        !(
          item.id === "audience" ||
          item.id === "professionalType" ||
          item.id === "documents" ||
          item.id === "faq"
        )
      ) {
        // Convert arrays to strings only for non-special fields
        itemValue = itemValue.join(",");
      }

      // Handle file uploads
      if (item.type === FIELD_TYPES.upload && item.id !== "documents") {
        itemValue = isArray(item.value)
          ? item.value.map((docUrl) => processUrl(docUrl))
          : processUrl(item.value);
      }

      // Handle duration field and its child data
      if (item.id === "duration") {
        const startDate =
          item.child?.data?.[0]?.value || dayjs().format("YYYY-MM-DD");
        const endDate =
          item.child?.data?.[1]?.value || calculateEndDate(item.value);

        return {
          duration: item.value,
          startAt: startDate,
          expireAt: endDate,
        };
      }

      if (item.id === "displayOnDashboard") {
        return {
          displayOnDashboard: itemValue === "yes", // Only true if explicitly "yes"
        };
      }

      // Return arrays for specific fields, strings for others
      return {
        [item.id]:
          Array.isArray(itemValue) &&
            (item.id === "audience" ||
              item.id === "professionalType" ||
              item.id === "documents" ||
              item.id === "faq")
            ? itemValue
            : (itemValue || "").toString(),
      };
    });

    // Merge all fields into a single object
    const mergedFields = Object.assign({}, ...mappedFields);

    // Add required state fields
    const finalAdObject = {
      ...mergedFields,
      isActive: true,
      state: "active",
      status: "active",
      active: true,
      published: true,
      visible: true,
      displayOnDashboard:
        mergedFields.displayOnDashboard !== undefined
          ? mergedFields.displayOnDashboard
          : true, // Default to true if not specified
      isPublished: true,
      isVisible: true,
      canReactivate: false, // Set to false for new ads
      isExpired: false, // Set to false for new ads
      visibility: {
        // Add explicit visibility object
        isActive: true,
        state: "active",
        status: "active",
        active: true,
        published: true,
        visible: true,
      },
    };

    setAdDetails(finalAdObject);
    return finalAdObject;
  }

  async function postAnAd(adDetails) {
    try {
      // Create a deep copy of adDetails to avoid mutations
      const processedDetails = JSON.parse(JSON.stringify(adDetails));

      // Ensure specific fields are always arrays
      const arrayFields = ["audience", "professionalType", "documents", "faq"];
      arrayFields.forEach((field) => {
        if (field in processedDetails) {
          processedDetails[field] = Array.isArray(processedDetails[field])
            ? processedDetails[field]
            : processedDetails[field]
              ? [processedDetails[field]]
              : [];
        }
      });

      // ✅ Ensure displayOrder is present in each faq object
      if (Array.isArray(processedDetails.faq)) {
        let maxDisplayOrder = processedDetails.faq.reduce((max, item) => {
          return typeof item.displayOrder === "number" && item.displayOrder > max
            ? item.displayOrder
            : max;
        }, 0);

        processedDetails.faq = processedDetails.faq.map((item) => {
          if (!("displayOrder" in item)) {
            maxDisplayOrder += 1;
            return { ...item, displayOrder: maxDisplayOrder };
          }
          return item;
        });
      }

      // Ensure adType is set
      if (!processedDetails.adType) {
        console.warn("No adType specified, defaulting to 'promotional'");
        processedDetails.adType = "promotional";
      }

      // Process other fields
      Object.keys(processedDetails).forEach((key) => {
        if (!arrayFields.includes(key)) {
          if (
            processedDetails[key] === null ||
            processedDetails[key] === undefined
          ) {
            processedDetails[key] = "";
          } else if (typeof processedDetails[key] === "boolean") {
            processedDetails[key] = processedDetails[key].toString();
          } else if (!Array.isArray(processedDetails[key])) {
            processedDetails[key] = processedDetails[key].toString();
          }
        }
      });

      // Conditionally include callToAction only if adType is 'learningSolution'
      if (processedDetails.adType === "learningSolution") {
        processedDetails.callToAction = processedDetails.callToAction || "";
      } else {
        delete processedDetails.callToAction;
      }

      const jobPayload = {
        data: {
          type: isEdit ? "update_advertisement" : "create_advertisement",
          ...processedDetails,
          totalDays: resultAdsFee?.totalDays,
          totalBudget: resultAdsFee?.fees,
          totalServiceFees: resultAdsFee?.servicesFees,
          isActive: true,
          state: "active",
          status: "active",
          active: true,
          published: true,
          visible: true,
          displayOnDashboard:
            processedDetails.displayOnDashboard !== undefined
              ? processedDetails.displayOnDashboard
              : true,
          isPublished: true,
          isVisible: true,
          canReactivate: false,
          isExpired: false,
          visibility: {
            isActive: true,
            state: "active",
            status: "active",
            active: true,
            published: true,
            visible: true,
          },
        },
      };

      dispatch(setLoading(true));
      let response;
      if (isEdit) {
        response = await editAdUrl(adId, jobPayload);
      } else {
        response = await postAdUrl(jobPayload);
        dispatch(setAdsResponse(response?.data?.data));
        
        // Skip payment dialog for learning solutions in production
        if (response?.data && !(processedDetails.adType === "learningSolution" && import.meta.env.VITE_NODE_ENV === 'production')) {
          setOpenPaymentDialog(true);
        } else if (response?.data && processedDetails.adType === "learningSolution" && import.meta.env.VITE_NODE_ENV === 'production') {
          // Navigate to my-ads for learning solutions in production (no payment required)
          setTimeout(() => {
            navigate("/" + ROUTES.myAds);
          }, 2000); // Wait 2 seconds to show the success message
        }
      }

      removeLocalStorage(MOBILE_AD_DATA);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: currentAdType === "learningSolution" 
            ? t("learning.idea_saved_successfully", "Idea saved successfully") 
            : t("ad.ad_saved_successfully"),
        })
      );
    } catch (err) {
      console.error("Error posting ad:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  const handleClosePayment = () => {
    setOpenPaymentDialog(false);
  };

  function onSubmit() {
    postAnAd(adDetails);
    setOpenSubmitDialog(false);
  }

  function handlePreview() {
    mapAdDetailObj();
    setShowPreview(true);
  }

  function onAdPreview() {
    const currentAdType = postAdData.find(
      (field) => field.id === "adType"
    )?.value;

    const blankDataIndex = postAdData.findIndex(
      (question) => {
        // Check if field should be shown
        if (question.show && !question.show({ adType: currentAdType })) {
          return false;
        }
        
        // Check if field is required (handle function or boolean)
        const isRequired = typeof question.validation?.required === 'function' 
          ? question.validation.required({ adType: currentAdType })
          : question.validation?.required || question.required;
          
        return isRequired &&
          (!question.value ||
            question.value.length === 0 ||
            (question.child &&
              question.value === "pickADate" &&
              (!question.child.data[0].value || !question.child.data[1].value)));
      }
    );

    if (blankDataIndex !== -1) {
      setPage(isReactivated ? 0 : blankDataIndex);
      return;
    }
    handlePreview();
  }

  function onEdit() {
    setShowPreview(false);
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // useMemo hooks moved above to avoid initialization errors

  const debouncedCalculateFee = useMemo(
    () =>
      debounce(async (payload) => {
        try {
          setLoader(true);
          const response = await postAdsCalculatefee(payload);
          if (response?.data) {
            // Use the API response for accurate calculation
            setResultAdsFee({
              totalDays: response.data.totalDays,
              fees: response.data.fees,
              servicesFees: response.data.servicesFees,
            });
          }
          setLoader(false);
        } catch (error) {
          setLoader(false);
          console.error("API error:", error);
        }
      }, 800),
    [] // 800ms delay
  );

  useEffect(() => {
    const shouldCallAPI =
      selectedProfessions.length > 0 &&
      Boolean(startAt) &&
      Boolean(expireAt) &&
      ["professionalType", "duration", "startAt", "expireAt"].includes(
        lastChangedFieldId
      );

    if (shouldCallAPI) {
      const payload = {
        startDate: startAt,
        endDate: expireAt,
        totalNumberOfProfessionalTypes: selectedProfessions.length,
      };

      debouncedCalculateFee(payload);
    }
  }, [selectedProfessions, startAt, expireAt, lastChangedFieldId, debouncedCalculateFee]);

  const allExchangeRate = async () => {
    try {
      const allData = await getExchangeRate();
      const rateString = allData?.data?.config?.value;
      const rates = JSON.parse(rateString); // JSON.parse required because value is a JSON string

      const totalUSD =
        Number(resultAdsFee.fees) + Number(resultAdsFee.servicesFees); // 216 + 7 = 223
      const userCurrencyRate = rates[ipLocation.currency]; // for example INR = 85.12
      const converted = Number((totalUSD * userCurrencyRate).toFixed(2));
      setConvertedTotal(converted);
    } catch (error) {
      console.error("Error fetching exchange rate data:", error);
    }
  };

  useEffect(() => {
    const debouncedCall = debounce(() => {
      if (
        ipLocation?.currency &&
        adsFeeCalculation?.nunberOfDays > 0 &&
        adsFeeCalculation?.professionalTypesLength > 0 &&
        resultAdsFee
      ) {
        allExchangeRate();
      }
    }, 700); // 700ms delay

    debouncedCall();
    // Cleanup to cancel debounce on unmount or before re-run
    return () => debouncedCall.cancel();
  }, [
    ipLocation?.currency,
    adsFeeCalculation?.nunberOfDays,
    adsFeeCalculation?.professionalTypesLength,
    resultAdsFee,
  ]);

  useEffect(() => {
    if (
      adsFeeCalculation?.nunberOfDays == 0 ||
      adsFeeCalculation?.professionalTypesLength == 0
    ) {
      setConvertedTotal(null);
    }
  }, [adsFeeCalculation]);

  if (showPreview) {
    return (
      <PreviewAdDetails
        adDetails={adDetails}
        handleAdEdit={onEdit}
        handleAdSubmit={onSubmit}
        openPaymentDialog={openPaymentDialog}
        handleClosePayment={handleClosePayment}
        openSubmitDialog={openSubmitDialog}
        setOpenSubmitDialog={setOpenSubmitDialog}
        isPaymnetCalculator={isPaymnetCalculator}
        setIsPaymentCalculator={setIsPaymentCalculator}
      />
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%" },
          my: 4,
        }}
      >
        {loading ? (
          <QuestionSkeleton />
        ) : (
          <>
            {!isMobile && currentAdType !== "learningSolution" && (
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="ad creation tabs"
                sx={{
                  mb: 4,
                  ml: 2,
                  mr: 2,
                  width: { xs: "100%", lg: "70%" },
                  mx: "auto",
                  display: "flex",
                  justifyContent: "center",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: "1rem",
                    minWidth: 120,
                  },
                  borderColor:
                    theme.palette.mode === "dark" ? theme.palette.divider : "divider",
                  background:
                    theme.palette.mode === "dark"
                      ? theme.palette.background.paper
                      : undefined,
                }}
              >
                <Tab label={t("ad.tabs.basic_information")} />
                <Tab label={t("ad.tabs.design")} />
              </Tabs>
            )}

            {isMobile ? (
              <Box
                sx={{
                  width: "100%",
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <Box>
                  <MuiTypography variant="h2" sx={{ mb: 3 }}>
                    {currentAdType === "learningSolution" 
                      ? t("learning.create_idea", "Create an Idea") 
                      : t("ad.create_ad")}
                  </MuiTypography>
                  <MobilePostAd
                    adField={[
                      ...adField
                      .filter((field) => !SUFFIX_AD_QUESTIONS_KEYS.includes(field.id))
                      .map((field) => ({
                        ...field,
                        value:
                          field.value ||
                          field.defaultValue ||
                          (field.type === FIELD_TYPES.multipleSelect ? [] : ""),
                      })),
                      ...(currentAdType !== "learningSolution"
                        ? designField.map((field) => ({
                          ...field,
                          value:
                            field.value ||
                            field.defaultValue ||
                            (field.type === FIELD_TYPES.multipleSelect
                              ? []
                              : ""),
                        }))
                        : []),
                      ...suffixAdField.map((field) => ({
                        ...field,
                        value:
                          field.value ||
                          field.defaultValue ||
                          (field.type === FIELD_TYPES.multipleSelect ? [] : ""),
                      })),
                    ]}
                    page={page}
                    onValueChange={onValueChange}
                    onDateValueChange={onDateValueChange}
                    onAdPreview={onAdPreview}
                    goToPreviousStep={goToPreviousStep}
                    goToNextStep={goToNextStep}
                    handlePageChange={handlePageChange}
                    t={t}
                    isEdit={isEdit}
                    resultAdsFee={resultAdsFee}
                    adsFeeCalculation={adsFeeCalculation}
                    setAdsFeeCalculation={setAdsFeeCalculation}
                    currency={ipLocation?.currency}
                    currentUserCurrency={user?.user?.country?.currency}
                    convertedTotal={convertedTotal}
                    setIsPaymentCalculator={setIsPaymentCalculator}
                    onUseMyProfileData={handleUseMyProfileData}
                  />
                </Box>
              </Box>
            ) : (
              <>
                <MuiTabPanel value={activeTab} index={0}>
                  <Box
                    sx={{
                      width: { xs: "100%", lg: "70%" },
                      mx: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <DesktopPostAd
                      adField={[
                        ...adField
                        .map((field) => ({
                          ...field,
                          value:
                            field.value ||
                            field.defaultValue ||
                            (field.type === FIELD_TYPES.multipleSelect ? [] : ""),
                        }))
                      ]}
                      onValueChange={onValueChange}
                      onDateValueChange={onDateValueChange}
                      onAdPreview={onAdPreview}
                      onSave={() => {
                        console.log("DesktopPostAd onSave triggered");
                        const currentAdType = adField.find(f => f.id === "adType")?.value;
                        console.log("Current ad type:", currentAdType);
                        
                        const hasCallToAction = adField?.some(
                          (field) => field?.id === "callToAction"
                        );
                        console.log("Has call to action field:", hasCallToAction);

                        // For learning solutions in production, submit directly without design tab
                        if (currentAdType === "learningSolution" && import.meta.env.VITE_NODE_ENV === 'production') {
                          console.log("Learning solution in production - submitting directly");
                          const adDetails = mapAdDetailObj();
                          postAnAd(adDetails);
                        } else if (hasCallToAction) {
                          console.log("Has call to action - submitting");
                          const adDetails = mapAdDetailObj();
                          postAnAd(adDetails);
                        } else {
                          console.log("No call to action - going to design tab");
                          setActiveTab(1);
                        }
                      }}
                      onCancel={() => {
                        dispatch(setPostAdData(AD_QUESTIONS));
                        navigate("/" + ROUTES.myAds);
                      }}
                      isEdit={isEdit}
                      resultAdsFee={resultAdsFee}
                      adsFeeCalculation={adsFeeCalculation}
                      setAdsFeeCalculation={setAdsFeeCalculation}
                      handleClosePayment={handleClosePayment}
                      openPaymentDialog={openPaymentDialog}
                      currency={ipLocation?.currency}
                      currentUserCurrency={user?.user?.country?.currency}
                      convertedTotal={convertedTotal}
                      isPaymnetCalculator={isPaymnetCalculator}
                      setIsPaymentCalculator={setIsPaymentCalculator}
                      onUseMyProfileData={handleUseMyProfileData}
                    />
                  </Box>
                </MuiTabPanel>

                {currentAdType !== "learningSolution" && (
                  <MuiTabPanel value={activeTab} index={1}>
                    <Box
                      sx={{
                        width: { xs: "100%", lg: "70%" },
                        mx: "auto",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <DesktopDesignTab
                        adField={adField}
                        onPreview={onAdPreview}
                        onSave={() => {
                          const adDetails = mapAdDetailObj();
                          postAnAd(adDetails);
                        }}
                        onCancel={() => setActiveTab(0)}
                        values={designField}
                        onValueChange={onValueChange}
                        errors={{}}
                        handleClosePayment={handleClosePayment}
                        openPaymentDialog={openPaymentDialog}
                      />
                    </Box>
                  </MuiTabPanel>
                )}
              </>
            )}
          </>
        )}
        {loader && <SpinnerLoader />}
      </Box>
    </Box>
  );
}

export default PostAnAd;