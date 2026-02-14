import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from "@mui/material";
import { Lock } from "iconsax-react";
import { useThemeMode } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { useTranslation } from "react-i18next";

import { colors } from "../../styles/theme";
import useVeriffVerification from "../../hooks/useVeriffVerification";

function NavItems({ id, label, active, icon, open, onItemClick, isLocked = false, customRender }) {
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { handleVeriffVerification } = useVeriffVerification();

  const handleClick = () => {
    // If item is locked, show alert and navigate to verification
    if (isLocked) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.info,
          message: t("profile.verify_to_access"),
        })
      );
      handleVeriffVerification();
      return;
    }
    onItemClick(id);
  };

  const getNavItem = (label, icon, active) => {
    const Icon = icon; // Keep the original icon

    return (
      <ListItemButton
        onClick={handleClick}
        sx={{
          minHeight: 48,
          justifyContent: open ? "initial" : "center",
          px: { xs: 2, sm: 3 },
          transition: "0.5s padding ease",
          ":hover": {
            background: "transparent",
            "& .MuiTypography-root": {
              fontWeight: isLocked ? 400 : 600,
            },
          },
          cursor: "pointer",
          position: "relative",
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 1.5 : "auto",
            justifyContent: "center",
            mt: "-2px",
          }}
        >
          <Icon
            size={19}
            variant={active ? "Bulk" : "Linear"}
            color={
              isLocked 
                ? (mode === "dark" ? "#888888" : "#666666")
                : mode === "dark" || active 
                ? colors.white 
                : colors.black
            }
          />
        </ListItemIcon>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            opacity: open ? 1 : 0,
          }}
        >
          <ListItemText
            primary={label}
            sx={{
              "& .MuiTypography-root": {
                fontSize: "0.9rem",
                color: isLocked
                  ? (mode === "dark" ? "#888888" : "#666666")
                  : active
                  ? "common.white"
                  : mode === "dark"
                  ? "common.white"
                  : "common.black",
              },
            }}
          />

          {customRender && customRender(active)}

        </Box>
      </ListItemButton>
    );
  };

  const getTooltipTitle = () => {
    if (isLocked) {
      return t("profile.verify_to_access");
    }
    return label;
  };

  return (
    <ListItem
      disablePadding
      sx={{
        display: "block",
        backgroundColor: active && !isLocked && "primary.main",
        borderRadius: active && !isLocked ? "10px" : 0,
        boxShadow: active && !isLocked
          ? "0px 4px 10px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(255, 255, 255, 0.05)"
          : "none",
        ":hover": {
          backgroundColor: isLocked 
            ? "transparent"
            : active 
            ? "primary.dark" 
            : "action.hover",
        },
        transition: "all 0.2s ease-in-out",
        opacity: isLocked ? 0.6 : 1,
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Small lock badge when sidebar is collapsed */}
      {isLocked && !open && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            zIndex: 999,
            backgroundColor: "#FF0000",
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(255,0,0,0.5)",
          }}
        >
          <Lock
            size={12}
            color="white"
            variant="Bold"
          />
        </Box>
      )}

      {/* Lock icon when sidebar is open */}
      {isLocked && open && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: 8,
            transform: "translateY(-50%)",
            zIndex: 999,
            backgroundColor: "#FF0000",
            borderRadius: "50%",
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(255,0,0,0.5)",
          }}
        >
          <Lock
            size={12}
            color="white"
            variant="Bold"
          />
        </Box>
      )}

      {open ? (
        isLocked ? (
          <Tooltip title={getTooltipTitle()} placement="right" arrow>
            {getNavItem(label, icon, active)}
          </Tooltip>
        ) : (
          getNavItem(label, icon, active)
        )
      ) : (
        <Tooltip title={getTooltipTitle()} placement="right">
          {getNavItem(label, icon, active)}
        </Tooltip>
      )}
    </ListItem>
  );
}

export default NavItems;