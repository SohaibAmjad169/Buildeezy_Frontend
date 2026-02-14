import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Divider, Stack, Tab, Tabs, Tooltip } from "@mui/material";
import { cloneDeep } from "lodash";
import { Star1 } from "iconsax-react";

import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { ROUTES } from "../../utils/constants/route";
import useFetchJobDetails from "../../hooks/useFetchJobDetails";
import ViewJobDetails from "../../components/viewJobDetails";
import CurrentBidList from "../../components/activeJobs/CurrentBidList";
import MuiDialog from "../../components/common/MuiDialog";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  acceptBidUrl,
  editJobUrl,
  rejectBidUrl,
} from "../../apis/apiEndPoints";
import MuiActionDialog from "../../components/common/MuiActionDialog";
import BidDetails from "../../components/activeJobs/BidDetails";
import { setJobDetails } from "../../redux/jobSlice";
import { colors } from "../../styles/theme";
import { getLabelFromId } from "../../utils/common";
import AddNewMilestone from "../../components/milestone/AddNewMilestone";
import { TABS } from "../../utils/constants/job";
import MuiTabPanel from "../../components/common/MuiTabPanel";

function ActiveJobsViewDetails() {
  const { t } = useTranslation();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.config);
  const { jobDetails } = useSelector((state) => state.job);

  const { fetchJobById } = useFetchJobDetails();

  const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [bidId, setBidId] = useState();
  const [openViewBid, setOpenViewBid] = useState(false);
  const [bidDetails, setBidDetails] = useState();
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [value, setValue] = useState(0);
  const [bidAuthOrId, setBidAuthOrId] = useState();

  const pastLinks = [
    {
      label: t("breadcrumbs.active_jobs"),
      path: "/" + ROUTES.activeJobs,
    },
  ];
  const activeLink = {
    label: t("details"),
  };

  useEffect(() => {
    fetchJobById(id);
  }, [fetchJobById, id]);

  //tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  //accept bid
  function handleBidAccept(bidId, authorId) {
    setBidId(bidId);
    setBidAuthOrId(authorId);
    setOpenAcceptDialog(true);
  }
  function onAcceptDialogClose() {
    setOpenAcceptDialog(false);
  }
  async function onAcceptBid() {
    try {
      dispatch(setLoading(true));
      await acceptBidUrl(id, bidId);
      onAcceptDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("job.details.bid_accepted"),
        })
      );
      setOpenMilestoneDialog(true);
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

  //reject bid
  function handleBidReject(bidId) {
    setBidId(bidId);
    setOpenRejectDialog(true);
  }
  function onRejectDialogClose() {
    setOpenRejectDialog(false);
  }
  async function onRejectBid() {
    try {
      dispatch(setLoading(true));
      const res = await rejectBidUrl(id, bidId);
      onRejectDialogClose();

      const newJobDetails = cloneDeep(jobDetails);
      const findIndex = newJobDetails.bids.findIndex((bid) => bid.id === bidId);
      if (findIndex !== -1) {
        newJobDetails.bids[findIndex] = res.data.data;
      }

      dispatch(setJobDetails(newJobDetails));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("job.details.bid_rejected"),
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

  //view bid
  function onCloseViewBidDialog() {
    setOpenViewBid(false);
  }
  function handleBidView(bidId) {
    const bid = jobDetails?.bids.filter((bid) => bid.id === bidId)[0];

    setBidDetails(bid);
    setOpenViewBid(true);
  }

  //priority
  async function handlePriority() {
    try {
      const jobPayload = {
        data: {
          type: "update_job",
          pinned: !jobDetails.pinnedAt,
        },
      };
      dispatch(setLoading(true));

      const res = await editJobUrl(id, jobPayload);
      dispatch(setJobDetails(res.data.data));
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

  //milestone
  function handleCloseAddMilestone() {
    setOpenMilestoneDialog(false);
  }
  return (
    <Box sx={{ height: "100%" }}>
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
            <Box>
              <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
              <Stack direction={"row"} alignItems={"center"} spacing={2} my={2}>
                <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
                  {t("job.details.job_details")}
                </MuiTypography>

                <Tooltip
                  title={t("job.details.priority_title")}
                  placement="top"
                  sx={{ mr: "-8px" }}
                >
                  <Star1
                    size="20"
                    color={
                      jobDetails.pinnedAt ? colors.primary : colors.black600
                    }
                    variant={jobDetails.pinnedAt ? "Bold" : "Linear"}
                    onClick={handlePriority}
                    style={{
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              </Stack>
              <Divider />
            </Box>
            <Box sx={{ width: "100%", mt: 2 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="wrapped label tabs"
                sx={(theme) => ({
                      backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : undefined,
                      borderColor: theme.palette.mode === "dark" ? theme.palette.divider : undefined,
                })}

              >
                <Tab label={TABS.JOB_DETAILS} wrapped />
                <Tab label={TABS.BIDS} wrapped />
              </Tabs>
              <MuiTabPanel value={value} index={0}>
                <ViewJobDetails jobDetails={jobDetails} showClient={false} />
              </MuiTabPanel>
              <MuiTabPanel value={value} index={1}>
                <CurrentBidList
                  jobType={getLabelFromId(jobDetails?.title, "title")}
                  bidList={jobDetails?.bids}
                  onBidAccept={handleBidAccept}
                  onBidReject={handleBidReject}
                  onBidView={handleBidView}
                />
              </MuiTabPanel>
            </Box>
          </Box>
        </Box>
      )}
      <MuiDialog
        title={t("job.details.accept_bid")}
        open={openAcceptDialog}
        handleClose={onAcceptDialogClose}
        handleSuccess={onAcceptBid}
        yesLabel={t("job.details.accept")}
        noLabel={t("cancel")}
      />
      <MuiDialog
        title={t("job.details.reject_bid")}
        open={openRejectDialog}
        handleClose={onRejectDialogClose}
        handleSuccess={onRejectBid}
        yesLabel={t("job.details.reject")}
        noLabel={t("cancel")}
      />
      <MuiActionDialog
        width={600}
        open={openViewBid}
        handleClose={onCloseViewBidDialog}
        title={t("job.details.bid_details")}
        handleSuccess={onCloseViewBidDialog}
        actionTitle={t("close")}
      >
        <BidDetails bidDetails={bidDetails} />
      </MuiActionDialog>

      <AddNewMilestone
        bidAuthOrId={bidAuthOrId}
        id={id}
        openAddMilestone={openMilestoneDialog}
        onCloseAddMilestone={handleCloseAddMilestone}
      />
    </Box>
  );
}

export default ActiveJobsViewDetails;
