import React, { useState, useEffect } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  TextField,
  Button,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Eye, Heart, MessageSquare, TrendingUp, Calendar, Filter } from 'lucide-react';
import dayjs from 'dayjs';

const AdAnalyticsChart = ({ analyticsData, loading = false, onDateRangeChange }) => {
  const { t } = useTranslation();
  const [showCumulative, setShowCumulative] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day')); // Changed from 30 to 7
  const [endDate, setEndDate] = useState(dayjs());
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    if (analyticsData?.impressions?.dailyImpressions) {
      console.log('Frontend: Received analytics data:', analyticsData);
      
      const formattedData = analyticsData.impressions.dailyImpressions.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: item.date,
        daily: item.count,
        cumulative: item.cumulativeCount,
      }));
      
      console.log('Frontend: Formatted chart data:', {
        total: formattedData.length,
        withData: formattedData.filter(item => item.daily > 0),
        first5: formattedData.slice(0, 5),
        last5: formattedData.slice(-5)
      });
      
      setChartData(formattedData);
    }
  }, [analyticsData]);

  const handleDateRangeApply = () => {
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: startDate.toDate(),
        endDate: endDate.toDate()
      });
    }
    setShowDateFilter(false);
  };

  const handleQuickDateRange = (days) => {
    const newEndDate = dayjs(); // Today
    const newStartDate = dayjs().subtract(days, 'day');
    
    console.log('Frontend: Setting date range', {
      days,
      startDate: newStartDate.format('YYYY-MM-DD'),
      endDate: newEndDate.format('YYYY-MM-DD'),
      startDateObj: newStartDate.toDate(),
      endDateObj: newEndDate.toDate(),
      // Check if Aug 5 is in range
      includesAug5: dayjs('2025-08-05').isBetween(newStartDate, newEndDate, 'day', '[]')
    });
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: newStartDate.toDate(),
        endDate: newEndDate.toDate()
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ height: 32, bgcolor: 'grey.200', borderRadius: 1, width: '30%' }} />
          <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box sx={{ height: 120, bgcolor: 'grey.200', borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ height: 400, bgcolor: 'grey.200', borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h1" color="text.secondary">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const { impressions, engagement } = analyticsData;
  
  const statsCards = [
    {
      title: t('analytics.total_impressions') || 'Total Impressions',
      value: impressions?.totalImpressions || 0,
      icon: Eye,
      color: 'primary.main',
      bgColor: 'primary.main',
    },
    {
      title: t('analytics.unique_users') || 'Unique Users',
      value: impressions?.uniqueUsers || 0,
      icon: TrendingUp,
      color: 'success.main',
      bgColor: 'success.main',
    },
    {
      title: t('analytics.total_likes') || 'Total Likes',
      value: engagement?.totalLikes || 0,
      icon: Heart,
      color: 'error.main',
      bgColor: 'error.main',
    },
    {
      title: t('analytics.total_comments') || 'Total Comments',
      value: engagement?.totalComments || 0,
      icon: MessageSquare,
      color: 'warning.main',
      bgColor: 'warning.main',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {showCumulative ? 'Cumulative' : 'Daily'} Impressions: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const peakDay = chartData.reduce((max, item) => 
    item.daily > max.daily ? item : max, chartData[0] || {}
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          {t('analytics.title') || 'Advertisement Analytics'}
        </Typography>

        {/* Quick Date Range Buttons */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Calendar size={16} />}
              onClick={() => setShowDateFilter(!showDateFilter)}
              sx={{ mb: { xs: 1, sm: 0 } }}
            >
              {t('analytics.date_range') || 'Date Range'}
            </Button>
            <Button
              variant={startDate.isSame(dayjs().subtract(7, 'day'), 'day') ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickDateRange(7)}
              sx={{ mb: { xs: 1, sm: 0 } }}
            >
              {t('analytics.7_days') || '7 Days'}
            </Button>
            <Button
              variant={startDate.isSame(dayjs().subtract(30, 'day'), 'day') ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickDateRange(30)}
              sx={{ mb: { xs: 1, sm: 0 } }}
            >
              {t('analytics.30_days') || '30 Days'}
            </Button>
            <Button
              variant={startDate.isSame(dayjs().subtract(90, 'day'), 'day') ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickDateRange(90)}
              sx={{ mb: { xs: 1, sm: 0 } }}
            >
              {t('analytics.90_days') || '90 Days'}
            </Button>
          </Stack>
        </Box>

        {/* Date Range Picker */}
        {showDateFilter && (
          <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h3" gutterBottom>
              {t('analytics.select_date_range') || 'Select Date Range'}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <DatePicker
                label={t('analytics.start_date') || 'Start Date'}
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                maxDate={dayjs()}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label={t('analytics.end_date') || 'End Date'}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                maxDate={dayjs()}
                minDate={startDate}
                slotProps={{ textField: { size: 'small' } }}
              />
              <Button
                variant="contained"
                onClick={handleDateRangeApply}
                startIcon={<Filter size={16} />}
              >
                {t('analytics.apply') || 'Apply'}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `${stat.bgColor}15`,
                          color: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent size={24} />
                      </Box>
                      <Box>
                        <Typography variant="h1" sx={{ fontWeight: 700 }}>
                          {stat.value.toLocaleString()}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Chart Section */}
        {chartData.length > 0 ? (
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ fontWeight: 600 }}>
                  {t('analytics.impression_trends') || 'Impression Trends'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`${chartData.length} ${t('analytics.days') || 'days'}`}
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showCumulative}
                        onChange={(e) => setShowCumulative(e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={t('analytics.cumulative') || 'Cumulative'}
                  />
                </Box>
              </Box>

              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  {showCumulative ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#709a1c"
                        strokeWidth={3}
                        dot={{ fill: '#709a1c', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#709a1c', strokeWidth: 2 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="daily"
                        fill="#709a1c"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Box>

              {/* Summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>{t('analytics.peak_day') || 'Peak Day'}:</strong> {peakDay?.date || t('analytics.not_available') || 'N/A'} {t('analytics.with') || 'with'}{' '}
                  {Math.max(...chartData.map(item => item.daily), 0)} {t('analytics.impressions') || 'impressions'}
                  {chartData.length > 0 && (
                    <>
                      {' • '}
                      <strong>{t('analytics.date_range') || 'Date Range'}:</strong> {chartData[0]?.fullDate} {t('analytics.to') || 'to'} {chartData[chartData.length - 1]?.fullDate}
                    </>
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <TrendingUp size={48} color="#709a1c" style={{ marginBottom: 16 }} />
                <Typography variant="h2" color="text.secondary" gutterBottom>
                  No impression data available yet
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Data will appear once your ad starts receiving impressions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AdAnalyticsChart;