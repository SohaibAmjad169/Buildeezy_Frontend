import { Box, Skeleton } from "@mui/material";

function AdListSkeleton() {
  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Skeleton width="40%" height={50} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Skeleton width="40%" height={50} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
          <Box>
            <Skeleton variant="rounded" width={225} height={100} />
            <Skeleton width={150} height={30} />
            <Skeleton width={100} height={25} />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default AdListSkeleton;
