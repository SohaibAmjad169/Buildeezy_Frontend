import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { setAlert, setLoading } from "../redux/configSlice";
import { withdrawBidUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";
import { useTranslation } from "react-i18next";

function useBidWithdraw() {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const withdrawBid = useCallback(
    async (jobId, bidId, navigateToList) => {
      try {
        dispatch(setLoading(true));
        await withdrawBidUrl(jobId, bidId);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("job.details.withdraw_successfully"),
          })
        );
        navigateToList();
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
    [dispatch, t]
  );

  return { withdrawBid };
}

export default useBidWithdraw;
