import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Box, Stepper, Step, StepLabel, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";
import { MILESTONE_STATE, ACTIONS } from "../../utils/constants/milestone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ActionButton from "../common/ActionButton";
import { useSelector, useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  acceptRejectMilestoneUrl,
  requestPaymentMilestoneUrl,
  updateMilestoneUrl,
} from "../../apis/apiEndPoints";
import { setStateLoading } from "../../redux/milestoneSlice";
import { setJobDetails } from "../../redux/jobSlice";
import { cloneDeep } from "lodash";
import AddNewMilestone from "../milestone/AddNewMilestone";
import PayMilestone from "../milestone/PayMilestone";
import MuiDialog from "../common/MuiDialog";
import { useState } from "react";

// Custom Step Icon to match vertical stepper style
function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 400,
        fontSize: 12,
        bgcolor: completed ? "#7BA51C" : active ? "#fff" : "#BDBDBD",
        color: completed ? "#fff" : active ? "#7BA51C" : "#757575",
        border: active && !completed ? "2px solid #7BA51C" : "none",
        transition: "all 0.2s",
      }}
    >
      {icon}
    </Box>
  );
}

dayjs.extend(relativeTime);

function OverallMilestone({
  jobDetails,
  onPay,
  isClient,
  isContractor,
  isDisabled,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [openPayMilestoneDialog, setOpenPayMilestoneDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState({
    milestoneIndex: null,
    milestoneId: "",
  });
  const [action, setAction] = useState("");
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  const { stateLoading } = useSelector((state) => state.milestone);

  function onActionChange(actionStatus) {
    setAction(actionStatus);
  }

  //open/close add new milestone
  function onOpenMilestoneDialog() {
    onActionChange(ACTIONS.IS_ADD_MORE);
    setOpenMilestoneDialog(true);
  }

  function handleCloseAddMilestone() {
    setOpenMilestoneDialog(false);
  }

  function onMilestoneUpdate(milestoneIndex, milestoneId) {
    onActionChange(ACTIONS.IS_EDIT);
    setSelectedMilestone({ milestoneIndex, milestoneId });
    setOpenMilestoneDialog(true);
  }

  function onMilestoneExtend(milestoneIndex, milestoneId) {
    onActionChange(ACTIONS.IS_EXTEND);
    setSelectedMilestone({ milestoneIndex, milestoneId });
    setOpenMilestoneDialog(true);
  }

  async function onActivateMilestone(index, step) {
    try {
      dispatch(setStateLoading(true));

      const milestonePayload = {
        data: {
          type: "update_milestone",
          state: MILESTONE_STATE.ACTIVE,
        },
      };
      await updateMilestoneUrl(jobDetails.id, step.id, milestonePayload);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      const newJobDetails = cloneDeep(jobDetails);
      const milestones = newJobDetails.milestones;
      milestones[index].state = MILESTONE_STATE.ACTIVE;
      newJobDetails.milestones = milestones;
      dispatch(setJobDetails(newJobDetails));

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_activated"),
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
      dispatch(setStateLoading(false));
    }
  }

  //accept/reject
  async function onRejectMilestone() {
    try {
      dispatch(setStateLoading(true));

      await acceptRejectMilestoneUrl(
        jobDetails.id,
        selectedMilestone.milestoneId,
        MILESTONE_STATE.REJECTED
      );
      const newJobDetails = cloneDeep(jobDetails);
      const milestones = newJobDetails.milestones;
      milestones[selectedMilestone.milestoneIndex].state =
        MILESTONE_STATE.REJECTED;
      newJobDetails.milestones = milestones;
      dispatch(setJobDetails(newJobDetails));
      onCloseRejectDialog();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_rejected"),
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
      dispatch(setStateLoading(false));
    }
  }

  async function onAcceptMilestone() {
    try {
      dispatch(setStateLoading(true));

      await acceptRejectMilestoneUrl(
        jobDetails.id,
        selectedMilestone.milestoneId,
        MILESTONE_STATE.ACCEPTED
      );
      const newJobDetails = cloneDeep(jobDetails);
      const milestones = newJobDetails.milestones;
      milestones[selectedMilestone.milestoneIndex].state =
        MILESTONE_STATE.ACCEPTED;
      newJobDetails.milestones = milestones;
      dispatch(setJobDetails(newJobDetails));
      onCloseAcceptDialog();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_accepted"),
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
      dispatch(setStateLoading(false));
    }
  }

  //open/close pay milestone
  function handleClosePayMilestone() {
    setOpenPayMilestoneDialog(false);
  }

  async function onRequestPayment(milestoneId, milestoneIndex) {
    try {
      dispatch(setStateLoading(true));
      await requestPaymentMilestoneUrl(milestoneId);
      const newJobDetails = cloneDeep(jobDetails);
      const milestones = newJobDetails.milestones;
      milestones[milestoneIndex].state = MILESTONE_STATE.PAYMENT_REQUESTED;
      newJobDetails.milestones = milestones;
      dispatch(setJobDetails(newJobDetails));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_payment_request"),
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
      dispatch(setStateLoading(false));
    }
  }

  //accept milestone dialog
  function onOpenAcceptDialog(milestoneId, index) {
    setSelectedMilestone({
      milestoneIndex: index,
      milestoneId,
    });
    setOpenAcceptDialog(true);
  }
  function onCloseAcceptDialog() {
    setOpenAcceptDialog(false);
  }

  //reject milestone dialog
  function onOpenRejectDialog(milestoneId, index) {
    setSelectedMilestone({
      milestoneIndex: index,
      milestoneId,
    });
    setOpenRejectDialog(true);
  }
  function onCloseRejectDialog() {
    setOpenRejectDialog(false);
  }

  return (
    <Box>
      <Stepper
        alternativeLabel
        activeStep={-1}
        orientation="horizontal"
        sx={{ mb: 6 }}
      >
        {jobDetails?.milestones?.map((milestone, idx) => (
          <Step
            key={milestone.id}
            completed={
              milestone.state === MILESTONE_STATE.ACCEPTED ||
              milestone.state === MILESTONE_STATE.COMPLETED
            }
          >
            <StepLabel
              StepIconComponent={CustomStepIcon}
              StepIconProps={{ icon: idx + 1 }}
              optional={
                <MuiTypography variant="subtitle2" sx={{ textAlign: "center" }}>
                  {milestone.description}
                </MuiTypography>
              }
            >
              {milestone.title}
              <MuiTypography
                variant="h2"
                sx={{ fontWeight: 500, mb: 2, textAlign: "center" }}
              >
                ${milestone.amount}
              </MuiTypography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <CalendarMonthIcon
                  sx={{ fontSize: 18, color: "text.secondary" }}
                />
                <Box>
                  <MuiTypography variant="h6" sx={{ fontSize: "0.75rem" }}>
                    {t("milestone.due_date")}
                  </MuiTypography>
                  <MuiTypography
                    variant="subtitle2"
                    sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                  >
                    {dayjs(milestone.dueDate).format("DD MMM YYYY")}
                  </MuiTypography>
                </Box>
              </Stack>

              {/* Client Actions */}
              {isClient && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  {(milestone.state === MILESTONE_STATE.PENDING ||
                    milestone.state === MILESTONE_STATE.REJECTED) && (
                    <ActionButton
                      disabled={isDisabled || stateLoading}
                      variant="outlined"
                      onClick={() => onMilestoneUpdate(idx, milestone.id)}
                      sx={{ mb: 1 }}
                    >
                      {t("edit")}
                    </ActionButton>
                  )}
                  {idx >= activeStep &&
                    milestone.state === MILESTONE_STATE.ACCEPTED && (
                      <ActionButton
                        disabled={isDisabled || stateLoading}
                        onClick={() => onActivateMilestone(idx, milestone)}
                        sx={{ mb: 1 }}
                      >
                        {t("milestone.activate")}
                      </ActionButton>
                    )}
                  {(milestone.state === MILESTONE_STATE.ACTIVE ||
                    milestone.state === MILESTONE_STATE.PAYMENT_REQUESTED ||
                    milestone.state === MILESTONE_STATE.PARTIAL) && (
                    <ActionButton
                      onClick={() => onPay(idx, milestone.id)}
                      sx={{ mb: 1 }}
                    >
                      {t("milestone.pay")}
                    </ActionButton>
                  )}
                  {milestone.state === MILESTONE_STATE.ACCEPTED && (
                    <ActionButton
                      disabled={isDisabled || stateLoading}
                      variant="outlined"
                      onClick={() => onMilestoneExtend(idx, milestone.id)}
                    >
                      {t("milestone.extend")}
                    </ActionButton>
                  )}
                </Box>
              )}

              {/* Contractor Actions */}
              {isContractor && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  {milestone.state === MILESTONE_STATE.PENDING && (
                    <>
                      <ActionButton
                        disabled={
                          isDisabled ||
                          stateLoading ||
                          jobDetails.milestones[idx - 1]?.state ===
                            MILESTONE_STATE.PENDING
                        }
                        variant="outlined"
                        onClick={() => onOpenRejectDialog(milestone.id, idx)}
                        sx={{ mb: 1, mr: 1 }}
                      >
                        {t("job.details.reject")}
                      </ActionButton>
                      <ActionButton
                        disabled={
                          isDisabled ||
                          stateLoading ||
                          jobDetails.milestones[idx - 1]?.state ===
                            MILESTONE_STATE.PENDING
                        }
                        onClick={() => onOpenAcceptDialog(milestone.id, idx)}
                      >
                        {t("job.details.accept")}
                      </ActionButton>
                    </>
                  )}
                  {(milestone.state === MILESTONE_STATE.ACTIVE ||
                    milestone.state === MILESTONE_STATE.PARTIAL) && (
                    <ActionButton
                      disabled={isDisabled || stateLoading}
                      onClick={() => onRequestPayment(milestone.id, idx)}
                    >
                      {t("milestone.request_payment")}
                    </ActionButton>
                  )}
                </Box>
              )}

              {/* Status Messages */}
              {milestone.state === MILESTONE_STATE.COMPLETED && (
                <MuiTypography
                  variant="descriptionText"
                  sx={{
                    color: "#7BA51C",
                    fontWeight: 500,
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  {t("Milestone has been fully paid and completed")}
                </MuiTypography>
              )}
              {milestone.state === MILESTONE_STATE.PAYMENT_REQUESTED && (
                <MuiTypography
                  variant="descriptionText"
                  sx={{
                    color: "#7BA51C",
                    fontWeight: 500,
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  {t("Payment for the milestone has been requested")}
                </MuiTypography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Add New Milestone Button for Client */}
      {isClient && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <ActionButton
            disabled={isDisabled || stateLoading}
            onClick={onOpenMilestoneDialog}
          >
            {t("milestone.add_new_milestone")}
          </ActionButton>
        </Box>
      )}

      {/* Dialogs */}
      <AddNewMilestone
        id={jobDetails.id}
        milestone={
          action === ACTIONS.IS_ADD_MORE
            ? {}
            : jobDetails.milestones?.[selectedMilestone?.milestoneIndex]
        }
        milestoneId={selectedMilestone.milestoneId}
        openAddMilestone={openMilestoneDialog}
        onCloseAddMilestone={handleCloseAddMilestone}
        isAddMore={action === ACTIONS.IS_ADD_MORE}
        isUpdate={action === ACTIONS.IS_EDIT}
        isExtend={action === ACTIONS.IS_EXTEND}
      />

      <PayMilestone
        milestoneIndex={selectedMilestone.milestoneIndex}
        milestoneId={selectedMilestone.milestoneId}
        openPayMilestone={openPayMilestoneDialog}
        onClosePayMilestone={handleClosePayMilestone}
      />

      <MuiDialog
        title={t("milestone.accept_milestone")}
        open={openAcceptDialog}
        handleClose={onCloseAcceptDialog}
        handleSuccess={onAcceptMilestone}
        yesLabel={t("job.details.accept")}
        noLabel={t("cancel")}
      />

      <MuiDialog
        title={t("milestone.reject_milestone")}
        open={openRejectDialog}
        handleClose={onCloseRejectDialog}
        handleSuccess={onRejectMilestone}
        yesLabel={t("job.details.reject")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

export default OverallMilestone;
