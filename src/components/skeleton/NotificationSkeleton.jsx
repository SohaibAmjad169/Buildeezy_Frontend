import { Box, Divider, Skeleton } from "@mui/material";

function NotificationSkeleton() {
  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        <Skeleton width="40%" height={30} />
        <Skeleton width="80%" height={30} />
        <Skeleton width="25%" height={25} />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ textAlign: "center" }}>
        <Skeleton width="40%" height={30} />
        <Skeleton width="80%" height={30} />
        <Skeleton width="25%" height={25} />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ textAlign: "center" }}>
        <Skeleton width="40%" height={30} />
        <Skeleton width="80%" height={30} />
        <Skeleton width="25%" height={25} />
      </Box>
    </>
  );
}

export default NotificationSkeleton;
