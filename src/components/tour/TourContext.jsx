// src/components/tour/TourContext.jsx - FIXED Previous Navigation & Step Counting
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../../context/ThemeContext';

const TOUR_TYPES = {
  PROFILE: 'profile',
  IDEAS: 'ideas',
  PROFESSIONALS: 'professionals'
};

const tourSteps = {
  profile: [
    {
      target: '[data-tour="profile-avatar"]',
      content: 'Click on your profile avatar to open the profile menu.',
      placement: 'bottom',
      title: 'Step 1: Open Profile Menu',
      disableBeacon: true,
      page: '/dashboard'
    },
    {
      target: '[data-tour="profile-menu-item"]',
      content: 'Click on "Profile" to navigate to your profile settings.',
      placement: 'bottom',
      title: ' Go to Profile Page',
      page: '/dashboard',
      action: 'navigate',
      navigateTo: '/profile'
    },
    {
      target: '[data-tour="profile-photo-upload"]',
      content: 'Upload your profile photo and complete all the blank spaces on this page. Don\'t forget to save your changes.',
      placement: 'right',
      title: 'Step 2: Upload Profile Photo',
      page: '/profile',
      waitForTarget: true,
      disableBeacon: true,
      spotlightClicks: false
    },
    {
      target: '[data-tour="design-tab"]',
      content: 'Click on the Design tab to customize how your profile looks.',
      placement: 'bottom',
      title: 'Step 4: Access Design Settings',
      page: '/profile',
      action: 'switch-tab',
      tabIndex: 2,
      disableBeacon: true
    },
    {
      target: '[data-tour="banner-upload"]',
      content: 'Upload your banner photo to make your profile stand out.',
      placement: 'bottom',
      title: 'Step 3: Upload Banner Photo',
      page: '/profile',
      waitForTarget: true,
      disableBeacon: true
    },
    {
      target: '[data-tour="theme-selector"]',
      content: 'Select a suitable theme for your profile. Use the preview feature to see how your profile will look.',
      placement: 'bottom',
      title: 'Step 4: Choose Your Theme',
      page: '/profile',
      disableBeacon: true
    },
    {
      target: '[data-tour="font-selector"]',
      content: 'Select your preferred font style, then save your changes.',
      placement: 'bottom',
      title: 'Step 5: Select Font Style',
      page: '/profile',
      disableBeacon: true
    }
  ]
};

const TourContext = createContext();

export function TourProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode } = useThemeMode();
  
  const [tourState, setTourState] = useState(() => {
    // Always start with clean state - don't restore from sessionStorage on refresh
    return {
      run: false,
      stepIndex: 0,
      tourType: null,
      waitingForNavigation: false,
      targetPage: null
    };
  });

  // Simplified state management - only save when actually needed
  useEffect(() => {
    // Only save state when tour is actively running and has a valid type
    if (tourState.run && tourState.tourType) {
      sessionStorage.setItem('buildeezy_tour_state', JSON.stringify(tourState));
    }
    // Don't auto-clear on every state change - let manual cleanup handle it
  }, [tourState.run, tourState.tourType, tourState.stepIndex]);

  // Enhanced navigation completion handler
  useEffect(() => {
    if (tourState.waitingForNavigation && tourState.targetPage) {
      console.log('🔧 Checking navigation completion:', location.pathname, 'vs target:', tourState.targetPage);
      
      if (location.pathname === tourState.targetPage || 
          location.pathname.startsWith(tourState.targetPage)) {
        
        console.log('🔧 Navigation completed! Starting tour...');
        
        const timer = setTimeout(() => {
          setTourState(prev => ({
            ...prev,
            waitingForNavigation: false,
            targetPage: null,
            run: true
          }));
        }, 1000); // Slightly longer delay to ensure page is fully loaded
        
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, tourState.waitingForNavigation, tourState.targetPage]);

  // Get all steps for step counting
  const getAllSteps = useCallback(() => {
    if (!tourState.tourType) return [];
    return tourSteps[tourState.tourType] || [];
  }, [tourState.tourType]);

  // Filter steps for current page
  const getCurrentPageSteps = useCallback(() => {
    if (!tourState.tourType) return [];
    
    const allSteps = tourSteps[tourState.tourType] || [];
    return allSteps.filter(step => {
      if (!step.page) return true;
      return location.pathname === step.page || location.pathname.startsWith(step.page);
    });
  }, [tourState.tourType, location.pathname]);

  // FIXED: Better step index mapping
  const getCurrentPageStepIndex = useCallback(() => {
    if (!tourState.tourType) return 0;
    
    const allSteps = getAllSteps();
    const currentStep = allSteps[tourState.stepIndex];
    
    if (!currentStep) return 0;
    
    const currentPageSteps = getCurrentPageSteps();
    const stepIndex = currentPageSteps.findIndex(step => step === currentStep);
    return Math.max(0, stepIndex);
  }, [tourState.tourType, tourState.stepIndex, getAllSteps, getCurrentPageSteps]);

  // FIXED: Enhanced callback with proper close handling
  const handleJoyrideCallback = useCallback(async (data) => {
    const { action, index, status, type } = data;
    
    console.log('🔧 Tour Event:', { action, index, status, type, stepIndex: tourState.stepIndex });
    
    const allSteps = getAllSteps();
    const currentStep = allSteps[tourState.stepIndex];

    // FIXED: Handle close button click immediately
    if (action === ACTIONS.CLOSE) {
      console.log('🔧 Close button clicked - stopping tour');
      stopTour();
      return;
    }

    // Handle tour completion
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      console.log('🔧 Tour completed:', status);
      setTourState({
        run: false,
        stepIndex: 0,
        tourType: null,
        waitingForNavigation: false,
        targetPage: null
      });
      
      // Mark tour as completed
      try {
        const completedTours = JSON.parse(localStorage.getItem('buildeezy_completed_tours') || '[]');
        if (tourState.tourType && !completedTours.includes(tourState.tourType)) {
          completedTours.push(tourState.tourType);
          localStorage.setItem('buildeezy_completed_tours', JSON.stringify(completedTours));
        }
      } catch (error) {
        console.warn('Failed to save tour completion:', error);
      }
      
      return;
    }

    // Handle target not found
    if (type === 'error:target_not_found') {
      console.log('🔧 Target not found for step:', currentStep?.title);
      
      if (tourState.stepIndex === 4) { // Banner upload step
        const waitForElement = async () => {
          let attempts = 0;
          while (attempts < 10) {
            const element = document.querySelector('[data-tour="banner-upload"]');
            if (element) {
              setTourState(prev => ({ ...prev, run: false }));
              setTimeout(() => setTourState(prev => ({ ...prev, run: true })), 200);
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }
          setTourState(prev => ({ ...prev, stepIndex: prev.stepIndex + 1 }));
        };
        waitForElement();
        return;
      }
    }

    // Block previous navigation - users can only go forward or restart
    if (action === ACTIONS.PREV) {
      console.log('🔧 Previous navigation blocked - use restart instead');
      return;
    }

    // Handle NEXT navigation
    if (action === ACTIONS.NEXT && currentStep) {
      console.log('🔧 Processing NEXT for step:', currentStep.title);
      
      // Handle profile navigation
      if (currentStep.action === 'navigate' && currentStep.navigateTo === '/profile') {
        console.log('🔧 Navigating to profile...');
        setTourState(prev => ({
          ...prev,
          run: false,
          waitingForNavigation: true,
          targetPage: '/profile',
          stepIndex: prev.stepIndex + 1
        }));
        navigate('/profile');
        return;
      }

      // Handle tab switching
      if (currentStep.action === 'switch-tab') {
        console.log('🔧 Switching to tab:', currentStep.tabIndex);
        
        const event = new CustomEvent('tourTabChange', {
          detail: { tabValue: currentStep.tabIndex }
        });
        window.dispatchEvent(event);
        
        setTourState(prev => ({ ...prev, run: false }));
        
        setTimeout(() => {
          setTourState(prev => ({
            ...prev,
            run: true,
            stepIndex: prev.stepIndex + 1
          }));
        }, 1200);
        
        return;
      }
    }

    // Handle normal progression
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = tourState.stepIndex + (action === ACTIONS.PREV ? -1 : 1);
      console.log('🔧 Normal progression:', tourState.stepIndex, '→', nextStepIndex);
      
      // Check if we've reached the end
      if (nextStepIndex >= allSteps.length) {
        console.log('🔧 Reached end of tour');
        setTourState({
          run: false,
          stepIndex: 0,
          tourType: null,
          waitingForNavigation: false,
          targetPage: null
        });
        return;
      }
      
      // Check if next step is on current page or needs navigation
      const nextStep = allSteps[nextStepIndex];
      if (nextStep && nextStep.page && nextStep.page !== location.pathname && !location.pathname.startsWith(nextStep.page)) {
        console.log('🔧 Next step requires navigation to:', nextStep.page);
        // Don't auto-navigate, just update step index and let the step handle it
      }
      
      setTourState(prev => ({ ...prev, stepIndex: nextStepIndex }));
    }
  }, [tourState.tourType, tourState.stepIndex, location.pathname, navigate, getAllSteps]);

  // Enhanced start tour with automatic navigation to correct starting page
  const startTour = useCallback((tourType, stepIndex = 0) => {
    if (!tourSteps[tourType]) {
      console.error('🔧 Invalid tour type:', tourType);
      return;
    }

    const allSteps = tourSteps[tourType];
    const startingStep = allSteps[stepIndex];
    const currentPage = location.pathname;
    
    console.log('🔧 Starting tour:', tourType, 'at step:', stepIndex);
    console.log('🔧 Current page:', currentPage, 'Starting step page:', startingStep?.page);

    // Check if we need to navigate to the starting page
    if (startingStep?.page && startingStep.page !== currentPage && !currentPage.startsWith(startingStep.page)) {
      console.log('🔧 Need to navigate to starting page:', startingStep.page);
      
      // Set tour state to waiting for navigation
      setTourState({
        run: false,
        stepIndex,
        tourType,
        waitingForNavigation: true,
        targetPage: startingStep.page
      });
      
      // Navigate to the starting page
      navigate(startingStep.page);
      return;
    }

    // If we're already on the correct page, start immediately
    console.log('🔧 Starting tour immediately on current page');
    setTourState({
      run: true,
      stepIndex,
      tourType,
      waitingForNavigation: false,
      targetPage: null
    });
  }, [location.pathname, navigate]);

  // Simplified stop tour function
  const stopTour = useCallback(() => {
    console.log('🔧 Stopping tour');
    sessionStorage.removeItem('buildeezy_tour_state');
    setTourState({
      run: false,
      stepIndex: 0,
      tourType: null,
      waitingForNavigation: false,
      targetPage: null
    });
  }, []);

  // Force reset tour state (for debugging or recovery)
  const resetTour = useCallback(() => {
    console.log('🔧 Force resetting tour state');
    sessionStorage.removeItem('buildeezy_tour_state');
    setTourState({
      run: false,
      stepIndex: 0,
      tourType: null,
      waitingForNavigation: false,
      targetPage: null
    });
  }, []);

  // Add restart tour function
  const restartTour = useCallback(() => {
    console.log('🔧 Restarting tour manually');
    if (tourState.tourType) {
      setTourState(prev => ({
        ...prev,
        run: true,
        stepIndex: 0,
        waitingForNavigation: false,
        targetPage: null
      }));
    }
  }, [tourState.tourType]);

  // Check for first-time user and auto-start tour
  const checkAndStartFirstTimeTour = useCallback((userProfile) => {
    try {
      // Don't auto-start if a tour is already running
      if (tourState.run) {
        console.log('🔧 Tour already running, skipping auto-start');
        return;
      }

      // Check if tours have been completed before
      let completedTours = [];
      try {
        const stored = localStorage.getItem('buildeezy_completed_tours');
        completedTours = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.warn('Error reading completed tours:', error);
        completedTours = [];
      }

      // Check user's tour history from profile (if available)
      const hasCompletedProfileTour = completedTours.includes(TOUR_TYPES.PROFILE);
      const isFirstTimeUser = completedTours.length === 0;
      
      // Additional checks for user profile completeness
      const isProfileIncomplete = userProfile && (
        !userProfile.profilePhoto || 
        !userProfile.firstName || 
        !userProfile.lastName ||
        !userProfile.bio
      );

      console.log('🔧 Tour check:', {
        isFirstTimeUser,
        hasCompletedProfileTour,
        isProfileIncomplete,
        userProfileExists: !!userProfile
      });

      // Auto-start profile tour if:
      // 1. First time user OR
      // 2. Profile tour not completed AND profile is incomplete
      if (isFirstTimeUser || (!hasCompletedProfileTour && isProfileIncomplete)) {
        console.log('🔧 Auto-starting profile tour for first-time/incomplete user');
        
        // Small delay to ensure UI is fully loaded
        setTimeout(() => {
          startTour(TOUR_TYPES.PROFILE);
        }, 2000);
      }
    } catch (error) {
      console.error('Error in checkAndStartFirstTimeTour:', error);
    }
  }, [tourState.run, startTour]);

  const value = {
    ...tourState,
    startTour,
    stopTour,
    restartTour,
    resetTour, // Add reset function for recovery
    checkAndStartFirstTimeTour,
    TOUR_TYPES,
    currentPage: location.pathname
  };

  const currentSteps = getCurrentPageSteps();
  const currentStepIndex = getCurrentPageStepIndex();
  const allSteps = getAllSteps();

  // FIXED: Proper step display - show overall step number correctly
  const getStepDisplay = () => {
    const currentStepNumber = tourState.stepIndex + 1;
    const totalSteps = allSteps.length;
    return { current: currentStepNumber, total: totalSteps };
  };

  const stepDisplay = getStepDisplay();

  // Enhanced Joyride styles
  const joyrideStyles = {
    options: {
      arrowColor: theme.palette.primary.main,
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.3)',
      primaryColor: theme.palette.primary.main,
      textColor: mode === 'dark' ? '#ffffff' : '#333333',
      width: 350,
      zIndex: 10000,
      beaconSize: 0,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    tooltip: {
      borderRadius: 8,
      fontSize: 14,
      fontFamily: theme.typography.fontFamily,
      boxShadow: mode === 'dark' 
        ? '0 8px 24px rgba(0, 0, 0, 0.6)' 
        : '0 8px 24px rgba(0, 0, 0, 0.15)',
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#ffffff',
    },
    tooltipContainer: {
      textAlign: 'left',
    },
    tooltipTitle: {
      color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      lineHeight: '1.4',
      fontFamily: theme.typography.fontFamily,
      padding: '16px 20px 0',
    },
    tooltipContent: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: mode === 'dark' ? '#e0e0e0' : '#555555',
      fontFamily: theme.typography.fontFamily,
      padding: '8px 20px 16px',
    },
    tooltipFooter: {
      padding: '0 20px 16px',
      borderTop: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '8px',
    },
    buttonNext: {
      backgroundColor: theme.palette.primary.main,
      borderRadius: '6px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      padding: '8px 16px',
      border: 'none',
      cursor: 'pointer',
      fontFamily: theme.typography.fontFamily,
    },
    buttonBack: {
      display: 'none', // Hide previous button completely
    },
    buttonSkip: {
      color: mode === 'dark' ? '#aaa' : '#999',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontFamily: theme.typography.fontFamily,
    },
    buttonClose: {
      color: mode === 'dark' ? '#aaa' : '#666',
      fontSize: '16px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      position: 'absolute',
      top: '8px',
      right: '8px',
      '&:hover': {
        color: mode === 'dark' ? '#fff' : '#333',
        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderRadius: '50%',
      }
    },
    beacon: {
      display: 'none',
    },
    beaconInner: {
      display: 'none',
    },
    spotlight: {
      borderRadius: '4px',
    }
  };

  console.log('🔧 Tour render state:', {
    run: tourState.run,
    waitingForNavigation: tourState.waitingForNavigation,
    globalStepIndex: tourState.stepIndex,
    globalStepNumber: tourState.stepIndex + 1,
    totalSteps: getAllSteps().length,
    currentPage: location.pathname,
    targetPage: tourState.targetPage,
    tourType: tourState.tourType,
    stepDisplay
  });

  return (
    <TourContext.Provider value={value}>
      {children}
      
      {/* FIXED: Enhanced Joyride with proper step counting and dynamic titles */}
      {tourState.run && !tourState.waitingForNavigation && currentSteps.length > 0 && (
        <Joyride
          callback={handleJoyrideCallback}
          continuous={true}
          run={true}
          stepIndex={Math.max(0, currentStepIndex)}
          steps={currentSteps.map((step) => {
            // FIXED: Calculate the correct step number for this specific step
            const allStepsArray = getAllSteps();
            const globalStepIndex = allStepsArray.findIndex(s => s === step);
            const stepNumber = globalStepIndex + 1;
            
            return {
              ...step,
              // FIXED: Override step display to show correct global step numbers
              title: step.title,
            };
          })}
          hideCloseButton={false}
          scrollToFirstStep={true}
          showProgress={false}
          showSkipButton={true}
          disableOverlay={false}
          disableOverlayClose={true}
          spotlightClicks={false}
          spotlightPadding={6}
          disableBeacon={true}
          styles={joyrideStyles}
          locale={{
            back: 'Previous',
            close: 'Close',
            last: 'Complete Guide',
            next: 'Next',
            skip: 'Skip Guide',
          }}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}

export { TOUR_TYPES };

export default { TourProvider, useTour, TOUR_TYPES };