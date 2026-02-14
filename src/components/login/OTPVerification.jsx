import { useState } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import MuiTypography from "../../components/common/MuiTypography";
import OTPInput from "../../components/common/OTPInput";
import SubmitButton from "../../components/common/SubmitButton";
import { sendOTPUrl, verifyOTPUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setAlert, setLoading } from "../../redux/configSlice";
import { encryptData } from "../../utils/encrypt";

const OTPVerification = ({
  token,
  email,
  phoneNumber = "",
  onOTPSubmit,
  onResendOtp,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.config);

  const [otp, setOTP] = useState("");

  function handleOtpChange(verificationCode) {
    setOTP(verificationCode);
  }

  async function handleVerification() {
    const resetDataPayload = {
      token,
      otp,
    };
    const verifyOTPPayload = {
      data: {
        type: "credentials",
        resetData: encryptData(resetDataPayload),
      },
    };

    try {
      dispatch(setLoading(true));
      const response = await verifyOTPUrl(verifyOTPPayload);
      const status = response.data.data.status || "";
      onOTPSubmit(status);
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

  async function handleResendOTP() {
    const otpPayload = {
      email,
      phoneNumber,
    };
    const resendOTPPayload = {
      data: {
        type: "otp_request",
        otpData: encryptData(otpPayload),
      },
    };

    try {
      dispatch(setLoading(true));
      const response = await sendOTPUrl(resendOTPPayload);
      const newToken = response.data.token;
      onResendOtp(newToken);
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

  return (
    <>
      <MuiTypography variant="h4" sx={{ mb: 3 }}>
        {t("login.verification_title")} <strong>{phoneNumber}</strong>
      </MuiTypography>
      <MuiTypography variant="subtitle1" sx={{ mb: 2 }}>
        {t("login.verification_subtitle")}
      </MuiTypography>
      <OTPInput onChange={handleOtpChange} />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          mt: 5,
          mb: 2,
          alignItems: { xs: "start", lg: "center" },
        }}
      >
        <SubmitButton
          sx={{
            width: { xs: "100%", lg: 182 },
            height: { xs: 42, lg: 50 },
            borderRadius: "10px",
            mr: { xs: 0, lg: 3 },
            mb: { xs: 1, lg: 0 },
          }}
          onClick={handleVerification}
          disabled={loading || otp.length < 6}
          loading={loading}
        >
          {t("login.verify_otp")}
        </SubmitButton>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <MuiTypography variant="subtitle1">
            {t("login.did_not_get_code")}
          </MuiTypography>
          &nbsp;
          <MuiTypography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "primary.main",
              cursor: "pointer",
            }}
            onClick={handleResendOTP}
            disabled={loading}
          >
            {t("login.resend")}
          </MuiTypography>
        </Box>
      </Box>
    </>
  );
};

export default OTPVerification;
