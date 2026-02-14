// src/components/tour/QuickTourButton.jsx
import React from 'react';
import { Button, Fab, Tooltip } from '@mui/material';
import { 
  PlayArrow, 
  MapOutlined,
  ExploreOutlined,
  NavigationOutlined,
  DirectionsOutlined,
  RouteOutlined,
  CompassCalibrationOutlined
} from '@mui/icons-material';
import { useTour } from './TourContext';
import { useTranslation } from 'react-i18next';

const QuickTourButton = ({ 
  tourType, 
  variant = "button", // "button", "fab", "icon"
  size = "medium",
  color = "primary",
  children,
  icon = "navigation", // "navigation", "map", "explore", "directions", "route", "compass"
  ...props 
}) => {
  const { startTour, run } = useTour();
  const { t } = useTranslation();

  const handleClick = () => {
    if (tourType) {
      startTour(tourType);
    }
  };

  // UPDATED: Better guide/navigation icons
  const getIcon = () => {
    switch (icon) {
      case "map":
        return <MapOutlined />;
      case "explore":
        return <ExploreOutlined />;
      case "directions":
        return <DirectionsOutlined />;
      case "route":
        return <RouteOutlined />;
      case "compass":
        return <CompassCalibrationOutlined />;
      case "navigation":
      default:
        return <NavigationOutlined />; // Perfect for guide/tour navigation
    }
  };

  const selectedIcon = getIcon();

  if (variant === "fab") {
    return (
      <Tooltip title={t('take_tour') || 'Take Tour'}>
        <Fab
          color={color}
          size={size}
          onClick={handleClick}
          disabled={run}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          {...props}
        >
          {selectedIcon}
        </Fab>
      </Tooltip>
    );
  }

  if (variant === "icon") {
    return (
      <Tooltip title={t('take_tour') || 'Take Tour'}>
        <Button
          variant="text"
          color={color}
          size={size}
          onClick={handleClick}
          disabled={run}
          sx={{ minWidth: 'auto', p: 1 }}
          {...props}
        >
          {selectedIcon}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outlined"
      color={color}
      size={size}
      startIcon={<PlayArrow />}
      onClick={handleClick}
      disabled={run}
      {...props}
    >
      {children || t('take_tour') || 'Take Tour'}
    </Button>
  );
};

export default QuickTourButton;