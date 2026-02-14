import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function DashboardCard({
  disabled = false,
  mediaIcon,
  title,
  navigateTo,
  onClick,
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleCardClick}
      disabled={disabled}
      sx={{
        minWidth: "150px",
        flex: 1,
        maxWidth: "265px",
        height: "48px",
        borderRadius: "8px",
      }}
      startIcon={mediaIcon}
    >
      {title}
    </Button>
  );
}

DashboardCard.propTypes = {
  mediaIcon: PropTypes.node,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  navigateTo: PropTypes.string,
  onClick: PropTypes.func,
};
