import { useDispatch } from "react-redux";
import { setAlert, setLoading } from "../redux/configSlice";
import { adminUpdateProfileUrl, updateProfileUrl } from "../apis/apiEndPoints";
import { USER_DATA } from "../utils/constants/auth";
import { setLocalStorage } from "../utils/localStorageUtils";
import { ALERT_TYPE } from "../utils/constants/config";
import { setProfileData } from "../redux/profileSlice";
import { useSelector } from "react-redux";
import { USER_TYPES } from "../utils/constants/login";

function useUpdateProfile() {
  const dispatch = useDispatch();
  const profileData = useSelector((state) => state.profile.profileData);
  const isAdmin = profileData?.userType === USER_TYPES.admin;

  async function updateProfile(
    profilePayload,
    successMsg,
    callAction = () => {}
  ) {
    try {
      dispatch(setLoading(true));
      const response = !isAdmin? await updateProfileUrl(profilePayload): await adminUpdateProfileUrl(profilePayload);
      if (!response || !response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      dispatch(setProfileData(response.data.data));
      setLocalStorage(USER_DATA, { user: response.data.data }, true);
      callAction();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: successMsg,
        })
      );
      return true; // Return success
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
      return false; // Return failure
    } finally {
      dispatch(setLoading(false));
    }
  }
  return { updateProfile };
}

export default useUpdateProfile;
