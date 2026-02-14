import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

import InputBox from "../common/InputBox";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";
import { FIELD_TYPES } from "../../utils/constants/login";
import MuiTypography from "../common/MuiTypography";
import MuiDatePickerBox from "../common/MuiDatePickerBox";
import MuiActionDialog from "../common/MuiActionDialog";
import { setAlert } from "../../redux/configSlice";
import { debounce } from "lodash";
import {
  addNewMilestoneUrl,
  deleteMilestoneUrl,
  getExchangeRate,
  // getSupportedCurrencies,
  getPaymentSupportedCurrencies,
  updateMilestoneUrl,
} from "../../apis/apiEndPoints";
import { ROUTES } from "../../utils/constants/route";
import { ALERT_TYPE } from "../../utils/constants/config";
import useFetchJobDetails from "../../hooks/useFetchJobDetails";
import { setDialogLoading } from "../../redux/milestoneSlice";
import { useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import { setJobDetails } from "../../redux/jobSlice";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { USER_DATA, IP_LOCAL_DATA } from "../../utils/constants/auth";
import { useRef } from "react";

const MILESTONE = {
  title: "",
  description: "",
  amount: "",
  dueDate: "",
  documents: [],
};

function AddNewMilestone({
  id,
  milestone,
  milestoneId,
  openAddMilestone,
  onCloseAddMilestone,
  isAddMore = false,
  isUpdate = false,
  isExtend = false,
  contractorId,
  bidAuthOrId,
}) {
  const { t } = useTranslation();
  const ipLocation = JSON?.parse(getLocalStorage(IP_LOCAL_DATA));
  const [uploadedDocumentId, setUploadedDocumentId] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [convertedTotal, setConvertedTotal] = useState(null);

  // Ref to keep latest amount value
  const latestAmountRef = useRef(0);
  const { jobDetails } = useSelector((state) => state.job);

  const { dialogLoading } = useSelector((state) => state.milestone);
  const { fetchJobById } = useFetchJobDetails();

  const [initLoad, setInitLoad] = useState(true);
  const [milestoneData, setMilestoneData] = useState(milestone || MILESTONE);

  useEffect(() => {
    if (isUpdate || isExtend) {
      setMilestoneData(milestone);
    } else {
      setMilestoneData(MILESTONE);
    }
  }, [openAddMilestone]);

  const getActionTitle = useMemo(() => {
    if (isAddMore) {
      return t("milestone.add_milestone");
    } else if (isUpdate) {
      return t("milestone.update_milestone");
    } else if (isExtend) {
      return t("milestone.extend_milestone");
    } else {
      return t("milestone.set_up_milestone");
    }
  }, [isAddMore, isUpdate, isExtend, t]);

  //add new milestone
  function onCloseMilestoneDialog() {
    setMilestoneData(MILESTONE);
    setUploadedDocumentId([])
    onCloseAddMilestone();
    setInitLoad(true);
  }

  function getSuccessMsg() {
    if (isAddMore) {
      return t("milestone.milestone_added");
    } else if (isUpdate) {
      return t("milestone.milestone_updated");
    } else if (isExtend) {
      return t("milestone.milestone_extended");
    } else {
      return t("milestone.milestone_added");
    }
  }

  async function onAddMilestone() {
    setInitLoad(false);
    if (
      !milestoneData?.title ||
      !milestoneData?.amount ||
      !milestoneData?.dueDate ||
      !milestoneData?.description
    ) {
      return;
    }
    // Use contractorId from props if provided, else fallback to first contractor
    const resolvedContractorId =
      contractorId ||
      jobDetails?.jobContractors?.[0]?.contractor?.id ||
      bidAuthOrId;

    const milestonePayload = {
      data: {
        type: isUpdate || isExtend ? "update_milestone" : "create_milestone",
        title: milestoneData?.title,
        description: milestoneData?.description,
        amount: milestoneData?.amount,
        dueDate: dayjs(milestoneData?.dueDate).format("YYYY-MM-DD"),
        // documents: milestoneData?.documents,
        documents: uploadedDocumentId,
        contractorId: resolvedContractorId,
      },
    };

    try {
      dispatch(setDialogLoading(true));
      if (isUpdate || isExtend) {
        await updateMilestoneUrl(id, milestoneId, milestonePayload);
      } else {
        await addNewMilestoneUrl(id, milestonePayload);
      }
      onCloseMilestoneDialog();

      if (isAddMore || isUpdate || isExtend) {
        fetchJobById(id);
      } else {
        navigate("/" + ROUTES.myContracts);
      }

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: getSuccessMsg(),
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
      dispatch(setDialogLoading(false));
    }
  }

  function onMilestoneDataChange(id, value) {
    setMilestoneData((prevData) => {
      let updatedValue = value;
      if (id === "documents") {
        updatedValue = value(prevData[id]);
      }
      return { ...prevData, [id]: updatedValue };
    });
  }

  //delete milestone
  async function onDeleteMilestone() {
    try {
      dispatch(setDialogLoading(true));

      await deleteMilestoneUrl(id, milestoneId);

      onCloseMilestoneDialog();

      const newJobDetails = cloneDeep(jobDetails);
      const newMilestones = newJobDetails.milestones.filter(
        (milestone) => milestone.id !== milestoneId
      );
      newJobDetails.milestones = newMilestones;
      dispatch(setJobDetails(newJobDetails));

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.milestone_deleted"),
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
      dispatch(setDialogLoading(false));
    }
  }

  // Exchange rate API
  const allExchangeRate = async (amount) => {
    try {
      const allData = await getExchangeRate();
      const rateString = allData?.data?.config?.value;
      const rates = JSON.parse(rateString);

      const userCurrencyRate = rates[ipLocation?.currency]; // INR etc.
      const converted = Number((amount * userCurrencyRate).toFixed(2));
      setConvertedTotal(converted);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  // Debounce with useCallback so it doesn’t re-create on every render
  const debouncedExchangeRate = useRef(
    debounce((amount) => {
      allExchangeRate(amount);
    }, 600)
  ).current;

  useEffect(() => {
    const amount = Number(milestoneData?.amount);

    if (!milestoneData?.amount || isNaN(amount) || amount <= 0) {
      debouncedExchangeRate.cancel(); // 👈 cancel pending debounce call
      setConvertedTotal(0);
      return;
    }

    latestAmountRef.current = amount;
    debouncedExchangeRate(amount);
  }, [milestoneData?.amount]);

  useEffect(() => {
    return () => {
      debouncedExchangeRate.cancel(); // cleanup on unmount
    };
  }, []);

  return (
    <MuiActionDialog
      width={600}
      open={openAddMilestone}
      handleClose={onCloseMilestoneDialog}
      title={getActionTitle}
      handleSuccess={onAddMilestone}
      actionTitle={t("submit")}
      {...(isUpdate && { actionTitle1: t("delete") })}
      handlePrimaryAction={onDeleteMilestone}
      disabled={dialogLoading}
    >
      <Box>
        <Box>
          <Box sx={{ mt: 3 }}>
            <InputBox
              id="title"
              placeholder={t("milestone.name_of_milestone")}
              value={milestoneData?.title}
              onInputChange={onMilestoneDataChange}
              disabled={isExtend || dialogLoading}
            />
            {!initLoad && !milestoneData?.title && (
              <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                {t("errors.title_required")}
              </MuiTypography>
            )}
          </Box>
          <Box sx={{ mt: 3 }}>
            <InputBox
              id="amount"
              placeholder={t("milestone.amount")}
              value={milestoneData?.amount}
              onInputChange={onMilestoneDataChange}
              disabled={isExtend || dialogLoading}
            />

            {convertedTotal > 0 && (
              <MuiTypography
                color="text.secondary"
                sx={{ mt: 1, ml: 0.5, fontSize: "12px" }}
              >
                {t("milestone.local_currency")}:{" "}
                <strong>{convertedTotal}</strong> {ipLocation?.currency}
              </MuiTypography>
            )}

            {!initLoad && !milestoneData?.amount && (
              <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                {t("errors.amount_required")}
              </MuiTypography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <MuiDatePickerBox
              id="dueDate"
              onDateChange={onMilestoneDataChange}
              value={milestoneData?.dueDate}
              placeholder={t("milestone.due_date")}
              sx={{
                width: "100%",
              }}
              disabled={dialogLoading}
            />
            {!initLoad && !milestoneData?.dueDate && (
              <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                {t("errors.due_date_required")}
              </MuiTypography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <InputBox
              id="description"
              placeholder={t("milestone.description")}
              value={milestoneData?.description}
              onInputChange={onMilestoneDataChange}
              type={FIELD_TYPES.description}
              disabled={isExtend || dialogLoading}
            />
            {!initLoad && !milestoneData?.description && (
              <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                {t("errors.description_required")}
              </MuiTypography>
            )}
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <UploadDoc
            id="documents"
            value={milestoneData?.documents}
            onSelectFiles={onMilestoneDataChange}
            setUploadedDocumentId={setUploadedDocumentId}
            acceptedFileTypes={ALL_FILE_TYPES}
            sx={{ mt: 2, mb: 1 }}
            multipleFiles={true}
            isDisabled={isExtend || dialogLoading}
            docId={true}
          />
        </Box>
      </Box>
    </MuiActionDialog>
  );
}

export default AddNewMilestone;
