import { useState, useEffect, useCallback } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

import MuiTypography from "../../components/common/MuiTypography";
import CancelRegistrationLink from "../../components/login/CancelRegistrationLink";
import NavigationBtn from "../../components/common/NavigationBtn";
import { onboardingQuestions } from "../../utils/constants/onboarding";
import OnboardingWizard from "../../components/onboardingQuestions/OnboardingWizard";
import {
  setQuestionValidation,
  setQuestionWizard,
} from "../../redux/onboardingSlice";
import { cloneDeep, isEmpty } from "lodash";
import { ROUTES } from "../../utils/constants/route";
import SubmitButton from "../../components/common/SubmitButton";
import {
  getProductCategoriesUrl,
  getUserCategoriesByTypeUrl,
  updateProfileUrl,
} from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setLocalStorage } from "../../utils/localStorageUtils";
import { USER_DATA } from "../../utils/constants/auth";
import { USER_TYPES } from "../../utils/constants/login";
import QuestionSkeleton from "../../components/skeleton/QuestionSkeleton";
import { validateHours } from "../../utils/common";
import { setProfileData } from "../../redux/profileSlice";

function Onboarding() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userType } = location.state || USER_TYPES.client;

  const { loading } = useSelector((state) => state.config);
  const { questionWizard } = useSelector((state) => state.onboarding);

  const [step, setStep] = useState(0);

  const updateConSpeOptions = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const categories = await getUserCategoriesByTypeUrl(userType);
      const newQuestions = cloneDeep(onboardingQuestions[userType]);
      newQuestions[0].options = categories.data.data.map((item) => ({
        id: item.id,
        label: item.label,
      }));
      dispatch(setQuestionWizard(newQuestions));
    } catch (err) {
      const fallbackQuestions = cloneDeep(onboardingQuestions[userType]);
      dispatch(setQuestionWizard(fallbackQuestions));
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
  }, [dispatch, userType]);

  const updateVendorOptions = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      const [categories, profession] = await Promise.all([
        getUserCategoriesByTypeUrl(userType),
        getProductCategoriesUrl(),
      ]);

      const newQuestions = cloneDeep(onboardingQuestions[userType]);
      newQuestions[0].options = categories.data.data.map((item) => ({
        id: item.id,
        label: item.label,
      }));
      newQuestions[1].options = profession.data.data.map((item) => ({
        id: item.id,
        label: item.label,
      }));
      dispatch(setQuestionWizard(newQuestions));
    } catch (err) {
      const fallbackQuestions = cloneDeep(onboardingQuestions[userType]);
      dispatch(setQuestionWizard(fallbackQuestions));
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
  }, [dispatch, userType]);

  useEffect(() => {
    if (userType) {
      if (userType === USER_TYPES.client) {
        dispatch(setQuestionWizard(onboardingQuestions[userType]));
      } else if (userType === USER_TYPES.vendor) {
        updateVendorOptions();
      } else {
        updateConSpeOptions();
      }
    }
  }, [userType, dispatch, updateVendorOptions, updateConSpeOptions]);

  function handleBack() {
    if (step > 0) {
      const activeQue = questionWizard[step];
      if (activeQue.validation?.required) {
        dispatch(setQuestionValidation({ step, isValid: true }));
      }
      setStep((prevState) => prevState - 1);
    }
  }

function handleNext() {
  if (step < questionWizard.length - 1) {
    const activeQue = questionWizard[step];

    if (activeQue.validation?.required) {
      let isValid = true;
      let errorMessage = "";

      if (activeQue.id === "openingHours") {
        // ✅ handle both array and single object
        const hoursEntries = Array.isArray(activeQue.value)
          ? activeQue.value
          : activeQue.value
          ? [activeQue.value]
          : [];

        isValid =
          hoursEntries.length > 0 &&
          hoursEntries.every(
            (hour) =>
              Array.isArray(hour.daysOfWeek) &&
              hour.daysOfWeek.length > 0 &&
              typeof hour.startTime === "string" &&
              hour.startTime.trim() !== "" &&
              typeof hour.endTime === "string" &&
              hour.endTime.trim() !== ""
          );

        errorMessage = t("errors.required_opening_hours");
      } else if (Array.isArray(activeQue.value)) {
        // ✅ for array-type fields (multi-select, checkboxes, etc.)
        isValid = activeQue.value.length > 0;
        errorMessage =
          activeQue.validation.error || t("errors.field_required");
      } else if (
        typeof activeQue.value === "object" &&
        activeQue.value !== null
      ) {
        // ✅ object-type fields (e.g., address form)
        isValid = Object.values(activeQue.value).some(
          (value) => value !== null && value !== ""
        );
        errorMessage =
          activeQue.validation.error || t("errors.field_required");
      } else {
        // ✅ simple text/number fields
        isValid = activeQue.value !== null && activeQue.value !== "";
        errorMessage =
          activeQue.validation.error || t("errors.field_required");
      }

      if (!isValid) {
        dispatch(setQuestionValidation({ step, isValid: false }));
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: errorMessage,
          })
        );
        return;
      }
    }

    setStep((prevState) => prevState + 1);
  }
}

  function onValueChange(id, value) {
    const newQuestionWizard = cloneDeep(questionWizard);
    if (
      id === "pastClients" &&
      value.length === 1 &&
      value[0].phoneNumber.length <= 6 &&
      !value[0].name &&
      !value[0].email
    ) {
      newQuestionWizard[step].value = "";
    } else if (id === "avatar" || id === "verificationDoc") {
      newQuestionWizard[step].value = value(newQuestionWizard[step].value);
    } else {
      newQuestionWizard[step].value = value;
    }

    if (newQuestionWizard[step].validation) {
      newQuestionWizard[step].validation.valid = true;
    }
    dispatch(setQuestionWizard(newQuestionWizard));
  }

  async function completeProfile() {
  // Validate all required fields
  const requiredFields = questionWizard.filter((q) => q.validation?.required);

  // Track invalid fields immutably
  const invalidFields = requiredFields
    .map((q) => {
      let isValid = true;
      let errorMessage = "";

      console.log(q.id, "========");

      if (q.id === "openingHours") {
        isValid = validateHours(q.value);
        console.log(isValid)
        errorMessage = t("errors.required_opening_hours");
      } else if (Array.isArray(q.value)) {
        isValid = q.value.length > 0;
        errorMessage = t("errors.select_at_least_one", { field: q.title.toLowerCase() });
      } else if (typeof q.value === "object" && q.value !== null) {
        isValid = Object.values(q.value).some(
          (value) => value !== null && value !== ""
        );
        errorMessage = t("errors.fill_in_field", { field: q.title.toLowerCase() });
      } else {
        isValid = q.value !== null && q.value !== "";
        errorMessage = t("errors.select_field", { field: q.title.toLowerCase() });
      }

      if (!isValid) {
        // ✅ return a new object with validation error without mutating
        return { ...q, validation: { ...q.validation, error: errorMessage } };
      }

      return null;
    })
    .filter(Boolean);

  if (invalidFields.length > 0) {
    // Show the first invalid field's error message
    const firstInvalidField = invalidFields[0];
    dispatch(
      setAlert({
        show: true,
        type: ALERT_TYPE.error,
        message:
          firstInvalidField.validation.error ||
          t("errors.fill_in_all_required_fields"),
      })
    );
    return;
  }

  // Transform questionWizard data for submission
  const questionData = questionWizard.map((item) => {
    if (item.id === "openingHours" && Array.isArray(item.value)) {
      const filteredHours = item.value.filter(
        (hour) =>
          Array.isArray(hour.daysOfWeek) &&
          hour.daysOfWeek.length > 0 &&
          hour.startTime &&
          hour.endTime
      );
      return { [item.id]: filteredHours };
    } else if (item.id === "openingHours" && typeof item.value === "object") {
      const hoursArray = Object.entries(item.value)
        .filter(([key]) => key.startsWith("openingHours"))
        .map(([, val]) => ({
          daysOfWeek: val.daysOfWeek,
          startTime: val.startTime,
          endTime: val.endTime,
        }));
      return { [item.id]: hoursArray };
    }

    return { [item.id]: item.value };
  });

  const questionPayload = Object.assign({}, ...questionData);

  // --- PATCH: Move additional fields into correct additionalInfo object ---
  let additionalInfoKey = null;
  if (userType === USER_TYPES.contractor) additionalInfoKey = "contractorAdditionalInfo";
  if (userType === USER_TYPES.specialist) additionalInfoKey = "specialistAdditionalInfo";
  if (userType === USER_TYPES.vendor) additionalInfoKey = "vendorAdditionalInfo";

  let additionalInfo = {};
  [
    "contactType",
    "preferContactedTime",
    "currency",
    "professionalAffiliations",
    "companyDetails",
    "sellingProductType",
    "isDeliver",
    "category",
    "experienceLevel",
    "verificationType",
    "verificationDoc",
    "pastClients",
  ].forEach((key) => {
    if (questionPayload[key] !== undefined) {
      additionalInfo[key] = questionPayload[key];
      delete questionPayload[key];
    }
  });

  const profilePayload = {
    data: {
      type: "user_profile",
      ...questionPayload,
      ...additionalInfo,
      ...(additionalInfoKey ? { [additionalInfoKey]: additionalInfo } : {}),
    },
  };

  try {
    dispatch(setLoading(true));
    const response = await updateProfileUrl(profilePayload);

    setLocalStorage(USER_DATA, { user: response.data.data }, true);
    dispatch(setProfileData(response.data.data));
    dispatch(
      setAlert({
        show: true,
        type: ALERT_TYPE.success,
        message: response.data.message,
      })
    );

    navigate("/" + ROUTES.dashboard, { replace: true });
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


  if (!userType) {
    return <Navigate to={`/${ROUTES.register}`} />;
  }
  return (
    <>
      <Box>
        <MuiTypography variant="h1" sx={{ mb: 1 }}>
          {t("login.signup_title")}
        </MuiTypography>
        <MuiTypography variant="h4" sx={{ mb: 4 }}>
          {t("login.onboarding_subtitle")}
        </MuiTypography>

        {questionWizard.length > 0 && !isEmpty(questionWizard[step]) && !loading ? (
          <OnboardingWizard
            id={questionWizard[step].id}
            title={questionWizard[step].title}
            subtitle={questionWizard[step].subtitle}
            placeholder={questionWizard[step].placeholder}
            questionType={questionWizard[step].type}
            options={questionWizard[step].options}
            value={questionWizard[step].value}
            fileTypes={questionWizard[step].fileTypes}
            onValueChange={onValueChange}
            validation={questionWizard[step].validation}
          />
        ) : (
          <QuestionSkeleton />
        )}

        <CancelRegistrationLink sx={{ mt: 3 }} />
      </Box>

      {step === questionWizard.length - 1 && (
        <SubmitButton
          onClick={completeProfile}
          loading={loading}
          disabled={loading}
          sx={{
            my: 2,
          }}
        >
          {t("onboarding.complete")}
        </SubmitButton>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          mb: 4,
        }}
      >
        <NavigationBtn
          onClick={handleBack}
          disabled={loading || step === 0}
          sx={{
            position: { lg: "absolute" },
            left: { lg: "9%" },
            bottom: "9%",
          }}
        />
        <NavigationBtn
          onClick={handleNext}
          type="next"
          disabled={loading || step === questionWizard.length - 1}
          sx={{
            position: { lg: "absolute" },
            right: { lg: "9%" },
            bottom: "9%",
          }}
        />
      </Box>
    </>
  );
}

export default Onboarding;
