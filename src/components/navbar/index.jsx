import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "@emotion/react";
import { useLocation, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { Collapse } from "@mui/material";
import { cloneDeep } from "lodash";

import logo from "../../assets/images/buildeezy_logo.svg";
import logoDark from "../../assets/images/buildeezy_logo_dark.svg";
import logoMini from "../../assets/images/logo_mini.png";
import logoMiniDark from "../../assets/images/logo_mini_dark.png";
import { useThemeMode } from "./../../context/ThemeContext";
import useNavbarItems from "../../hooks/useNavbarItems";
import NavSubItems from "./NavSubItems";
import NavItems from "./NavItems";
import Permissions from "../common/Permissions";
import { INDIVIDUAL_ROUTES, ROUTES } from "../../utils/constants/route";
import useEmptyStore from "../../hooks/useEmptyStore";
import { DRAWER_WIDTH } from "../../utils/common";
import { USER_TYPES } from "../../utils/constants/login";
import { useSelector, useDispatch } from "react-redux";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IS_ADMIN } from "../../utils/constants/auth";
import { useTranslation } from "react-i18next";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import useVeriffVerification from "../../hooks/useVeriffVerification";

const openedMixin = (theme) => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  padding: "18px 16px",
  height: 70,
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  // shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

function Navbar({ open, handleClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isAdmin = getLocalStorage(IS_ADMIN);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { profileData } = useSelector((state) => state.profile);
  const isVerified = profileData?.isVerified || false;

  const { mode } = useThemeMode();
  const { navbarItems, setNavbarItems } = useNavbarItems();
  const { emptyPostData } = useEmptyStore();

  const { handleVeriffVerification } = useVeriffVerification();


  function navigateToDashboard() {
    const dashboardRoute = isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard;
    navigate("/" + dashboardRoute);
  }

  // Handle clicks outside the drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        if (!isDesktop) {
          handleClose();
        }
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function deactivateItems(item) {
    if (item.subItems) {
      item.subItems.forEach((subItem) => {
        subItem.active = false;
        subItem.open = false;
        deactivateItems(subItem);
      });
    }
  }

  function removeSelection(item) {
    item.active = false;
    item.open = false;
    deactivateItems(item);
  }

  // Handle locked item click
  const handleLockedItemClick = () => {
    dispatch(
      setAlert({
        show: true,
        type: ALERT_TYPE.info,
        message: t("profile.verify_to_access"),
      })
    );
    // Navigate to verification page
    handleVeriffVerification();
  };

  const updateNavbarItems = useCallback((routeNames) => {
    emptyPostData();

    const newNavbarItems = cloneDeep(navbarItems);

    // if routes are profile, past-clients, verification remove focus from drawer items
    if (routeNames.some((value) => INDIVIDUAL_ROUTES.includes(value))) {
      newNavbarItems.forEach((item) => {
        removeSelection(item);
      });
      setNavbarItems(newNavbarItems);
      return;
    }

    // if routes are not profile, past-clients, verification apply focus to drawer items
    for (let item of newNavbarItems) {
      //select nav item
      const itemRouteName = item.path?.split("/");
      const index = getLocalStorage(IS_ADMIN) ? 2 : 1;
      if (routeNames.includes(itemRouteName?.[index])) {
        //deselect any selected nav item
        removeSelection(item);

        item.active = true;
        item.open = true;
        break;
      } else {
        if (item.subItems) {
          for (let subItem of item.subItems) {
            const subItemRouteName = subItem.path?.split("/");
            if (routeNames.includes(subItemRouteName?.[index])) {
              //deselect any selected nav item
              removeSelection(item);

              item.active = true;
              item.open = true;
              subItem.active = true;
              subItem.open = true;
              break;
            } else {
              if (subItem.subItems) {
                for (let lastItem of subItem.subItems) {
                  const lastItemRouteName = lastItem.path?.split("/");
                  if (routeNames.includes(lastItemRouteName?.[index])) {
                    //deselect any selected nav item
                    removeSelection(item);

                    item.active = true;
                    item.open = true;
                    subItem.active = true;
                    subItem.open = true;
                    lastItem.active = true;
                    lastItem.open = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    setNavbarItems(newNavbarItems);
  }, []);

  useEffect(() => {
    let endPoint = location.pathname.split("/");
    updateNavbarItems(endPoint);
  }, [location.pathname, updateNavbarItems]);

  const handleItemChange = (id) => {
    const newNavbarItems = cloneDeep(navbarItems);
    const targetItem = newNavbarItems.find(item => item.id === id);

    // Check if item is locked
    if (targetItem?.isLocked) {
      handleLockedItemClick();
      return;
    }
    let selectednavDetils;
    newNavbarItems.forEach((item) => {
      if (item.id === id) {
        selectednavDetils = item;
        if (item.path) {
          navigate(item.path, { replace: true });
        } else {
          if (!item.subItems) {
            if (profileData.userType === USER_TYPES.client) {
              navigate(item.subItems[1].path, { replace: true });
            } else {
              navigate(item.subItems[0].path, { replace: true });
            }
          }
        }

        item.active = true;
        item.open = true;
      } else {
        item.active = false;
        item.open = false;
        deactivateItems(item);
      }
    });

    if (!isDesktop && !selectednavDetils.subItems) {
      handleClose();
    }

    setNavbarItems(newNavbarItems);
  };

  const handleSubItemChange = (id, subItemId) => {
    const newNavbarItems = cloneDeep(navbarItems);
    const activeItemIndex = navbarItems.findIndex((item) => item.id === id);
    const targetSubItem = newNavbarItems[activeItemIndex]?.subItems?.find(subItem => subItem.id === subItemId);

    // Check if sub item is locked
    if (targetSubItem?.isLocked) {
      handleLockedItemClick();
      return;
    }

    newNavbarItems[activeItemIndex].subItems?.forEach((subItem) => {
      if (subItem.id === subItemId) {
        if (!subItem.open && !subItem.active) {
          if (subItem.path) {
            navigate(subItem.path, {
              replace: true,
            });
          } else {
            navigate(subItem.subItems[0].path, {
              replace: true,
            });
          }
          if (!isDesktop) {
            handleClose();
          }
        } else {
          subItem.open = !subItem.open;
          subItem.active = true;
        }
      } else {
        subItem.active = false;
        subItem.open = false;
        deactivateItems(subItem);
      }
    });
    setNavbarItems(newNavbarItems);
  };

  const handleLastItemChange = (id, subItemId, lastItemId) => {
    const newNavbarItems = cloneDeep(navbarItems);
    const activeItemIndex = navbarItems.findIndex((item) => item.id === id);
    const activeSubItemIndex = navbarItems[activeItemIndex].subItems.findIndex(
      (subItem) => subItem.id === subItemId
    );
    const targetLastItem = newNavbarItems[activeItemIndex]?.subItems?.[activeSubItemIndex]?.subItems?.find(lastItem => lastItem.id === lastItemId);

    // Check if last item is locked
    if (targetLastItem?.isLocked) {
      handleLockedItemClick();
      return;
    }

    newNavbarItems[activeItemIndex].subItems?.[
      activeSubItemIndex
    ].subItems?.forEach((lastItem) => {
      if (lastItem.id === lastItemId) {
        navigate(lastItem.path, {
          replace: true,
        });
      }
    });

    if (!isDesktop) {
      handleClose();
    }
  };

  return (
    <>
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={open}
        onClose={handleClose}
        PaperProps={{
          ref: drawerRef,
          sx: {
            backgroundColor: mode === "dark" ? "#1E1E1E" : "#fff",
          },
        }}
      >
        <DrawerHeader>
          {isDesktop && open ? (
            <Box
              component="img"
              src={mode === "dark" ? logoDark : logo}
              alt="logo"
              onClick={navigateToDashboard}
              data-tour="buildeezy-logo"
              sx={{
                width: "150px",
                cursor: "pointer",
              }}
            />
          ) : (
            <Box
              component="img"
              src={mode === "dark" ? logoMiniDark : logoMini}
              alt="logo-mini"
              onClick={navigateToDashboard}
              sx={{
                mt: "9px",
                width: "25px",
                cursor: "pointer",
              }}
            />
          )}
        </DrawerHeader>
        <Divider />
        <List
          sx={{
            padding: open ? "0 16px" : "0 8px",
            mt: 2,
          }}
        >
          {navbarItems.map(
            ({ id, label, icon, active, open: itemOpen, roles, subItems, isLocked, customRender }) => (
              <Permissions key={id} requiredRoles={roles}>
                <NavItems
                  id={id}
                  label={t(label)}
                  active={active}
                  icon={icon}
                  open={open}
                  isLocked={isLocked}
                  onItemClick={() => handleItemChange(id)}
                  data-tour={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  customRender={customRender}
                />

                {open && subItems?.length > 0 && (
                  <Collapse in={itemOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ ml: "32.5px", mt: 1 }}>
                      {subItems?.map(
                        ({
                          id: subItemId,
                          label,
                          active,
                          open: subItemOpen,
                          roles: subItemRoles,
                          subItems,
                          isLocked: subItemLocked,
                        }) => (
                          <Permissions
                            key={subItemId}
                            requiredRoles={subItemRoles}
                          >
                            <NavSubItems
                              id={id}
                              label={t(label)}
                              hasSubItems={subItems?.length > 0}
                              isLocked={subItemLocked}
                              onSubItemClick={() =>
                                handleSubItemChange(id, subItemId)
                              }
                              itemOpen={subItemOpen}
                              sx={{
                                "& .MuiTypography-root": {
                                  fontWeight: active && 600,
                                },
                              }}
                            />

                            <Collapse
                              in={subItemOpen}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box>
                                {subItems?.map(
                                  ({
                                    id: lastItemId,
                                    label,
                                    active,
                                    roles: lastItemRoles,
                                    isLocked: lastItemLocked,
                                  }) => (
                                    <Permissions
                                      key={lastItemId}
                                      requiredRoles={lastItemRoles}
                                    >
                                      <NavSubItems
                                        id={id}
                                        label={t(label)}
                                        active={active}
                                        hasSubItems={false}
                                        isLocked={lastItemLocked}
                                        onSubItemClick={() =>
                                          handleLastItemChange(
                                            id,
                                            subItemId,
                                            lastItemId
                                          )
                                        }
                                        isLast={true}
                                        sx={{
                                          pl: 1.5,
                                          ...(active && {
                                            backgroundColor: "subItemBg",
                                            borderRadius: "0 20px 20px 0",
                                            width: "max-content",
                                            pr: 1.5,
                                          }),
                                        }}
                                      />
                                    </Permissions>
                                  )
                                )}
                              </Box>
                            </Collapse>
                          </Permissions>
                        )
                      )}
                    </Box>
                  </Collapse>
                )}
              </Permissions>
            )
          )}
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;