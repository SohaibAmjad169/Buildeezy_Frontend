import { Suspense } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../../utils/common";
import { useSelector } from "react-redux";
import AccessDenied from "../errorPages/AccessDenied";
import FallbackSpinner from "../common/FallbackSpinner";
import { ROUTES } from "../../utils/constants/route";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";

const PrivateRoute = ({ requiredRoles, children }) => {
  const location = useLocation();
  const profile = useSelector((state) => state.profile);
  const isAuthenticated = isLoggedIn();
  const isAdmin = getLocalStorage(IS_ADMIN);


  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`/${ROUTES.login}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // For admin routes, we mainly rely on the IS_ADMIN flag
  if (isAdmin) {
    return <Suspense fallback={<FallbackSpinner />}>{children}</Suspense>;
  }

  // Check if profile data exists and has userType
  if (!profile.profileData || typeof profile.profileData.userType === 'undefined') {
    return <FallbackSpinner />;
  }

  // Check role permissions for non-admin users
  if (Array.isArray(requiredRoles) && !requiredRoles.includes(profile.profileData.userType)) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<FallbackSpinner />}>{children}</Suspense>;
};

PrivateRoute.propTypes = {
  requiredRoles: PropTypes.array,
  children: PropTypes.node,
};

export default PrivateRoute;