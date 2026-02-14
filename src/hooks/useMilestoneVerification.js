import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import useVeriffVerification from "./useVeriffVerification";
import { USER_TYPES } from "../utils/constants/login";
import { setAlert } from "../redux/configSlice";
import { ALERT_TYPE } from "../utils/constants/config";

const useMilestoneVerification = () => {
  const { profileData } = useSelector((state) => state.profile);
  const { handleVeriffVerification } = useVeriffVerification();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const isClient = profileData?.userType === USER_TYPES.client;
  const isVerified = profileData?.isVerified || false;

  // Check if milestone amount requires verification
  const requiresVerification = (amount) => {
    return isClient && !isVerified && amount > 100;
  };

  // Handle milestone activation with verification check
  const handleMilestoneAction = (amount, callback) => {
    if (requiresVerification(amount)) {
      // Show info alert and trigger verification
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.info,
          message: t("milestone.verification_required_message"),
        })
      );
      handleVeriffVerification();
      return false; // Prevent the action
    } else {
      // Proceed with the action
      callback();
      return true; // Action proceeded
    }
  };

  // Show verification requirement indicator
  const shouldShowVerificationIndicator = (amount) => {
    return requiresVerification(amount);
  };

  return {
    requiresVerification,
    handleMilestoneAction,
    shouldShowVerificationIndicator,
    isClient,
    isVerified
  };
};

export default useMilestoneVerification;