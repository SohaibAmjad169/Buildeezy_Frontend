import { Box } from "@mui/material";

import NoData from "../common/NoData";
import BidList from "./BidList";

function CurrentBidList({
  jobType,
  bidList,
  onBidAccept,
  onBidReject,
  onBidView,
  jobDetails,
}) {
  
  return (
    <Box sx={{ my: 3 }}>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {bidList ? (
          bidList.length > 0 &&
          bidList.map((bid) => (
            <BidList
              key={bid.id}
              jobType={jobType}
              bidDetails={bid}
              handleBidView={() => onBidView(bid.id)}
              handleBidAccept={() => onBidAccept(bid.id,bid?.authorId)}
              handleBidReject={() => onBidReject(bid.id)}
              jobDetails={jobDetails}
            />
          ))
        ) : (
          <Box
            sx={{
              mt: 2,
              width: "100%",
            }}
          >
            <NoData />
          </Box>
        )}
      </Box>
    </Box>
  );
}
export default CurrentBidList;
