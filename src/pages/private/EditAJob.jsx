import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cloneDeep, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { ArrowLeft } from "iconsax-react";

import PostAJob from "./PostAJob";
import useFetchJobDetails from "../../hooks/useFetchJobDetails";
import { JOB_QUESTIONS, mapQuestions } from "../../utils/constants/job";
import { setPostJobData } from "../../redux/jobSlice";
import { FIELD_TYPES } from "../../utils/constants/login";
import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import { getLabelFromId } from "../../utils/common";

function EditAJob() {
  const { id } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pastLinks = location.state.pastLinks || [];

  const { jobDetails } = useSelector((state) => state.job);

  const { fetchJobById } = useFetchJobDetails();

  const activeLink = {
    label: getLabelFromId(jobDetails?.title, "title"),
  };
  useEffect(() => {
    fetchJobById(id);
  }, [fetchJobById, id]);

  useEffect(() => {
    if (!isEmpty(jobDetails)) {
      const jobQuestions = [
        ...JOB_QUESTIONS,
        ...(mapQuestions[jobDetails?.title] || []),
      ];
      const newJobQuestions = cloneDeep(jobQuestions);
      newJobQuestions.forEach((question) => {
        if (question.type === FIELD_TYPES.address) {
          question.value = {
            address: jobDetails.address,
            country: jobDetails.country,
            city: jobDetails.city,
          };
        } else if (question.id === "specifyDetails") {
          if (question.type === FIELD_TYPES.select) {
            question.value = jobDetails[question.id]?.toString() ?? "";
          } else {
            question.value = jobDetails[question.id] ?? "";
          }
          if (question.child && jobDetails[question.id].includes("others")) {
            question.child.show = true;
            question.child.value = jobDetails[question.child.id];
          }
        } else if (
          question.child &&
          jobDetails[question.id].includes("others")
        ) {
          question.value = jobDetails[question.id] ?? "";
          question.child.show = true;
          question.child.value = jobDetails[question.child.id];
        } else {
          question.value = jobDetails[question.id] ?? "";
        }
      });

      dispatch(setPostJobData(newJobQuestions));
    }
  }, [dispatch, jobDetails]);

  function navigateBack() {
    navigate(-1);
  }

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", lg: "70%" },
          }}
        >
          <Stack direction={"row"} alignItems={"center"} spacing={2} mb={2}>
            <ArrowLeft
              size="20"
              style={{ cursor: "pointer" }}
              onClick={navigateBack}
            />
            <MuiTypography variant="h2">{t("job.edit_job")}</MuiTypography>
          </Stack>
          <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
        </Box>
      </Box>
      <PostAJob isEdit={true} jobId={id} />
    </>
  );
}

export default EditAJob;
