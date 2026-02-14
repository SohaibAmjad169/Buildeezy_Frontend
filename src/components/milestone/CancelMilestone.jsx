import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";

import MuiTypography from "../common/MuiTypography";
import MuiActionDialog from "../common/MuiActionDialog";
import { setAlert } from "../../redux/configSlice";
import { setDialogLoading } from "../../redux/milestoneSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import useValidation from "../../hooks/useValidation";
import {
  CANCEL_QUESTIONS,
  PARTIAL_AMOUNT,
} from "../../utils/constants/milestone";
import FormFields from "../common/FormFields";

function CancelMilestone({
  openCancelMilestone,
  onCloseCancelMilestone,
  onCancelSuccess,
  milestoneIndex,
  milestoneId,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dialogLoading } = useSelector((state) => state.milestone);

  const { isValidData, validateData } = useValidation();

  const [question, setQuestion] = useState(CANCEL_QUESTIONS);
  const [initLoad, setInitLoad] = useState(true);

  const onCloseDialog = () => {
    setQuestion(CANCEL_QUESTIONS);
    onCloseCancelMilestone();
    setInitLoad(true);
  };

  const onHandleSuccess = async () => {
    setInitLoad(false);
    const validatedQuestion = validateData(question);
    setQuestion(validatedQuestion);
    const isFormValid = isValidData(validatedQuestion);

    if (!isFormValid) return;

    const queData = question.map((que) => ({ [que.id]: que.value }));
    const queObj = Object.assign({}, ...queData);

    // payload example
    const cancelPayload = {
      data: {
        type: "cancel_milestone",
        ...queObj,
      },
    };

    try {
      dispatch(setDialogLoading(true));
      // your API call here (like cancelMilestoneUrl if you have)

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.cancel_success"),
        })
      );

      onCloseDialog();
      if (onCancelSuccess) onCancelSuccess();
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
  };

  const onCancelMilestoneDataChange = (id, value, error) => {

    setQuestion((prevData) => {
      const newQuestions = cloneDeep(prevData);
      const fieldIndex = newQuestions.findIndex((el) => el.id === id);
      if (fieldIndex !== -1) {
        newQuestions[fieldIndex].value = value;

        if (newQuestions[fieldIndex].validation) {
          newQuestions[fieldIndex].validation.error = error;
          newQuestions[fieldIndex].validation.valid =
            error === "" ? true : false;
        }

        // Handle Partial Amount Field
        if (id === "paymentSettlement" && value === "partial_payment") {
          if (!newQuestions.find((pay) => pay.id === "partialAmount")) {
            newQuestions.push(PARTIAL_AMOUNT);
          }
        } else if (id === "paymentSettlement" && value === "full_refund") {
          // Remove partialAmount field if exists
          const index = newQuestions.findIndex(
            (pay) => pay.id === "partialAmount"
          );
          if (index !== -1) newQuestions.splice(index, 1);
        }
      }
      return newQuestions;
    });
  };

  return (
    <MuiActionDialog
      width={750}
      open={openCancelMilestone}
      handleClose={onCloseDialog}
      title={t("milestone.cancel_milestone")}
      handleSuccess={onHandleSuccess}
      actionTitle={t("submit")}
      disabled={dialogLoading}
    >
      <Box sx={{ my: 4 }}>
        {question.map((que) => {
          return (
            <Box sx={{ mt: 3 }} key={que.id}>
              <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
                <MuiTypography variant="h6">{que?.label}</MuiTypography>
                {que?.validation?.required && (
                  <MuiTypography sx={{ color: "error.main" }}>*</MuiTypography>
                )}
              </Stack>
              <FormFields
                id={que.id}
                placeholder={que.placeholder}
                value={que.value}
                options={que.options}
                onValueChange={onCancelMilestoneDataChange}
                type={que.type}
                initLoad={initLoad}
                validation={que.validation}
                disabled={dialogLoading}
              />
            </Box>
          );
        })}
      </Box>
    </MuiActionDialog>
  );
}

export default CancelMilestone;
