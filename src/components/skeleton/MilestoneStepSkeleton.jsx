import { Box, Skeleton } from "@mui/material";

function MilestoneStepSkeleton() {
  return (
    <>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Skeleton width="40%" height={30} />
        <Skeleton width="80%" height={30} />
        <Skeleton width="25%" height={25} />
      </Box>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Skeleton width="40%" height={30} />
        <Skeleton width="80%" height={30} />
        <Skeleton width="25%" height={25} />
      </Box>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Skeleton width="40%" height={30} />
        <Skeleton width="80%" height={30} />
        <Skeleton width="25%" height={25} />
      </Box>
    </>
  );
}

export default MilestoneStepSkeleton;
