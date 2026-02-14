import { useEffect } from "react";
import { useState } from "react";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cloneDeep, isArray, isObject } from "lodash";

import MuiTypography from "../../components/common/MuiTypography";
import RoundButton from "../../components/common/RoundButton";
import PaginationCard from "../../components/common/PaginationCard";
import FormFields from "../../components/common/FormFields";
import { setPostJobData, setPostJobDataValue } from "../../redux/jobSlice";
import { JOB_QUESTIONS } from "../../utils/constants/job";
import { ROUTES } from "../../utils/constants/route";
import InputBox from "../../components/common/InputBox";
import { setAlert, setLoading } from "../../redux/configSlice";
import {
  editJobUrl,
  // getSupportedCurrencies,
  getPaymentSupportedCurrencies,
  postJobUrl,
} from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import SingleSkeleton from "../../components/skeleton/SingleSkeleton";
import QuestionSkeleton from "../../components/skeleton/QuestionSkeleton";
import { hasAnyEmptyValue } from "../../utils/common";
import PreviewJobDetails from "../../components/previewJobDetails";
import useCountry from "../../hooks/useCountry";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { USER_DATA, IP_LOCAL_DATA } from "../../utils/constants/auth";

import { JOB_TYPE_OPTIONS } from "../../utils/constants/job";


function PostAJob({ isEdit = false, jobId = "" }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = JSON?.parse(getLocalStorage(USER_DATA));
  const { getCountries } = useCountry();

  const { postJobData } = useSelector((state) => state.job);
  const { loading } = useSelector((state) => state.config);

  const [page, setPage] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);


  const jobTypeOptions = JOB_TYPE_OPTIONS.map(opt => ({
    ...opt,
    label: t(opt.labelKey)
  }));

  function getTranslatedOptions(options) {
    if (!options) return [];
    return options.map(opt => ({
      ...opt,
      label: t(opt.labelKey || opt.label)
    }));
  }

  async function fetchCountries() {
    await getCountries();
  }

  useEffect(() => {
    fetchCountries();
  }, []);

  function handlePageChange(e, pageValue) {
    setPage(pageValue - 1);
  }
  function goToPreviousStep() {
    if (page > 0) {
      setPage((prevState) => prevState - 1);
    }
  }
  function goToNextStep() {
    setPage((prevState) => prevState + 1);
  }

  function onValueChange(id, value) {
    dispatch(setPostJobDataValue({ id, value }));
  }

  function onTextValueChange(id, value) {
    const newPostJobData = cloneDeep(postJobData);

    const fieldIndex = newPostJobData.findIndex((el) => el.id === id);
    newPostJobData[fieldIndex].child.value = value;

    dispatch(setPostJobData(newPostJobData));
  }

  async function postAJob(jobDetails, isDrafted = false) {
    try {
      const jobPayload = {
        data: {
          type: isEdit ? "update_job" : "create_job",
          state: isDrafted ? "draft" : "active",
          ...jobDetails,
        },
      };
      dispatch(setLoading(true));

      if (isEdit) {
        await editJobUrl(jobId, jobPayload);
      } else {
        await postJobUrl(jobPayload);

        // const userLocalData = JSON?.parse(getLocalStorage(IP_LOCAL_DATA));
        // const userCurrency = userLocalData?.currency?.toLowerCase();
        // const data = await getPaymentSupportedCurrencies();
        // if (data?.data?.currencies.includes(userCurrency)) {
        //   // ✅ Inject currency into jobPayload
        //   jobPayload.data.currency = userCurrency;
        //   await postJobUrl(jobPayload);
        // } else {
        //   dispatch(
        //     setAlert({
        //       show: true,
        //       type: ALERT_TYPE.error,
        //       // message: err.message,
        //       message: t("job.unsupportedCurrency"),
        //       subMessage: t("job.Currency"),
        //     })
        //   );
        // }
      }

      setPage(0);
      dispatch(setPostJobData(JOB_QUESTIONS));
      if (isDrafted) {
        navigate("/" + ROUTES.draftedJobs);
      } else {
        navigate("/" + ROUTES.activeJobs);
      }
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
  function onSubmit() {
    postAJob(jobDetails);
  }

  function mapJobDetailObj() {
    const jobData = postJobData.map((item) => {
      let itemValue = item.value;

      if (item.id === "specifyDetails" && !isArray(item.value)) {
        itemValue = [item.value];
      }
      if (item.id === "documents") {
        itemValue =
          item.value &&
          item.value?.map((docUrl) =>
            docUrl.includes("https:")
              ? docUrl.split("/").slice(-2).join("/")
              : docUrl
          );
      }

      let childValue = {};
      if (
        item.child &&
        (item.value === "others" ||
          (isArray(item.value) && item.value.includes("others")))
      ) {
        childValue = { [item.child.id]: item.child.value };
      }
      return {
        ...(isObject(itemValue) && !isArray(itemValue)
          ? { ...itemValue }
          : { [item.id]: itemValue }),
        ...childValue,
      };
    });
    const jobObj = Object.assign({}, ...jobData);
    setJobDetails(jobObj);
    return jobObj;
  }

  function handlePreview() {
    mapJobDetailObj();
    setShowPreview(true);
  }
  function onEdit() {
    setShowPreview(false);
  }

  function onSaveAsDraft() {
    const jobObj = mapJobDetailObj();
    postAJob(jobObj, true);
  }

  async function onJobPreview() {
    //validate fields
    const blankDataIndex = postJobData.findIndex(
      (question) =>
        question.required &&
        (!question.value ||
          question.value.length === 0 ||
          (question.id === "whereJob" && hasAnyEmptyValue(question.value)) ||
          (question.child &&
            (question.value === "others" ||
              (isArray(question.value) && question.value.includes("others"))) &&
            !question.child.value))
    );

    if (blankDataIndex !== -1) {
      setPage(blankDataIndex);
      return;
    }
    handlePreview();
  }

  if (showPreview) {
    return (
      <PreviewJobDetails
        jobDetails={jobDetails}
        handleJobEdit={onEdit}
        handleJobSubmit={onSubmit}
      />
    );
  }
  return (
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
          my: 4,
        }}
      >
        <MuiTypography variant="h2">
          {!isEdit && t("job.create_job")}
        </MuiTypography>
        {loading ? (
          <QuestionSkeleton />
        ) : (
          <Box sx={{ mt: 3, mb: 4 }}>
            <Stack direction={"row"} spacing={0.5} sx={{ mb: 1.5 }}>
              <MuiTypography variant="h6">
                {t(postJobData[page]?.labelKey)}
              </MuiTypography>
              {postJobData[page]?.required && (
                <MuiTypography sx={{ color: "error.main" }}>*</MuiTypography>
              )}
            </Stack>

            <FormFields
              id={postJobData[page]?.id}
              placeholder={postJobData[page]?.placeholderKey}
              value={postJobData[page]?.value}
              options={getTranslatedOptions(postJobData[page]?.options)}
              onValueChange={onValueChange}
              type={postJobData[page]?.type}
              multipleFiles={postJobData[page]?.multipleFiles}
              fileTypes={postJobData[page]?.fileTypes}
              showTitle={false}
            />
            {postJobData[page]?.child?.show && (
              <Box
                sx={{
                  mt: 2,
                }}
              >
                <InputBox
                  id={postJobData[page]?.id}
                  placeholder={t(postJobData[page]?.child?.placeholderKey || postJobData[page]?.child?.label)}
                  onInputChange={onTextValueChange}
                  value={postJobData[page]?.child.value}
                />
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <RoundButton
            variant="outlined"
            onClick={goToPreviousStep}
            sx={{
              mr: 2,
              width: { xs: "100%", sm: "inherit" },
              mb: { xs: 1, sm: 0 },
            }}
            disabled={page === 0}
          >
            {t("previous")}
          </RoundButton>
          <RoundButton
            onClick={onSaveAsDraft}
            sx={{
              mr: 2,
              width: { xs: "100%", sm: "inherit" },
              mb: { xs: 1, sm: 0 },
            }}
          >
            {t("save_as_draft")}
          </RoundButton>
          {page > 0 && page >= postJobData.length - 1 ? (
            <RoundButton
              variant="outlined"
              onClick={onJobPreview}
              sx={{ width: { xs: "100%", sm: "inherit" } }}
            >
              {t("preview")}
            </RoundButton>
          ) : (
            <RoundButton
              variant="outlined"
              onClick={goToNextStep}
              disabled={page >= postJobData.length - 1}
              sx={{ width: { xs: "100%", sm: "inherit" } }}
            >
              {t("next")}
            </RoundButton>
          )}
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ width: "65%" }}>
          <SingleSkeleton />
        </Box>
      ) : (
        <PaginationCard
          count={postJobData.length}
          page={page + 1}
          onPageChange={handlePageChange}
          title={t(postJobData[page]?.titleKey)}
          subtitle={t(postJobData[page]?.subtitleKey)}
        />
      )}
    </Box>
  );
}

export default PostAJob;
