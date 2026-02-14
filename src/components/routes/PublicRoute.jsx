import { Suspense } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/common";
import { ROUTES } from "../../utils/constants/route";
import FallbackSpinner from "../common/FallbackSpinner";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";

const PublicRoute = ({ children }) => {
  const isAuthenticated = isLoggedIn();
  const isAdmin = getLocalStorage(IS_ADMIN);

  if (isAuthenticated) {
    return (
      <Navigate
        to={`/${isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard}`}
        replace
      />
    );
  }
  return <Suspense fallback={<FallbackSpinner />}>{children}</Suspense>;
};

PublicRoute.propTypes = { children: PropTypes.node };

export default PublicRoute;
