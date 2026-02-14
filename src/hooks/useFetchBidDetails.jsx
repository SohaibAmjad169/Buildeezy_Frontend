import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { setAlert, setLoading } from "../redux/configSlice";
import { getBidDetailsUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";
import { setBidDetails } from "../redux/bidSlice";

function useFetchBidDetails() {
  const dispatch = useDispatch();

  const fetchBidById = useCallback(
    async (bidId) => {
      try {
        dispatch(setLoading(true));
        const { data } = await getBidDetailsUrl(bidId);
        const resData = data.data;
        dispatch(setBidDetails(resData));
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

  return { fetchBidById };
}

export default useFetchBidDetails;
