import { useTranslation } from "react-i18next";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, Divider, Tab, Tabs, Tooltip, Stack } from "@mui/material";
import { useMemo } from "react";
import { ArrowLeft } from "iconsax-react";

import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { ROUTES } from "../../utils/constants/route";
import useFetchJobDetails from "../../hooks/useFetchJobDetails";
import ViewJobDetails from "../../components/viewJobDetails";
import { useEffect, useState } from "react";
import MuiTabPanel from "../../components/common/MuiTabPanel";
import UpdateJobDialog from "../../components/viewJobDetails/UpdateJobDialog";
import { getLabelFromId } from "../../utils/common";
import CurrentBidList from "../../components/activeJobs/CurrentBidList";
import {
  acceptBidUrl,
  getUsers,
  getUserBidInvitationsUrl,
} from "../../apis/apiEndPoints";
import MilestoneStepper from "../../components/milestone/MilestoneStepper";
import MilestoneDocumentList from "../../components/milestone/MilestoneDocumentList";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import getContractorTabDetails from "../../utils/getContractorTabDetails";
import ActionButton from "../../components/common/ActionButton";

function MyContractsViewDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.config);
  const { jobDetails } = useSelector((state) => state.job);
  const { profileData } = useSelector((state) => state.profile);

  const { fetchJobById } = useFetchJobDetails();

  const [value, setValue] = useState(0);
  const [openUpdateJob, setOpenUpdateJob] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [contractorInvitations, setContractorInvitations] = useState({});
  // For contractors, if milestones are missing or empty, fetch from /job/:jobId
  const [userMilestones, setUserMilestones] = useState([]);
  const [openDocumetModale, setOpenDocumetModale] = useState(false);
  
  const pastLinks = [
    {
      label: t("breadcrumbs.my_contracts"),
      path: "/" + ROUTES.myContracts,
    },
  ];
  const activeLink = {
    label: t("details"),
  };

  // Helper to check for valid job UUID
  const isValidJobId = (val) =>
    typeof val === "string" && val.length === 36 && val.includes("-");
  // Prefer contract from navigation state, else valid id from route
  const contractFromState = location.state && location.state.contract;
  const jobIdToUse = contractFromState?.id || (isValidJobId(id) ? id : null);

  useEffect(() => {
    if (contractFromState) {
      dispatch({ type: "job/setJobDetails", payload: contractFromState });
    } else if (jobIdToUse) {
      fetchJobById(jobIdToUse);
    } else {
      console.warn("[DEBUG] No valid job ID found in state or route");
    }
  }, [fetchJobById, jobIdToUse, contractFromState, dispatch]);

  useEffect(() => {
    if (!loading && jobDetails) {
      const shouldOpenUpdateDialog =
        searchParams.get("openUpdateDialog") === "true";
      if (shouldOpenUpdateDialog) {
        setOpenUpdateJob(true);
        setValue(0);
      }
    }
  }, [loading, jobDetails, searchParams]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUsers();
        setAllUsers(res.data.data);
      } catch {
        // Optionally handle error
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchInvitations() {
      if (!jobDetails?.jobContractors) return;
      const invitationsMap = {};
      await Promise.all(
        jobDetails.jobContractors.map(async (jc) => {
          try {
            const res = await getUserBidInvitationsUrl(jc.contractor.id);
            // Use the first invitation for this contractor
            const inv = (res.data.data || [])[0];
            if (inv) {
              invitationsMap[jc.contractor.id] = inv;
            }
          } catch {
            // Optionally handle error
          }
        })
      );
      setContractorInvitations(invitationsMap);
    }
    fetchInvitations();
  }, [jobDetails?.jobContractors]);

  //tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCloseUpdateJobDialog = () => {
    setOpenUpdateJob(false);
  };

  // Back button handler
  const handleGoBack = () => {
    navigate("/" + ROUTES.myContracts);
  };

  // Accept/Reject bid handlers (scaffold)
  const handleBidAccept = async (bidId) => {
    try {
      // 1. Accept the bid
      await acceptBidUrl(id, bidId);

      // 2. Fetch updated job details
      if (isValidJobId(id)) {
        await fetchJobById(id);
      } else {
        console.warn(
          "[DEBUG] Skipping fetchJobById after bid accept, invalid id:",
          id
        );
      }

      // 3. Optionally, set the tab to the new contractor (last tab)
      if (jobDetails?.jobContractors) {
        setValue(jobDetails.jobContractors.length); // Project Plan tab index is after contractors
      }

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Bid was accepted successfully",
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
    }
  };
  const handleBidReject = () => {
    // TODO: Call reject bid API and update state
  };
  const handleBidView = () => {
    // TODO: Navigate to bid details or open modal
  };

  // Prepare contractor tabs
  const contractorTabs = useMemo(() => {
    if (!jobDetails?.jobContractors) return [];
    return jobDetails.jobContractors.map((jc) => ({
      contractor: jc.contractor,
      milestones:
        jobDetails.milestones?.filter(
          (m) => String(m.contractorId) === String(jc.contractor.id)
        ) || [],
      bid: jobDetails.bids?.find(
        (b) =>
          String(b.authorId) === String(jc.contractor.id) &&
          b.state === "accepted"
      ),
    }));
  }, [jobDetails]);

  useEffect(() => {
    console.log("contractorTabs", contractorTabs);
  }, [contractorTabs]);

  // Add effect to fetch latest job details (including bids) when Bids tab is selected
  useEffect(() => {
    if (value === contractorTabs.length && isValidJobId(id)) {
      fetchJobById(id);
    } else if (value === contractorTabs.length) {
      fetchJobById(id);
    }
  }, [value, contractorTabs.length, fetchJobById, id]);

  // Add Talent handler
  const handleAssignTalent = () => {
    if (jobDetails?.id) {
      navigate(`/my-contracts/view/${jobDetails.id}/add-talent`);
    }
  };

  // Determine if current user is the author
  const isAuthor = jobDetails?.author?.id === profileData?.id;
  // For contractors, find their tab index
  const contractorTabIndex = contractorTabs.findIndex(
    (tab) => tab.contractor.id === profileData?.id
  );

  useEffect(() => {
    if (isAuthor) {
      return;
    }
    // Get milestones for the contractor
    const contractorMilestones =
      jobDetails?.milestonesByContractor?.[profileData?.id];

    if (
      contractorMilestones &&
      Array.isArray(contractorMilestones) &&
      contractorMilestones.length > 0
    ) {
      setUserMilestones(contractorMilestones);
      return;
    }

    // Fallback to milestones array if present and non-empty
    if (
      Array.isArray(jobDetails?.milestones) &&
      jobDetails.milestones.length > 0
    ) {
      setUserMilestones(jobDetails.milestones);
      return;
    }

    setUserMilestones([]);
  }, [isAuthor, jobDetails, profileData]);

  useEffect(() => {
    // Always show main contractor tab on load
    setValue(0);
  }, [jobDetails?.id]);

  const handleDocumentModale = () => {
    setOpenDocumetModale(!openDocumetModale);
    alert("open");
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
            {/* Header with Back Button and Breadcrumbs */}
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2
            }}>
              {/* Left side: Back Button and Breadcrumbs */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ActionButton
                  variant="outlined"
                  onClick={handleGoBack}
                  sx={{
                    minWidth: "auto",
                    px: 1.5,
                    py: 1,
                    borderColor: "#E0E0E0",
                    color: "#666",
                    "&:hover": {
                      borderColor: "#7BA51C",
                      backgroundColor: "#7BA51C0A",
                      color: "#7BA51C"
                    }
                  }}
                  startIcon={ArrowLeft}
                >
                  Back
                </ActionButton>
                <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
              </Box>
            </Box>

            <MuiTypography variant="h1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
              {t("contract.contract_details")}
            </MuiTypography>

            <Divider />

            <Box sx={{ width: "100%", mt: 2 }}>
              {isAuthor ? (
                <>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="wrapped label tabs"
                    sx={(theme) => ({
                      backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : undefined,
                      borderColor:
                        theme.palette.mode === "dark" ? theme.palette.divider : "divider",
                    })}
                  >
                    {contractorTabs.map((tab) => {
                      const tabTitleNew =
                        contractorInvitations[tab?.contractor?.id];
                      const tabTitle = tabTitleNew?.title || jobDetails?.title;

                      return (
                        <Tooltip
                          key={tab.contractor.id}
                          title={`${tabTitle} Details`}
                          arrow
                        >
                          <Tab
                            label={
                              <div
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: 120,
                                }}
                              >
                                {tabTitle} Details
                              </div>
                            }
                            wrapped={false}
                          />
                        </Tooltip>
                      );
                    })}
                    <Tab label={t("job.details.bids_tab")} wrapped />
                  </Tabs>
                  {contractorTabs.map((tab, index) => (
                    <MuiTabPanel
                      value={value}
                      index={index}
                      key={tab.contractor.id}
                    >
                      {(() => {
                        const invitation =
                          contractorInvitations[tab.contractor.id];
                        // Always check for main contractor by contractorId field
                        const isMainMenuContractor =
                          jobDetails?.contractorId === tab.contractor.id;
                        // For non-main contractor, get invitation by jobId and contractorId
                        let invitationForTab = invitation;
                        if (
                          !isMainMenuContractor &&
                          !invitationForTab &&
                          Array.isArray(jobDetails.bidInvitations)
                        ) {
                          invitationForTab = jobDetails.bidInvitations.find(
                            (inv) =>
                              inv.jobId === jobDetails.id &&
                              inv.title === tab.title
                          );
                        }
                        const tabDetails = getContractorTabDetails({
                          jobDetails,
                          jobContractors: jobDetails.jobContractors,
                          bidInvitations: jobDetails.bidInvitations,
                          contractor: tab.contractor,
                        });
                        const mergedJobDetails = {
                          ...jobDetails,
                          ...tabDetails,
                          budget: tab.bid?.amount,
                          amount: tab.bid?.amount,
                          documents: tab.bid?.documents,
                        };

                        return (
                          <>
                            <MilestoneStepper
                              milestoneSteps={tab.milestones}
                              id={mergedJobDetails.id}
                              isDisabled={
                                mergedJobDetails.state === "completed"
                              }
                              isClient={
                                mergedJobDetails?.author?.id === profileData?.id
                              }
                              isContractor={
                                tab.contractor.id === profileData?.id
                              }
                              title="job.information"
                              contractorId={tab.contractor.id}
                              jobState={mergedJobDetails.state}
                            />
                            <MilestoneDocumentList
                              milestoneSteps={tab.milestones}
                              jobId={jobDetails?.id}
                            />
                            <ViewJobDetails
                              invitation={invitation}
                              jobDetails={mergedJobDetails}
                              talentUser={{
                                ...tab.contractor,
                              }}
                              allUsers={allUsers}
                              showClient={
                                mergedJobDetails?.author?.id !== profileData?.id
                              }
                              showContractor={false}
                              isContract={true}
                            />
                          </>
                        );
                      })()}
                    </MuiTabPanel>
                  ))}

                  <MuiTabPanel value={value} index={contractorTabs.length}>
                    <CurrentBidList
                      jobType={getLabelFromId(jobDetails?.title, "title")}
                      bidList={jobDetails.bids}
                      onBidAccept={handleBidAccept}
                      onBidReject={handleBidReject}
                      onBidView={handleBidView}
                      jobDetails={jobDetails}
                    />
                  </MuiTabPanel>
                </>
              ) : (
                contractorTabIndex !== -1 && (
                  <MuiTabPanel
                    value={0}
                    index={0}
                    key={contractorTabs[contractorTabIndex].contractor.id}
                  >
                    {(() => {
                      const invitation =
                        contractorInvitations[
                        contractorTabs[contractorTabIndex].contractor.id
                        ];
                      // Always check for main contractor by contractorId field
                      const isMainMenuContractor =
                        jobDetails?.contractorId ===
                        contractorTabs[contractorTabIndex].contractor.id;
                      // For non-main contractor, get invitation by jobId and contractorId
                      let invitationForTab = invitation;
                      if (
                        !isMainMenuContractor &&
                        !invitationForTab &&
                        Array.isArray(jobDetails.bidInvitations)
                      ) {
                        invitationForTab = jobDetails.bidInvitations.find(
                          (inv) =>
                            inv.jobId === jobDetails.id &&
                            inv.title ===
                            contractorTabs[contractorTabIndex].title
                        );
                      }
                      const tabDetails = getContractorTabDetails({
                        jobDetails,
                        jobContractors: jobDetails.jobContractors,
                        bidInvitations: jobDetails.bidInvitations,
                        contractor:
                          contractorTabs[contractorTabIndex].contractor,
                      });
                      const mergedJobDetails = {
                        ...jobDetails,
                        ...tabDetails,
                        budget: contractorTabs[contractorTabIndex].bid?.amount,
                        amount: contractorTabs[contractorTabIndex].bid?.amount,
                        documents:
                          contractorTabs[contractorTabIndex].bid?.documents,
                      };

                      return (
                        <>
                          <MilestoneStepper
                            milestoneSteps={userMilestones}
                            id={mergedJobDetails.id}
                            isDisabled={mergedJobDetails.state === "completed"}
                            isClient={
                              mergedJobDetails?.author?.id === profileData?.id
                            }
                            isContractor={
                              contractorTabs[contractorTabIndex].contractor
                                .id === profileData?.id
                            }
                            title="job.information"
                            contractorId={
                              contractorTabs[contractorTabIndex].contractor.id
                            }
                            jobState={mergedJobDetails.state}
                          />
                          <MilestoneDocumentList
                            milestoneSteps={userMilestones}
                            jobId={jobDetails?.id}
                          />
                          <ViewJobDetails
                            jobDetails={mergedJobDetails}
                            talentUser={{
                              ...contractorTabs[contractorTabIndex].contractor,
                            }}
                            allUsers={allUsers}
                            showClient={
                              mergedJobDetails?.author?.id !== profileData?.id
                            }
                            showContractor={false}
                            isContract={true}
                          />
                        </>
                      );
                    })()}
                  </MuiTabPanel>
                )
              )}
            </Box>
          </Box>
        </Box>
      )}

      <UpdateJobDialog
        open={openUpdateJob}
        onClose={handleCloseUpdateJobDialog}
        jobDetails={jobDetails}
      />
    </>
  );
}

export default MyContractsViewDetails;