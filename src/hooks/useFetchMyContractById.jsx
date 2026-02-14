import { useDispatch } from "react-redux";
import { setJobDetails } from "../redux/jobSlice";
import { getMyContractsUrl } from "../apis/apiEndPoints";

export default function useFetchMyContractById() {
  const dispatch = useDispatch();

  const fetchMyContractById = async (jobId) => {
    // Fetch all contracts (or enough to include the one you want)
    const { data } = await getMyContractsUrl({ page: 0, pageSize: 100 });
    const contract = data.data.find((c) => c.id === jobId);
    if (contract) {
      dispatch(setJobDetails(contract));
    }
  };

  return { fetchMyContractById };
}
