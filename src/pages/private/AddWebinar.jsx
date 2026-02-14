import { useEffect, useRef, useState } from "react";
import { Box, useMediaQuery, useTheme, Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { cloneDeep, isArray } from "lodash";

import {
  setAddWebinarData,
  setAddWebinarDataValue,
  setWebinarResponse,
} from "../../redux/webinarSlice";
import {
  SETUP_QUESTIONS,
  AD_QUESTIONS,
  DESIGN_QUESTIONS,
} from "../../utils/constants/webinar";
import { ROUTES } from "../../utils/constants/route";
import QuestionSkeleton from "../../components/skeleton/QuestionSkeleton";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  editWebinarUrl,
  getUserCategoriesByTypeUrl,
  addWebinarUrl,
  postWebinarCalculatefee,
  getExchangeRate,
  getSingleWebinar,
  postAdsCalculatefee,
  getAllWebinars,
  postAdUrl,
} from "../../apis/apiEndPoints";
import { FIELD_TYPES } from "../../utils/constants/login";
import dayjs from "dayjs";
import MuiTabPanel from "../../components/common/MuiTabPanel";
import MuiTypography from "../../components/common/MuiTypography";
import DesktopDesignTab from "../../components/addWebinar/DesktopDesignTab";
import DesktopAddWebinar from "../../components/addWebinar/DesktopAddWebinar";
import MobileAddWebinar from "../../components/addWebinar/MobileAddWebinar";
import PreviewWebinarDetails from "../../components/previewWebinarDetails";
import DesktopSetUpWebinar from "../../components/addWebinar/DesktopSetUpWebinar";
import useDebounce from "../../hooks/useDebounce";
import SpinnerLoader from "../../components/common/SpinnerLoader";
import { IP_LOCAL_DATA, USER_DATA } from "../../utils/constants/auth";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { useSearchParams } from "react-router-dom";
import DesktopPostAd from "../../components/postAd/DesktopPostAd";
import {
  setAdsResponse,
  setPostAdData,
  setPostAdDataValue,
} from "../../redux/adSlice";
import { useMemo } from "react";
import { debounce } from "lodash";
import SubmitButton from "../../components/common/SubmitButton";
import MobileSetUpWebinar from "../../components/addWebinar/MobileSetUpWebinar";
import MobileDesignTabWebinar from "../../components/addWebinar/MobileDesignTabWebinar";


function AddWebinar({ adId = "", isReactivated = false }) {
  // Utility to generate all UTC time zones (including offsets with minutes)
  function getUTCOptions() {
    // Generates UTC offsets from UTC-12:00 to UTC+14:00, including minutes (00, 15, 30, 45)
    // Excludes offsets that do not exist officially (e.g., UTC+14:15, UTC-12:15, UTC+00:15, UTC+00:45)
    const options = [];
    const minuteOffsets = [0, 15, 30, 45];
    for (let i = -12; i <= 14; i++) {
      for (let m of minuteOffsets) {
        // Exclude minutes for UTC+14 and UTC-12 (only :00 exists officially)
        if ((i === 14 && m !== 0) || (i === -12 && m !== 0)) continue;
        // Exclude minutes for UTC+00:15 and UTC+00:45 (do not exist officially)
        if (i === 0 && (m === 15 || m === 45)) continue;
        const sign = i < 0 ? "-" : "+";
        const hours = Math.abs(i).toString().padStart(2, "0");
        const minutes = m.toString().padStart(2, "0");
        options.push({
          id: `UTC${sign}${hours}:${minutes}`,
          label: `UTC${sign}${hours}:${minutes}`,
        });
      }
    }
    return options;
  }
  const ipLocation = JSON?.parse(getLocalStorage(IP_LOCAL_DATA));
  const [showPreview, setShowPreview] = useState(false);
  const [convertedTotal, setConvertedTotal] = useState(null);
  const user = JSON?.parse(getLocalStorage(USER_DATA));
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [isEdit, setIsEdit] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const webinarId = location?.state?.webinarId;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [upcomingWebinar, setUpcomingWebinar] = useState({});
  const [webinars, setWebinars] = useState([]);
  const [participants, setParticipants] = useState(0);
  const [duration, setDuration] = useState(0);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const prevValues = useRef({ participants: 0, duration: 0 });
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  const [webinarFee, setWebinarFee] = useState({});
  const [adFee, setAdFee] = useState({});
  const [editedConvertedTotal, setEditedConvertedTotal] = useState(null);

  const totalParticipantMinutes = participants * duration;
  const { postAdData } = useSelector((state) => state.ad);
  const { addWebinarData } = useSelector((state) => state.webinar);
  const [spinerloading, setSpinerLoading] = useState(false);
  const { loading } = useSelector((state) => state.config);
  const [page, setPage] = useState(0);
  const [webinarDetails, setWebinarDetails] = useState(null);
  const [adDetails, setAdDetails] = useState(null);

  const [setupField, setSetupField] = useState([]);
  const [webinarField, setWebinarField] = useState([]);
  const [designField, setDesignField] = useState([]);
  const [singleWebinar, setSingleWebinar] = useState({});
  const [adField, setAdField] = useState([]);
  const [lastChangedFieldId, setLastChangedFieldId] = useState("");

  const [adsFeeCalculation, setAdsFeeCalculation] = useState({
    nunberOfDays: 0,
    professionalTypesLength: 0,
  });
  const [resultAdsFee, setResultAdsFee] = useState({});

  // Estado de pago del webinar
  const [paymentStatus, setPaymentStatus] = useState(null);

  // --- Limpieza y recarga tras pago exitoso ---
  useEffect(() => {
    // If coming from a successful payment and there is an id in the URL
    if (location.state?.fromPayment && id) {
      // Remove local draft
      localStorage.removeItem('webinarFormState');
      // Reload webinar data from backend
      getSingleWebinar(id)
        .then((response) => {
          // Check if response data is valid
          if (!response?.data || Object.keys(response.data).length === 0) {
            dispatch(
              setAlert({
                show: true,
                type: ALERT_TYPE.error,
                message: 'No webinar data found after payment. Please contact support.',
              })
            );
            return;
          }
          setIsEdit(true);
          setSingleWebinar(response?.data);
          setParticipants(response?.data?.totalParticipants);
          setDuration(response?.data?.totalDurationInMinutes);
          setPaymentStatus(response?.data?.paymentStatus || response?.data?.isPaid || null);
          const updatedFormData = SingleMapWebinarDetailObj(
            response?.data,
            addWebinarData
          );
          dispatch(setAddWebinarData(updatedFormData));
        })
        .catch((error) => {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: error?.message || 'Failed to fetch webinar after payment',
            })
          );
        });
    }
  }, [location.state, id]);

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
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");
    const fromPayment = location.state?.fromPayment;

    if (tabParam && !isNaN(parseInt(tabParam))) {
      setActiveTab(parseInt(tabParam));
    } else if (fromPayment && isEdit) {
      // If coming from payment and in edit mode, go to basic information tab
      setActiveTab(1);
    }
  }, [location.search, location.state, isEdit]);

  const [hasLoadedProfessionalTypes, setHasLoadedProfessionalTypes] =
    useState(false);
  // Get the current ad type
  const currentAdType = addWebinarData.find(
    (field) => field.id === "adType"
  )?.value;

  // Get the current call to action
  const currentCallToAction = addWebinarData.find(
    (field) => field.id === "callToAction"
  )?.value;

  const handleClosePayment = () => {
    setOpenPaymentDialog(false);
  };

  const getWebinarCalculatefee = async () => {
    const payload = {
      totalParticipants: participants,
      totalDurationInMinutes: duration,
    };
    try {
      setSpinerLoading(true);
      const response = await postWebinarCalculatefee(payload);
      if (response) {
        setSpinerLoading(false);
        setWebinarFee(response?.data);
        if (ipLocation?.currency) {
          // allExchangeRate();
          try {
            const allData = await getExchangeRate();
            const rateString = allData?.data?.config?.value;
            const rates = JSON.parse(rateString); // JSON.parse required because value is a JSON string

            const totalUSD =
              Number(response?.data.fees) + Number(response?.data.servicesFees); // 216 + 7 = 223
            const userCurrencyRate = rates[ipLocation.currency]; // for example INR = 85.12
            const converted = Number((totalUSD * userCurrencyRate).toFixed(2));
            setConvertedTotal(converted);
          } catch (error) {
            console.error("Error fetching exchange rate data:", error);
          }
        }
      }
    } catch (error) {
      setSpinerLoading(false);
      setWebinarFee({});
      setConvertedTotal(null);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    }
  };

  useEffect(() => {
    if (isReactivated) {
      // setAdField([postAdData[3]]);
      setWebinarField([postAdData[3]]);
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
            placeholder: t("ad.design.callToAction.placeholder"),
            options: [
              // {
              //   id: "learnMore",
              //   label: t("ad.design.callToAction.options.learn_more"),
              // },
              // {
              //   id: "register",
              //   label: t("ad.design.callToAction.options.register"),
              // },
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
        setDesignField([]); // Hide all design fields for learning solution
      } else {
        // For non-learning solution ads, ensure callToAction is in design fields
        const callToActionField = postAdData.find(
          (field) => field.id === "callToAction"
        );
        if (
          callToActionField &&
          !designFields.some((field) => field.id === "callToAction")
        ) {
          designFields.push({
            ...callToActionField,
            show: () => true, // Always show in design tab for non-learning solutions
            options: [
              // {
              //   id: "learn_more",
              //   label: t("ad.design.callToAction.options.learn_more"),
              // },
              {
                id: "register",
                label: t("ad.design.callToAction.options.register"),
              },
              // {
              //   id: "contact_only",
              //   label: t("ad.design.callToAction.options.contact_only"),
              // },
            ],
          });
        }
        setDesignField(designFields);
      }
      // setAdField(basicFields);
      setWebinarField(basicFields);
    }
  }, [isReactivated, postAdData, currentAdType, t]);

  // Debounced effect
  useDebounce(
    () => {
      const { participants: prevP, duration: prevD } = prevValues.current;

      // Only call API if values changed significantly (e.g., 0 to 10)s
      if (participants !== prevP || duration !== prevD) {
        prevValues.current = { participants, duration };
        getWebinarCalculatefee();
      }
    },
    900,
    [participants, duration]
  );

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

      const initializedSetupQuestions = SETUP_QUESTIONS.map((question) => {
    // If the field is timeZone, add UTC options
        if (question.id === "timeZone") {
          return {
            ...question,
            options: getUTCOptions(),
            value:
              question.defaultValue ||
              question.value ||
              "UTC+00:00",
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

      // Get ad type from navigation state if available
      const webinarTypeFromNav = location.state?.type;
      const initializedWebinarQuestions = AD_QUESTIONS.map((question) => {
        if (question.id === "adType" && webinarTypeFromNav) {
          return {
            ...question,
            value: webinarTypeFromNav,
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
        setAddWebinarData([
          ...initializedSetupQuestions,
          ...initializedWebinarQuestions,
          ...initializedDesignQuestions,
        ])
      );
    }
  }, [dispatch, isEdit, location.state]);

  useEffect(() => {
    if (isReactivated) {
      setWebinarField([addWebinarData[3]]);
    } else {
      // Separate setup fields, basic fields and design fields
      const setupFields = addWebinarData.filter((field) =>
        SETUP_QUESTIONS.some((setupField) => setupField.id === field.id)
      );
      // const basicFields = addWebinarData.filter(
      //   (field) =>
      //     !DESIGN_QUESTIONS.some(
      //       (designField) => designField.id === field.id
      //     ) &&
      //     !SETUP_QUESTIONS.some((setupField) => setupField.id === field.id)
      //     &&
      //     (!field.show ||
      //       field.show({ adType: currentAdType }) ||
      //       field.show({ callToAction: currentCallToAction }))
      // );

      let basicFields = addWebinarData.filter(
        (field) =>
          !DESIGN_QUESTIONS.some(
            (designField) => designField.id === field.id
          ) &&
          !SETUP_QUESTIONS.some((setupField) => setupField.id === field.id) &&
          (!field.show ||
            field.show({ adType: currentAdType }) ||
            field.show({ callToAction: currentCallToAction }))
      );

      // Merge values from setupFields into basicFields where labels match

      basicFields = basicFields.map((field) => {
        const correspondingSetupField = setupFields.find(
          (sf) => (sf.label || sf.title) === (field.label || field.title)
        );

        if (correspondingSetupField) {
          return { ...field, value: correspondingSetupField.value };
        }

        return field;
      });

      const designFields = addWebinarData.filter(
        (field) =>
          DESIGN_QUESTIONS.some((designField) => designField.id === field.id) &&
          (!field.show ||
            field.show({ adType: currentAdType }) ||
            field.show({ callToAction: currentCallToAction }))
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
            title: t("webinar.design.callToAction.title"),
            label: t("webinar.design.callToAction.title"),
            placeholder: t("webinar.design.callToAction.placeholder"),
            options: [
              // {
              //   id: "learnMore",
              //   label: t("webinar.design.callToAction.options.learn_more"),
              // },
              // {
              //   id: "register",
              //   label: t("webinar.design.callToAction.options.register"),
              // },
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
        setDesignField([]); // Hide all design fields for learning solution
      } else {
        // For non-learning solution ads, ensure callToAction is in design fields
        const callToActionField = addWebinarData.find(
          (field) => field.id === "callToAction"
        );
        if (
          callToActionField &&
          !designFields.some((field) => field.id === "callToAction")
        ) {
          designFields.push({
            ...callToActionField,
            show: () => true, // Always show in design tab for non-learning solutions
            options: [
              // {
              //   id: "learn_more",
              //   label: t("ad.design.callToAction.options.learn_more"),
              // },
              {
                id: "register",
                label: t("ad.design.callToAction.options.register"),
              },
              // {
              //   id: "contact_only",
              //   label: t("ad.design.callToAction.options.contact_only"),
              // },
            ],
          });
        }
        setDesignField(designFields);
      }
      setWebinarField(basicFields);
      setSetupField(setupFields);
    }
  }, [isReactivated, addWebinarData, currentAdType, t]);

  async function getProfessionalTypes() {
    try {
      // dispatch(setLoading(true));
      const audienceField = addWebinarData.find(
        (question) => question.id === "audience"
      );
      if (!audienceField?.value?.length) {
        return;
      }
      const response = await getUserCategoriesByTypeUrl(
        audienceField.value.join(",")
      );
      const newAddWebinarData = cloneDeep(addWebinarData);
      const findIndex = newAddWebinarData.findIndex(
        (question) => question.id === "professionalType"
      );
      if (findIndex !== -1) {
        newAddWebinarData[findIndex].options = response.data.data;
        // dispatch(setAddWebinarData(newAddWebinarData));
        if (audienceField?.value?.length === 4) {
          const responseData = response.data.data;
          if (Array.isArray(responseData)) {
            const ids = responseData.map((item) => item.id);
            newAddWebinarData[findIndex].value = ids;
            dispatch(setAddWebinarData(newAddWebinarData));
          }
        }
        dispatch(setAddWebinarData(newAddWebinarData));
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
    const audienceField = addWebinarData.find(
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
  }, [addWebinarData, hasLoadedProfessionalTypes]);

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
    dispatch(setAddWebinarDataValue({ id, value }));
  }

  // function onDateValueChange(id, value, index) {
  //   const newAddWebinarData = cloneDeep(addWebinarData);
  //   const fieldIndex = newAddWebinarData.findIndex((el) => el.id === id);
  //   if (index === 0) {
  //     // newAddWebinarData[fieldIndex].child.data[index + 1].value = "";
  //     newAddWebinarData[fieldIndex].child.data[index].value = value;
  //     // newAddWebinarData[fieldIndex].value = value;

  //     dispatch(setAddWebinarData(newAddWebinarData));
  //   }
  //   if (index === 3) {
  //     newAddWebinarData[fieldIndex].value = value;
  //     dispatch(setAddWebinarData(newAddWebinarData));
  //   }
  //   newAddWebinarData[fieldIndex].child.data[index].value = value;
  //   dispatch(setAddWebinarData(newAddWebinarData));
  // }

  // function onDateValueChange(id, value, index) {
  //   const newAddWebinarData = cloneDeep(addWebinarData);
  //   const fieldIndex = newAddWebinarData.findIndex((el) => el.id === id);

  //   // Deep clone the child object explicitly to avoid frozen error
  //   const clonedChild = cloneDeep(newAddWebinarData[fieldIndex].child);
  //   newAddWebinarData[fieldIndex].child = clonedChild;

  //   // Now safe to mutate
  //   newAddWebinarData[fieldIndex].child.data[index].value = value;

  //   // Optionally update .value for index 3
  //   if (index === 3) {
  //     newAddWebinarData[fieldIndex].value = value;
  //   }

  //   dispatch(setAddWebinarData(newAddWebinarData));
  // }

  function onDateValueChange(id, value, index) {
    const newAddWebinarData = cloneDeep(addWebinarData);
    const fieldIndex = newAddWebinarData.findIndex((el) => el.id === id);
    if (fieldIndex === -1) return;
    const field = newAddWebinarData[fieldIndex];

    // Si el campo tiene child.data, actualiza el valor en el array
    if (field?.child?.data && Array.isArray(field.child.data)) {
      field.child.data = [...field.child.data];
      if (field.child.data[index]) {
        field.child.data[index] = { ...field.child.data[index], value };
      }
      // También actualiza el valor principal si corresponde
      if (index === 3 && value) {
      if (typeof value === "string") {
        field.value = value;
      } else if (value.utcDateTime) {
        field.value = value.utcDateTime;
      } else {
        const parsed = dayjs(value);
        field.value = parsed.isValid() ? parsed.toISOString() : null;
      }
    }

    // ✅ Timezone field (index 4)
    if (index === 4 && value) {
      field.value = value.timezone || value;
    }
  } else {
    // For fields without child.data
    if (typeof value === "string") {
      field.value = value;
    } else if (value?.utcDateTime) {
      field.value = value.utcDateTime;
    } else {
      const parsed = dayjs(value);
      field.value = parsed.isValid() ? parsed.toISOString() : null;
    }
  }
    dispatch(setAddWebinarData(newAddWebinarData));
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
  // For pickADate, use the selected date or default to 30 days
        endDate = today.add(30, "day");
        break;
      default:
        // Default to 30 days for any other value
        endDate = today.add(30, "day");
    }

    return endDate.format("YYYY-MM-DD");
  }

  // Add the new mapAdObject function
  function mapAdObject() {
    const mappedFields = addWebinarData.map((item) => {
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

  // Handle duration field and its child data - This is key for startAt/expireAt
      if (item.id === "duration") {
        const startDate =
          item.child?.data?.[0]?.value || dayjs().format("YYYY-MM-DD");
        const endDate =
          item.child?.data?.[1]?.value || calculateEndDate(item.value);

        const adDurationInDays = dayjs(endDate).diff(dayjs(startDate), "day");

        return {
          duration: item.value,
          startAt: startDate,
          expireAt: endDate,
          adDurationInDays: adDurationInDays,
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

  function mapWebinarDetailObj() {
    const mappedFields = addWebinarData.map((item) => {
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

        const adDurationInDays = dayjs(endDate).diff(dayjs(startDate), "day");

        return {
          duration: item.value,
          startAt: startDate,
          expireAt: endDate,
          adDurationInDays: adDurationInDays,
        };
      }

  // Map callToAction to state for backend compatibility
      if (item.id === "callToAction") {
        return {
          state: String(itemValue || ""),
        };
      }

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
    const finalWebinarObject = {
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

    setWebinarDetails(finalWebinarObject);
    return finalWebinarObject;
  }

  function SingleMapWebinarDetailObj(responseData, addWebinarData) {
    const fieldMapping = {
      approach: "agenda",
      audience: "audienceTypes",
      banner: "banner",
      businessName: "businessName",
      callToAction: "callToAction",
      documents: "assets",
      faq: "faqs",
      font: "fontStyle",
      id: "callId",
      logo: "brandLogo",
      professionalType: "professions",
      setupAdType: "type",
      setupDate: "startDate",
      timeZone: "timeZone",
      setupDescription: "description",
      setupHeadline: "title",
      theme: "theme",
      url: "callToActionUrl",
    };

    return addWebinarData.map((field) => {
      const responseKey = fieldMapping[field.id];
      return {
        ...field,
        value: responseKey ? responseData[responseKey] || "" : field.value,
      };
    });
  }

  useEffect(() => {
    if (!id) return;

    async function getSingleWebinarData() {
      try {
        const response = await getSingleWebinar(id);
        setIsEdit(true);
        setSingleWebinar(response?.data);
        setParticipants(response?.data?.totalParticipants);
        setDuration(response?.data?.totalDurationInMinutes);
        const updatedFormData = SingleMapWebinarDetailObj(
          response?.data,
          addWebinarData
        );
        dispatch(setAddWebinarData(updatedFormData));

        // handle your response here
      } catch (error) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error?.message || "Failed to fetch webinar",
          })
        );
      }
    }

    getSingleWebinarData();
  }, [id]);

  async function addWebinar(webinarDetails) {
    setSpinerLoading(true);
    try {
      // Create a deep copy of webinarDetails to avoid mutations
      const processedDetails = JSON.parse(JSON.stringify(webinarDetails));

      // Ensure specific fields are always arrays
      const arrayFields = ["audience", "professionalType", "documents", "faq"];
      arrayFields.forEach((field) => {
        if (field in processedDetails) {
          // If the field exists, ensure it's an array
          processedDetails[field] = Array.isArray(processedDetails[field])
            ? processedDetails[field]
            : processedDetails[field]
            ? [processedDetails[field]]
            : [];
        }
      });

      // Ensure adType is set
      if (!processedDetails.adType) {
        console.warn("No adType specified, defaulting to 'promotional'");
        processedDetails.adType = "promotional";
      }

      // Process other fields
      Object.keys(processedDetails).forEach((key) => {
        if (!arrayFields.includes(key)) {
          // Convert non-array fields to strings
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
      const payload = {
        type: processedDetails?.setupAdType,
        title: processedDetails?.setupHeadline,
        description: processedDetails?.setupDescription,
        mediaFile: processedDetails?.logo,
        totalParticipants: webinarFee?.totalParticipants,
        totalDurationInMinutes: webinarFee?.totalDurationInMinutes,
        totalFees: webinarFee?.fees,
        totalServicesFees: webinarFee?.servicesFees,
        startDate: processedDetails?.setupDate,
        timeZone: processedDetails?.timeZone || "UTC",
        audienceTypes: processedDetails?.audience,
        professions: processedDetails?.professionalType,
        assets: processedDetails?.documents,
        businessName: processedDetails?.businessName,
        brandLogo: processedDetails?.logo,
        adDurationInDays: +processedDetails?.adDurationInDays,
        banner: processedDetails?.banner,
        theme: processedDetails?.theme,
        fontStyle: processedDetails?.fontStyle,
        agenda: processedDetails?.approach,
        faqs: processedDetails?.faq,
        callToAction: processedDetails?.callToAction,
        url: processedDetails?.url,
      };

      // Use mapAdObject to get the properly mapped ad details
      const mappedAdDetails = mapAdObject();
      const jobPayload = {
        data: {
          type: "create_advertisement",
          adType: mappedAdDetails?.setupAdType,
          webinar: { id: webinarId },
          headline: mappedAdDetails?.setupHeadline,
          description: mappedAdDetails?.setupDescription,
          audience: mappedAdDetails?.audience,
          professionalType: mappedAdDetails?.professionalType,
          documents: mappedAdDetails?.documents,
          businessName: mappedAdDetails?.businessName,
          logo: mappedAdDetails?.logo,
          duration: +mappedAdDetails?.adDurationInDays,
          startAt: mappedAdDetails?.startAt, // Now properly included
          expireAt: mappedAdDetails?.expireAt, // Now properly included
          banner: mappedAdDetails?.banner,
          theme: mappedAdDetails?.theme,
          font: mappedAdDetails?.fontStyle,
          approach: mappedAdDetails?.approach,
          faq: mappedAdDetails?.faq,
          callToAction: mappedAdDetails?.callToAction,
          url: mappedAdDetails?.url,
          totalDays: adFee?.totalDays,
          totalBudget: adFee?.fees,
          totalServiceFees: adFee?.servicesFees,
          isActive: true,
          state: "active",
          status: "active",
          active: true,
          published: true,
          visible: true,
          displayOnDashboard:
            mappedAdDetails.displayOnDashboard !== undefined
              ? mappedAdDetails.displayOnDashboard
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
      // dispatch(setLoading(true));

      if (isEdit) {
        // const response = await editWebinarUrl(id, payload);
        const response = await postAdUrl(jobPayload);
        console.log("🚀 ~ addWebinar ~ response:", response);
        dispatch(setAdsResponse(response?.data?.data));
        if (response?.data) {
          setOpenPaymentDialog(true);
        }
      } else {
        const response = await addWebinarUrl(payload);
        console.log("🚀 ~ addWebinar ~ response:", response);
        dispatch(setWebinarResponse(response?.data));
        if (response?.data) {
          setSpinerLoading(false);
        }
        if (response?.data) {
          setSpinerLoading(false);
          setOpenPaymentDialog(true);
        }
      }

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("webinar.webinar_saved_successfully"),
        })
      );

      // setPage(0);
      // dispatch(setAddWebinarData(AD_QUESTIONS));

      // If the ad type is learning, navigate to the learning section
      // if (webinarDetails.type === "learningSolution") {
      //   navigate("/" + ROUTES.learning);
      // } else {
      //   // Add a small delay to ensure the backend has processed the ad
      //   // setTimeout(() => {
      //   //   window.location.href = "/" + ROUTES.dashboard;
      //   // }, 1500);
      // }
    } catch (err) {
      setSpinerLoading(false);

      console.error("Error posting ad:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      setSpinerLoading(false);

      // dispatch(setLoading(false));
    }
  }

  function onSubmit() {
    addWebinar(webinarDetails);
    setOpenSubmitDialog(false);
  }

  function handlePreview() {
    mapWebinarDetailObj();
    setShowPreview(true);
  }

  function onWebinarPreview() {
    const currentAdType = addWebinarData.find(
      (field) => field.id === "adType"
    )?.value;

    const blankDataIndex = addWebinarData.findIndex(
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

// Key for localStorage
const WEBINAR_FORM_KEY = "webinarFormState";

// Restore state on mount
useEffect(() => {
  const saved = localStorage.getItem(WEBINAR_FORM_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.addWebinarData) dispatch(setAddWebinarData(parsed.addWebinarData));
    if (parsed.participants !== undefined) setParticipants(parsed.participants);
    if (parsed.duration !== undefined) setDuration(parsed.duration);
    if (parsed.activeTab !== undefined) setActiveTab(parsed.activeTab);
  }
}, []);

// Save state every time it changes
useEffect(() => {
  localStorage.setItem(WEBINAR_FORM_KEY, JSON.stringify({
    addWebinarData,
    participants,
    duration,
    activeTab
  }));
}, [addWebinarData, participants, duration, activeTab]);

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
      if (item.id === "callToAction") {
        return {
          state: String(itemValue || ""),
        };
      }

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

  const selectedProfessions = useMemo(() => {
    return (
      webinarField.find((item) => item.id === "professionalType")?.value || []
    );
  }, [webinarField]);

  const startAt = useMemo(() => {
    return (
      webinarField
        .find((item) => item.id === "duration")
        ?.child?.data?.find((item) => item.id === "startAt")?.value || ""
    );
  }, [webinarField]);

  const expireAt = useMemo(() => {
    return (
      webinarField
        .find((item) => item.id === "duration")
        ?.child?.data?.find((item) => item.id === "expireAt")?.value || ""
    );
  }, [webinarField]);

  function onValueAdsChange(id, value) {
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

  function onDateValueAdsChange(id, value, index) {
    setLastChangedFieldId(id);
    const newPostAdData = cloneDeep(postAdData);
    const fieldIndex = newPostAdData.findIndex((el) => el.id === id);
    if (index === 0) {
      newPostAdData[fieldIndex].child.data[index + 1].value = "";
    }
    newPostAdData[fieldIndex].child.data[index].value = value;
    dispatch(setPostAdData(newPostAdData));
  }

  function onDateValueWebinarChange(id, value, index) {
    setLastChangedFieldId(id);
    const newWebinarData = cloneDeep(addWebinarData);
    console.log("helo", newWebinarData)
    const fieldIndex = newWebinarData.findIndex((el) => el.id === id);
    if (index === 0) {
      newWebinarData[fieldIndex].child.data[index + 1].value = "";
    }
    newWebinarData[fieldIndex].child.data[index].value = value;
    dispatch(setAddWebinarData(newWebinarData));
  }
  // const debouncedCalculateFee = useMemo(
  //   () =>
  //     debounce(async (payload) => {
  //       try {
  //         setSpinerLoading(true);
  //         const response = await postAdsCalculatefee(payload);
  //         if (response) {
  //           setSpinerLoading(false);
  //         }
  //       } catch (error) {
  //         setSpinerLoading(false);
  //         console.error("API error:", error);
  //       }
  //     }, 800),
  //   [] // 800ms delay
  // );

  const debouncedCalculateFee = useMemo(
    () =>
      debounce(async (payload) => {
        try {
          setSpinerLoading(true);
          const response = await postAdsCalculatefee(payload);
          if (response) {
            setSpinerLoading(false);

            // ✅ Store response
            setAdFee(response?.data);

            // ✅ Handle currency conversion
            if (ipLocation?.currency) {
              try {
                const allData = await getExchangeRate();
                const rateString = allData?.data?.config?.value;
                const rates = JSON.parse(rateString);

                const totalUSD =
                  Number(response?.data.fees) +
                  Number(response?.data.servicesFees);

                const userCurrencyRate = rates[ipLocation.currency];
                const converted = Number(
                  (totalUSD * userCurrencyRate).toFixed(2)
                );

                setEditedConvertedTotal(converted);
              } catch (err) {
                console.error("Exchange rate error:", err);
              }
            }
          }
        } catch (error) {
          setSpinerLoading(false);
          console.error("API error:", error);
          setAdFee({});
          setEditedConvertedTotal(null);
        }
      }, 800),
    [ipLocation] // include ipLocation in deps to keep it fresh
  );

  useEffect(() => {
    const isValidDateChange = !!startAt && !!expireAt;

    if (isValidDateChange && selectedProfessions.length > 0) {
      const payload = {
        startDate: startAt,
        endDate: expireAt,
        totalNumberOfProfessionalTypes: selectedProfessions.length,
      };

      debouncedCalculateFee(payload);
    }
  }, [startAt, expireAt]);

  // useEffect(() => {
  //   const shouldCallAPI =
  //     selectedProfessions.length > 0 &&
  //     Boolean(startAt) &&
  //     Boolean(expireAt) &&
  //     ["professionalType", "duration", "startAt", "expireAt"].includes(
  //       lastChangedFieldId
  //     );

  //   if (shouldCallAPI) {
  //     const payload = {
  //       startDate: startAt,
  //       endDate: expireAt,
  //       totalNumberOfProfessionalTypes: selectedProfessions.length,
  //     };

  //     debouncedCalculateFee(payload);
  //   }
  // }, [selectedProfessions, startAt, expireAt, lastChangedFieldId]);

  useEffect(() => {
    // Auto-sync values from indices 0,1,2 to indices 4,5,6 based on label match
    const syncValues = () => {
      const sourceIndices = [0, 1, 2]; // Setup fields
      const targetIndices = [4, 5, 6]; // Webinar fields

      let hasChanges = false;
      const updatedData = [...addWebinarData];

      sourceIndices.forEach((sourceIndex, i) => {
        const targetIndex = targetIndices[i];

        // Check if both indices exist in the array
        if (updatedData[sourceIndex] && updatedData[targetIndex]) {
          const sourceField = updatedData[sourceIndex];
          const targetField = updatedData[targetIndex];

          // Check if labels match (using label or title)
          const sourceLabel = sourceField.label || sourceField.title;
          const targetLabel = targetField.label || targetField.title;

          if (
            sourceLabel === targetLabel &&
            sourceField.value !== targetField.value
          ) {
            // Sync the value from source to target
            updatedData[targetIndex] = {
              ...targetField,
              value: sourceField.value,
            };
            hasChanges = true;
          }
        }
      });

      // Only update Redux if there are actual changes
      if (hasChanges) {
        dispatch(setAddWebinarData(updatedData));
      }
    };

    // Run sync when addWebinarData changes
    if (addWebinarData.length > 6) {
      syncValues();
    }
  }, [addWebinarData, dispatch]);

  const onValueChangeWithSync = (id, value) => {
    // First, update the field normally
    dispatch(setAddWebinarDataValue({ id, value }));

    // Then check if this is one of the source fields (indices 0,1,2) and sync
    const currentFieldIndex = addWebinarData.findIndex(
      (field) => field.id === id
    );
    const sourceIndices = [0, 1, 2];
    const targetIndices = [4, 5, 6];

    if (sourceIndices.includes(currentFieldIndex)) {
      const sourceIndexPosition = sourceIndices.indexOf(currentFieldIndex);
      const targetIndex = targetIndices[sourceIndexPosition];

      if (addWebinarData[targetIndex]) {
        const sourceField = addWebinarData[currentFieldIndex];
        const targetField = addWebinarData[targetIndex];

        // Check if labels match
        const sourceLabel = sourceField.label || sourceField.title;
        const targetLabel = targetField.label || targetField.title;

        if (sourceLabel === targetLabel) {
          // Sync the value to target field
          setTimeout(() => {
            dispatch(setAddWebinarDataValue({ id: targetField.id, value }));
          }, 0);
        }
      }
    }
  };

  useEffect(() => {
    getWebinars();
  }, []);

  const getWebinars = async () => {
    try {
      let webinarList = await getAllWebinars();
      setWebinars(webinarList?.data?.data);
      if (webinarList?.data?.data?.length > 0) {
        const now = new Date();

        // Filter only upcoming webinars
        const upcomingWebinars = webinarList?.data?.data.filter(
          (webinar) => new Date(webinar.startDate) > now
        );

        // Sort by soonest date
        upcomingWebinars.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );

        // Get the first (soonest) upcoming webinar
        setUpcomingWebinar(upcomingWebinars[0]);
      }
    } catch (err) {
      console.log("Failed to get webinars!");
    }
  };

  const handleStartCall = () => {
    navigate("/webinar/start-live-call", {
      state: { webinar: upcomingWebinar },
    });
  };

 // Synchronize openPaymentDialog with the actual payment status
  useEffect(() => {
    if ((paymentStatus === true || paymentStatus === 'paid') && !openPaymentDialog) {
      setOpenPaymentDialog(true);
    }
  }, [paymentStatus, openPaymentDialog]);

  if (showPreview) {
    return (
      <PreviewWebinarDetails
        webinarDetails={webinarDetails}
        handleAdEdit={onEdit}
        handleAdSubmit={onSubmit}
        openPaymentDialog={openPaymentDialog}
        handleClosePayment={handleClosePayment}
        openSubmitDialog={openSubmitDialog}
        setOpenSubmitDialog={setOpenSubmitDialog}
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
                }}
              >
                

                <Tab label={t("webinar.set_up_webinar")} disabled={activeTab !== 0} />
                <Tab label={t("webinar.basic_information")} disabled={activeTab === 0 || !(openPaymentDialog || paymentStatus === true || paymentStatus === 'paid')} />
                <Tab label={t("webinar.design_tab")} disabled={activeTab === 0 || !(openPaymentDialog || paymentStatus === true || paymentStatus === 'paid')} />
                
              </Tabs>
            )}

         {isMobile ? (
           <>
             {/* Paso 1: Setup y pago */}
             {activeTab === 0 && (
               <Box sx={{ width: "100%", mx: "auto" }}>
                 <MuiTypography variant="h2" sx={{ mb: 3 }}>
                   {t("webinar.create_webinar")}
                 </MuiTypography>
                 {webinars.length > 0 && (
                   <SubmitButton onClick={handleStartCall}>
                     {t("webinar.start_live_call")}
                   </SubmitButton>
                 )}
                 <MobileSetUpWebinar
                   webinarField={setupField}
                   onValueChange={onValueChange}
                   onDateValueChange={onDateValueChange}
                   onWebinarPreview={onWebinarPreview}
                   webinars={webinars}
                   handleStartCall={handleStartCall}
                   onSave={
                     isEdit
                       ? () => {
                           if (openPaymentDialog) setActiveTab(1);
                         }
                       : async () => {
                           const webinarDetails = mapWebinarDetailObj();
                           await addWebinar(webinarDetails);
                           setOpenPaymentDialog(true);
                         }
                   }
                   onCancel={() => {
                     dispatch(setAddWebinarData(AD_QUESTIONS));
                     navigate("/" + ROUTES.dashboard);
                   }}
                   t={t}
                   isEdit={isEdit}
                   webinarFee={webinarFee}
                   duration={duration}
                   participants={participants}
                   totalParticipantMinutes={totalParticipantMinutes}
                   resultAdsFee={resultAdsFee}
                   adsFeeCalculation={adsFeeCalculation}
                   setAdsFeeCalculation={setAdsFeeCalculation}
                   setParticipants={setParticipants}
                   setDuration={setDuration}
                   handleClosePayment={handleClosePayment}
                   openPaymentDialog={openPaymentDialog}
                   currency={ipLocation?.currency}
                   currentUserCurrency={user?.user?.country?.currency}
                   convertedTotal={convertedTotal}
                 />
               </Box>
             )}
             {/* Paso 2: Basic + Design juntos, solo si ya pagó */}
             {activeTab === 1 && (openPaymentDialog || paymentStatus === true || paymentStatus === 'paid') && (
               <Box sx={{ width: "100%", mx: "auto" }}>
                 <MobileAddWebinar
                   webinarField={[
                     ...webinarField,
                     ...designField,
                   ]}
                   page={page}
                   onValueChange={onValueChange}
                   onDateValueChange={onDateValueAdsChange}
                   onWebinarPreview={onWebinarPreview}
                   goToPreviousStep={goToPreviousStep}
                   goToNextStep={goToNextStep}
                   handlePageChange={handlePageChange}
                   t={t}
                   resultAdsFee={resultAdsFee}
                   currency={ipLocation?.currency}
                   convertedTotal={convertedTotal}
                   onUseMyProfileData={undefined}
                 />
               </Box>
             )}
           </>
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
                    <DesktopSetUpWebinar
                      webinarField={setupField}
                      onValueChange={onValueChange}
                      // onValueChange={onValueChangeWithSync}
                      onDateValueChange={onDateValueChange}
                      onWebinarPreview={onWebinarPreview}
                      // onSave={() => setActiveTab(1)}
                      webinars={webinars}
                      handleStartCall={handleStartCall}
                      onSave={
                        isEdit
                          ? () => {
                              if (openPaymentDialog) setActiveTab(1);
                            }
                          : () => {
                              const webinarDetails = mapWebinarDetailObj();
                              addWebinar(webinarDetails);
                              // Advance to tab 1 only if openPaymentDialog is true
                            }
                      }
                      onCancel={() => {
                        dispatch(setAddWebinarData(AD_QUESTIONS));
                        navigate("/" + ROUTES.dashboard);
                      }}
                      t={t}
                      isEdit={isEdit}
                      webinarFee={webinarFee}
                      duration={duration}
                      participants={participants}
                      totalParticipantMinutes={totalParticipantMinutes}
                      resultAdsFee={resultAdsFee}
                      adsFeeCalculation={adsFeeCalculation}
                      setAdsFeeCalculation={setAdsFeeCalculation}
                      setParticipants={setParticipants}
                      setDuration={setDuration}
                      handleClosePayment={handleClosePayment}
                      openPaymentDialog={openPaymentDialog}
                      currency={ipLocation?.currency}
                      currentUserCurrency={user?.user?.country?.currency}
                      convertedTotal={convertedTotal}
                    />
                  </Box>
                </MuiTabPanel>

                <MuiTabPanel value={activeTab} index={1}>
                  <Box
                    sx={{
                      width: { xs: "100%", lg: "70%" },
                      mx: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <DesktopAddWebinar
                      setupField={setupField}
                      webinarField={webinarField}
                      onValueChange={onValueChange}
                      onDateValueChange={onDateValueWebinarChange}
                      onWebinarPreview={onWebinarPreview}
                      // onSave={() => {
                      //   const webinarDetails = mapWebinarDetailObj();
                      //   addWebinar(webinarDetails);
                      // }}
                      onSave={() => setActiveTab(1 + 1)}
                      onCancel={() => {
                        dispatch(setAddWebinarData(AD_QUESTIONS));
                        navigate("/" + ROUTES.dashboard);
                      }}
                      t={t}
                      isEdit={isEdit}
                      activeTab={activeTab}
                      resultAdsFee={resultAdsFee}
                      adsFeeCalculation={adsFeeCalculation}
                      setAdsFeeCalculation={setAdsFeeCalculation}
                      handleClosePayment={handleClosePayment}
                      openPaymentDialog={openPaymentDialog}
                      currency={ipLocation?.currency}
                      currentUserCurrency={user?.user?.country?.currency}
                      convertedTotal={convertedTotal}
                      editedConvertedTotal={editedConvertedTotal}
                    />
                    {/* <DesktopPostAd
                      adField={adField}
                      onValueChange={onValueAdsChange}
                      onDateValueChange={onDateValueAdsChange}
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
                        navigate("/" + ROUTES.myAds);
                      }}
                      t={t}
                      isEdit={isEdit}
                      resultAdsFee={resultAdsFee}
                      adsFeeCalculation={adsFeeCalculation}
                      setAdsFeeCalculation={setAdsFeeCalculation}
                      handleClosePayment={handleClosePayment}
                      openPaymentDialog={openPaymentDialog}
                      currency={ipLocation?.currency}
                      currentUserCurrency={user?.user?.country?.currency}
                      convertedTotal={convertedTotal}
                    /> */}
                  </Box>
                </MuiTabPanel>

                <MuiTabPanel value={activeTab} index={2}>
                  <Box
                    sx={{
                      width: { xs: "100%", lg: "70%" },
                      mx: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <DesktopDesignTab
                      onPreview={onWebinarPreview}
                      onSave={() => {
                        const webinarDetails = mapWebinarDetailObj();
                        addWebinar(webinarDetails);
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
              </>
            )}
          </>
        )}
      </Box>
      {spinerloading && <SpinnerLoader />}
    </Box>
  );
}

export default AddWebinar;
