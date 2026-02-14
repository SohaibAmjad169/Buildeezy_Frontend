import { useState } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "../../utils/constants/route";
import OTPVerification from "../../components/login/OTPVerification";
import LoginLink from "../../components/login/LoginLink";
import { setAlert, setLoading } from "../../redux/configSlice";
import { registerUrl, socialRegisterUrl } from "../../apis/apiEndPoints";
import { ACCESS_TOKEN_KEY } from "../../utils/constants/auth";
import { ALERT_TYPE } from "../../utils/constants/config";
import { encryptData } from "../../utils/encrypt";
import { setLocalStorage } from "../../utils/localStorageUtils";
import { setProfileData } from "../../redux/profileSlice";

const RegisterVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { token } = location.state || "";

  const { userType, accountDetails, authDetails, isSocialRegister, provider } =
    useSelector((state) => state.register);

  const [otpToken, setOtpToken] = useState(token);

  function handleResendOtp(newToken) {
    setOtpToken(newToken);
  }
  async function handleRegister(status) {
    // register user
    try {
      const registerPayload = {
        data: {
          type: isSocialRegister ? "social_user_request" : "user_request",
          ...(!isSocialRegister && {
            token: status,
          }),
          firstName: accountDetails[0].value,
          lastName: accountDetails[1].value,
          email: accountDetails[2].value,
          country: accountDetails[3].value,
          city: accountDetails[4].value,
          userType: accountDetails[5].value,
          phoneNumber: authDetails[0].value,
          ...(!isSocialRegister && {
            password: encryptData(authDetails[1].value),
          }),
          ...(isSocialRegister && { providerId: encryptData(provider.id) }),
          ...(isSocialRegister && { providerType: provider.type }),
        },
      };

      dispatch(setLoading(true));
      const registerApiUrl = isSocialRegister ? socialRegisterUrl : registerUrl;

      const response = await registerApiUrl(registerPayload);
      const accessToken = response.data.data.session.accessToken;

      setLocalStorage(ACCESS_TOKEN_KEY, accessToken);
      dispatch(setProfileData(response.data.data));

      navigate(
        "/" + ROUTES.onboarding,
        { state: { userType } },
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
  }

  if (!token) {
    return <Navigate to={`/${ROUTES.register}`} />;
  }

  return (
    <>
      <OTPVerification
        token={otpToken}
        email={accountDetails[2].value}
        phoneNumber={authDetails[0].value}
        onOTPSubmit={handleRegister}
        onResendOtp={handleResendOtp}
      />
      <Box
        sx={{
          display: { xs: "block", lg: "flex" },
          justifyContent: "space-between",
        }}
      >
        <LoginLink />
      </Box>
    </>
  );
};

export default RegisterVerification;
