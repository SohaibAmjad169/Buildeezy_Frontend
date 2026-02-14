import { useSelector } from "react-redux";

function Permissions({
  requiredRoles = [],
  requiredPermissions = [],
  children,
}) {
  const profile = useSelector((state) => state.profile.profileData);
  const userType = profile?.userType;
  const userPermissions = profile?.permissions || [];

  const hasRole =
    requiredRoles.length === 0 || requiredRoles.includes(userType);
  const hasPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((p) => userPermissions.includes(p));

  if (hasRole && hasPermission) {
    return <>{children}</>;
  }
}

export default Permissions;
