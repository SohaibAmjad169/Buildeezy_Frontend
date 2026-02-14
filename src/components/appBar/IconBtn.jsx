import { useMemo } from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";

import { colors } from "../../styles/theme";
import { useThemeMode } from "../../context/ThemeContext";

function IconBtn({
  icon,
  badgeCount,
  onClick,
  sx,
  disabled,
  tooltip,
  ...rest
}) {
  const { mode } = useThemeMode();
  const renderIcon = useMemo(() => {
    const Icon = icon;
    return (
      <Badge
        badgeContent={badgeCount}
        color="primary"
        sx={{ "& .MuiBadge-badge": { top: -10 } }}
      >
        <Icon
          size={16}
          color={
            disabled
              ? colors.grey300
              : mode === "dark"
              ? colors.white
              : colors.black
          }
        />
      </Badge>
    );
  }, [icon, badgeCount, mode]);

  return (
    <IconButton
      disabled={disabled}
      aria-label="icon"
      edge="start"
      size="small"
      onClick={onClick}
      sx={{
        p: 1.2,
        border: "solid 1px",
        color: "iconBorder",
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
export default IconBtn;
