import { ListItem, ListItemButton, ListItemText, Tooltip, Box } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Lock } from "iconsax-react";
import { useThemeMode } from "../../context/ThemeContext";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { useTranslation } from "react-i18next";
import { colors } from "../../styles/theme";
import useVeriffVerification from "../../hooks/useVeriffVerification";

function NavSubItems({
  id,
  label,
  active,
  itemOpen,
  onSubItemClick,
  hasSubItems,
  isLocked = false,
  sx,
}) {
  const { mode } = useThemeMode();
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
    onSubItemClick(id);
  };

  const getTooltipTitle = () => {
    if (isLocked) {
      return t("profile.verify_to_access");
    }
    return label;
  };

  const getSubItemContent = () => (
    <ListItemButton
      onClick={handleClick}
      sx={{
        minHeight: 30,
        height: 30,
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        transition: "0.5s padding ease",
        background: "transparent",
        ":hover": {
          background: "transparent",
          "& .MuiTypography-root": {
            fontWeight: isLocked ? 400 : 600,
          },
        },
        ...(hasSubItems && {
          justifyContent: "flex-start !important",
        }),
        cursor: "pointer",
      }}
    >
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        width: "100%",
        justifyContent: "space-between"
      }}>
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <ListItemText
            primary={label}
            sx={{
              "& .MuiTypography-root": {
                fontSize: "0.8rem",
                color: isLocked
                  ? (mode === "dark" ? "#888888" : "#666666")
                  : active
                  ? "primary.main"
                  : mode === "dark" 
                  ? "common.white" 
                  : "common.black",
                fontWeight: active ? 600 : 400,
              },
              ...(hasSubItems && {
                flex: "none",
                mr: 1,
              }),
            }}
          />
          
          {/* Lock icon next to the label */}
          {isLocked && (
            <Lock
              size={12}
              color={mode === "dark" ? "#888888" : "#666666"}
              variant="Bold"
              style={{ marginLeft: 8, flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Arrow icons for expandable items (only show if not locked) */}
        {hasSubItems && !isLocked && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {itemOpen ? (
              <KeyboardArrowUpIcon 
                fontSize="small" 
                sx={{ 
                  color: mode === "dark" ? "common.white" : "common.black" 
                }} 
              />
            ) : (
              <KeyboardArrowDownIcon 
                fontSize="small"
                sx={{ 
                  color: mode === "dark" ? "common.white" : "common.black" 
                }} 
              />
            )}
          </Box>
        )}
      </Box>
    </ListItemButton>
  );

  return (
    <ListItem
      disablePadding
      sx={{
        display: "block",
        position: "relative",
        py: 0.3,
        opacity: isLocked ? 0.6 : 1,
        cursor: "pointer",
        "::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: active && !isLocked ? "2px" : "1px",
          backgroundColor: active && !isLocked ? "primary.main" : colors.grey300,
          borderRadius: active && !isLocked ? "5px" : 0,
        },
        ...sx,
      }}
    >
      {isLocked ? (
        <Tooltip title={getTooltipTitle()} placement="right" arrow>
          {getSubItemContent()}
        </Tooltip>
      ) : (
        getSubItemContent()
      )}
    </ListItem>
  );
}

export default NavSubItems;