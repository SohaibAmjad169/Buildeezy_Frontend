import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { setAlert, setLoading } from "../redux/configSlice";
import { updateBidUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";

function useEditBid() {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const updateBid = useCallback(
    async (jobId, bidId, bidData, updateDetails) => {
      const newBidData = { ...bidData };
      newBidData.documents = bidData.documents?.map((docUrl) =>
        docUrl.includes("https:")
          ? docUrl.split("/").slice(-2).join("/")
          : docUrl
      );

      const bidPayload = {
        data: {
          type: "update_bid",
          ...newBidData,
        },
      };

      try {
        dispatch(setLoading(true));
        const res = await updateBidUrl(jobId, bidId, bidPayload);
        const bid = res.data.data;
        updateDetails({
          amount: bid.amount,
          description: bid.description,
          documents: bid.documents,
        });
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("job.details.updated_successfully"),
          })
        );
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

  return { updateBid };
}

export default useEditBid;
