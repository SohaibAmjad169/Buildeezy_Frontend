import { useMemo } from "react";
import { ListItemIcon } from "@mui/material";

import { colors } from "../../styles/theme";
import MuiTypography from "../common/MuiTypography";
import { useThemeMode } from "../../context/ThemeContext";

function Item({ label, icon }) {
  const { mode } = useThemeMode();

  const renderMenuIcon = useMemo(() => {
    const Icon = icon;
    return (
      <Icon
        size={16}
        color={mode === "dark" ? colors.white : colors.black}
      ></Icon>
    );
  }, [icon, mode]);

  return (
    <>
      <ListItemIcon sx={{ minWidth: 27 }}>{renderMenuIcon}</ListItemIcon>
      <MuiTypography variant="subtitle1" sx={{ fontWeight: 500 }}>
        {label}
      </MuiTypography>
    </>
  );
}

export default Item;
