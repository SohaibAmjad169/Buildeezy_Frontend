import { useTranslation } from "react-i18next";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, Divider, Button, Stack } from "@mui/material";
import { colors } from "../../styles/theme";

import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { ROUTES } from "../../utils/constants/route";
import useFetchJobDetails from "../../hooks/useFetchJobDetails";
import ViewJobDetails from "../../components/viewJobDetails";
import { useEffect, useState } from "react";
import UpdateJobDialog from "../../components/viewJobDetails/UpdateJobDialog";
import { getUserBidInvitationsUrl } from "../../apis/apiEndPoints";
import MuiActionDialog from "../../components/common/MuiActionDialog";
import SubmitBid from "../../components/allJobs/SubmitBid";
import { postBidUrl } from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";

function JobInvitationViewDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const { loading } = useSelector((state) => state.config);
  const { jobDetails } = useSelector((state) => state.job);
  const { profileData } = useSelector((state) => state.profile);

  const { fetchJobById } = useFetchJobDetails();

  const [openUpdateJob, setOpenUpdateJob] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [openSubmitBid, setOpenSubmitBid] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const BID = { amount: "", description: "", documents: [] };
  const [bidData, setBidData] = useState(BID);

  const dispatch = useDispatch();

  const pastLinks = [
    {
      label: t("Invitations"),
      path: "/" + ROUTES.invitations,
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

  // Always try to get invitation: from navigation, jobDetails, or fetch from API
  useEffect(() => {
    let found =
      location.state?.invitation ||
      jobDetails?.invitation ||
      jobDetails?.bidInvitation;
    if (found) {
      setInvitation(found);
    } else if (profileData?.id && id) {
      // Fetch user's invitations and find the one for this job
      getUserBidInvitationsUrl(profileData.id).then((res) => {
        const invs = res.data.data || [];
        const match = invs.find((inv) => inv.jobId === id);
        if (match) setInvitation(match);
      });
    }
  }, [location.state, jobDetails, profileData?.id, id]);

  const handleCloseUpdateJobDialog = () => {
    setOpenUpdateJob(false);
  };

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
      // You may need to import and use dispatch from redux if not already
      dispatch(setLoading(true));
      await postBidUrl(id, bidPayload);

      // Optionally update jobDetails state if needed
      // onCloseSubmitBidDialog();
      window.location.reload();
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

  return (
    <>
      {loading ? (
        <ViewJobDetailsSkeleton />
      ) : !jobDetails ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <MuiTypography variant="h2" color="error.main" sx={{ mb: 2 }}>
            Job not found or you do not have access.
          </MuiTypography>
        </Box>
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

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
                {t("contract.contract_details")}
              </MuiTypography>
              {invitation && (
                <Button
                  variant="contained"
                  onClick={openSubmitBidDialog}
                  disabled={jobDetails?.isBidPlaced}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: colors.primary,
                    fontSize: "0.8rem",
                    "&:hover": {
                      backgroundColor: colors.primary800,
                    },
                  }}
                >
                  {jobDetails?.isBidPlaced
                    ? `${t("job.details.my_bid")} $${bidData.amount}`
                    : t("job.details.bid_the_job")}
                </Button>
              )}
            </Stack>

            <Divider />

            <Box sx={{ width: "100%", mt: 2 }}>
              <ViewJobDetails
                jobDetails={jobDetails}
                showClient={jobDetails?.author?.id !== profileData?.id}
                showContractor={jobDetails?.author?.id === profileData?.id}
                isContract={true}
              />
            </Box>
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

export default JobInvitationViewDetails;
