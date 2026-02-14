import { useDispatch } from "react-redux";
import { createVeriffFrame } from "@veriff/incontext-sdk";
import { setAlert, setLoading } from "../redux/configSlice";
import { updateVerificationStatus, setProfileData } from "../redux/profileSlice";
import { getVeriffSessionUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";
import { mapVeriffStatus } from "../utils/constants/profile";
import { USER_DATA } from "../utils/constants/auth";
import { getLocalStorage } from "../utils/localStorageUtils";

const useVeriffVerification = () => {
  const dispatch = useDispatch();

  //create veriff iframe with event handlers
  const veriffFrame = (url) =>
    createVeriffFrame({
      url: url,
      onEvent: (event) => {
        console.log('Veriff event:', event);
        handleVeriffEvent(event);
      },
    });

  const handleVeriffEvent = (event) => {
    switch (event.name) {
      case 'onFinish':
        console.log('Veriff session completed');
        // Optionally refresh profile data or show success message
        dispatch(setAlert({
          show: true,
          type: ALERT_TYPE.info,
          message: "Verification submitted successfully. We'll review your documents and update your status shortly."
        }));
        break;
      case 'onCancel':
        console.log('Veriff session cancelled');
        break;
      case 'onError':
        console.error('Veriff error:', event.error);
        dispatch(setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "An error occurred during verification. Please try again."
        }));
        break;
      default:
        console.log('Veriff event:', event.name);
    }
  };

  const refreshProfileData = () => {
    // Force refresh of profile data from server to get updated verification status
    const userData = getLocalStorage(USER_DATA, true);
    if (userData?.user?.id) {
      // You might want to call your profile API here to refresh data
      // For now, we'll rely on the backend webhook to update the status
      console.log('Profile data refresh triggered');
    }
  };

  const handleVeriffVerification = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getVeriffSessionUrl();
      const url = response.data.data.redirectUrl;
      veriffFrame(url);
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
  };

  return { 
    handleVeriffVerification,
    refreshProfileData,
    updateVerificationStatus: (status) => {
      const isVerified = status === mapVeriffStatus.approved;
      dispatch(updateVerificationStatus({ 
        isVerified, 
        veriffStatus: status 
      }));
    }
  };
};

export default useVeriffVerification;