import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function AcountsCard({
  disabled = false,
  mediaIcon,
  title,
  navigateTo,
  onClick,
  shouldHighlightRed,
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
        // backgroundColor:   !loading &&
        // !payouts_enabled &&
        // userType !== "client" && "red",
        // "&:hover": {
        //   backgroundColor: !loading &&
        // !payouts_enabled &&
        // userType !== "client" && "#f53309"
        // }
        backgroundColor: shouldHighlightRed ? "red" : undefined,
        "&:hover": {
          backgroundColor: shouldHighlightRed ? "#f53309" : undefined,
        },
      }}
      startIcon={mediaIcon}
    >
      {title}
    </Button>
  );
}

AcountsCard.propTypes = {
  mediaIcon: PropTypes.node,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  navigateTo: PropTypes.string,
  onClick: PropTypes.func,
};
