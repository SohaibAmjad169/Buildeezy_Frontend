import { useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";

import { ROUTES } from "../../utils/constants/route";
import { FORGOT_PASSWORD } from "../../utils/constants/login";
import { setLoading } from "../../redux/configSlice";
import MuiTypography from "../../components/common/MuiTypography";
import useValidation from "../../hooks/useValidation";
import SubmitButton from "../../components/common/SubmitButton";
import NavigationBtn from "../../components/common/NavigationBtn";
import { forgotPasswordUrl } from "../../apis/apiEndPoints";
import FormFields from "../../components/common/FormFields";

function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const updatePassword = location.state?.updatePassword || false;

  const { loading } = useSelector((state) => state.config);

  const [initLoad, setInitLoad] = useState(true);
  const [formData, setFormData] = useState(FORGOT_PASSWORD);
  const [error, setError] = useState("");

  const { isValidData, validateData } = useValidation();

  function navigateToLogin() {
    navigate("/" + ROUTES.login, { replace: true });
  }

  function onValueChange(id, value, error) {
    if (error) {
      setError("");
    }
    const newFormData = cloneDeep(formData);
    newFormData.value = value;
    newFormData.validation.error = error;
    newFormData.validation.valid = error === "" ? true : false;
    setFormData(newFormData);
  }

  async function onSubmitForgotPassword() {
    setInitLoad(false);

    const validatedFormData = validateData([formData]);
    setFormData(validatedFormData[0]);
    const isFormValid = isValidData(validatedFormData);

    if (!isFormValid) {
      return;
    }

    const forgotPasswordPayload = {
      data: {
        type: "forgot_password_request",
        email: formData.value,
      },
    };

    try {
      dispatch(setLoading(true));
      const response = await forgotPasswordUrl(forgotPasswordPayload);
      const token = response.data.token;

      navigate(
        "/" + ROUTES.forgotPasswordVerification,
        {
          state: {
            token,
            email: formData.value,
          },
        },
        { replace: true }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <>
      <MuiTypography variant="h1" sx={{ mb: 1 }}>
        {updatePassword
          ? t("login.update_password")
          : t("login.forgot_password")}
      </MuiTypography>
      <MuiTypography variant="h4" sx={{ mb: 3 }}>
        {t("login.forgot_password_subtitle")}
      </MuiTypography>
      <Box sx={{ mt: 2 }}>
        <FormFields
          id={formData.id}
          placeholder={formData.placeholder}
          value={formData.value}
          onValueChange={onValueChange}
          type={formData.type}
          validation={formData.validation}
          initLoad={initLoad}
        />
      </Box>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
      <SubmitButton
        sx={{
          mt: 2,
          mb: 2,
        }}
        onClick={onSubmitForgotPassword}
        disabled={loading}
        loading={loading}
      >
        {t("submit")}
      </SubmitButton>
      <Box
        sx={{
          position: { md: "absolute" },
          left: 70,
          bottom: 60,
        }}
      >
        <NavigationBtn onClick={navigateToLogin} />
      </Box>
    </>
  );
}

export default ForgotPassword;
