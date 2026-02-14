import { useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";

import { ROUTES } from "../../utils/constants/route";
import { REACTIVATE_ACCOUNT } from "../../utils/constants/login";
import { reactivateAccountUrl } from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import MuiTypography from "../../components/common/MuiTypography";
import useValidation from "../../hooks/useValidation";
import SubmitButton from "../../components/common/SubmitButton";
import { ALERT_TYPE } from "../../utils/constants/config";
import FormFields from "../../components/common/FormFields";

function ReactivateAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const email = location.state.email || "";

  const { loading } = useSelector((state) => state.config);

  const [initLoad, setInitLoad] = useState(true);
  const [formData, setFormData] = useState(REACTIVATE_ACCOUNT);
  const [error, setError] = useState("");

  const { isValidData, validateData } = useValidation();

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

  async function handleReactiveAccount() {
    setInitLoad(false);

    const validatedFormData = validateData([formData]);
    setFormData(validatedFormData[0]);
    const isFormValid = isValidData(validatedFormData);

    if (!isFormValid) {
      return;
    }
    const reactivateAccountPayload = {
      data: {
        type: "reactive_account_request",
        email,
        reason: formData.value,
      }
    };

    try {
      dispatch(setLoading(true));
      const response = await reactivateAccountUrl(reactivateAccountPayload);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: response.data.message,
        })
      );
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
        {t("login.welcome_back")}
      </MuiTypography>
      <MuiTypography variant="h4" sx={{ mb: 4 }}>
        {t("login.reason_for_reactivation")}
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
          mt: 4,
          mb: 2,
        }}
        onClick={handleReactiveAccount}
        disabled={loading}
        loading={loading}
      >
        {t("submit")}
      </SubmitButton>
    </>
  );
}

export default ReactivateAccount;
