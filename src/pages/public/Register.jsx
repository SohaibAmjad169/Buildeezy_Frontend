import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import SocialRegister from "../../components/login/SocialRegister";
import RegisterStepper from "../../components/login/RegisterStepper";
import MuiTypography from "../../components/common/MuiTypography";
import { setShowLogoLeft } from "../../redux/configSlice";
import { getMappedUserType } from "../../utils/constants/login";
import { ROUTES } from "../../utils/constants/route";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isSocial = location.state?.isSocial || false;
  const { userType } = useSelector((state) => state.register);
  const [registerWithEmail, setRegisterWithEmail] = useState(isSocial);

  useEffect(() => {
    dispatch(setShowLogoLeft(isSocial));
    setRegisterWithEmail(isSocial);
  }, [isSocial, dispatch]);

  function handleRegisterWithEmail() {
    dispatch(setShowLogoLeft(true));
    setRegisterWithEmail(true);
  }

  // Function to handle successful registration and redirect
  const handleRegistrationSuccess = () => {
    // Get redirect path from the original login attempt
    const redirectPath = location.state?.from?.pathname || 
                        new URLSearchParams(location.search).get('redirect');
    
    if (redirectPath) {
      // If there was a redirect path, go to login with that redirect info
      navigate(`/${ROUTES.login}`, { 
        state: { from: { pathname: redirectPath } }, 
        replace: true 
      });
    } else {
      // Normal flow - go to login
      navigate(`/${ROUTES.login}`, { replace: true });
    }
  };

  return (
    <>
      {registerWithEmail ? (
        <>
          <MuiTypography variant="h1" sx={{ mb: 1 }}>
            {t("login.signup_title")}
          </MuiTypography>
          <MuiTypography variant="h4" sx={{ mb: 4 }}>
            {t("login.signup_subtitle2")}
            <strong>{getMappedUserType(userType)}</strong>
          </MuiTypography>
          <RegisterStepper onRegistrationSuccess={handleRegistrationSuccess} />
        </>
      ) : (
        <GoogleOAuthProvider clientId={googleClientId}>
          <SocialRegister onRegisterWithEmail={handleRegisterWithEmail} />
        </GoogleOAuthProvider>
      )}
    </>
  );
}

export default Register;