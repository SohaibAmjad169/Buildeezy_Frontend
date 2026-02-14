import { Box, Divider, Skeleton } from "@mui/material";

function OverviewSkeleton() {
  return (
    <>
      <Skeleton width="100%" height={50} />
      <Divider sx={{ my: 2.5 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: "100%", alignItems: "start", justifyItems: "start" }}>
        <Skeleton width="100%" height={300} />
        <Skeleton width="100%" height={300} />
      </Box>
    </>
  );
}

export default OverviewSkeleton;
