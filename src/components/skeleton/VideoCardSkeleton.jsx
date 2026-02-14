import { Card, CardContent, Grid, Skeleton } from '@mui/material';

const VideoCardSkeleton = () => {
  return (
    <Grid container spacing={2}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={180} />
            <CardContent>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="circular" width={20} height={20} />
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default VideoCardSkeleton;
