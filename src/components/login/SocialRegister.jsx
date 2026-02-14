import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useGoogleLogin } from "@react-oauth/google";

import SocialLoginButton from "./SocialLoginButton";
import googleIcon from "../../assets/images/icons/google.svg";
import facebookIcon from "../../assets/images/icons/facebook.svg";
import emailIcon from "../../assets/images/icons/email.svg";
import StartIcon from "../common/StartIcon";
import MuiTypography from "../common/MuiTypography";
import LoginLink from "./LoginLink";
import { encryptData } from "../../utils/encrypt";
import useLogin from "../../hooks/useLogin";

const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

function SocialRegister({ onRegisterWithEmail }) {
  const { t } = useTranslation();

  const { onLogin } = useLogin();

  const responseFacebook = (response) => {
    if (response.id) {
      const nameArray = response.name.split(" ");
      const fbData = {};
      fbData.firstName = nameArray[0];
      fbData.lastName = nameArray[1];
      fbData.email = response.email;
      fbData.providerId = response.id;

      const credPayload = {
        code: response.id,
        provider: "facebook",
      };
      const loginPayload = {
        data: {
          type: "credentials",
          credentials: encryptData(credPayload),
        },
      };
      onLogin(loginPayload, true, false, fbData);
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
      onLogin(loginPayload);
    }
  };

  const register = useGoogleLogin({
    onSuccess: responseGoogle,
    flow: "auth-code",
  });

  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        <MuiTypography variant="h1" sx={{ mb: 1 }}>
          {t("welcome_to_buildeezy")}
        </MuiTypography>
        <MuiTypography variant="h4">
          {t("login.signup_subtitle1")}
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
          onClick={() => register()}
          label={t("login.signup_google")}
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
              label={t("login.signup_facebook")}
              styles={{ mb: 2 }}
              startIcon={<StartIcon imageSrc={facebookIcon} />}
            />
          )}
        />

        <SocialLoginButton
          label={t("login.signup_email")}
          styles={{ mb: 2 }}
          startIcon={<StartIcon imageSrc={emailIcon} />}
          onClick={onRegisterWithEmail}
        />
      </Box>
      <LoginLink />
    </>
  );
}

export default SocialRegister;
