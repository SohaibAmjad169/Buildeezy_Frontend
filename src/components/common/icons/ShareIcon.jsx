import PropTypes from "prop-types";
import shareIcon from "../../../../src/assets/images/icons/up-loading.png";

const ShareIcon = ({ size = 14, color = "inherit", ...props }) => (
  <img
    src={shareIcon}
    alt="Share"
    style={{
      width: size,
      height: size,
      filter:
        color === "inherit"
          ? "brightness(0) saturate(100%) invert(44%) sepia(9%) saturate(155%) hue-rotate(201deg) brightness(94%) contrast(86%)" // This converts to #6E6E72
          : color === "primary"
            ? "brightness(0) saturate(100%) invert(48%) sepia(67%) saturate(2284%) hue-rotate(202deg) brightness(101%) contrast(101%)"
            : "none",
      transition: "filter 0.2s ease-in-out",
      ...props.style,
    }}
    {...props}
  />
);

ShareIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.object,
};

export default ShareIcon;
