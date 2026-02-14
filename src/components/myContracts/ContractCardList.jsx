import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  editJobUrl,
  getMyContractsUrl,
  getJobDetailsUrl,
  getReviewStatusUrl, // NEW: Use the new review status API
} from "../../apis/apiEndPoints";
import { cloneDeep } from "lodash";
import { setFetchNextLoading, setMyContractList } from "../../redux/jobSlice";
import MuiDialog from "../common/MuiDialog";
import NoData from "../common/NoData";
import JobCardListSkeleton from "../skeleton/JobCardListSkeleton";
import JobCard from "../common/JobCard";
import SeeMore from "../common/SeeMore";
import { USER_TYPES } from "../../utils/constants/login";

function ContractCardList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { myContractList, fetchNextLoading } = useSelector(
    (state) => state.job
  );
  const { profileData } = useSelector((state) => state.profile);

  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [jobId, setJobId] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);
  const [reviewStatusData, setReviewStatusData] = useState({}); // NEW: Store review status by job ID

  const { loading } = useSelector((state) => state.config);

  // NEW: Fetch review status for all jobs
  const fetchReviewStatus = useCallback(async (jobIds) => {
    if (!profileData?.id || !jobIds || jobIds.length === 0) return;
    
    try {
      console.log('🔍 Fetching review status for jobs:', jobIds);
      const response = await getReviewStatusUrl(profileData.id, jobIds);
      const statusData = response.data.data || [];
      
      console.log('🔍 Fetched review status:', statusData);
      
      // Convert array to object keyed by jobId for easy lookup
      const statusByJobId = {};
      statusData.forEach(status => {
        statusByJobId[status.jobId] = status;
      });
      
      setReviewStatusData(statusByJobId);
    } catch (error) {
      console.error("Failed to fetch review status:", error);
      setReviewStatusData({});
    }
  }, [profileData?.id]);

  //view job details
  function handleViewJobDetail(jobId) {
    const contract = rows.find((job) => job.id === jobId);
    navigate("view/" + jobId, { state: { contract } });
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
      let navigationData = {};
      
      if (findIndex !== -1) {
        newMyContractList[findIndex].state = "completed";
        const job = rows[findIndex];
        
        // NEW: Determine navigation based on user type
        if (profileData?.userType === USER_TYPES.client) {
          // Client completing job -> navigate to review contractor
          const contractorId = job.contractorId || job.jobContractors?.[0]?.contractor?.id;
          const contractorName = job.contractor?.firstName + " " + job.contractor?.lastName ||
                               job.jobContractors?.[0]?.contractor?.firstName + " " + job.jobContractors?.[0]?.contractor?.lastName;
          
          navigationData = {
            jobId,
            contractorId,
            contractorName,
          };
        }
        // NOTE: Contractors don't auto-navigate to review page since only clients complete jobs
      }
      
      dispatch(setMyContractList(newMyContractList));

      // Only navigate to review if client (since only clients complete jobs)
      if (profileData?.userType === USER_TYPES.client) {
        navigate(`/add-review?contractor=${navigationData.contractorId}&job=${jobId}`, {
          state: navigationData,
          replace: true
        });
      }

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

  const fetchMyContractJobs = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getMyContractsUrl(paginationModel);
      let resData = res.data;
      
      // Fetch full job details (including bids) for each contract
      const detailedContracts = await Promise.all(
        resData.map(async (contract) => {
          try {
            const { data: jobDetails } = await getJobDetailsUrl(contract.id);
            return { ...contract, ...jobDetails };
          } catch (_) {
            // If job details fetch fails, fallback to contract
            return contract;
          }
        })
      );
      
      setTotalRecords(res.meta.totalRecords);
      setRows(detailedContracts);
      dispatch(setMyContractList(detailedContracts));
      
      // NEW: Fetch review status for all jobs
      const jobIds = detailedContracts.map(job => job.id);
      if (jobIds.length > 0) {
        await fetchReviewStatus(jobIds);
      }
      
      if (detailedContracts.length === res.meta.totalRecords) {
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
      dispatch(setLoading(false));
    }
  }, [dispatch, paginationModel, fetchReviewStatus]);

  async function fetchNextContracts() {
    const newPaginationModel = { ...paginationModel };
    newPaginationModel.page = newPaginationModel.page + 1;
    setPaginationModel(newPaginationModel);
    
    try {
      dispatch(setFetchNextLoading(true));
      const { data: res } = await getMyContractsUrl(newPaginationModel);
      const resData = res.data;
      const newRowList = [...rows, ...resData];
      setRows(newRowList);
      dispatch(setMyContractList(newRowList));
      
      // NEW: Fetch review status for new jobs
      const newJobIds = resData.map(job => job.id);
      if (newJobIds.length > 0) {
        await fetchReviewStatus(newJobIds);
      }
      
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
  
  useEffect(() => {
    fetchMyContractJobs();
  }, [fetchMyContractJobs]);

  return (
    <>
      {loading && rows.length === 0 ? (
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
            {rows.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetail={handleViewJobDetail}
                isContract={true}
                handleJobComplete={onJobComplete}
                reviewStatus={reviewStatusData[job.id]} // NEW: Pass review status for this specific job
              />
            ))}
          </Box>
          <SeeMore
            handleSeeMore={fetchNextContracts}
            isShow={rows.length >= 10 && hasMoreData}
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

export default ContractCardList;