import React from 'react';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  calculateProfileCompletion,
  getProfileCompletionStatus,
  getPriorityMissingFields,
} from '../../utils/profileCompletion';

const ProfileCompletionProgress = ({ 
  profileFields, 
  designData = null,
  portfolioData = null,
  pastClientsData = null,
  profileData = null,
  showDetails = false, 
  compact = false,
  onFieldClick 
}) => {
  const { t } = useTranslation();
  const [showMissingFields, setShowMissingFields] = React.useState(false);

  const completion = calculateProfileCompletion(profileFields, designData, portfolioData, pastClientsData, profileData);
  const status = getProfileCompletionStatus(completion.percentage);
  const priorityFields = getPriorityMissingFields(completion.missingFields, 10); // Increased from 5 to 10

  if (compact) {
    return (
      <Box sx={{ mb: 2, mt:2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ minWidth: 80 }}>
            <Typography variant="body2" color="text.secondary">
              Profile: {completion.percentage}%
            </Typography>
          </Box>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={completion.percentage}
              color={status.color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
          <Chip 
            label={completion.percentage >= 100 ? 'Complete' : `${completion.missingFields.length} missing`}
            color={completion.percentage >= 100 ? 'success' : 'warning'}
            size="small"
            onClick={() => completion.missingFields.length > 0 ? setShowMissingFields(!showMissingFields) : null}
            sx={{ cursor: completion.missingFields.length > 0 ? 'pointer' : 'default' }}
          />
        </Box>
        
        {/* Missing Fields in Compact Mode */}
        {completion.missingFields.length > 0 && (
          <Collapse in={showMissingFields}>
            <Box sx={{ 
              pl: 2, 
              pt: 1, 
              borderLeft: `3px solid ${status.color === 'error' ? 'error.main' : 'warning.main'}`,
              backgroundColor: 'background.paper',
              borderRadius: 1
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                Missing Information:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {priorityFields.map((field) => (
                  <Chip
                    key={field.id}
                    label={field.title}
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => onFieldClick?.(field.id)}
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 24,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'warning.light',
                        color: 'warning.contrastText'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  return (
    <Card 
      sx={{ 
        mb: 3,
        border: status.priority === 'critical' ? 2 : 1,
        borderColor: status.color === 'error' ? 'error.main' : 'divider',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {t('profile.completion.title', 'Profile Completion')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold" color={`${status.color}.main`}>
              {completion.percentage}%
            </Typography>
            {status.priority === 'critical' && (
              <WarningIcon color="error" />
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={completion.percentage}
            color={status.color}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {completion.completedFields} of {completion.totalFields} required fields
            </Typography>
            <Typography variant="caption" color={`${status.color}.main`}>
              {status.status}
            </Typography>
          </Box>
        </Box>

        {/* Status Message */}
        <Alert 
          severity={status.color} 
          sx={{ mb: 2 }}
          icon={status.priority === 'critical' ? <WarningIcon /> : undefined}
        >
          <Typography variant="body2">
            {t(`profile.completion.${status.status}`, status.message)}
          </Typography>
        </Alert>

        {/* Missing Fields Section */}
        {completion.missingFields.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                {t('profile.completion.missing_fields', 'Missing Information')} ({completion.missingFields.length})
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowMissingFields(!showMissingFields)}
              >
                {showMissingFields ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={showMissingFields}>
              <List dense sx={{ pl: 1 }}>
                {priorityFields.map((field) => (
                  <ListItem
                    key={field.id}
                    onClick={() => onFieldClick?.(field.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <UncheckedIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={field.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                      }}
                    />
                    {field.priority >= 7 && (
                      <Chip 
                        label="Important" 
                        size="small" 
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}

        {/* Completed Fields Summary (when details shown) */}
        {showDetails && completion.completedFields > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
              ✓ Completed Information ({completion.completedFields})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {completion.completedFields.slice(0, 5).map((field) => (
                <Chip
                  key={field.id}
                  label={field.title}
                  size="small"
                  color="success"
                  variant="outlined"
                  icon={<CheckCircleIcon />}
                />
              ))}
              {completion.completedFields > 5 && (
                <Chip
                  label={`+${completion.completedFields - 5} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionProgress;