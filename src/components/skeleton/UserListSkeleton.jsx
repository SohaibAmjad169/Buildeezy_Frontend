import { Divider, Skeleton, Stack } from "@mui/material";

function UserListSkeleton() {
  return (
    <Stack alignItems={"center"} divider={<Divider flexItem />}>
      {Array.from({ length: 8 }, (_, i) => i + 1).map((el) => (
        <Skeleton width="90%" height={70} key={el} />
      ))}
    </Stack>
  );
}

export default UserListSkeleton;
