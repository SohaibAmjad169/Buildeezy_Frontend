import { Skeleton } from "@mui/material";

function QuestionSkeleton() {
  return (
    <>
      <Skeleton width="80%" height={50} />
      <Skeleton width="100%" height={50} />
    </>
  );
}

export default QuestionSkeleton;
