import { Avatar, Badge, styled } from "@mui/material";

const StyledBadge = styled(Badge, {
  shouldForwardProp: (prop) => prop !== "isActive" && prop !== "showOnlineStatus",
})(({ theme, isActive }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: isActive ? theme.palette.active : theme.palette.deactive,
    color: isActive ? theme.palette.active : theme.palette.deactive,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: 12,
    height: 12,
    borderRadius: "50%",
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: isActive ? "ripple 1.2s infinite ease-in-out" : "none",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

function ChatAvatar({ 
  src, 
  alt, 
  sx, 
  active = false, 
  showOnlineStatus = true, // New prop to control online status visibility
  children, 
  ...rest 
}) {
  const AvatarComponent = (
    <Avatar alt={alt} src={src} sx={{ ...sx }} {...rest}>
      {children}
    </Avatar>
  );

  // Only show badge if showOnlineStatus is true
  if (showOnlineStatus) {
    return (
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        isActive={active}
        showOnlineStatus={showOnlineStatus}
      >
        {AvatarComponent}
      </StyledBadge>
    );
  }

  // Return plain avatar without badge
  return AvatarComponent;
}

export default ChatAvatar;