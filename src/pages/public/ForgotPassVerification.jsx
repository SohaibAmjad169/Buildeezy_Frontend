import React, { useState } from "react";
import { Box } from "@mui/material";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import NavigationBtn from "../../components/common/NavigationBtn";
import { ROUTES } from "../../utils/constants/route";
import OTPVerification from "../../components/login/OTPVerification";

const ForgotPassVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { token, email } = location.state || "";
  const [otpToken, setOtpToken] = useState(token);

  function navigateToLogin() {
    navigate("/" + ROUTES.login, { replace: true });
  }

  async function navigateToResetPassword(status) {
    navigate(
      "/" + ROUTES.resetPassword,
      { state: { status, email } },
      { replace: true }
    );
  }

  function handleResendOtp(newToken) {
    setOtpToken(newToken);
  }

  if (!token) {
    return <Navigate to={`/${ROUTES.login}`} />;
  }

  return (
    <>
      <OTPVerification
        token={otpToken}
        email={email}
        onOTPSubmit={navigateToResetPassword}
        onResendOtp={handleResendOtp}
      />
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
};

export default ForgotPassVerification;
