import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";

import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { getMyBidsUrl } from "../../apis/apiEndPoints";
import useBidWithdraw from "../../hooks/useBidWithdraw";
import useEditBid from "../../hooks/useEditBid";
import MuiActionDialog from "../common/MuiActionDialog";
import SubmitBid from "../allJobs/SubmitBid";
import MuiDialog from "../common/MuiDialog";
import { setBidList, setUpdatedBidData } from "../../redux/bidSlice";
import { getLabelFromId } from "../../utils/common";
import BidCard from "../common/BidCard";
import JobCardListSkeleton from "../skeleton/JobCardListSkeleton";
import NoData from "../common/NoData";
import SeeMore from "../common/SeeMore";
import { setFetchNextLoading } from "../../redux/jobSlice";

const BID = {
  amount: "",
  description: "",
  documents: [],
};

function BidCardList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { bidList } = useSelector((state) => state.bid);
  const { loading } = useSelector((state) => state.config);
  const { fetchNextLoading } = useSelector((state) => state.job);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [ids, setIds] = useState({
    jobId: "",
    bidId: "",
  });
  const [openEditBid, setOpenEditBid] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [bidData, setBidData] = useState(BID);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [totalBids, setTotalBids] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const { withdrawBid } = useBidWithdraw();
  const { updateBid } = useEditBid();

  const fetchMyBidJobs = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getMyBidsUrl(paginationModel);

      const resData = res.data;
      setTotalBids(res.meta.totalRecords);

      dispatch(setBidList(resData));
      if (resData.length === res.meta.totalRecords) {
        setHasMoreData(false);
      }
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
  }, [dispatch, paginationModel]);

  useEffect(() => {
    fetchMyBidJobs();
  }, []);

  //fetch next bids
  async function fetchNextBids() {
    const newPaginationModel = { ...paginationModel };
    newPaginationModel.page = newPaginationModel.page + 1;
    setPaginationModel(newPaginationModel);
    try {
      dispatch(setFetchNextLoading(true));
      const { data: res } = await getMyBidsUrl(newPaginationModel);
      const resData = res.data;
      const newBidList = [...bidList, ...resData];
      dispatch(setBidList(newBidList));
      if (newBidList.length >= totalBids) {
        setHasMoreData(false);
      }
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setFetchNextLoading(false));
    }
  }

  //edit bid
  function handleBidDetailEdit(bid) {
    setIds({
      jobId: bid?.job.id,
      bidId: bid?.id,
    });

    setBidData({
      amount: bid.amount,
      description: bid.description,
      documents: bid.documents,
    });
    setOpenEditBid(true);
  }
  function onCloseEditBidDialog() {
    setOpenEditBid(false);
    setInitLoad(true);
  }
  function onBidValueChange(id, value) {
    setBidData((prevData) => {
      let updatedValue = value;
      if (id === "documents") {
        updatedValue = value(prevData[id]);
      }
      return { ...prevData, [id]: updatedValue };
    });
  }
  function updateDetails(updatedBidDetails) {
    dispatch(
      setUpdatedBidData({ bidId: ids.bidId, updatedDetails: updatedBidDetails })
    );
    onCloseEditBidDialog();
  }
  async function onEditBid() {
    setInitLoad(false);
    if (!bidData.amount) {
      return;
    }
    updateBid(ids.jobId, ids.bidId, bidData, updateDetails);
  }

  //withdraw bid
  function handleBidDetailWidthdraw(bid) {
    setIds({
      jobId: bid?.job.id,
      bidId: bid?.id,
    });

    setOpenWithdrawDialog(true);
  }
  function onWithdrawDialogClose() {
    setOpenWithdrawDialog(false);
  }
  function updateBidList() {
    const newBidList = cloneDeep(bidList).filter((bid) => bid.id !== ids.bidId);
    dispatch(setBidList(newBidList));
    onWithdrawDialogClose();
  }
  async function onWithdraw() {
    withdrawBid(ids.jobId, ids.bidId, updateBidList);
  }

  //view bid details
  function handleViewBidDetails(bidId) {
    navigate("view/" + bidId);
  }

  return (
    <Box>
      {loading && bidList.length === 0 ? (
        <JobCardListSkeleton />
      ) : bidList.length === 0 ? (
        <Box
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          <NoData />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {bidList.map((bid) => (
              <BidCard
                key={bid.id}
                jobType={getLabelFromId(bid.job.title, "title")}
                bidDetails={bid}
                onViewBidDetails={handleViewBidDetails}
                handleBidEdit={handleBidDetailEdit}
                handleBidWithdraw={handleBidDetailWidthdraw}
              />
            ))}
          </Box>
          <SeeMore
            handleSeeMore={fetchNextBids}
            isShow={hasMoreData}
            isLoading={fetchNextLoading}
          />
        </>
      )}

      <MuiActionDialog
        width={550}
        open={openEditBid}
        handleClose={onCloseEditBidDialog}
        title={t("job.details.estimate_quote")}
        handleSuccess={onEditBid}
        actionTitle={t("submit")}
      >
        <SubmitBid
          initLoad={initLoad}
          bid={bidData}
          handleBidDataChange={onBidValueChange}
        />
      </MuiActionDialog>
      <MuiDialog
        title={t("job.details.withdraw_bid")}
        open={openWithdrawDialog}
        handleClose={onWithdrawDialogClose}
        handleSuccess={onWithdraw}
        yesLabel={t("job.details.withdraw")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

export default BidCardList;
