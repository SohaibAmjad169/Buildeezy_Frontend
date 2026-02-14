import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";

import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { getAllJobsUrl, getUserSettings } from "../../apis/apiEndPoints";
import JobCard from "../common/JobCard";
import NoData from "../common/NoData";
import { useSelector } from "react-redux";
import JobCardListSkeleton from "../skeleton/JobCardListSkeleton";
import SeeMore from "../common/SeeMore";
import { setFetchNextLoading } from "../../redux/jobSlice";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IP_LOCAL_DATA } from "../../utils/constants/auth";

function JobCardList({ query, initLoad }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [hasMoreData, setHasMoreData] = useState(true);

  const { loading } = useSelector((state) => state.config);
  const { fetchNextLoading } = useSelector((state) => state.job);
  const { userSettings } = useSelector((state) => state.userSettings);

  const userInfo = JSON?.parse(getLocalStorage(IP_LOCAL_DATA));

  //view job details
  function handleViewJobDetail(jobId) {
    navigate("view/" + jobId);
  }

  const fetchAllJobs = useCallback(
    async (query) => {
      const newPaginationModel = { ...paginationModel };
      newPaginationModel.page = 0;
      setPaginationModel(newPaginationModel);

      try {
        dispatch(setLoading(true));
        const { data: res } = await getAllJobsUrl(
          newPaginationModel,
          query,
          userSettings,
          userInfo
        );

        const resData = res.data;
        setTotalRecords(res.meta.totalRecords);
        setRows(resData);
        if (resData.length < res.meta.totalRecords) {
          setHasMoreData(true);
        }
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
    },
    [dispatch, paginationModel, userSettings, userInfo]
  );

  useEffect(() => {
  if (userSettings) {
    fetchAllJobs(query);
  }
}, [userSettings?.isGlobalLocation]);


  const debouncedFetchAllJobs = useCallback(
    debounce((query) => {
      //initload is added to prevent api call on component load because of 500ms delay
      if (!initLoad) {
        fetchAllJobs(query);
      }
    }, 500), // Adjust the delay time as needed

    [initLoad]
  );

  async function fetchNextJobs() {
    const newPaginationModel = { ...paginationModel };
    newPaginationModel.page = newPaginationModel.page + 1;
    setPaginationModel(newPaginationModel);
    try {
      dispatch(setFetchNextLoading(true));
      const res = await getAllJobsUrl(newPaginationModel, query);
      const resData = res.data.data;
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
    fetchAllJobs("");
  }, []);

  useEffect(() => {
    debouncedFetchAllJobs(query);
  }, [query]);

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
                isAllJob={true}
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
    </>
  );
}

export default JobCardList;
