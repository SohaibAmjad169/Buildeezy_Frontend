import { Box } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MilestoneDocumentList from "../milestone/MilestoneDocumentList";
import GeneralInformation from "../milestone/GeneralInformation";
import MilestoneStepper from "../milestone/MilestoneStepper";
import NoData from "../common/NoData";
import { useTranslation } from "react-i18next";
import { requestPaymentMilestoneUrl } from "../../apis/apiEndPoints";
import { MILESTONE_STATE } from "../../utils/constants/milestone";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setStateLoading } from "../../redux/milestoneSlice";
import { cloneDeep } from "lodash";
import { setJobDetails } from "../../redux/jobSlice";
import { useState } from "react";
import PayMilestone from "../milestone/PayMilestone";
import SelectMilestoneDialog from "../milestone/SelectMilestoneDialog";
import MuiTypography from "../common/MuiTypography";

dayjs.extend(relativeTime);

function ViewContractDetails({
  jobDetails,
  showAddTalentButton = false,
  title = "job.information",
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [openSelectDialog, setOpenSelectDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState({
    milestoneIndex: null,
    milestoneId: "",
    contractorId: "",
  });

  const { profileData } = useSelector((state) => state.profile);

  const handleAssignTalent = () => {
    navigate(`/my-contracts/view/${jobDetails.id}/add-talent`);
  };

  const handleSelectMilestone = async (milestone, index, contractorId) => {
    setOpenSelectDialog(false);
    if (milestone.state === MILESTONE_STATE.PAYMENT_REQUESTED) {
      setSelectedMilestone({
        milestoneIndex: index,
        milestoneId: milestone.id,
        contractorId,
      });
      setOpenPayDialog(true);
      return;
    }
    try {
      dispatch(setStateLoading(true));
      await requestPaymentMilestoneUrl(milestone.id);
      const newJobDetails = cloneDeep(jobDetails);
      const milestones = newJobDetails.milestonesByContractor[contractorId];
      milestones[index].state = MILESTONE_STATE.PAYMENT_REQUESTED;
      newJobDetails.milestonesByContractor[contractorId] = milestones;
      dispatch(setJobDetails(newJobDetails));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_payment_request"),
        })
      );
      setSelectedMilestone({
        milestoneIndex: index,
        milestoneId: milestone.id,
        contractorId,
      });
      setOpenPayDialog(true);
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setStateLoading(false));
    }
  };

  return (
    <Box>
      {jobDetails.jobContractors && jobDetails.jobContractors.length > 0 ? (
        jobDetails.jobContractors.map((contractor) => (
          <Box key={contractor.contractorId} sx={{ mb: 6 }}>
            <MilestoneStepper
              milestoneSteps={
                jobDetails.milestonesByContractor?.[contractor.contractorId] ||
                []
              }
              id={jobDetails.id}
              contractorId={contractor.contractorId}
              isDisabled={jobDetails.state === "completed"}
              isClient={jobDetails?.author?.id === profileData?.id}
              isContractor={contractor.contractorId === profileData?.id}
              title={title}
              showAddTalentButton={showAddTalentButton}
              onAddTalent={handleAssignTalent}
            />
            <SelectMilestoneDialog
              open={openSelectDialog}
              onClose={() => setOpenSelectDialog(false)}
              milestones={
                jobDetails.milestonesByContractor?.[contractor.contractorId] ||
                []
              }
              onSelectMilestone={(milestone, idx) =>
                handleSelectMilestone(milestone, idx, contractor.contractorId)
              }
            />
            <PayMilestone
              milestoneIndex={selectedMilestone.milestoneIndex}
              milestoneId={selectedMilestone.milestoneId}
              openPayMilestone={
                openPayDialog &&
                selectedMilestone.contractorId === contractor.contractorId
              }
              onClosePayMilestone={() => setOpenPayDialog(false)}
            />
          </Box>
        ))
      ) : (
        <Box
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          <NoData />
        </Box>
      )}
      {/* General Information above Documents */}
      <GeneralInformation jobDetails={jobDetails} />
      <MilestoneDocumentList
        key="milestone-documents"
        milestoneSteps={
          jobDetails.milestonesByContractor?.[
            Object.keys(jobDetails.milestonesByContractor || {})[0]
          ] || []
        }
      />
    </Box>
  );
}

export default ViewContractDetails;
