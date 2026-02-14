import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Box, Divider } from "@mui/material";
import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { getJobDetailsUrl, postBidUrl } from "../../apis/apiEndPoints";
import ViewJobDetails from "../../components/viewJobDetails";
import ActionButton from "../../components/common/ActionButton";
import MuiActionDialog from "../../components/common/MuiActionDialog";
import SubmitBid from "../../components/allJobs/SubmitBid";
import { useDispatch, useSelector } from "react-redux";
import { setAlert, setLoading } from "../../redux/configSlice";
import { setJobDetails } from "../../redux/jobSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";

const BID = {
  amount: "",
  description: "",
  documents: [],
};

export default function InvitationJobDetails() {
  const { t } = useTranslation();
  const { jobId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const invitation = location.state?.invitation;
  const { jobDetails } = useSelector((state) => state.job);
  const { loading } = useSelector((state) => state.config);
  const [openSubmitBid, setOpenSubmitBid] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [bidData, setBidData] = useState(BID);

  useEffect(() => {
    async function fetchJob() {
      dispatch(setLoading(true));
      const res = await getJobDetailsUrl(jobId);
      let jobData = res.data.data;
      if (invitation) {
        jobData = {
          ...jobData,
          title: invitation.title || invitation.jobTitle || jobData.title,
          description: invitation.comments || jobData.description,
          budget: invitation.budget || jobData.budget,
          createdAt:
            invitation.startDate || invitation.createdAt || jobData.createdAt,
        };
      }
      dispatch(setJobDetails(jobData));
      dispatch(setLoading(false));
    }
    fetchJob();
    // eslint-disable-next-line
  }, [jobId, invitation]);

  function openSubmitBidDialog() {
    setOpenSubmitBid(true);
  }
  function onCloseSubmitBidDialog() {
    setOpenSubmitBid(false);
    setBidData(BID);
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

  async function onSubmitBid() {
    setInitLoad(false);
    if (!bidData.amount) {
      return;
    }
    const bidPayload = {
      data: {
        type: "post_bid",
        ...bidData,
      },
    };

    try {
      dispatch(setLoading(true));
      await postBidUrl(jobId, bidPayload);

      const newJobDetails = cloneDeep(jobDetails);
      newJobDetails.isBidPlaced = true;
      newJobDetails.noOfBids = (jobDetails.noOfBids || 0) + 1;

      dispatch(setJobDetails(newJobDetails));

      onCloseSubmitBidDialog();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("job.details.bid_submitted"),
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
  }

  const bidAmount = useMemo(() => {
    const bidDetails = jobDetails?.bids?.filter(
      (bid) => bid.jobId === jobDetails?.id
    )[0];
    return bidDetails?.amount || bidData.amount;
  }, [jobDetails]);

  if (loading || !jobDetails) return <ViewJobDetailsSkeleton />;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: { xs: "100%", lg: "70%" } }}>
          <MuiBreadcrumbs
            pastLinks={[{ label: "Invitations", path: "/invitations" }]}
            activeLink={{ label: "details" }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              mt: 2,
              mb: 2,
            }}
          >
            <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
              Job Details
            </MuiTypography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ActionButton
                variant="contained"
                onClick={openSubmitBidDialog}
                disabled={jobDetails?.isBidPlaced}
                sx={{ width: { xs: "100%" }, mt: { xs: 1, sm: 0 } }}
              >
                {jobDetails?.isBidPlaced
                  ? `${t("job.details.my_bid")} $${bidAmount}`
                  : t("job.details.bid_the_job")}
              </ActionButton>
            </Box>
          </Box>
          <Divider />
          <ViewJobDetails jobDetails={jobDetails} />
        </Box>
      </Box>
      <MuiActionDialog
        width={550}
        open={openSubmitBid}
        handleClose={onCloseSubmitBidDialog}
        title={t("job.details.estimate_quote")}
        handleSuccess={onSubmitBid}
        actionTitle={t("submit")}
      >
        <SubmitBid
          initLoad={initLoad}
          bid={bidData}
          handleBidDataChange={onBidValueChange}
        />
      </MuiActionDialog>
    </>
  );
}
