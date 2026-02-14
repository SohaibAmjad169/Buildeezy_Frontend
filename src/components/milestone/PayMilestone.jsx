import { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";
import { useSelector } from "react-redux";

import MuiTypography from "../common/MuiTypography";
import MuiActionDialog from "../common/MuiActionDialog";
import { setAlert } from "../../redux/configSlice";
import { payMilestoneUrl, queryMilestoneUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  ACTIONS,
  AMOUNT,
  MILESTONE_STATE,
  PAY_QUESTIONS,
  QUERY_QUESTIONS,
} from "../../utils/constants/milestone";
import FormFields from "../common/FormFields";
import useValidation from "../../hooks/useValidation";
import { setDialogLoading } from "../../redux/milestoneSlice";
import { setJobDetails } from "../../redux/jobSlice";
import { useEffect } from "react";

function PayMilestone({
  milestoneIndex,
  milestoneId,
  openPayMilestone,
  onClosePayMilestone,
  onPaySuccess,
  action: initialAction,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { dialogLoading } = useSelector((state) => state.milestone);
  const { jobDetails } = useSelector((state) => state.job);

  const { isValidData, validateData } = useValidation();

  const [action, setAction] = useState(initialAction || ACTIONS.IS_PAY);
  const [question, setQuestion] = useState(
    initialAction === ACTIONS.IS_QUERY ? QUERY_QUESTIONS : PAY_QUESTIONS
  );

  // const [action, setAction] = useState(initialAction || ACTIONS.IS_PAY);
  // const [action, setAction] = useState(ACTIONS.IS_PAY);
  // const [question, setQuestion] = useState(PAY_QUESTIONS);
  const [initLoad, setInitLoad] = useState(true);

  useEffect(() => {
    if (openPayMilestone) {
      setAction(initialAction || ACTIONS.IS_PAY);
      setQuestion(
        initialAction === ACTIONS.IS_QUERY ? QUERY_QUESTIONS : PAY_QUESTIONS
      );
    }
  }, [openPayMilestone, initialAction]);

  //close pay milestone
  function onCloseMilestoneDialog() {
    setQuestion(PAY_QUESTIONS);
    setAction(ACTIONS.IS_PAY);
    onClosePayMilestone();
    setInitLoad(true);
  }

  async function onHandleSuccess() {

    setInitLoad(false);

    const validatedQuestion = validateData(question);
    setQuestion(validatedQuestion);
    const isFormValid = isValidData(validatedQuestion);

    if (!isFormValid) {
      return;
    }

    const queData = question.map((que) => ({ [que.id]: que.value }));
    const queObj = Object.assign({}, ...queData);
    const queMilestonePayload = {
      data: {
        type: action === ACTIONS.IS_PAY ? "pay_milestone" : "raise_dispute",
        ...(action === ACTIONS.IS_PAY && {
          isPartialPaymentReleased:
            queObj.fullPaymentReleased === "yes" ? false : true,
        }),
        ...queObj,
      },
    };
    

    try {
      dispatch(setDialogLoading(true));
      if (action === ACTIONS.IS_PAY) {
        const res = await payMilestoneUrl(milestoneId, queMilestonePayload);
        const newJobDetails = cloneDeep(jobDetails);
        const milestones = newJobDetails.milestones;
        milestones[milestoneIndex].state = res.data.data.state;
        newJobDetails.milestones = milestones;
        dispatch(setJobDetails(newJobDetails));
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("milestone.state.milestone_completed"),
          })
        );
      } else {
        await queryMilestoneUrl(milestoneId, queMilestonePayload);
        const newJobDetails = cloneDeep(jobDetails);
        const milestones = newJobDetails.milestones;
        milestones[milestoneIndex].state = MILESTONE_STATE.QUERY;
        newJobDetails.milestones = milestones;
        dispatch(setJobDetails(newJobDetails));
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("milestone.state.milestone_disputed"),
          })
        );
      }
      onCloseMilestoneDialog();
      if (onPaySuccess) onPaySuccess();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setDialogLoading(false));
    }
  }

  function onPayMilestoneDataChange(id, value, error) {
    let newPayQuestion = cloneDeep(question);

    setQuestion((prevData) => {
      newPayQuestion = [...prevData];
      const fieldIndex = newPayQuestion.findIndex((el) => el.id === id);
      let updatedValue = value;
      if (id === "documents") {
        updatedValue = value(newPayQuestion[fieldIndex].value);
      }
      newPayQuestion[fieldIndex].value = updatedValue;

      if (newPayQuestion[fieldIndex].validation) {
        newPayQuestion[fieldIndex].validation.error = error;
        newPayQuestion[fieldIndex].validation.valid =
          error === "" ? true : false;
      }

      if (id === "fullPaymentReleased" && updatedValue === "no") {
        newPayQuestion = [...newPayQuestion, AMOUNT];
      } else if (id === "fullPaymentReleased" && updatedValue === "yes") {
        if (newPayQuestion.findIndex((pay) => pay.id === "amount") !== -1) {
          newPayQuestion = newPayQuestion.filter((pay) => pay.id !== "amount");
        }
      }
      return newPayQuestion;
    });
  }

  useEffect(() => {
    if (initialAction === "isQuery") {
      setAction(ACTIONS.IS_QUERY);
      setQuestion(QUERY_QUESTIONS);
    } else {
      setQuestion(PAY_QUESTIONS);
      setAction(ACTIONS.IS_PAY);
    }
  }, [initialAction]);
  //query
  function onNavigateToQuery() {
    setAction(ACTIONS.IS_QUERY);
    setQuestion(QUERY_QUESTIONS);
  }

  return (
    <MuiActionDialog
      width={750}
      open={openPayMilestone}
      handleClose={onCloseMilestoneDialog}
      title={
        action === ACTIONS.IS_PAY
          ? t("milestone.pay_milestone")
          : t("milestone.query")
      }
      handleSuccess={onHandleSuccess}
      handleSecondaryAction={onNavigateToQuery}
      actionTitle={action === ACTIONS.IS_PAY ? t("pay") : t("send")}
      {...(action === ACTIONS.IS_PAY && { actionTitle2: t("query") })}
      disabled={dialogLoading}
    >
      <Box sx={{ my: 4 }}>
        {question?.length > 0 &&
          question.map((pay) => {
            return (
              <Box sx={{ mt: 3 }} key={pay.id}>
                <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
                  <MuiTypography variant="h6">{pay?.label}</MuiTypography>
                  {pay?.label && pay?.validation?.required && (
                    <MuiTypography sx={{ color: "error.main" }}>
                      *
                    </MuiTypography>
                  )}
                </Stack>

                <FormFields
                  id={pay?.id}
                  placeholder={pay?.placeholder}
                  value={pay?.value}
                  options={pay?.options}
                  onValueChange={onPayMilestoneDataChange}
                  type={pay?.type}
                  multipleFiles={pay?.multipleFiles}
                  fileTypes={pay?.fileTypes}
                  showTitle={false}
                  initLoad={initLoad}
                  validation={pay?.validation}
                  disabled={dialogLoading}
                />
              </Box>
            );
          })}
      </Box>
    </MuiActionDialog>
  );
}

export default PayMilestone;
