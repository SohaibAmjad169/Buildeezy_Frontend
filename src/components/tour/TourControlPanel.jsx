// src/components/tour/TourControls.jsx - Safe tour controls for AppBar
import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import {
  NavigationOutlined,
  PlayArrow,
  Person,
  Lightbulb,
  People,
  Close,
  RestartAlt,
  AssistantDirectionSharp,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTour, TOUR_TYPES } from "./TourContext";
import { useTranslation } from "react-i18next";

// Simple tour menu for AppBar - FIXED: Better icon
export const TourMenuButton = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { startTour, run } = useTour();
  const { t } = useTranslation();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStartTour = (tourType) => {
    try {
      startTour(tourType);
      handleClose();
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  };

  return (
    <>
      <Tooltip title="Help & Guides">
        <IconButton
          onClick={() => handleStartTour(TOUR_TYPES.PROFILE)}
          disabled={run}
          size="small"
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": { backgroundColor: "primary.dark" },
            borderRadius: "6px",
            padding: "4px 6px",
            gap: "4px",
          }}
        >
          <AssistantDirectionSharp fontSize="small" />
          <span style={{ fontSize: "0.8rem" }}>Tour</span>
        </IconButton>
      </Tooltip>

      {/* <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleStartTour(TOUR_TYPES.PROFILE)}>
          <PlayArrow sx={{ mr: 1 }} />
          {t("profile_tour") || "Profile Setup Guide"}
        </MenuItem>
        <MenuItem onClick={() => handleStartTour(TOUR_TYPES.IDEAS)}>
          <PlayArrow sx={{ mr: 1 }} />
          {t("ideas_guide") || "Ideas Guide"}
        </MenuItem>
        <MenuItem onClick={() => handleStartTour(TOUR_TYPES.PROFESSIONALS)}>
          <PlayArrow sx={{ mr: 1 }} />
          {t("professionals_guide") || "Professionals Guide"}
        </MenuItem>
      </Menu> */}
    </>
  );
};

// Full tour dialog for more detailed control
export const TourDialog = ({ className = "", compact = false }) => {
  const { startTour, stopTour, run, tourType } = useTour();
  const { t } = useTranslation();
  const theme = useTheme();

  const tours = [
    {
      type: TOUR_TYPES.PROFILE,
      label: t("profile_tour") || "Profile Setup",
      description:
        t("complete_profile_creation_guide") ||
        "Complete profile creation guide",
      color: "primary",
      icon: <Person fontSize="small" />,
    },
    {
      type: TOUR_TYPES.IDEAS,
      label: t("idea_lounge_guide") || "Idea Lounge",
      description: t("explore_and_create_ideas") || "Explore and create ideas",
      color: "secondary",
      icon: <Lightbulb fontSize="small" />,
    },
    {
      type: TOUR_TYPES.PROFESSIONALS,
      label: t("find_professionals_guide") || "Find Professionals",
      description:
        t("search_and_connect_with_others") || "Search and connect with others",
      color: "success",
      icon: <People fontSize="small" />,
    },
  ];

  if (compact) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<NavigationOutlined fontSize="small" />}
        onClick={() => startTour(TOUR_TYPES.PROFILE)}
        disabled={run}
        sx={{
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}10`,
          },
        }}
      >
        Start Guide
      </Button>
    );
  }

  return (
    <Card
      className={className}
      sx={{
        mb: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {/* UPDATED: Better icon for guides */}
            <NavigationOutlined sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Interactive Guides
            </Typography>
          </Box>
          {run && (
            <IconButton
              onClick={stopTour}
              size="small"
              sx={{ color: "error.main" }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Welcome to Buildeezy! Choose a tour to learn our platform effectively.
        </Typography>

        <Grid container spacing={1.5}>
          {tours.map((tour) => (
            <Grid item xs={12} sm={4} key={tour.type}>
              <Button
                variant={
                  run && tourType === tour.type ? "contained" : "outlined"
                }
                fullWidth
                startIcon={tour.icon}
                onClick={() => startTour(tour.type)}
                disabled={run}
                sx={{
                  p: 1.5,
                  textAlign: "left",
                  justifyContent: "flex-start",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minHeight: 70,
                  fontSize: "0.875rem",
                  ...(run && tourType === tour.type
                    ? {
                        backgroundColor: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }
                    : {
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: `${theme.palette.primary.main}08`,
                        },
                      }),
                }}
              >
                <Typography
                  variant="subtitle2"
                  component="div"
                  sx={{ fontWeight: 600 }}
                >
                  {tour.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                >
                  {tour.description}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>

        {run && (
          <Box
            mt={2}
            p={1.5}
            sx={{
              bgcolor: `${theme.palette.primary.main}15`,
              borderRadius: 1,
              border: `1px solid ${theme.palette.primary.main}30`,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label="Guide Active"
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontSize: "0.75rem",
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                  {tours.find((t) => t.type === tourType)?.label}
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<RestartAlt fontSize="small" />}
                onClick={() => startTour(tourType, 0)}
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: "0.75rem",
                }}
              >
                Restart
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Simple floating help button - FIXED: Better icon
export const FloatingHelpButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { run } = useTour();

  return (
    <>
      <IconButton
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          bgcolor: "primary.main",
          color: "white",
          "&:hover": {
            bgcolor: "primary.dark",
          },
          zIndex: 1000,
        }}
        onClick={() => setDialogOpen(true)}
        disabled={run}
      >
        {/* UPDATED: Better icon for floating help */}
        <NavigationOutlined />
      </IconButton>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Interactive Guides</DialogTitle>
        <DialogContent>
          <TourDialog />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default { TourMenuButton, TourDialog, FloatingHelpButton };
