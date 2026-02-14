import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import SearchTalent from "../../components/talent/SearchTalent";

function AddTalent() {
  const { id } = useParams();
  const { jobDetails } = useSelector((state) => state.job);

  return (
    <Box sx={{ p: 3 }}>
      <SearchTalent contractId={id} jobDetails={jobDetails} />
    </Box>
  );
}

export default AddTalent;
