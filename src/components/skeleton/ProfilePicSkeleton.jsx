import { Skeleton } from "@mui/material";

function ProfilePicSkeleton() {
  return (
    <>
      <Skeleton variant="circular" width={120} height={120} animation="wave" />
    </>
  );
}

export default ProfilePicSkeleton;
