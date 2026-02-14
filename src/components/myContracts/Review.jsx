import { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { cloneDeep, flattenDeep } from "lodash";

import MuiTypography from "../common/MuiTypography";
import { REVIEW_QUESTIONS } from "../../utils/constants/review";
import { setAlert, setLoading } from "../../redux/configSlice";
import { postJobReviewUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import { ROUTES } from "../../utils/constants/route";
import FormFields from "../common/FormFields";
import useValidation from "../../hooks/useValidation";
import ActionButton from "../common/ActionButton";

function Review() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const jobId = location.state?.jobId;
  const contractor = location.state?.contractor;

  const { isValidData, validateData } = useValidation();

  const [questions, setQuestions] = useState(REVIEW_QUESTIONS);
  const [initLoad, setInitLoad] = useState(true);

  function onDataChange(id, value, error, index) {
    const newQuestions = cloneDeep(questions);
    const fieldIndex = newQuestions.findIndex((el) => el.id === id);

    const updatedValue = value;
    if (index === 0) {
      updatedValue[1].value = "";
    }

    newQuestions[fieldIndex].value = updatedValue;
    newQuestions[fieldIndex].validation.error = error;
    newQuestions[fieldIndex].validation.valid = error === "" ? true : false;
    setQuestions(newQuestions);
  }

  async function handleSaveReview() {
    setInitLoad(false);

    const validatedQuestion = validateData(questions);
    setQuestions(validatedQuestion);
    const isFormValid = isValidData(validatedQuestion);

    if (!isFormValid) {
      return;
    }

    const newQuestions = validatedQuestion.map((item) => {
      const id = item.id;
      const value = item.value;

      if (id === "rating") {
        return value.map((el) => ({
          [el.id]: el.value,
          [el.reasonId]: el.reason,
        }));
      }
      return {
        [item.id]: item.value,
      };
    });

    const reviewPayload = {
      data: {
        type: "post_rating",
        ...Object.assign({}, ...flattenDeep(newQuestions)),
      },
    };

    try {
      dispatch(setLoading(true));
      await postJobReviewUrl(jobId,contractor, reviewPayload);
      navigate("/" + ROUTES.myContracts, { replace: true });
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("review.review_submitted"),
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "60%" },
        }}
      >
        <MuiTypography variant="h2">{t("review.title")}</MuiTypography>
        <MuiTypography variant="h6">
          {t("review.subtitle1")} {contractor} {t("review.subtitle2")}
        </MuiTypography>
        {questions?.length > 0 &&
          questions.map((que) => (
            <Box sx={{ mt: 3 }} key={que.id}>
              <Stack mb={1.5}>
                <Stack direction={"row"} spacing={0.5}>
                  <MuiTypography variant="h6">{que?.label}</MuiTypography>
                  {que?.label && que?.validation?.required && (
                    <MuiTypography sx={{ color: "error.main" }}>
                      *
                    </MuiTypography>
                  )}
                </Stack>
                <MuiTypography variant="subtitle3">
                  {que?.subtitle}
                </MuiTypography>
              </Stack>

              <FormFields
                id={que?.id}
                placeholder={que?.placeholder}
                value={que?.value}
                options={que?.options}
                onValueChange={onDataChange}
                type={que?.type}
                initLoad={initLoad}
                validation={que?.validation}
              />
            </Box>
          ))}
        <ActionButton
          onClick={handleSaveReview}
          sx={{
            display: "block",
            my: 2,
            ml: "auto",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {t("review.send")}
        </ActionButton>
      </Box>
    </Box>
  );
}

export default Review;
