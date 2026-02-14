import { useDispatch } from "react-redux";
import { getVeriffStatusUrl } from "../apis/apiEndPoints";
import { setVeriffStatus } from "../redux/profileSlice";
import { setAlert } from "../redux/configSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import UpdateData from "../components/profile/UpdateProfileData/index.jsx";
import { USER_TYPES } from "../utils/constants/login";

function useVeriffStatus() {
  const dispatch = useDispatch();
  async function fetchVeriffStatus() {
    if (UpdateData?.userType !== USER_TYPES.client) {
      try {
        const response = await getVeriffStatusUrl();
        dispatch(setVeriffStatus(response.data.data?.status || ""));
      } catch (err) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: err.message,
          })
        );
      }
    }
  }

  return { fetchVeriffStatus };
}

export default useVeriffStatus;
