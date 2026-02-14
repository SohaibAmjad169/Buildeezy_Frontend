import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ComingSoon from "./ComingSoon";
import VerificationRequired from "./VerificationRequired"; // You'll need to create this component

const HIDDEN_ROUTES_IN_PRODUCTION = [
  "/all-jobs",
  "/post-a-job",
  "/active-jobs",
  "/drafted-jobs",
  "/my-bids",
  "/my-contracts",
  "/invitations",
  // "/post-an-ad"
  // "/my-ads",
  "/accounts"
];

// Routes that require verification
const VERIFICATION_REQUIRED_ROUTES = [
  "/all-jobs",
  "/post-a-job",
  "/active-jobs",
  "/drafted-jobs",
  "/my-bids",
  "/my-contracts",
  "/invitations",
  "/post-an-ad",
  "/my-ads",
  "/add-review",
  "/add-webinar"
];

const ProductionRouteWrapper = ({ children }) => {
  const location = useLocation();
  const isProduction = import.meta.env.VITE_NODE_ENV === "production";
  const { profileData } = useSelector((state) => state.profile);
  const isVerified = profileData?.isVerified || false;
  const isAdmin = profileData?.userType === "admin";

  // Check if route is hidden in production
  if (
    isProduction &&
    HIDDEN_ROUTES_IN_PRODUCTION.some((route) =>
      location.pathname.startsWith(route)
    )
  ) {
    return <ComingSoon />;
  }

  // Check if route requires verification (skip for admin users and clients)
  if (
    !isAdmin &&
    !isVerified &&
    profileData?.userType !== "client" && // Allow clients full access
    VERIFICATION_REQUIRED_ROUTES.some((route) =>
      location.pathname.startsWith(route)
    )
  ) {
    return <VerificationRequired />;
  }

  return children;
};

export default ProductionRouteWrapper;