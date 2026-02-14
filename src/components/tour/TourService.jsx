// src/components/tour/TourService.jsx - Safe version with proper error handling
import { useEffect } from 'react';
import { useTour, TOUR_TYPES } from './TourContext';
import { useSelector } from 'react-redux';
import { getLocalStorage } from '../../utils/localStorageUtils';
import { IS_ADMIN } from '../../utils/constants/auth';

const TourService = () => {
  const { startTour } = useTour();
  
  // Safe Redux state access with fallbacks
  const profileData = useSelector((state) => {
    try {
      return state?.profile?.profileData || null;
    } catch (error) {
      console.warn('TourService: Profile state not available yet');
      return null;
    }
  });

  useEffect(() => {
    // Safety checks before doing anything
    try {
      // Check if we have the required data
      if (!profileData?.id) {
        console.log('TourService: Waiting for profile data...');
        return;
      }

      // Safe localStorage access
      const isAdmin = getLocalStorage(IS_ADMIN);
      if (isAdmin) {
        console.log('TourService: Admin user, skipping tours');
        return;
      }

      // Safe localStorage read with error handling
      let completedTours = [];
      try {
        const stored = localStorage.getItem('buildeezy_completed_tours');
        completedTours = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.warn('TourService: Error reading completed tours from localStorage:', error);
        completedTours = [];
      }

      // Check if this is a first-time user
      const isFirstTime = completedTours.length === 0;
      
      if (isFirstTime) {
        console.log('TourService: First-time user detected, scheduling tour...');
        
        // Wait for UI to fully load before starting tour
        const timer = setTimeout(() => {
          try {
            console.log('TourService: Starting profile tour for first-time user');
            startTour(TOUR_TYPES.PROFILE);
          } catch (error) {
            console.error('TourService: Error starting tour:', error);
          }
        }, 3000); // Increased delay to ensure UI is ready
        
        return () => clearTimeout(timer);
      } else {
        console.log('TourService: User has completed tours before, skipping auto-start');
      }
      
    } catch (error) {
      console.error('TourService: Error in useEffect:', error);
      // Don't re-throw the error - just log it and continue
    }
  }, [profileData?.id, startTour]); // Only depend on essential values

  // This component doesn't render anything
  return null;
};

export default TourService;

// Alternative: Conditional TourService that only loads when ready
export const ConditionalTourService = () => {
  const profileData = useSelector((state) => state?.profile?.profileData);
  
  // Only render TourService when we have profile data
  if (!profileData?.id) {
    console.log('ConditionalTourService: Profile not ready yet');
    return null;
  }
  
  return <TourService />;
};

// Alternative: Delayed TourService that waits before initializing
export const DelayedTourService = () => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Wait for app to be fully initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isReady) {
    return null;
  }
  
  return <TourService />;
};

// Manual tour trigger service (doesn't auto-start)
export const ManualTourService = () => {
  // This version doesn't auto-start tours, just provides the context
  // Use this if you want to manually trigger tours only
  return null;
};