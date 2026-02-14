import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAlert, setLoading } from "../redux/configSlice";
import { getJobDetailsUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";
import { setJobDetails } from "../redux/jobSlice";

function useFetchJobDetails() {
  const dispatch = useDispatch(); 

  const fetchJobById = useCallback(
    async (jobId) => {
      try {
        dispatch(setLoading(true));
        const { data } = await getJobDetailsUrl(jobId, "bids");
        dispatch(setJobDetails(data.data));
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

  return { fetchJobById };
}

export default useFetchJobDetails;
