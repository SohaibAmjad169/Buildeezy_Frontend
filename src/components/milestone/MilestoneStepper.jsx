import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import {
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  CalendarToday,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import Divider from "@mui/material/Divider";

import MuiTypography from "../common/MuiTypography";
import ActionButton from "../common/ActionButton";
import AddNewMilestone from "./AddNewMilestone";
import MilestoneStepSkeleton from "../skeleton/MilestoneStepSkeleton";
import { ACTIONS, MILESTONE_STATE } from "../../utils/constants/milestone";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  acceptRejectMilestoneUrl,
  updateMilestoneUrl,
  requestPaymentMilestoneUrl,
  cancelMilestoneUrl,
} from "../../apis/apiEndPoints";
import { setStateLoading } from "../../redux/milestoneSlice";
import PayMilestone from "./PayMilestone";
import MilestoneState from "./MilestoneState";
import MuiDialog from "../common/MuiDialog";
import PaymentMethodSelector from "../common/PaymentMethodSelector";
import useFetchMyContractById from "../../hooks/useFetchMyContractById";
import CancelMilestone from "./CancelMilestone";
import { useSearchParams } from "react-router-dom";
import useMilestoneVerification from "../../hooks/useMilestoneVerification";

// Custom Step Icon to match horizontal stepper style
function CustomStepIcon(props) {
  const { active, completed, icon, isVertical, stepState } = props;

  const isCancelled = stepState === MILESTONE_STATE.CANCELLED;

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
        bgcolor: isCancelled
          ? "#f44336"
          : stepState === MILESTONE_STATE.PAYMENT_PENDING
          ? "#ff9800"
          : completed
          ? "#7BA51C"
          : active
          ? "#fff"
          : "#BDBDBD",
        color: isCancelled
          ? "#fff"
          : stepState === MILESTONE_STATE.PAYMENT_PENDING
          ? "#fff"
          : completed
          ? "#fff"
          : active
          ? "#7BA51C"
          : "#757575",
        border:
          active && !completed && !isCancelled ? "2px solid #7BA51C" : "none",
        transition: "all 0.2s",
        marginBottom: isVertical ? "0px" : "8px",
        position: isVertical ? "relative" : "static",
        zIndex: 1,
      }}
    >
      {icon}
    </Box>
  );
}

// Add refund status indicator component
const RefundStatusIndicator = ({ milestone }) => {
  const { t } = useTranslation();

  const getRefundStatusConfig = (status) => {
    switch (status) {
      case "processed":
        return {
          color: "#4caf50",
          bgcolor: "#e8f5e8",
          icon: "✓",
          text: t("milestone.refund_processed"),
        };
      case "pending":
        return {
          color: "#ff9800",
          bgcolor: "#fff3e0",
          icon: "⏳",
          text: t("milestone.refund_pending"),
        };
      case "requires_manual_processing":
        return {
          color: "#2196f3",
          bgcolor: "#e3f2fd",
          icon: "⚠️",
          text: t("milestone.refund_manual_processing"),
        };
      case "failed":
        return {
          color: "#f44336",
          bgcolor: "#ffebee",
          icon: "✗",
          text: t("milestone.refund_failed"),
        };
      default:
        return {
          color: "#757575",
          bgcolor: "#f5f5f5",
          icon: "?",
          text: t("milestone.refund_status_unknown"),
        };
    }
  };

  if (!milestone.refundStatus) return null;

  const config = getRefundStatusConfig(milestone.refundStatus);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.5,
        bgcolor: config.bgcolor,
        border: `1px solid ${config.color}`,
        borderRadius: 1,
        mt: 1,
      }}
    >
      <Box sx={{ fontSize: "1rem" }}>{config.icon}</Box>
      <Box sx={{ flex: 1 }}>
        <MuiTypography
          variant="body2"
          sx={{ fontWeight: 500, color: config.color }}
        >
          {config.text}
        </MuiTypography>
        {milestone.refundAmount && (
          <MuiTypography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
          >
            Amount: ${milestone.refundAmount}
          </MuiTypography>
        )}
        {milestone.refundProcessedAt && (
          <MuiTypography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
          >
            Processed:{" "}
            {dayjs(milestone.refundProcessedAt).format("DD MMM YYYY HH:mm")}
          </MuiTypography>
        )}
      </Box>
    </Box>
  );
};

function MilestoneStepper({
  id,
  milestoneSteps,
  isDisabled,
  isClient,
  isContractor,
  title = "job.information",
  showAddTalentButton = false,
  onAddTalent,
  contractorId,
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [searchParams] = useSearchParams();
  const cancel = searchParams.get("cancel");

  const dispatch = useDispatch();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [openPayMilestoneDialog, setOpenPayMilestoneDialog] = useState(false);
  const [openCancelMilestone, setOpenCancelMilestone] = useState(false);
  const [isVerticalView, setIsVerticalView] = useState(isMobile);
  const [visibleMilestones, setVisibleMilestones] = useState(4);
  const [selectedMilestone, setSelectedMilestone] = useState({
    milestoneIndex: null,
    milestoneId: "",
    action: "isPay",
  });
  const [action, setAction] = useState("");
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [milstoneDetails, setmilstoneDetails] = useState({
    amount: 0,
    description: "",
    state: "",
    title: "",
    id: "",
    createdAt: "",
    dueDate: "",
  });

  const { milestoneLoading, stateLoading } = useSelector(
    (state) => state.milestone
  );
  const { fetchMyContractById } = useFetchMyContractById();

  const { handleMilestoneAction, requiresVerification } =
    useMilestoneVerification();

  // Local state for optimistic updates
  const [localMilestones, setLocalMilestones] = useState(milestoneSteps || []);

  useEffect(() => {
    setLocalMilestones(milestoneSteps || []);
  }, [milestoneSteps]);

  useEffect(() => {
    setIsVerticalView(isMobile);
  }, [isMobile]);

  // Utility functions
  function updateLocalMilestoneState(index, newState) {
    setLocalMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, state: newState } : m))
    );
  }

  function revertLocalMilestoneState(index, prevState) {
    setLocalMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, state: prevState } : m))
    );
  }

  function onActionChange(actionStatus) {
    setAction(actionStatus);
  }

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
    const proceedWithActivation = async () => {
      const prevState = localMilestones[index]?.state;
      try {
        dispatch(setStateLoading(true));
        updateLocalMilestoneState(index, MILESTONE_STATE.ACTIVE);
        const milestonePayload = {
          data: {
            type: "update_milestone",
            state: MILESTONE_STATE.ACTIVE,
          },
        };
        await updateMilestoneUrl(id, step.id, milestonePayload);
        setActiveStep(index);
        fetchMyContractById(id);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("milestone.milestone_activated"),
          })
        );
      } catch (err) {
        revertLocalMilestoneState(index, prevState);
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

    // Use the milestone verification hook
    handleMilestoneAction(step.amount, proceedWithActivation);
  }

  async function onRejectMilestone() {
    try {
      dispatch(setStateLoading(true));
      await acceptRejectMilestoneUrl(
        id,
        selectedMilestone.milestoneId,
        MILESTONE_STATE.REJECTED
      );
      await fetchMyContractById(id);
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
        id,
        selectedMilestone.milestoneId,
        MILESTONE_STATE.ACCEPTED
      );
      await fetchMyContractById(id);
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

  function handleClosePayMilestone() {
    setOpenPayMilestoneDialog(false);
  }

  async function onPay(index, milestoneId, action = "isPay") {
    const step = localMilestones[index];

    const proceedWithPay = () => {
      setSelectedMilestone({ milestoneIndex: index, milestoneId, action });
      setOpenPayMilestoneDialog(true);
    };

    // Use the milestone verification hook
    handleMilestoneAction(step.amount, proceedWithPay);
  }

  const getVerificationIndicator = (amount) => {
    if (requiresVerification(amount)) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            ml: 1,
            px: 1,
            py: 0.5,
            bgcolor: "#FFF3CD",
            borderRadius: 1,
            border: "1px solid #FFECB5",
          }}
        >
          <MuiTypography
            variant="caption"
            sx={{ color: "#856404", fontWeight: 500 }}
          >
            Verification Required
          </MuiTypography>
        </Box>
      );
    }
    return null;
  };

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

  const handleOpenPayment = (
    amount,
    description,
    state,
    title,
    id,
    createdAt,
    dueDate
  ) => {
    const proceedWithPayment = () => {
      setOpenPaymentDialog(true);
      setmilstoneDetails({
        amount,
        description,
        state,
        title,
        id,
        createdAt,
        dueDate,
      });
    };

    // Use the milestone verification hook - this will either proceed or trigger verification
    handleMilestoneAction(amount, proceedWithPayment);
  };

  const handleClosePayment = () => {
    setOpenPaymentDialog(false);
  };

  async function onRequestPayment(index, milestoneId) {
    try {
      dispatch(setStateLoading(true));
      await requestPaymentMilestoneUrl(milestoneId);
      updateLocalMilestoneState(index, MILESTONE_STATE.PAYMENT_REQUESTED);
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

  async function onCancelMilestone(index, milestoneId) {
    try {
      dispatch(setStateLoading(true));
      await cancelMilestoneUrl(milestoneId);
      await fetchMyContractById(id);
      setOpenCancelMilestone(false);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_cancelled"),
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

  const handleShowMore = () => {
    setVisibleMilestones((prev) => Math.min(prev + 4, localMilestones.length));
  };

  const handleShowLess = () => {
    setVisibleMilestones(4);
  };

  const displayedMilestones = isVerticalView
    ? localMilestones
    : localMilestones?.slice(0, visibleMilestones) || [];

  const MilestoneContent = ({ step, index }) => (
    <Box
      sx={{
        textAlign: isVerticalView ? "left" : "center",
        pl: isVerticalView ? 2 : 0,
        width: "100%",
        minHeight: isVerticalView ? "auto" : "280px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: step.state === MILESTONE_STATE.CANCELLED ? 0.85 : 1,
        position: "relative",
      }}
    >
      {/* Cancelled Badge */}
      {step.state === MILESTONE_STATE.CANCELLED && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            bgcolor: "#f44336",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.75rem",
            fontWeight: 600,
            zIndex: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {t("milestone.cancelled").toUpperCase()}
        </Box>
      )}

      <Box>
        <MuiTypography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            textDecoration:
              step.state === MILESTONE_STATE.CANCELLED
                ? "line-through"
                : "none",
            color:
              step.state === MILESTONE_STATE.CANCELLED
                ? "text.secondary"
                : "inherit",
          }}
        >
          {step.title}
        </MuiTypography>

        <MuiTypography
          variant="subtitle2"
          sx={{
            mb: 2,
            color:
              step.state === MILESTONE_STATE.CANCELLED
                ? "text.disabled"
                : "text.secondary",
          }}
        >
          {step.description}
        </MuiTypography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isVerticalView ? "flex-start" : "center",
            mb: 2,
          }}
        >
          <MuiTypography
            variant="h2"
            sx={{
              fontWeight: 500,
              textDecoration:
                step.state === MILESTONE_STATE.CANCELLED
                  ? "line-through"
                  : "none",
              color:
                step.state === MILESTONE_STATE.CANCELLED
                  ? "text.disabled"
                  : "inherit",
            }}
          >
            ${step.amount}
          </MuiTypography>
          {step.state !== MILESTONE_STATE.CANCELLED &&
            getVerificationIndicator(step.amount)}
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ mt: "auto" }}>
        {step.state === MILESTONE_STATE.CANCELLED ? (
          <Box sx={{ textAlign: "center" }}>
            {/* Simple text indication */}
            <MuiTypography
              variant="body2"
              color="error"
              sx={{ fontWeight: 500, mb: 0.5 }}
            >
              Milestone Cancelled
            </MuiTypography>

            {step.updatedAt && (
              <MuiTypography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                {dayjs(step.updatedAt).format("DD MMM YYYY")}
              </MuiTypography>
            )}

            {/* Simple refund status text */}
            {step.refundStatus && (
              <MuiTypography
                variant="caption"
                color={
                  step.refundStatus === "processed"
                    ? "success.main"
                    : "warning.main"
                }
                sx={{ fontWeight: 500 }}
              >
                {step.refundStatus === "processed"
                  ? "Refund Processed"
                  : "Refund Pending"}
              </MuiTypography>
            )}
          </Box>
        ) : (
          <>
            {/* Due Date Row with Action Buttons */}
            <Stack
              direction={isVerticalView ? "row" : "column"}
              alignItems={isVerticalView ? "center" : "center"}
              justifyContent={isVerticalView ? "space-between" : "center"}
              spacing={isVerticalView ? 0 : 2}
              sx={{ mb: 2, width: "100%" }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  justifyContent: isVerticalView ? "flex-start" : "center",
                }}
              >
                <CalendarToday sx={{ fontSize: 18 }} />
                <Box>
                  <MuiTypography variant="h6" sx={{ fontSize: "0.75rem" }}>
                    {t("milestone.due_date")}
                  </MuiTypography>
                  <MuiTypography
                    variant="subtitle2"
                    sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                  >
                    {dayjs(step.dueDate).format("DD MMM YYYY")}
                  </MuiTypography>
                </Box>
              </Stack>

              {/* Fixed Action Buttons Logic */}
              <Stack
                direction={isVerticalView ? "row" : "column"}
                spacing={1}
                sx={{
                  alignItems: "center",
                  justifyContent: isVerticalView ? "flex-end" : "center",
                  width: isVerticalView ? "auto" : "100%",
                }}
              >
                {/* Client Actions */}
                {isClient && (
                  <>
                    {/* PENDING/REJECTED: Edit button only */}
                    {(step.state === MILESTONE_STATE.PENDING ||
                      step.state === MILESTONE_STATE.REJECTED) && (
                      <ActionButton
                        disabled={isDisabled || stateLoading}
                        variant="outlined"
                        onClick={() => onMilestoneUpdate(index, step.id)}
                        sx={{ mb: 1 }}
                      >
                        {t("edit")}
                      </ActionButton>
                    )}

                    {/* ACCEPTED: Activate, Extend, Cancel buttons */}
                    {step.state === MILESTONE_STATE.ACCEPTED && (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <ActionButton
                          disabled={isDisabled || stateLoading}
                          onClick={() =>
                            handleOpenPayment(
                              step?.amount,
                              step?.description,
                              step?.state,
                              step?.title,
                              step?.id,
                              step?.createdAt,
                              step?.dueDate
                            )
                          }
                          sx={{
                            bgcolor: "#7BA51C",
                            minWidth: 90,
                            px: 2,
                            fontWeight: 600,
                            color: "#fff",
                            "&:hover": { bgcolor: "#698D17" },
                          }}
                        >
                          {t("milestone.activate")}
                        </ActionButton>

                        <ActionButton
                          disabled={isDisabled || stateLoading}
                          variant="outlined"
                          onClick={() => onMilestoneExtend(index, step.id)}
                        >
                          {t("milestone.extend")}
                        </ActionButton>

                        <ActionButton
                          onClick={() => {
                            setSelectedMilestone({
                              milestoneIndex: index,
                              milestoneId: step.id,
                            });
                            setOpenCancelMilestone(true);
                          }}
                          color="error"
                          variant="outlined"
                        >
                          {t("milestone.cancel")}
                        </ActionButton>
                      </Stack>
                    )}

                    {/* ACTIVE/PAYMENT_REQUESTED/PARTIAL: Pay and Cancel buttons */}
                    {(step.state === MILESTONE_STATE.ACTIVE ||
                      step.state === MILESTONE_STATE.PAYMENT_REQUESTED ||
                      step.state === MILESTONE_STATE.PARTIAL) && (
                      <Box display="flex" gap={1} justifyContent="center">
                        <ActionButton
                          onClick={() => onPay(index, step.id)}
                          sx={{ mb: 1 }}
                        >
                          {t("milestone.pay")}
                        </ActionButton>

                        <ActionButton
                          onClick={() => {
                            setSelectedMilestone({
                              milestoneIndex: index,
                              milestoneId: step.id,
                            });
                            setOpenCancelMilestone(true);
                          }}
                          sx={{ mb: 1 }}
                          color="error"
                          variant="outlined"
                        >
                          {t("milestone.cancel")}
                        </ActionButton>
                      </Box>
                    )}

                    {/* PAYMENT_PENDING: No action buttons, status is shown in MilestoneState */}
                    {step.state === MILESTONE_STATE.PAYMENT_PENDING && (
                      <Box display="flex" gap={1} justifyContent="center">
                        {/* Actions disabled during payment processing - status shown below */}
                      </Box>
                    )}
                  </>
                )}

                {/* Contractor Actions */}
                {isContractor && (
                  <>
                    {step?.state === MILESTONE_STATE.PENDING && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap", gap: 1 }}
                      >
                        <ActionButton
                          disabled={
                            isDisabled ||
                            stateLoading ||
                            localMilestones[index - 1]?.state ===
                              MILESTONE_STATE.PENDING
                          }
                          variant="outlined"
                          onClick={() => onOpenRejectDialog(step.id, index)}
                          size="small"
                          sx={{ width: "auto", minWidth: "80px" }}
                        >
                          {t("job.details.reject")}
                        </ActionButton>
                        <ActionButton
                          disabled={
                            isDisabled ||
                            stateLoading ||
                            localMilestones[index - 1]?.state ===
                              MILESTONE_STATE.PENDING
                          }
                          onClick={() => onOpenAcceptDialog(step.id, index)}
                          size="small"
                          sx={{ width: "auto", minWidth: "80px" }}
                        >
                          {t("job.details.accept")}
                        </ActionButton>
                      </Stack>
                    )}

                    {step?.state === MILESTONE_STATE.ACTIVE && (
                      <ActionButton
                        disabled={isDisabled || stateLoading}
                        onClick={() => onRequestPayment(index, step.id)}
                        size="small"
                        sx={{ width: "auto", minWidth: "120px" }}
                      >
                        {t("milestone.request_payment")}
                      </ActionButton>
                    )}

                    {cancel === "1" && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap", gap: 1 }}
                      >
                        <ActionButton
                          size="small"
                          sx={{ width: "auto", minWidth: "80px" }}
                        >
                          {t("milestone.approve")}
                        </ActionButton>
                        <ActionButton
                          onClick={() => onPay(index, step.id, "isQuery")}
                          variant="outlined"
                          sx={{
                            color: "#719C40",
                            borderColor: "#719C40",
                            width: "auto",
                            minWidth: "80px",
                            "&:hover": {
                              backgroundColor: "#719C401A",
                              borderColor: "#719C40",
                            },
                          }}
                          size="small"
                        >
                          {t("milestone.query")}
                        </ActionButton>
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            </Stack>

            <Box sx={{ mt: 2 }}>
              <MilestoneState step={step} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Title Section */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
        sx={{ pr: 1, mt: 2 }}
      >
        <MuiTypography variant="h3" sx={{ fontWeight: 600 }}>
          {t(title)}
        </MuiTypography>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* View Toggle Button - Only show on desktop */}
          {!isMobile && (
            <IconButton
              onClick={() => setIsVerticalView(!isVerticalView)}
              sx={{
                bgcolor: isVerticalView ? "#7BA51C" : "transparent",
                color: isVerticalView ? "#fff" : "#7BA51C",
                border: "1px solid #7BA51C",
                borderRadius: 1,
                "&:hover": {
                  bgcolor: isVerticalView ? "#698D17" : "#7BA51C1A",
                },
              }}
              size="small"
            >
              {isVerticalView ? (
                <KeyboardArrowUp sx={{ fontSize: 16 }} />
              ) : (
                <KeyboardArrowDown sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          )}

          {showAddTalentButton && (
            <ActionButton variant="outlined" onClick={onAddTalent}>
              {t("milestone.add_talent")}
            </ActionButton>
          )}

          {isClient && (
            <ActionButton
              disabled={isDisabled || stateLoading}
              onClick={onOpenMilestoneDialog}
              sx={{
                bgcolor: "#7BA51C",
                "&:hover": {
                  bgcolor: "#698D17",
                },
              }}
            >
              {t("milestone.add_new_milestone")}
            </ActionButton>
          )}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {milestoneLoading ? (
        <MilestoneStepSkeleton />
      ) : (
        <Box>
          {isVerticalView ? (
            // Vertical Stepper
            <Box>
              {localMilestones?.map((step, index) => (
                <Box
                  key={step.id}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                    mb: index === localMilestones.length - 1 ? 0 : 4,
                  }}
                >
                  {/* Step Number Circle */}
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
                      bgcolor:
                        step.state === MILESTONE_STATE.CANCELLED
                          ? "#f44336"
                          : step.state === MILESTONE_STATE.PAYMENT_PENDING
                          ? "#ff9800"
                          : step.state === MILESTONE_STATE.ACCEPTED ||
                            step.state === MILESTONE_STATE.COMPLETED
                          ? "#7BA51C"
                          : "#BDBDBD",
                      color:
                        step.state === MILESTONE_STATE.CANCELLED
                          ? "#fff"
                          : step.state === MILESTONE_STATE.PAYMENT_PENDING
                          ? "#fff"
                          : step.state === MILESTONE_STATE.ACCEPTED ||
                            step.state === MILESTONE_STATE.COMPLETED
                          ? "#fff"
                          : "#757575",
                      mr: 2,
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  >
                    {index + 1}
                  </Box>

                  {/* Connector Line - Only show if not the last item */}
                  {index < localMilestones.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: "11px",
                        top: "32px",
                        width: "2px",
                        height: "calc(100% + 16px)",
                        bgcolor: "#7BA51C",
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Milestone Content */}
                  <Box sx={{ flex: 1, width: "100%" }}>
                    <MilestoneContent step={step} index={index} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            // Horizontal Stepper with improved layout
            <Box>
              <Box
                sx={{
                  overflowX: "auto",
                  pb: 2,
                  "&::-webkit-scrollbar": {
                    height: 6,
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#7BA51C",
                    borderRadius: 3,
                  },
                }}
              >
                <Stepper
                  alternativeLabel
                  activeStep={-1}
                  orientation="horizontal"
                  sx={{
                    mb: 4,
                    minWidth: `${displayedMilestones.length * 320}px`, // Increased width for better spacing
                    "& .MuiStepConnector-root": {
                      top: 12,
                      left: "calc(-50% + 12px)",
                      right: "calc(50% + 12px)",
                    },
                    "& .MuiStepConnector-line": {
                      borderTopWidth: 2,
                      borderColor: "#7BA51C",
                    },
                  }}
                >
                  {displayedMilestones?.map((step, index) => (
                    <Step
                      key={step.id}
                      completed={
                        step.state === MILESTONE_STATE.ACCEPTED ||
                        step.state === MILESTONE_STATE.COMPLETED
                      }
                      sx={{
                        minWidth: 300,
                        maxWidth: 300,
                        "& .MuiStepLabel-root": {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        },
                        "& .MuiStepLabel-labelContainer": {
                          width: "100%",
                          textAlign: "center",
                        },
                      }}
                    >
                      <StepLabel
                        StepIconComponent={CustomStepIcon}
                        StepIconProps={{
                          icon: index + 1,
                          isVertical: false,
                          stepState: step.state,
                        }}
                        optional={
                          <Box sx={{ width: "100%", mt: 2 }}>
                            <MilestoneContent step={step} index={index} />
                          </Box>
                        }
                      />
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Show More/Less Controls */}
              {localMilestones.length > 4 && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  {visibleMilestones < localMilestones.length && (
                    <ActionButton
                      variant="outlined"
                      onClick={handleShowMore}
                      size="small"
                    >
                      Show More ({localMilestones.length - visibleMilestones}{" "}
                      more)
                    </ActionButton>
                  )}

                  {visibleMilestones > 4 && (
                    <ActionButton
                      variant="outlined"
                      onClick={handleShowLess}
                      size="small"
                    >
                      Show Less
                    </ActionButton>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <Dialog
        open={openPaymentDialog}
        onClose={handleClosePayment}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0 }}>
          <PaymentMethodSelector
            onClose={(event, reason) => {
              if (reason !== "backdropClick") {
                handleClosePayment();
              }
            }}
            milstoneDetails={milstoneDetails}
            page={"milestone"}
          />
        </DialogContent>
      </Dialog>

      <AddNewMilestone
        id={id}
        milestone={
          action === ACTIONS.IS_ADD_MORE
            ? {}
            : localMilestones?.[selectedMilestone?.milestoneIndex]
        }
        milestoneId={selectedMilestone.milestoneId}
        openAddMilestone={openMilestoneDialog}
        onCloseAddMilestone={handleCloseAddMilestone}
        isAddMore={action === ACTIONS.IS_ADD_MORE}
        isUpdate={action === ACTIONS.IS_EDIT}
        isExtend={action === ACTIONS.IS_EXTEND}
        contractorId={contractorId}
      />

      <PayMilestone
        milestoneIndex={selectedMilestone.milestoneIndex}
        milestoneId={selectedMilestone.milestoneId}
        openPayMilestone={openPayMilestoneDialog}
        onClosePayMilestone={handleClosePayMilestone}
        onPaySuccess={() => fetchMyContractById(id)}
        action={selectedMilestone.action}
      />

      <CancelMilestone
        milestoneIndex={selectedMilestone.milestoneIndex}
        milestoneId={selectedMilestone.milestoneId}
        openCancelMilestone={openCancelMilestone}
        onCloseCancelMilestone={() => setOpenCancelMilestone(false)}
        onCancelSuccess={() =>
          onCancelMilestone(
            selectedMilestone.milestoneIndex,
            selectedMilestone.milestoneId
          )
        }
      />

      <MuiDialog
        title={t("milestone.accept_milestone_title")}
        subtitle={t("milestone.accept_milestone_subtitle")}
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

export default MilestoneStepper;
