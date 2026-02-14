import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Divider, Stack, Tab, Tabs } from "@mui/material";
import { Edit2 } from "iconsax-react";

import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { ROUTES } from "../../utils/constants/route";
import ViewJobDetails from "../../components/viewJobDetails";
import MuiActionDialog from "../../components/common/MuiActionDialog";
import SubmitBid from "../../components/allJobs/SubmitBid";
import useFetchBidDetails from "../../hooks/useFetchBidDetails";
import IconBtn from "../../components/appBar/IconBtn";
import MuiDialog from "../../components/common/MuiDialog";
import useBidWithdraw from "../../hooks/useBidWithdraw";
import useEditBid from "../../hooks/useEditBid";
import { setBidDetails } from "../../redux/bidSlice";
import ActionButton from "../../components/common/ActionButton";
import MuiChip from "../../components/common/MuiChip";
import { getFirstCharUpperCase } from "../../utils/common";
import { TABS } from "../../utils/constants/job";
import MuiTabPanel from "../../components/common/MuiTabPanel";
import BidDetailsTab from "../../components/myBids/BidDetailsTab";

const BID = {
  amount: "",
  description: "",
  documents: [],
};
function MyBidsViewDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.config);
  const { bidDetails } = useSelector((state) => state.bid);

  const { fetchBidById } = useFetchBidDetails();
  const { withdrawBid } = useBidWithdraw();
  const { updateBid } = useEditBid();

  const [openEditBid, setOpenEditBid] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [bidData, setBidData] = useState(BID);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [value, setValue] = useState(0);

  const pastLinks = [
    {
      label: t("breadcrumbs.my_bids"),
      path: "/" + ROUTES.myBids,
    },
  ];
  const activeLink = {
    label: t("details"),
  };

  useEffect(() => {
    fetchBidById(id);
  }, [id]);

  //tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  //edit bid
  function openEditBidDialog() {
    setBidData({
      amount: bidDetails.amount,
      description: bidDetails.description,
      documents: bidDetails.documents,
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
    dispatch(setBidDetails({ ...bidDetails, ...updatedBidDetails }));
    onCloseEditBidDialog();
  }
  async function onEditBid() {
    setInitLoad(false);
    if (!bidData.amount) {
      return;
    }
    updateBid(bidDetails?.job.id, id, bidData, updateDetails);
  }

  //withdraw bid
  function onWithdrawDialogOpen() {
    setOpenWithdrawDialog(true);
  }
  function onWithdrawDialogClose() {
    setOpenWithdrawDialog(false);
  }
  function navigateToMyBids() {
    onWithdrawDialogClose();
    navigate("/" + ROUTES.myBids);
  }
  async function onWithdraw() {
    withdrawBid(bidDetails?.job.id, id, navigateToMyBids);
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
              <Stack direction={"row"} alignItems={"center"} spacing={2}>
                <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
                  {t("job.details.my_bid_details")}
                </MuiTypography>
                <MuiChip
                  value={getFirstCharUpperCase(bidDetails?.state || "")}
                />
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: { xs: 1, md: 0 },
                }}
              >
                <IconBtn
                  icon={Edit2}
                  tooltip="edit"
                  sx={{
                    mr: 2,
                  }}
                  onClick={openEditBidDialog}
                  disabled={
                    bidDetails.job?.state !== "active" ||
                    bidDetails.state !== "pending"
                  }
                />
                <ActionButton
                  variant="outlined"
                  onClick={onWithdrawDialogOpen}
                  sx={{ width: "100%" }}
                  disabled={
                    bidDetails.job?.state !== "active" ||
                    bidDetails.state !== "pending"
                  }
                >
                  {t("job.details.withdraw")}
                </ActionButton>
              </Box>
            </Box>
            <Divider />

            <Box sx={{ width: "100%", mt: 2 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="wrapped label tabs"
                sx={(theme) => ({
                    background:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : undefined,
                           borderColor:
          theme.palette.mode === "dark" ? theme.palette.divider : "divider",
                })}
              >
                <Tab label={TABS.JOB_DETAILS} wrapped />
                <Tab label={TABS.BID_DETAILS} wrapped />
              </Tabs>
              <MuiTabPanel value={value} index={0}>
                <ViewJobDetails jobDetails={bidDetails?.job} />
              </MuiTabPanel>
              <MuiTabPanel value={value} index={1}>
                <BidDetailsTab bidDetails={bidDetails} />
              </MuiTabPanel>
            </Box>
          </Box>
        </Box>
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

export default MyBidsViewDetails;
