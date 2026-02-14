import { Box, Grid, Skeleton } from '@mui/material'
import React from 'react'

function AccountsSkeleton() {
  return (
    <Box sx={{ mt: 2 }}>
      {/* Top 3 skeleton cards in Grid layout */}
      <Grid container spacing={3} mb={4}>
        {[1, 2, 3].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rounded" width="100%" height={107} />
          </Grid>
        ))}
      </Grid>

      {/* Full-width skeleton section */}
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="rounded" width="100%" height={100} />
      </Box>
    </Box>
  )
}

export default AccountsSkeleton
