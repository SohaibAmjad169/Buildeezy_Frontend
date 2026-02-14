import { useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";

import { ROUTES } from "../../utils/constants/route";
import { RESET_PASSWORD } from "../../utils/constants/login";
import { resetPasswordUrl } from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import MuiTypography from "../../components/common/MuiTypography";
import useValidation from "../../hooks/useValidation";
import { removeAll } from "../../utils/localStorageUtils";
import SubmitButton from "../../components/common/SubmitButton";
import NavigationBtn from "../../components/common/NavigationBtn";
import { ALERT_TYPE } from "../../utils/constants/config";
import FormFields from "../../components/common/FormFields";
import { encryptData } from "../../utils/encrypt";

function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { status, email } = location.state || "";
  const { loading } = useSelector((state) => state.config);

  const [initLoad, setInitLoad] = useState(true);
  const [formData, setFormData] = useState(RESET_PASSWORD);
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
    const fieldIndex = newFormData.findIndex((el) => el.id === id);
    newFormData[fieldIndex].value = value;
    newFormData[fieldIndex].validation.error = error;
    newFormData[fieldIndex].validation.valid = error === "" ? true : false;
    setFormData(newFormData);
  }

  async function handleResetPassword() {
    setInitLoad(false);
    const validatedFormData = validateData(formData);
    setFormData(validatedFormData);
    const isFormValid = isValidData(validatedFormData);
    //validate passwords
    if (!isFormValid) {
      return;
    }
    //compare password and confirm passwords
    if (formData[0].value !== formData[1].value) {
      setError(t("login.passwords_not_match"));
      return;
    }

    const credPayload = {
      email,
      status,
      password: formData[0].value,
    };
    const resetPasswordPayload = {
      data: {
        type: "change_password",
        credentials: encryptData(credPayload),
      },
    };

    try {
      dispatch(setLoading(true));
      const response = await resetPasswordUrl(resetPasswordPayload);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: response.data.message,
        })
      );
      removeAll();
      navigate("/" + ROUTES.login, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <>
      <MuiTypography variant="h1" sx={{ mb: 1 }}>
        {t("login.reset_password")}
      </MuiTypography>
      <MuiTypography variant="h4" sx={{ mb: 4 }}>
        {t("login.enter_new_password")}
      </MuiTypography>
      {formData.map(({ id, placeholder, type, value, validation }) => (
        <Box sx={{ mt: 2 }} key={id}>
          <FormFields
            id={id}
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
            type={type}
            validation={validation}
            initLoad={initLoad}
          />
        </Box>
      ))}
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}

      <SubmitButton
        sx={{
          mt: 4,
          mb: 2,
        }}
        onClick={handleResetPassword}
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

export default ResetPassword;
