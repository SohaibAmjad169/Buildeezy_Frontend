import { useState } from "react";
import { IconButton, Menu, MenuItem, Paper, Box, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MuiTypography from "../common/MuiTypography";
import { useThemeMode } from "../../context/ThemeContext";

function ActionsMenu({ id, menuItems, onMenuItemClick, isHorizontal, row }) {
  const { mode } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (e, menuId) => {
    e.stopPropagation();
    setAnchorEl(null);
    onMenuItemClick(menuId, id);
  };

  const MenuIcon = menuItems.length === 1 && menuItems[0].icon;

  const renderHorizontalMenu = (
    <Box>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            variant="text"
            key={item.id}
            startIcon={<Icon sx={{ fontSize: 14 }} />}
            onClick={() => onMenuItemClick(item.id, id)}
            disabled={row.status?.toLowerCase() === "rejected"}
            sx={{
              fontSize: "0.8rem",
              mr: 1,
              color: item.color,
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );

  const renderVerticalMenu =
    menuItems.length === 1 ? (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MenuIcon
          size={18}
          variant="Outline"
          onClick={() => onMenuItemClick(menuItems[0].id, id)}
          style={{
            cursor: "pointer",
          }}
        />
      </Box>
    ) : (
      <>
        <IconButton
          aria-label="actions"
          id="table-actions-button"
          aria-controls={open ? "table-actions-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          sx={{ color: mode === "dark" ? "common.white" : "common.black" }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="table-actions-menu"
          MenuListProps={{
            "aria-labelledby": "table-actions-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slot={Paper}
        >
          {menuItems.map(({ icon: Icon, id, label }) => (
            <MenuItem
              disabled={id === "completeJob" && row.status === "Completed"}
              key={id}
              onClick={(e) => handleClose(e, id)}
              sx={{
                minWidth: 110,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Icon size={18} variant="Linear" style={{ marginRight: 4 }} />
              <MuiTypography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {" "}
                {label}
              </MuiTypography>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  return <>{isHorizontal ? renderHorizontalMenu : renderVerticalMenu}</>;
}

export default ActionsMenu;
