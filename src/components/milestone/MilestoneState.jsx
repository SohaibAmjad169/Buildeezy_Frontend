import dayjs from "dayjs";
import MuiTypography from "../common/MuiTypography";
import { MILESTONE_STATE } from "../../utils/constants/milestone";
import { useTranslation } from "react-i18next";

function RenderState({ color = "primary.main", state }) {
  return (
    <MuiTypography
      variant="descriptionText"
      sx={{ ml: 0.5, color: color, fontWeight: 500 }}
    >
      {state}
    </MuiTypography>
  );
}
function MilestoneState({ step }) {
  const { t } = useTranslation();
  return (
    <>
      {dayjs(new Date()) > dayjs(step.dueDate).endOf("day") && (
        <>
          <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
            {t("milestone.state.dueDate_expired")}
          </MuiTypography>
          <br />
        </>
      )}
      {step.state === MILESTONE_STATE.ACCEPTED && (
        <RenderState state={t("milestone.state.milestone_accepted")} />
      )}
      {step.state === MILESTONE_STATE.REJECTED && (
        <RenderState
          color="error.main"
          state={t("milestone.state.milestone_rejected")}
        />
      )}
      {step.state === MILESTONE_STATE.ACTIVE && (
        <RenderState state={t("milestone.state.milestone_activated")} />
      )}
      {step.state === MILESTONE_STATE.PAYMENT_REQUESTED && (
        <RenderState state={t("milestone.state.milestone_payment_requested")} />
      )}
      {step.state === MILESTONE_STATE.PAYMENT_PENDING && (
        <RenderState 
          color="warning.main"
          state={t("milestone.state.milestone_payment_pending")} 
        />
      )}
      {step.state === MILESTONE_STATE.PARTIAL && (
        <RenderState state={t("milestone.state.milestone_partial")} />
      )}
      {step.state === MILESTONE_STATE.COMPLETED && (
        <RenderState state={t("milestone.state.milestone_completed")} />
      )}
      {step.state === MILESTONE_STATE.QUERY && (
        <RenderState
          color="error.main"
          state={t("milestone.state.milestone_query")}
        />
      )}
    </>
  );
}

export default MilestoneState;
