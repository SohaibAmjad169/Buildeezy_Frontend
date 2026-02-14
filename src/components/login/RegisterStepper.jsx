import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";

import { STEPS } from "../../utils/constants/login";
import NavigationBtn from "../common/NavigationBtn";
import AccountDetails from "./AccountDetails";
import AuthDetails from "./AuthDetails";
import useValidation from "../../hooks/useValidation";
import { setAccountDetails, setAuthDetails } from "../../redux/registerSlice";
import { setAlert, setLoading } from "../../redux/configSlice";
import {
  checkEmailAvailabilityUrl,
  checkPhoneAvailabilityUrl,
  sendOTPUrl,
} from "../../apis/apiEndPoints";
import MuiStepper from "../common/MuiStepper";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants/route";
import { ALERT_TYPE } from "../../utils/constants/config";
import { encryptData } from "../../utils/encrypt";

function RegisterStepper() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { loading } = useSelector((state) => state.config);
  const { accountDetails, authDetails, term, isSocialRegister } = useSelector(
    (state) => state.register
  );

  const [activeStep, setActiveStep] = useState(0);
  const [initLoad, setInitLoad] = useState(true);
  const [error, setError] = useState("");
  const [termError, setTermError] = useState("");

  const { isValidData, validateData } = useValidation();

  function updateEmailValidation(error, isValid) {
    const newAccountDetails = cloneDeep(accountDetails);
    const fieldIndex = newAccountDetails.findIndex((el) => el.id === "email");
    newAccountDetails[fieldIndex].validation.error = error;
    newAccountDetails[fieldIndex].validation.valid = isValid;
    dispatch(setAccountDetails(newAccountDetails));
  }
  const onCheckEmailValidity = async () => {
    try {
      dispatch(setLoading(true));
      const fieldIndex = accountDetails.findIndex((el) => el.id === "email");
      const email = accountDetails[fieldIndex].value;
      await checkEmailAvailabilityUrl(email);
      setInitLoad(true);
      setActiveStep((prevState) => prevState + 1);
    } catch (err) {
      updateEmailValidation(err.message, false);
    } finally {
      dispatch(setLoading(false));
    }
  };

  function updatePhoneValidation(error, isValid) {
    const newAuthDetails = cloneDeep(authDetails);
    const fieldIndex = newAuthDetails.findIndex(
      (el) => el.id === "phoneNumber"
    );
    newAuthDetails[fieldIndex].validation.error = error;
    newAuthDetails[fieldIndex].validation.valid = isValid;
    dispatch(setAuthDetails(newAuthDetails));
  }

  const onCheckPhoneValidity = async () => {
    try {
      dispatch(setLoading(true));
      const fieldIndex = authDetails.findIndex((el) => el.id === "phoneNumber");
      const phone = authDetails[fieldIndex].value;
      await checkPhoneAvailabilityUrl(phone);

      try {
        const fieldEmailIndex = accountDetails.findIndex(
          (el) => el.id === "email"
        );
        const fieldPhoneIndex = authDetails.findIndex(
          (el) => el.id === "phoneNumber"
        );
        const email = accountDetails[fieldEmailIndex].value;
        const phoneNumber = authDetails[fieldPhoneIndex].value;
        const otpPayload = {
          email,
          phoneNumber,
        };
        const sendOTPPayload = {
          data: {
            type: "otp_request",
            otpData: encryptData(otpPayload),
          },
        };
        dispatch(setLoading(true));
        const response = await sendOTPUrl(sendOTPPayload);
        const token = response.data.token;
        //navigate to otp verification
        navigate(
          "/" + ROUTES.registerVerification,
          {
            state: {
              token,
            },
          },
          { replace: true }
        );
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
    } catch (err) {
      updatePhoneValidation(err.message, false);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAccountDetailsSubmit = async () => {
    const validatedAccountDetails = validateData(accountDetails);
    dispatch(setAccountDetails(validatedAccountDetails));
    const isFormValid = isValidData(validatedAccountDetails);

    if (!isFormValid) {
      return;
    }
    onCheckEmailValidity();
  };

  const validateTerms = () => {
    if (!term) {
      setTermError(t("errors.invalid_term"));
    }
  };

  const handleAuthSubmit = async () => {
    setError("");
    const validatedAuthDetails = validateData(authDetails);
    dispatch(setAuthDetails(validatedAuthDetails));
    const isFormValid = isValidData(validatedAuthDetails);
    if (!isFormValid) {
      validateTerms();
      return;
    }
    //compare password and confirm passwords
    if (!isSocialRegister && authDetails[1].value !== authDetails[2].value) {
      const newAuthDetails = cloneDeep(authDetails);
      newAuthDetails[2].validation.error = t("login.passwords_not_match");
      newAuthDetails[2].validation.valid = false;
      dispatch(setAuthDetails(newAuthDetails));
      validateTerms();
      return;
    }

    if (!term) {
      validateTerms();
      return;
    }
    onCheckPhoneValidity();
  };

  const handleNext = () => {
    setInitLoad(false);

    switch (activeStep) {
      case 0:
        handleAccountDetailsSubmit();
        break;
      case 1:
        handleAuthSubmit();
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    setError("");
    setTermError("");

    // const validatedAccountDetails = validateData(accountDetails);
    // dispatch(setAccountDetails(validatedAccountDetails));

    // const validatedAuthDetails = validateData(authDetails);
    // dispatch(setAuthDetails(validatedAuthDetails));

    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <MuiStepper steps={STEPS} activeStep={activeStep} />

        {activeStep === 0 && (
          <AccountDetails initLoad={initLoad} errorMsg={error} />
        )}
        {activeStep === 1 && (
          <AuthDetails
            initLoad={initLoad}
            errorMsg={error}
            termError={termError}
          />
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
            disabled={activeStep === 0 || loading}
            sx={{ marginLeft: { xs: 0, lg: "-35%" } }}
          />
          <NavigationBtn
            onClick={handleNext}
            type="next"
            disabled={loading}
            sx={{ marginRight: { xs: 0, lg: "-35%" } }}
          />
        </Box>
      </Box>
    </>
  );
}
export default RegisterStepper;
