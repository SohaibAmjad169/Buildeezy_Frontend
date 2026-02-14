import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";
import { setAlert, setLoading } from "../../redux/configSlice";
import { editJobUrl, getMyContractsUrl } from "../../apis/apiEndPoints";
import { setFetchNextLoading, setMyContractList } from "../../redux/jobSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import SeeMore from "../../components/common/SeeMore";
import JobCard from "../../components/common/JobCard";
import MuiDialog from "../../components/common/MuiDialog";
import NoData from "../../components/common/NoData";
import JobCardListSkeleton from "../../components/skeleton/JobCardListSkeleton";

function Overview({ 
  setPaginationModel, 
  rows, 
  loadingMyCards, 
  hasMoreData, 
  totalRecords, 
  paginationModel, 
  setRows, 
  setHasMoreData,
  onOverviewDataChange // Add this prop to notify parent
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myContractList, fetchNextLoading } = useSelector(
    (state) => state.job
  );

  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [jobId, setJobId] = useState("");

  // NEW: Notify parent component about data availability whenever rows change
  useEffect(() => {
    if (onOverviewDataChange) {
      onOverviewDataChange(rows.length > 0);
    }
  }, [rows.length, onOverviewDataChange]);

  //view job details
  function handleViewJobDetail(jobId) {
    navigate("/my-contracts/view/" + jobId);
  }

  //complete job
  function onJobComplete(job) {
    setJobId(job.id);
    setOpenCompleteDialog(true);
  }
  
  function onCompleteDialogClose() {
    setOpenCompleteDialog(false);
  }
  
  async function onCompleteJob() {
    const updatedJobPayload = {
      data: {
        type: "update_job",
        state: "completed",
      },
    };
    try {
      dispatch(setLoading(true));
      await editJobUrl(jobId, updatedJobPayload);
      onCompleteDialogClose();

      const findIndex = myContractList.findIndex((job) => job.id === jobId);
      const newMyContractList = cloneDeep(myContractList);
      let contractorName = "";
      if (findIndex !== -1) {
        newMyContractList[findIndex].state = "completed";
        const contDetails = rows[findIndex].contractor;
        contractorName = contDetails.firstName + " " + contDetails.lastName;
      }
      dispatch(setMyContractList(newMyContractList));

      navigate(
        "review/" + jobId,
        {
          state: {
            jobId,
            contractor: contractorName,
          },
        },
        { replace: true }
      );

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("job.details.job_completed_successfully"),
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

  async function fetchNextContracts() {
    const newPaginationModel = { ...paginationModel };
    newPaginationModel.page = newPaginationModel.page + 1;
    setPaginationModel(newPaginationModel);
    try {
      dispatch(setFetchNextLoading(true));
      const { data: res } = await getMyContractsUrl(newPaginationModel);
      const resData = res.data;
      const newRowList = [...rows, ...resData];
      const filterData = newRowList.filter(
        (item) => item?.state !== "completed"
      );
      setRows(filterData);
      dispatch(setMyContractList(newRowList));
      if (newRowList.length >= totalRecords) {
        setHasMoreData(false);
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
      dispatch(setFetchNextLoading(false));
    }
  }

  return (
    <>
      {loadingMyCards ? (
        <JobCardListSkeleton />
      ) : rows.length === 0 ? (
        <Box
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          <NoData />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {rows?.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetail={handleViewJobDetail}
                isContract={true}
                handleJobComplete={onJobComplete}
              />
            ))}
          </Box>
          <SeeMore
            handleSeeMore={fetchNextContracts}
            isShow={hasMoreData}
            isLoading={fetchNextLoading}
          />
        </>
      )}
      <MuiDialog
        title={t("job.details.complete_job")}
        open={openCompleteDialog}
        handleClose={onCompleteDialogClose}
        handleSuccess={onCompleteJob}
        yesLabel={t("complete")}
        noLabel={t("cancel")}
      />
    </>
  );
}

export default React.memo(Overview);