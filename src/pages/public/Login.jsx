import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ROUTES } from "../../utils/constants/route";
import SocialLogin from "../../components/login/SocialLogin";
import { LOGIN } from "../../utils/constants/login";
import MuiTypography from "../../components/common/MuiTypography";
import useValidation from "../../hooks/useValidation";
import SubmitButton from "../../components/common/SubmitButton";
import FormFields from "../../components/common/FormFields";
import CheckBox from "../../components/common/CheckBox";
import RegisterLink from "../../components/login/RegisterLink";
import { encryptData } from "../../utils/encrypt";
import useLogin from "../../hooks/useLogin";
import { setShowLogoLeft } from "../../redux/configSlice";
import MuiActionDialog from "../../components/common/MuiActionDialog";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login({ isAdmin = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.config);

  const [initLoad, setInitLoad] = useState(true);
  const [loginWithEmail, setLoginWithEmail] = useState(isAdmin);
  const [formData, setFormData] = useState(LOGIN);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const { isValidData, validateData } = useValidation();
  const {
    loginError,
    onLogin,
    onAdminLogin,
    setLoginError,
    passwordExpired,
    setPasswordExpired,
  } = useLogin();

  // Get the intended redirect path from location state or URL params
  const getRedirectPath = (isAdmin = false) => {
    // Check if there's a redirect path in location state (from PrivateRoute)
    const from = location.state?.from?.pathname;
    
    // Or check for a 'redirect' query parameter
    const urlParams = new URLSearchParams(location.search);
    const redirectParam = urlParams.get('redirect');
    
    // Return the redirect path, or default to dashboard
    return from || redirectParam || `/${isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard}`;
  };

  useEffect(() => {
    setError(loginError);
  }, [loginError]);

  function navigateToForgotPassword() {
    navigate("/" + ROUTES.forgotPassword);
  }

  function handleLoginWithEmail() {
    dispatch(setShowLogoLeft(true));
    setLoginWithEmail(true);
  }

  function onValueChange(id, value, error) {
    if (error || loginError) {
      setError("");
      setLoginError("");
    }
    const newFormData = cloneDeep(formData);
    const fieldIndex = newFormData.findIndex((el) => el.id === id);
    newFormData[fieldIndex].value = value;
    newFormData[fieldIndex].validation.error = error;
    newFormData[fieldIndex].validation.valid = error === "" ? true : false;
    setFormData(newFormData);
  }

  function handleRememberMe(checked) {
    setRememberMe(checked);
  }

  async function handleLogin() {
    setInitLoad(false);
    const validatedFormData = validateData(formData);
    setFormData(validatedFormData);
    const isFormValid = isValidData(validatedFormData);
    if (!isFormValid) {
      return;
    }

    const credPayload = {
      email: formData[0].value,
      password: formData[1].value,
    };
    const loginPayload = {
      data: {
        type: "credentials",
        credentials: encryptData(credPayload),
        rememberMe: rememberMe,
      },
    };

    // Get the redirect path before login
    const redirectPath = getRedirectPath(isAdmin);
    if (isAdmin) {
      onAdminLogin(loginPayload, rememberMe, redirectPath);
    } else {
      onLogin(loginPayload, false, rememberMe, {}, redirectPath);
    }
  }

  function onPasswordUpdate() {
    onPasswordExpiredDialogClose();
    navigate("/" + ROUTES.forgotPassword, {
      state: {
        updatePassword: true,
      },
    });
  }

  function onPasswordExpiredDialogClose() {
    setPasswordExpired(false);
  }
  
  return (
    <>
      {loginWithEmail ? (
        <>
          <MuiTypography variant="h1" sx={{ mb: 3 }}>
            {t("login.login_title")}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CheckBox
              disabled={loading}
              checked={rememberMe}
              onChange={handleRememberMe}
              label={
                <MuiTypography variant="subtitle1">
                  {t("login.remember_me")}
                </MuiTypography>
              }
            />
            <MuiTypography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                cursor: "pointer",
              }}
              disabled={loading}
              onClick={navigateToForgotPassword}
            >
              {t("login.forgot_password")}
            </MuiTypography>
          </Box>
          <SubmitButton
            sx={{
              mt: 2,
              mb: 2,
            }}
            onClick={handleLogin}
            disabled={loading}
            loading={loading}
          >
            {t("login.login")}
          </SubmitButton>
          {!isAdmin && <RegisterLink sx={{ justifyContent: "center" }} />}
        </>
      ) : (
        <GoogleOAuthProvider clientId={googleClientId}>
          <SocialLogin onLoginWithEmail={handleLoginWithEmail} />
        </GoogleOAuthProvider>
      )}

      <MuiActionDialog
        width={400}
        open={passwordExpired}
        handleClose={onPasswordExpiredDialogClose}
        title={t("login.password_expired")}
        handleSuccess={onPasswordUpdate}
        actionTitle={t("login.update_password")}
        showClose={false}
      >
        <MuiTypography variant="subtitle2" sx={{ mt: 2 }}>
          {t("login.password_expired_subtitle")}
        </MuiTypography>
      </MuiActionDialog>
    </>
  );
}

export default Login;