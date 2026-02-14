import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";

import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { deleteJobUrl, getDraftedJobsUrl } from "../../apis/apiEndPoints";
import MuiDialog from "../common/MuiDialog";
import { ROUTES } from "../../utils/constants/route";
import JobCard from "../common/JobCard";
import JobCardListSkeleton from "../skeleton/JobCardListSkeleton";
import NoData from "../common/NoData";
import { Box } from "@mui/material";
import SeeMore from "../common/SeeMore";
import { setFetchNextLoading } from "../../redux/jobSlice";

function DraftedCardList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [jobId, setJobId] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);

  const { loading } = useSelector((state) => state.config);
  const { fetchNextLoading } = useSelector((state) => state.job);

  const pastLinks = [
    {
      label: t("breadcrumbs.drafted_jobs"),
      path: "/" + ROUTES.draftedJobs,
    },
  ];

  //delete drafted jobs
  function onJobDelete(job) {
    setJobId(job.id);
    setOpenDeleteDialog(true);
  }
  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }
  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteJobUrl(jobId);

      const newRows = cloneDeep(rows).filter((job) => job.id !== jobId);
      setTotalRecords((prevState) => prevState - 1);
      setRows(newRows);

      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("job.deleted_successfully"),
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

  //view job details
  function handleViewJobDetail(jobId) {
    navigate("edit/" + jobId, { state: { pastLinks } });
  }

  //edit drafted jobs
  function onJobEdit(job) {
    navigate("edit/" + job.id, { state: { pastLinks } });
  }

  const fetchAllJobs = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getDraftedJobsUrl(paginationModel);

      const resData = res.data;
      setTotalRecords(res.meta.totalRecords);
      setRows(resData);
      if (resData.length === res.meta.totalRecords) {
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
  }, [dispatch, paginationModel]);

  async function fetchNextJobs() {
    const newPaginationModel = { ...paginationModel };
    newPaginationModel.page = newPaginationModel.page + 1;
    setPaginationModel(newPaginationModel);
    try {
      dispatch(setFetchNextLoading(true));
      const { data: res } = await getDraftedJobsUrl(newPaginationModel);
      const resData = res.data;
      const newRowList = [...rows, ...resData];
      setRows(newRowList);
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
    fetchAllJobs();
  }, []);

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
                handleJobEdit={onJobEdit}
                handlejobDelete={onJobDelete}
                isDraftedJob={true}
              />
            ))}
          </Box>
          <SeeMore
            handleSeeMore={fetchNextJobs}
            isShow={hasMoreData}
            isLoading={fetchNextLoading}
          />
        </>
      )}
      <MuiDialog
        title={t("job.delete_job")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </>
  );
}

export default DraftedCardList;
