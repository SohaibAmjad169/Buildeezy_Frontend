import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { cloneDeep, debounce, isArray } from "lodash";
import { Box, useMediaQuery, useTheme, Tabs, Tab } from "@mui/material";

import MuiTabPanel from "../common/MuiTabPanel";
import MobilePostAd from "../postAd/MobilePostAd";
import PreviewAdDetails from "../previewAdDetails";
import DesktopPostAd from "../postAd/DesktopPostAd";
import MuiTypography from "../common/MuiTypography";
import SpinnerLoader from "../common/SpinnerLoader";
import { ROUTES } from "../../utils/constants/route";
import DesktopDesignTab from "../postAd/DesktopDesignTab";
import { FIELD_TYPES } from "../../utils/constants/login";
import { ALERT_TYPE } from "../../utils/constants/config";
import QuestionSkeleton from "../skeleton/QuestionSkeleton";
import { setAlert, setLoading } from "../../redux/configSlice";
import { AD_QUESTIONS, DESIGN_QUESTIONS } from "../../utils/constants/ad";
import {
  getLocalStorage,
  removeLocalStorage,
} from "../../utils/localStorageUtils";
import {
  IP_LOCAL_DATA,
  MOBILE_AD_DATA,
  USER_DATA,
} from "../../utils/constants/auth";
import {
  setAdsResponse,
  setPostAdData,
  setPostAdDataValue,
} from "../../redux/adSlice";
import {
  editAdUrl,
  getExchangeRate,
  getUserCategoriesByTypeUrl,
  postAdsCalculatefee,
  postAdUrl,
} from "../../apis/apiEndPoints";

function PostAnAd({ isEdit = false, adId = "", isReactivated = false }) {
  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";

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
  const [loader, setLoader] = useState(false);

  const [page, setPage] = useState(0);
  const [adDetails, setAdDetails] = useState(null);
  const [adField, setAdField] = useState([]);
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

  useEffect(() => {
    removeLocalStorage(MOBILE_AD_DATA);
  }, [location.pathname]);

  // Get the current ad type
  const currentAdType = postAdData.find(
    (field) => field.id === "adType"
  )?.value;

  useEffect(() => {
    const resultOfAdsFee = () => {
      const baseFee = 0.5; // Base fee per day USD
      const totalDays = adsFeeCalculation?.nunberOfDays || 1;
      const audience = adsFeeCalculation?.professionalTypesLength;

      const fees = Math.round(baseFee * totalDays * audience);
      const servicesFees = Math.round(fees * 0.029 + 0.3);

      setResultAdsFee({
        totalDays,
        fees,
        servicesFees,
      });
    };

    if (adsFeeCalculation) {
      resultOfAdsFee();
    }
  }, [adsFeeCalculation]);

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

      dispatch(
        setPostAdData([
          ...initializedAdQuestions,
          ...initializedDesignQuestions,
        ])
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

      // If ad type is learning solution, move call to action and displayOnDashboard to basic fields
      if (currentAdType === "learningSolution") {
        const callToActionField = designFields.find(
          (field) => field.id === "callToAction"
        );
        const displayOnDashboardField = designFields.find(
          (field) => field.id === "displayOnDashboard"
        );
        if (callToActionField) {
          // Ensure the call to action field has the proper title and subtitle
          const callToActionWithTitle = {
            ...callToActionField,
            title: t("ad.design.callToAction.title"),
            label: t("ad.design.callToAction.title"),
            placeholder: "ad.design.callToAction.placeholder",
            options: [
              {
                id: "contact_only",
                label: t("ad.design.callToAction.options.contact_only"),
              },
            ],
          };

          basicFields.push(callToActionWithTitle);
        }
        if (displayOnDashboardField) {
          basicFields.push(displayOnDashboardField);
        }
        setDesignField([]);
      } else {
        const callToActionField = postAdData.find(
          (field) => field.id === "callToAction"
        );
        if (
          callToActionField &&
          !designFields.some((field) => field.id === "callToAction")
        ) {
          designFields.push({
            ...callToActionField,
            show: () => true,
            options: [
              {
                id: "contact_only",
                label: t("ad.design.callToAction.options.contact_only"),
              },
            ],
          });
        }
        setDesignField(designFields);
      }
      setAdField(basicFields);
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

  // const processUrl = (url) => {
  //   if (url.includes("https:")) {
  //     return url.split("/").slice(-2).join("/");
  //   }
  //   return url;
  // };

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

      // Map callToAction to state for backend compatibility
      // if (item.id === "callToAction") {
      //   return {
      //     state: String(itemValue || ""),
      //   };
      // }

      // Handle displayOnDashboard field
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
          return typeof item.displayOrder === "number" &&
            item.displayOrder > max
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

      if (isEdit) {
        const response = await editAdUrl(adId, jobPayload);
      } else {
        const response = await postAdUrl(jobPayload);
        dispatch(setAdsResponse(response?.data?.data));
        if (response?.data && !isAdmin) {
          setOpenPaymentDialog(true);
        }
      }

      removeLocalStorage(MOBILE_AD_DATA);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("ad.ad_saved_successfully"),
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
      (question) =>
        question.required &&
        (!question.show || question.show({ adType: currentAdType })) && // Only check if field is visible
        (!question.value ||
          question.value.length === 0 ||
          (question.child &&
            question.value === "pickADate" &&
            (!question.child.data[0].value || !question.child.data[1].value)))
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

  const debouncedCalculateFee = useMemo(
    () =>
      debounce(async (payload) => {
        try {
          setLoader(true);
          const response = await postAdsCalculatefee(payload);
          if (response) {
            setLoader(false);
          }
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
  }, [selectedProfessions, startAt, expireAt, lastChangedFieldId]);

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
                    theme.palette.mode === "dark"
                      ? theme.palette.divider
                      : "divider",
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
                    {t("ad.create_ad")}
                  </MuiTypography>
                  <MobilePostAd
                    adField={[
                      ...adField.map((field) => ({
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
                      adField={adField}
                      onValueChange={onValueChange}
                      onDateValueChange={onDateValueChange}
                      onAdPreview={onAdPreview}
                      onSave={() => {
                        const hasCallToAction = adField?.some(
                          (field) => field?.id === "callToAction"
                        );

                        if (hasCallToAction) {
                          const adDetails = mapAdDetailObj();
                          postAnAd(adDetails);
                        } else {
                          setActiveTab(1);
                        }
                      }}
                      onCancel={() => {
                        dispatch(setPostAdData(AD_QUESTIONS));
                        navigate("/" + ROUTES.adminMarketing);
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
