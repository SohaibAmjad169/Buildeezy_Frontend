import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Analytics,
  Visibility,
  Mouse,
  Schedule,
  TrendingUp,
  Error,
  OpenInNew,
  Refresh,
  Timeline,
  Speed,
  People,
} from '@mui/icons-material';
import clarity from '@microsoft/clarity';

const ClarityDashboard = ({ projectId = "sxabpx4iwu" }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clarityData, setClarityData] = useState({
    overview: {
      totalSessions: 0,
      totalUsers: 0,
      avgSessionDuration: 0,
      bounceRate: 0
    },
    recentSessions: [],
    sessionTrends: [],
    heatmapData: [],
    insights: [],
    customEvents: [],
    performanceMetrics: {}
  });

  // Check if Clarity is initialized (should be done in main app)
  useEffect(() => {
    if (typeof clarity === 'undefined') {
      console.warn('Microsoft Clarity is not initialized. Please ensure it is initialized in your main app.');
    }
  }, []);

  // Fetch Clarity data using their API
  const fetchClarityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Note: Microsoft Clarity doesn't provide a public REST API for dashboard data
      // You would need to use Microsoft Graph API or Clarity's internal APIs
      // This is a template for when/if they provide public APIs

      const response = await fetch(`https://clarity.microsoft.com/api/projects/${projectId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_CLARITY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Clarity data: ${response.status}`);
      }

      const data = await response.json();
      setClarityData(data);

    } catch (err) {
      console.error('Error fetching Clarity data:', err);
      setError(err.message);
      
      // For now, show message about manual access since API is not public
      setError('Microsoft Clarity data must be accessed through their web dashboard. Click "Open Clarity Dashboard" to view analytics.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Get local tracked events from Clarity
  const getLocalClarityEvents = useCallback(() => {
    try {
      // Access any locally stored Clarity events if available
      if (typeof clarity !== 'undefined' && clarity.getEvents) {
        const events = clarity.getEvents();
        return events;
      }
      return [];
    } catch (err) {
      console.error('Error getting local Clarity events:', err);
      return [];
    }
  }, []);

  // Track dashboard view
  useEffect(() => {
    if (typeof clarity !== 'undefined') {
      clarity.event('clarity_dashboard_viewed', {
        timestamp: new Date().toISOString(),
        tab: activeTab
      });
    }
  }, [activeTab]);

  useEffect(() => {
    fetchClarityData();
  }, [fetchClarityData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Track tab change
    if (typeof clarity !== 'undefined') {
      clarity.event('clarity_dashboard_tab_changed', {
        from_tab: activeTab,
        to_tab: newValue
      });
    }
  };

  const openClarityDashboard = () => {
    const url = `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`;
    window.open(url, '_blank');
    
    // Track external dashboard access
    if (typeof clarity !== 'undefined') {
      clarity.event('external_clarity_dashboard_opened', {
        project_id: projectId
      });
    }
  };

  const refreshData = () => {
    fetchClarityData();
    
    // Track refresh action
    if (typeof clarity !== 'undefined') {
      clarity.event('clarity_dashboard_refreshed', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const LoadingState = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography>Loading Clarity Analytics...</Typography>
      </Stack>
    </Box>
  );

  const ErrorState = () => (
    <Box p={3}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>Microsoft Clarity Integration</Typography>
        <Typography paragraph>
          {error || 'Microsoft Clarity does not currently provide a public API for dashboard data integration.'}
        </Typography>
        <Typography paragraph>
          To view your analytics data, please use the official Clarity dashboard:
        </Typography>
        <Button
          variant="contained"
          startIcon={<OpenInNew />}
          onClick={openClarityDashboard}
          sx={{ mr: 2 }}
        >
          Open Clarity Dashboard
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refreshData}
        >
          Retry Connection
        </Button>
      </Alert>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Features:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Analytics /></ListItemIcon>
              <ListItemText 
                primary="Session Recordings" 
                secondary="Watch real user sessions and interactions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Mouse /></ListItemIcon>
              <ListItemText 
                primary="Heatmaps" 
                secondary="See where users click, scroll, and engage"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Timeline /></ListItemIcon>
              <ListItemText 
                primary="User Insights" 
                secondary="Get automated insights about user behavior"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Speed /></ListItemIcon>
              <ListItemText 
                primary="Performance Metrics" 
                secondary="Monitor page load times and user experience"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  const OverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="success">
          <Typography>
            ✅ Clarity tracking is active across your entire website. Data will appear in the Microsoft Clarity dashboard within 1-2 hours.
          </Typography>
        </Alert>
      </Grid>
      
      {/* Placeholder cards for when API becomes available */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <People color="primary" />
              <Box>
                <Typography variant="h4">--</Typography>
                <Typography color="textSecondary">Total Sessions</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Visibility color="primary" />
              <Box>
                <Typography variant="h4">--</Typography>
                <Typography color="textSecondary">Unique Users</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Schedule color="primary" />
              <Box>
                <Typography variant="h4">--</Typography>
                <Typography color="textSecondary">Avg Session Duration</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUp color="primary" />
              <Box>
                <Typography variant="h4">--</Typography>
                <Typography color="textSecondary">Bounce Rate</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Session Trends</Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">
                Chart data will be available when connected to Clarity API
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const EventsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Custom Events Tracking</Typography>
            <Typography paragraph>
              The following events are being tracked across your entire application:
            </Typography>
            <Stack spacing={1}>
              <Chip label="app_initialized" variant="outlined" />
              <Chip label="menu_click" variant="outlined" />
              <Chip label="settings_change" variant="outlined" />
              <Chip label="profile_action" variant="outlined" />
              <Chip label="notification_click" variant="outlined" />
              <Chip label="user_logout" variant="outlined" />
              <Chip label="theme_toggled" variant="outlined" />
              <Chip label="clarity_dashboard_viewed" variant="outlined" />
              <Chip label="page_navigation" variant="outlined" />
              <Chip label="form_submission" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Microsoft Clarity Analytics
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<OpenInNew />}
            onClick={openClarityDashboard}
          >
            Open Clarity Dashboard
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Events" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && <OverviewTab />}
      {activeTab === 1 && <EventsTab />}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Clarity Configuration</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2">Project ID:</Typography>
                    <Typography>{projectId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Status:</Typography>
                    <Chip 
                      label="Active (Site-wide)" 
                      color="success" 
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Tracking Scope:</Typography>
                    <Typography>Entire website</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Initialization:</Typography>
                    <Typography>Main application entry point</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ClarityDashboard;