import { Box, Stack, Skeleton } from "@mui/material";

function ChatListSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Box key={item} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={200} height={20} />
            </Box>
            <Skeleton variant="circular" width={32} height={32} />
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

export default ChatListSkeleton;
