import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useGoogleLogin } from "@react-oauth/google";

import SocialLoginButton from "./SocialLoginButton";
import googleIcon from "../../assets/images/icons/google.svg";
import facebookIcon from "../../assets/images/icons/facebook.svg";
import emailIcon from "../../assets/images/icons/email.svg";
import StartIcon from "../common/StartIcon";
import MuiTypography from "../common/MuiTypography";
import RegisterLink from "./RegisterLink";
import useLogin from "../../hooks/useLogin";
import { encryptData } from "../../utils/encrypt";

const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

function SocialLogin({ onLoginWithEmail }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { onLogin } = useLogin();

  // Get the redirect path for social logins too
  const getRedirectPath = () => {
    const from = location.state?.from?.pathname;
    const urlParams = new URLSearchParams(location.search);
    const redirectParam = urlParams.get('redirect');
    return from || redirectParam || null;
  };

  const responseFacebook = (response) => {
    if (response.id) {
      const nameArray = response.name.split(" ");
      const fbData = {};
      fbData.firstName = nameArray[0];
      fbData.lastName = nameArray[1];
      fbData.email = response.email;
      fbData.providerId = response.id;

      const credPayload = {
        code: response.email,
        provider: "facebook",
      };
      const loginPayload = {
        data: {
          type: "credentials",
          credentials: encryptData(credPayload),
        },
      };
      
      // Pass redirect path for Facebook login
      const redirectPath = getRedirectPath();
      onLogin(loginPayload, true, false, fbData, redirectPath);
    }
  };

  const responseGoogle = (response) => {
    if (response.code) {
      const code = response.code;
 
      const credPayload = {
        code,
        provider: "google",
      };
      const loginPayload = {
        data: {
          type: "credentials",
          credentials: encryptData(credPayload),
        },
      };
      
      // Pass redirect path for Google login
      const redirectPath = getRedirectPath();
      onLogin(loginPayload, true, false, {}, redirectPath);
    }
  };

  const login = useGoogleLogin({
    onSuccess: responseGoogle,
    flow: "auth-code",
  });

  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        <MuiTypography variant="h1" sx={{ mb: 1 }}>
          {t("welcome_to_buildeezy")}
        </MuiTypography>
        <MuiTypography variant="h4" component="h2">
          {t("login.login_subtitle")}
        </MuiTypography>
      </Box>
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SocialLoginButton
          onClick={() => login()}
          label={t("login.login_google")}
          styles={{ mb: 2 }}
          startIcon={<StartIcon imageSrc={googleIcon} />}
        />

        <FacebookLogin
          appId={facebookAppId}
          autoLoad={false}
          fields="name,email,picture"
          callback={responseFacebook}
          render={(renderProps) => (
            <SocialLoginButton
              onClick={renderProps.onClick}
              label={t("login.login_facebook")}
              styles={{ mb: 2 }}
              startIcon={<StartIcon imageSrc={facebookIcon} />}
            />
          )}
        />

        <SocialLoginButton
          label={t("login.login_email")}
          styles={{ mb: 2 }}
          startIcon={<StartIcon imageSrc={emailIcon} />}
          onClick={onLoginWithEmail}
        />
      </Box>
      <RegisterLink />
    </>
  );
}

export default SocialLogin;