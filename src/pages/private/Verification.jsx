import { useEffect, useState } from "react";
import { Box, Chip, Stack } from "@mui/material";
import MuiTypography from "../../components/common/MuiTypography";
import { useTranslation } from "react-i18next";
import { createVeriffFrame } from "@veriff/incontext-sdk";
import { ArrowLeft } from "iconsax-react";
import { useNavigate } from "react-router-dom";

import useProfileData from "./../../hooks/useProfileData";
import IdVerification from "../../components/verification/IdVerification";
import ResidenceVerification from "../../components/verification/ResidenceVerification";
import { setAlert, setLoading } from "../../redux/configSlice";
import { useDispatch, useSelector } from "react-redux";
import { getVeriffSessionUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useVeriffVerification from "../../hooks/useVeriffVerification";
import ClientVerification from "../../components/verification/ClientVerification";
import VerificationTitle from "../../components/verification/VerificationTitle";
import { USER_TYPES } from "../../utils/constants/login";
import {
  mapVeriffStatus,
  profileStatus,
  veriffStatusObj,
} from "../../utils/constants/profile";
import Info from "../../components/verification/Info";
import ActionButton from "../../components/common/ActionButton";

function Verification() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === USER_TYPES.admin;
  const { loading } = useSelector((state) => state.config);
  const { veriffStatus } = useSelector((state) => state.profile);

  const { profile } = useProfileData();
  const { updateProfile } = useUpdateProfile();
  const { handleVeriffVerification: handleVeriffClick } = useVeriffVerification();

  const [verificationType, setVerificationType] = useState("");
  const [verificationDoc, setVerificationDoc] = useState("");
  const [residenceDoc, setResidenceDoc] = useState("");
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const status = profile?.status;

  useEffect(() => {
    setVerificationType(profile?.verificationType || "");
    setVerificationDoc(profile?.verificationDoc || "");
    setResidenceDoc(profile?.residenceDoc || "");
  }, []);

  function handleIdTypeChange(id, value) {
    setVerificationType(value);
  }

  function handleIdDocChange(id, value) {
    setVerificationDoc((prevState) => value(prevState));
  }

  function handleResiDocChange(id, value) {
    setResidenceDoc((prevState) => value(prevState));
  }

  function goToPrevStep() {
    if (step === 2) {
      onPrevStep();
    }
  }

  async function handleUpdateProfile() {
    const docsData = {
      verificationType,
      verificationDoc,
      residenceDoc,
    };

    const isClientValid = clients?.every(
      (client) => client.name !== "" && client.email !== ""
    );
    if (!isClientValid) {
      setError(t("profile.required_client"));
      return;
    }
    const profilePayload = {
      data: {
        type: !isAdmin ? "user_profile" : "admin_profile",
        ...docsData,
        ...(clients.length > 0 && { pastClients: clients }),
      },
    };
    updateProfile(profilePayload, t("profile.profile_updated"), goToPrevStep);
  }

  // Use the hook's method instead of local implementation
  const handleVeriffVerification = () => {
    handleVeriffClick();
  };

  const handleClientUpdate = (clientData) => {
    setError("");
    setClients(clientData);
  };

  const onNextStep = () => {
    setStep((prevState) => prevState + 1);
  };

  const onPrevStep = () => {
    setStep((prevState) => prevState - 1);
  };

  function navigateBack() {
    navigate(-1);
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "70%" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction={"row"} alignItems={"center"} spacing={2}>
            <ArrowLeft
              size="20"
              style={{ cursor: "pointer" }}
              onClick={navigateBack}
            />
            <MuiTypography variant="h2">
              {t("profile.verify_profile")}
            </MuiTypography>
          </Stack>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {veriffStatus && veriffStatusObj[veriffStatus] ? (
              <>
                <Info data={t(veriffStatusObj[veriffStatus]?.info)} />
                <Chip
                  label={t(veriffStatusObj[veriffStatus]?.chipLabel)}
                  sx={{
                    backgroundImage: veriffStatusObj[veriffStatus]?.bgColor,
                    color: veriffStatusObj[veriffStatus]?.color,
                    fontWeight: 500,
                    px: 2,
                  }}
                />
              </>
            ) : (
              <>
                <Info data={profileStatus[status]?.info} />
                <Chip
                  label={t(profileStatus[status]?.chipLabel)}
                  sx={{
                    backgroundImage: profileStatus[status]?.bgColor,
                    color: profileStatus[status]?.color,
                    fontWeight: 500,
                    px: 2,
                  }}
                />
              </>
            )}
          </Box>
        </Box>

        {/* Skip ID verification and go directly to Veriff verification */}
        {profile.userType === USER_TYPES.client && step === 2 ? (
          <>
            <VerificationTitle title={t("profile.past_client_verification")} />
            <ClientVerification
              onClientUpdate={handleClientUpdate}
              error={error}
            />
          </>
        ) : (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <MuiTypography variant="h3" sx={{ mb: 2 }}>
              {t("profile.ready_to_verify")}
            </MuiTypography>
            <MuiTypography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
              {t("profile.verification_instructions")}
            </MuiTypography>
          </Box>
        )}

        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-end",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Show Verify Me button if not verified or verification failed/expired */}
          {(!veriffStatus ||
            veriffStatus === mapVeriffStatus.declined ||
            veriffStatus === mapVeriffStatus.expired ||
            !profileData?.isVerified) && (
            <ActionButton
              disabled={loading}
              onClick={handleVeriffVerification}
              variant="outlined"
            >
              {t("profile.verify_me")}
            </ActionButton>
          )}

          {/* Show client verification flow for clients */}
          {profile.userType === USER_TYPES.client ||
          profile.userType === USER_TYPES.vendor ||
          profile.pastClients?.length >= 2 ||
          step === 2 ? (
            <>
              {step === 2 && (
                <ActionButton
                  variant="outlined"
                  disabled={loading}
                  onClick={onPrevStep}
                >
                  {t("profile.previous")}
                </ActionButton>
              )}
              {step === 1 && profile.userType === USER_TYPES.client && (
                <ActionButton disabled={loading} onClick={onNextStep}>
                  {t("profile.next")}
                </ActionButton>
              )}
              {step === 2 && (
                <ActionButton disabled={loading} onClick={handleUpdateProfile}>
                  {t("profile.save_changes")}
                </ActionButton>
              )}
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export default Verification;