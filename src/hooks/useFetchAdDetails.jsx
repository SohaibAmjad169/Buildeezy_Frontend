import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAlert, setLoading } from "../redux/configSlice";
import { getAdDetailsUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";
import { setAdDetails } from "../redux/adSlice";

function useFetchAdDetails() {
  const dispatch = useDispatch();

  const fetchAdById = useCallback(
    async (adId) => {
      try {
        dispatch(setLoading(true));
        const { data } = await getAdDetailsUrl(adId);
        const resData = data.data;
        dispatch(setAdDetails(resData));
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

  return { fetchAdById };
}

export default useFetchAdDetails;
