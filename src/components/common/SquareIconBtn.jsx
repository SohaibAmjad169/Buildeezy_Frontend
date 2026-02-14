import { useMemo } from "react";
import { IconButton, Tooltip } from "@mui/material";

function SquareIconBtn({ icon, onClick, sx, disabled, tooltip, ...rest }) {
  const renderIcon = useMemo(() => {
    const Icon = icon;
    return <Icon size={16} />;
  }, [icon]);

  return (
    <IconButton
      disabled={disabled}
      aria-label="icon"
      edge="start"
      size="small"
      onClick={onClick}
      sx={{
        p: 1,
        width: "40px",
        border: "solid 1px",
        borderRadius: "8px",
        "&.Mui-disabled": {
          color: "iconBorder",
        },
        ...sx,
      }}
      {...rest}
    >
      {tooltip ? (
        <Tooltip title={tooltip} placement="bottom">
          {renderIcon}
        </Tooltip>
      ) : (
        <>{renderIcon}</>
      )}
    </IconButton>
  );
}
export default SquareIconBtn;
