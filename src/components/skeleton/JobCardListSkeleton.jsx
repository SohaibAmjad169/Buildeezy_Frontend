import { Box, Skeleton } from "@mui/material";

function JobCardListSkeleton() {
  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
        <Skeleton
          variant="rounded"
          width={530}
          height={266}
          sx={{
            borderRadius: "1rem",
          }}
        />
        <Skeleton
          variant="rounded"
          width={530}
          height={266}
          sx={{
            borderRadius: "1rem",
          }}
        />
        <Skeleton
          variant="rounded"
          width={530}
          height={266}
          sx={{
            borderRadius: "1rem",
          }}
        />
        <Skeleton
          variant="rounded"
          width={530}
          height={266}
          sx={{
            borderRadius: "1rem",
          }}
        />
      </Box>
    </>
  );
}

export default JobCardListSkeleton;
