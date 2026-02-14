import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { setAlert, setLoading } from "../redux/configSlice";
import { getUserCategoriesByTypeUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";
import { useSelector } from "react-redux";

function useUserCategories() {
  const dispatch = useDispatch();

  const [categories, setCategories] = useState(null);
  const { userType } = useSelector((state) => state.profile.profileData);

  const fetchCategoryByType = useCallback(
    async (user) => {
      const selectedUserType = user || userType;
      try {
        dispatch(setLoading(true));
        const res = await getUserCategoriesByTypeUrl(selectedUserType);

        const allCategories = res.data.data.map((item) => ({
          id: item.id,
          label: item.label,
        }));
        setCategories(allCategories);
        return allCategories;
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
    },
    [dispatch]
  );

  return { categories, fetchCategoryByType };
}

export default useUserCategories;
