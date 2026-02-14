import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";

import { setAlert, setLoading } from "../redux/configSlice";
import { getProfileUrl } from "../apis/apiEndPoints";
import { setProfileData } from "../redux/profileSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import { setLocalStorage } from "../utils/localStorageUtils";
import { USER_DATA } from "../utils/constants/auth";

function useProfileData() {
  const dispatch = useDispatch();

  const { profileData } = useSelector((state) => state.profile);

  const [profile, setProfile] = useState(profileData);

  useEffect(() => {
    setProfile(profileData);
  }, [profileData]);

  async function fetchProfileData() {
    try {
      dispatch(setLoading(true));
      const userId = profileData?.id;
      if (!userId) throw new Error("User ID not found");
      const response = await getProfileUrl(userId);
      setProfile(response.data.data);
      dispatch(setProfileData(response.data.data));
      setLocalStorage(USER_DATA, { user: response.data.data }, true);
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
  useEffect(() => {
    if (isEmpty(profileData)) {
      fetchProfileData();
    } else {
      setProfile(profileData);
    }
  }, []);

  return { profile };
}

export default useProfileData;
