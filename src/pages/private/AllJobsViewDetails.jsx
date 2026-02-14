import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Divider } from "@mui/material";

import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { ROUTES } from "../../utils/constants/route";
import useFetchJobDetails from "../../hooks/useFetchJobDetails";
import ViewJobDetails from "../../components/viewJobDetails";
import MuiActionDialog from "../../components/common/MuiActionDialog";
import { useEffect, useState } from "react";
import SubmitBid from "../../components/allJobs/SubmitBid";
import { setAlert, setLoading } from "../../redux/configSlice";
import { postBidUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import { cloneDeep } from "lodash";
import { setJobDetails } from "../../redux/jobSlice";
import ActionButton from "../../components/common/ActionButton";
import { useMemo } from "react";
import UpdateJobDialog from "../../components/viewJobDetails/UpdateJobDialog";

const BID = {
  amount: "",
  description: "",
  documents: [],
};
function AllJobsViewDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.config);
  const { jobDetails } = useSelector((state) => state.job);

  const [openSubmitBid, setOpenSubmitBid] = useState(false);
  const [openUpdateJob, setOpenUpdateJob] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [bidData, setBidData] = useState(BID);

  const { fetchJobById } = useFetchJobDetails();

  const pastLinks = [
    {
      label: t("breadcrumbs.all_jobs"),
      path: "/" + ROUTES.allJobs,
    },
  ];
  const activeLink = {
    label: t("details"),
  };

  useEffect(() => {
    fetchJobById(id);
  }, [fetchJobById, id]);

  useEffect(() => {
    if (!loading && jobDetails) {
      const shouldOpenUpdateDialog =
        searchParams.get("openUpdateDialog") === "true";
      if (shouldOpenUpdateDialog) {
        setOpenUpdateJob(true);
      }
    }
  }, [loading, jobDetails, searchParams]);

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
      await postBidUrl(id, bidPayload);

      const newJobDetails = cloneDeep(jobDetails);
      newJobDetails.isBidPlaced = true;
      newJobDetails.noOfBids = jobDetails.noOfBids + 1;

      dispatch(setJobDetails(newJobDetails));

      onCloseSubmitBidDialog();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: `Your bid of $${bidData.amount} has been placed successfully.`,
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
    const bidDetails = jobDetails.bids?.filter(
      (bid) => bid.jobId === jobDetails.id
    )[0];
    return bidDetails?.amount || bidData.amount;
  }, [jobDetails]);

  const handleCloseUpdateJobDialog = () => {
    setOpenUpdateJob(false);
  };

  return (
    <>
      {loading ? (
        <ViewJobDetailsSkeleton />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", lg: "70%" },
            }}
          >
            <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
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
                {t("job.details.job_details")}
              </MuiTypography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ActionButton
                  variant="contained"
                  onClick={openSubmitBidDialog}
                  disabled={jobDetails?.isBidPlaced}
                  sx={{
                    width: { xs: "100%" },
                    mt: { xs: 1, sm: 0 },
                  }}
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
      )}

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

      <UpdateJobDialog
        open={openUpdateJob}
        onClose={handleCloseUpdateJobDialog}
        jobDetails={jobDetails}
      />
    </>
  );
}

export default AllJobsViewDetails;
