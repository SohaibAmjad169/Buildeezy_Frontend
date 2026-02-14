import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { setAlert, setLoading } from "../redux/configSlice";
import {
  adminLoginUrl,
  loginUrl,
  socialLoginUrl,
  getProfileUrl,
  getPortfolioUrl,
} from "../apis/apiEndPoints";
import { setLocalStorage } from "../utils/localStorageUtils";
import {
  ACCESS_TOKEN_KEY,
  IP_LOCAL_DATA,
  IS_ADMIN,
  REFRESH_TOKEN_KEY,
  STRIPE_ACCOUNT_ID,
  USER_DATA,
  USER_LOCALE,
} from "../utils/constants/auth";
import { ROUTES } from "../utils/constants/route";
import useRegisterFields from "./useRegisterFields";
import { ALERT_TYPE } from "../utils/constants/config";
import { setProfileData } from "../redux/profileSlice";
import { calculateProfileCompletion, shouldRedirectToProfile } from "../utils/profileCompletion";
import { PROFILE_DATA } from "../utils/constants/profile";

function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState("");
  const [passwordExpired, setPasswordExpired] = useState(false);

  const { updateRegisterFields } = useRegisterFields();

  // Check profile completion and redirect if necessary
  async function checkProfileCompletion(userData) {
    try {
      console.log('checkProfileCompletion called with:', userData?.id, userData?.userType);
      
      if (!userData?.id || !userData?.userType) {
        console.log('Missing user data, returning null');
        return null; // Can't check completion without user data
      }

      // Get the profile fields structure for this user type
      const profileFields = PROFILE_DATA[userData.userType] || [];
      console.log('Profile fields for', userData.userType, ':', profileFields.length);
      
      // Fetch complete profile data, portfolio, and design data
      console.log('Fetching complete profile data for user:', userData.id);
      const [profileResponse, portfolioResponse] = await Promise.all([
        getProfileUrl(userData.id),
        getPortfolioUrl(userData.id).catch(() => ({ data: { data: [] } })) // Catch portfolio errors
      ]);
      
      if (!profileResponse?.data?.data) {
        console.log('No profile data received');
        return null;
      }
      
      console.log('Profile data received:', profileResponse.data.data);
      console.log('Portfolio data received:', portfolioResponse?.data?.data || []);

      // Create profile fields with current values
      const fieldsWithValues = profileFields.map(field => {
        const profileData = profileResponse.data.data;
        let additionalInfo = {};
        
        if (userData.userType === 'vendor') {
          additionalInfo = profileData.vendorAdditionalInfo || {};
        } else if (userData.userType === 'specialist') {
          additionalInfo = profileData.specialistAdditionalInfo || {};
        } else if (userData.userType === 'contractor') {
          additionalInfo = profileData.contractorAdditionalInfo || {};
        }

        let fieldValue = '';
        if (field.id === 'name') {
          fieldValue = {
            first: profileData.firstName || '',
            second: profileData.lastName || '',
          };
        } else if (field.id === 'email') {
          fieldValue = profileData.email || '';
        } else if (field.id === 'phoneNumber') {
          fieldValue = profileData.phoneNumber || '';
        } else if (field.id === 'country') {
          fieldValue = profileData.country || {};
        } else if (field.id === 'city') {
          fieldValue = profileData.city || {};
        } else if (field.id === 'description') {
          fieldValue = profileData.description || '';
        } else {
          fieldValue = additionalInfo[field.id] || '';
        }

        return {
          ...field,
          value: fieldValue
        };
      });

      // Extract additional data for comprehensive calculation
      const profileData = profileResponse.data.data;
      const designData = profileData.profileDesign || {};
      const portfolioData = portfolioResponse?.data?.data || [];
      const pastClientsData = profileData.pastClients || [];
      
      console.log('Design data:', designData);
      console.log('Portfolio count:', portfolioData.length);
      console.log('Past clients count:', pastClientsData.length);

      // Calculate completion percentage with all data
      const completion = calculateProfileCompletion(
        fieldsWithValues, 
        designData, 
        portfolioData, 
        pastClientsData,
        profileData
      );
      console.log('Comprehensive profile completion result:', completion);
      return completion.percentage;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return null; // Don't block login on error
    }
  }

  function navigateToRegister(redirectPath = null) {
    const state = { isSocial: true };
    
    // If there's a redirect path, preserve it in the register flow
    if (redirectPath) {
      state.from = { pathname: redirectPath };
    }
    
    navigate(
      "/" + ROUTES.register,
      { state },
      { replace: true }
    );
  }

  async function onLogin(
    loginPayload,
    isSocial = true,
    rememberMe = false,
    fbData = {},
    redirectPath = null
  ) {
    try {
      dispatch(setLoading(true));
      const loginApiUrl = isSocial ? socialLoginUrl : loginUrl;
      const response = await loginApiUrl(loginPayload);
      const status = response.data.data?.status;
      const email = response.data.data?.email;
      //set admin false for every user login
      setLocalStorage(IS_ADMIN, false);

      //status is 0 when user is deactivated
      if (status === 3) {
        navigate(
          "/" + ROUTES.reactivateAccount,
          { state: { email } },
          { replace: true }
        );
        return;
      }

      const accessToken = response.data.data?.session.accessToken;
      const refreshToken = response.data.data?.session.refreshToken;
      const userType = response.data.data?.userType;

      setLocalStorage(ACCESS_TOKEN_KEY, accessToken);
      if (rememberMe) {
        setLocalStorage(REFRESH_TOKEN_KEY, refreshToken);
      }
      dispatch(setProfileData(response.data.data));

      //status is 0 when user is registered but onboarding is pending
      if (status === 0) {
        navigate(
          "/" + ROUTES.onboarding,
          { state: { userType } },
          { replace: true }
        );
        return;
      }
      //store user data only if user is logged in
      setLocalStorage(USER_DATA, { user: response.data.data }, true);
      setLocalStorage(
        STRIPE_ACCOUNT_ID,
        response.data.data?.stripeAccountId,
        true
      );
      //request for push notifications registration only if user is logged in

      // Check profile completion and redirect accordingly
      console.log('Checking profile completion for user:', response.data.data.id, response.data.data.userType);
      const completionPercentage = await checkProfileCompletion(response.data.data);
      console.log('Profile completion percentage:', completionPercentage);
      
      // If profile completion is less than 50%, redirect to profile page
      if (completionPercentage !== null && shouldRedirectToProfile(completionPercentage)) {
        console.log('Redirecting to profile page due to incomplete profile:', completionPercentage + '%');
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.warning,
            message: `Profile ${completionPercentage}% complete. Please complete your profile to continue using all features.`,
          })
        );
        navigate("/" + ROUTES.profile, { replace: true });
      } else {
        console.log('Profile completion OK, navigating to dashboard:', completionPercentage + '%');
        // Navigate to redirect path or default dashboard
        const targetPath = redirectPath || ("/" + ROUTES.dashboard);
        navigate(targetPath, { replace: true });
      }
    } catch (err) {
      if (!isSocial) {
        if (err.code === 426) {
          setPasswordExpired(true);
        } else {
          setLoginError(err.message);
        }
      } else {
        if (err.code === 425) {
          //if user does not exist, navigate to register
          const data = err.meta.user;
          const providerType = err.meta.providerType;

          if (providerType === "google") {
            updateRegisterFields(
              data.firstName,
              data.lastName,
              data.email,
              data.providerId,
              "google"
            );
          } else {
            updateRegisterFields(
              fbData.firstName,
              fbData.lastName,
              fbData.email,
              fbData.providerId,
              "facebook"
            );
          }
          navigateToRegister(redirectPath);
        } else if (err.msg) {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: err.msg,
            })
          );
        }
      }
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function onAdminLogin(loginPayload, rememberMe = false, redirectPath = null) {
    try {
      dispatch(setLoading(true));
      const response = await adminLoginUrl(loginPayload);

      const accessToken = response.data.data?.session.accessToken;
      const refreshToken = response.data.data?.session.refreshToken;

      setLocalStorage(ACCESS_TOKEN_KEY, accessToken);
      if (rememberMe) {
        setLocalStorage(REFRESH_TOKEN_KEY, refreshToken);
      }
      setLocalStorage(IS_ADMIN, true);
      // dispatch(setProfileData(response.data.data));

      //store user data only if user is logged in
      const fullAdminData = response.data.data;
      dispatch(setProfileData(fullAdminData));
      setLocalStorage(USER_DATA, { user: fullAdminData }, true);

      // Navigate to redirect path or default admin dashboard
      const targetPath = redirectPath || ("/" + ROUTES.adminDashboard);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setLoginError(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    loginError,
    onLogin,
    onAdminLogin,
    setLoginError,
    passwordExpired,
    setPasswordExpired,
  };
}

export default useLogin;