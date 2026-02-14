import { useTheme } from "@emotion/react";
import {
  Box,
  Card,
  Divider,
  Skeleton,
  Stack,
  useMediaQuery,
} from "@mui/material";

export default function ViewJobDetailsSkeleton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ height: "100%", width: { xs: "100%", lg: "70%" } }}>
        <Stack alignItems={"center"} direction={"row"} spacing={2}>
          <Skeleton variant="rounded" width={80} height={25} />
          <Skeleton
            variant="rectangular"
            width={150}
            height={32}
            sx={{ borderRadius: 32 }}
          />
        </Stack>
        <Box sx={{ mt: 1.5 }}>
          <Skeleton width={220} />
        </Box>
        <Box
          sx={{
            bgcolor: "rgb(0 0 0 / 0.05)",
            p: "1rem 1.5rem",
            borderRadius: 3,
            my: 3,
          }}
          variant="rectangular"
          width={"100%"}
        >
          <Stack
            divider={<Divider orientation="vertical" flexItem />}
            alignItems={"center"}
            direction={"row"}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Skeleton
              variant="rounded"
              width={150}
              height={24}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rounded"
              width={150}
              height={24}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rounded"
              width={150}
              height={24}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rounded"
              width={150}
              height={24}
              sx={{ borderRadius: 2 }}
            />
          </Stack>
          <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap={2}>
            <Skeleton
              variant="rectangular"
              width={150}
              height={32}
              sx={{ borderRadius: 32 }}
            />
            <Skeleton
              variant="rectangular"
              width={150}
              height={32}
              sx={{ borderRadius: 32 }}
            />
            <Skeleton
              variant="rectangular"
              width={150}
              height={32}
              sx={{ borderRadius: 32 }}
            />
            <Skeleton
              variant="rectangular"
              width={150}
              height={32}
              sx={{ borderRadius: 32 }}
            />
            <Skeleton
              variant="rectangular"
              width={150}
              height={32}
              sx={{ borderRadius: 32 }}
            />
            <Skeleton
              variant="rectangular"
              width={150}
              height={32}
              sx={{ borderRadius: 32 }}
            />
          </Box>
        </Box>
        <Stack
          alignItems={"flex-start"}
          direction="row"
          flexWrap={"wrap"}
          gap={3}
          sx={{ my: 3 }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton width={150} height={32} />
            <fieldset
              style={{
                border: `1px solid #131A471A`,
                borderRadius: 10,
                padding: "0.5rem 1.5rem 1rem",
              }}
            >
              <legend
                style={{
                  color: "#131A478A",
                  paddingInline: 10,
                }}
              >
                <Skeleton width={100} height={24} />
              </legend>
              <Skeleton width={"80%"} height={24} />
            </fieldset>

            <Stack
              divider={
                <Divider
                  orientation={isMobile ? "horizontal" : "vertical"}
                  flexItem
                />
              }
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 8 }}
              sx={{ mt: 2.75, mb: 2 }}
            >
              <Box>
                <Skeleton width={148} height={24} />
                <Skeleton width={110} height={24} />
              </Box>
              <Box>
                <Skeleton width={130} height={24} />
                <Skeleton width={150} height={24} />
              </Box>
            </Stack>
            <Skeleton width={180} height={24} sx={{ mb: 2 }} />
            <Stack direction={"row"} spacing={2}>
              <Skeleton variant="rounded" width={120} height={100} />
              <Stack spacing={2}>
                <Skeleton variant="rounded" width={120} height={42} />
                <Skeleton variant="rounded" width={120} height={42} />
              </Stack>
            </Stack>
          </Box>

          <Card
            variant="outlined"
            sx={{
              minWidth: { xs: "100%", lg: 300 },
              maxWidth: { xs: "100%", lg: 350 },
              borderRadius: 3,
              flex: 1,
            }}
          >
            <Skeleton width={150} height={24} sx={{ mb: 1.75 }} />
            <Stack direction={"row"} spacing={2}>
              <Skeleton variant="circular" width={46} height={46} />
              <Box>
                <Skeleton width={120} />
                <Skeleton width={80} />
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
