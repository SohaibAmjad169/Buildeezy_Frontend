import { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from "react-router-dom";
import { isAuthorized } from "../../utils/common";
import FallbackSpinner from '../common/FallbackSpinner';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = isAuthorized();

  if (isAuthenticated) {
    return <Suspense fallback={<FallbackSpinner />}>{children}</Suspense>;
  } else {
    return <Navigate to="/" replace />;
  }
};

ProtectedRoute.propTypes = { children: PropTypes.node };

export default ProtectedRoute;
