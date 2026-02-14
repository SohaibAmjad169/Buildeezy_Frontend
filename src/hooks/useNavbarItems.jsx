import { useEffect, useState } from "react";
import {
  Element4,
  Briefcase,
  Candle,
  Message,
  UserSquare,
  People,
  Book1,
  UserTick,
  DeviceMessage,
  UserCirlceAdd,
  TaskSquare,
  Setting2,
  Diagram,
  ShieldSearch,
  DocumentText,
} from "iconsax-react";

import { useThemeMode } from "../context/ThemeContext";
import { ROUTES } from "../utils/constants/route";
import { USER_TYPES } from "../utils/constants/login";
import { getLocalStorage } from "../utils/localStorageUtils";
import { IS_ADMIN } from "../utils/constants/auth";
import { useSelector } from "react-redux";

import { Box, Typography } from "@mui/material";

const IS_PRODUCTION = import.meta.env.VITE_NODE_ENV === "production";
const PRODUCTION_VISIBLE_ITEMS = [
  "dashboard",
  "professionals",
  "message",
  "learning",
  "review",
  "ads",
  "myAds",
];

// Items that should be locked for unverified users
const LOCKED_ITEMS_FOR_UNVERIFIED = [
  "jobs",
  "ads",
  "webinar",
  "review",
  "professionals",
  "accounts",
  "catalogue",
  "message",
];

const DisplayUnreadCount = ({active}) => {
  const { channelsUnreadCount } = useSelector((state) => state.pubnub);
  const allUnreadCount = Object.values(channelsUnreadCount).reduce(
    (acc, count) => acc + count,
    0
  );
  if (allUnreadCount === 0) return <></>;
  return (
    <Box sx={{ 
      width: "18px", 
      height: "18px",
      position: "relative",
      ml: 1, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: active ? "#fff" : "primary.main",
      borderRadius: "50%",
      fontSize: "0.8rem",
      ...(!active && {
        color: "#fff",
      })
    }}>
      <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
        {allUnreadCount}
      </Typography>
    </Box>
  );
};

function useNavbarItems() {
  const { mode } = useThemeMode();
  const isAdmin = getLocalStorage(IS_ADMIN);
  const { profileData } = useSelector((state) => state.profile);
  const isVerified = profileData?.isVerified || false;

  const ITEMS = [
    {
      id: "dashboard",
      label: "navbar.dashboard",
      active: false,
      path: "/" + ROUTES.dashboard,
      icon: Element4,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "jobs",
      label: "navbar.jobs",
      active: false,
      icon: Briefcase,
      open: false,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
      subItems: [
        {
          id: "allJobs",
          label: "navbar.allJobs",
          active: false,
          path: "/" + ROUTES.allJobs,
          roles: [USER_TYPES.contractor, USER_TYPES.specialist],
        },
        {
          id: "postAJob",
          label: "navbar.postAJob",
          active: false,
          path: "/" + ROUTES.postAJob,
          roles: [
            USER_TYPES.client,
            USER_TYPES.contractor,
            USER_TYPES.specialist,
          ],
        },
        {
          id: "myJobs",
          label: "navbar.myPosts",
          active: false,
          open: false,
          roles: [
            USER_TYPES.client,
            USER_TYPES.contractor,
            USER_TYPES.specialist,
          ],
          subItems: [
            {
              id: "activeJobs",
              label: "navbar.active",
              active: false,
              path: "/" + ROUTES.activeJobs,
              roles: [
                USER_TYPES.client,
                USER_TYPES.contractor,
                USER_TYPES.specialist,
              ],
            },
            {
              id: "draftedJobs",
              label: "navbar.drafted",
              active: false,
              path: "/" + ROUTES.draftedJobs,
              roles: [
                USER_TYPES.client,
                USER_TYPES.contractor,
                USER_TYPES.specialist,
              ],
            },
          ],
        },
        {
          id: "myBids",
          label: "navbar.myBids",
          active: false,
          path: "/" + ROUTES.myBids,
          roles: [USER_TYPES.contractor, USER_TYPES.specialist],
        },
        {
          id: "myContracts",
          label: "navbar.myContracts",
          active: false,
          path: "/" + ROUTES.myContracts,
          roles: [
            USER_TYPES.client,
            USER_TYPES.contractor,
            USER_TYPES.specialist,
          ],
        },
        {
          id: "invitations",
          label: "navbar.invitations",
          active: false,
          path: "/invitations",
          roles: [
            USER_TYPES.vendor,
            USER_TYPES.contractor,
            USER_TYPES.specialist,
          ],
        },
      ],
    },
    {
      id: "professionals",
      label: "navbar.professionals",
      active: false,
      path: "/" + ROUTES.professionals,
      icon: People,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "ads",
      label: "navbar.ads",
      active: false,
      icon: Candle,
      open: false,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
      subItems: [
        {
          id: "postAnAd",
          label: "navbar.postAnAd",
          active: false,
          path: "/" + ROUTES.postAnAd,
          roles: [
            USER_TYPES.contractor,
            USER_TYPES.specialist,
            USER_TYPES.vendor,
          ],
        },
        {
          id: "myAds",
          label: "navbar.myAds",
          active: false,
          path: "/" + ROUTES.myAds,
          roles: [
            USER_TYPES.contractor,
            USER_TYPES.specialist,
            USER_TYPES.vendor,
          ],
        },
      ],
    },
    {
      id: "learning",
      label: "navbar.ideasLounge",
      active: false,
      path: "/" + ROUTES.learning,
      icon: Book1,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "review",
      label: "navbar.addReview",
      active: false,
      path: "/" + ROUTES.addReview,
      icon: ShieldSearch,
      roles: [USER_TYPES.client],
    },
    {
      id: "message",
      label: "navbar.message",
      active: false,
      path: "/" + ROUTES.message,
      icon: Message,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
      customRender: (active) => {
        return <DisplayUnreadCount active={active} />;
      },
    },
    {
      id: "webinar",
      label: "Webinar",
      active: false,
      path: "/" + ROUTES.addWebinar,
      icon: DeviceMessage,
      roles: [USER_TYPES.vendor],
    },
    {
      id: "accounts",
      label: "Accounts",
      active: false,
      path: "/" + ROUTES.accounts,
      icon: UserSquare,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "catalogue",
      label: "Catalogue",
      active: false,
      path: "/" + ROUTES.catalogue,
      icon: DocumentText,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
  ];

  const ADMIN_ITEMS = [
    {
      id: "adminDashboard",
      label: "navbar.dashboard",
      active: false,
      path: "/" + ROUTES.adminDashboard,
      icon: Element4,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminRevenue",
      label: "navbar.revenue",
      active: false,
      path: "/" + ROUTES.adminRevenue,
      icon: Briefcase,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminUsers",
      label: "navbar.users",
      active: false,
      path: "/" + ROUTES.adminUsers,
      icon: UserCirlceAdd,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminCatalogue",
      label: "navbar.catalogue",
      active: false,
      path: "/" + ROUTES.adminCatalogue,
      icon: TaskSquare,
      roles: [USER_TYPES.admin],
      subItems: [
        {
          id: "adminCatalogueCategory",
          label: "Catalogue Category",
          active: false,
          path: "/" + ROUTES.adminCatalogueCategory,
          roles: [USER_TYPES.admin],
        },
      ],
    },
    {
      id: "userManagement",
      label: "navbar.userManagement",
      active: false,
      icon: UserTick,
      roles: [USER_TYPES.admin],
      subItems: [
        {
          id: "verification",
          label: "navbar.verification",
          active: false,
          path: "/" + ROUTES.adminVerification,
          roles: [USER_TYPES.admin],
        },
        {
          id: "reactivation",
          label: "navbar.reactivation",
          active: false,
          path: "/" + ROUTES.adminReactivation,
          roles: [USER_TYPES.admin],
        },
        {
          id: "adPost",
          label: "navbar.adPost",
          active: false,
          path: "/" + ROUTES.adminAdpost,
          roles: [USER_TYPES.admin],
        },
        {
          id: "paymentManagment",
          label: "Payment Managment",
          active: false,
          path: "/" + ROUTES.adminPaymentManagment,
          roles: [USER_TYPES.admin],
        },
        {
          id: "dispute",
          label: "navbar.dispute",
          active: false,
          path: "/" + ROUTES.adminDispute,
          roles: [USER_TYPES.admin],
        },
      ],
    },
    {
      id: "adminMarketing",
      label: "navbar.marketing",
      active: false,
      path: "/" + ROUTES.adminMarketing,
      icon: Diagram,
      roles: [USER_TYPES.admin],
      subItems: [
        {
          id: "adminMyAds",
          label: "navbar.myAds",
          active: false,
          path: "/" + ROUTES.adminMyAds,
          roles: [USER_TYPES.admin],
        },
        {
          id: "adminLeads",
          label: "navbar.leads",
          active: false,
          path: "/" + ROUTES.adminLeads,
          roles: [USER_TYPES.admin],
        },
        {
          id: "messagesLog",
          label: "navbar.messagesLog",
          active: false,
          path: "/" + ROUTES.messagesLog,
          roles: [USER_TYPES.admin],
        },
      ],
    },
    {
      id: "settings",
      label: "navbar.settings",
      active: false,
      icon: Setting2,
      roles: [USER_TYPES.admin],
      subItems: [
        {
          id: "categories",
          label: "navbar.categories",
          active: false,
          path: "/" + ROUTES.adminCategories,
          roles: [USER_TYPES.admin],
        },
        {
          id: "adminRoles",
          label: "navbar.adminRoles",
          active: false,
          path: "/" + ROUTES.adminRoles,
          roles: [USER_TYPES.admin],
        },
      ],
    },
    {
      id: "Clarity",
      label: "clarity",
      active: false,
      icon: Setting2,
      path: "/" + ROUTES.clarity,
      roles: [USER_TYPES.admin],
    },
  ];

  // Add isLocked property to items based on verification status and user type
  const addLockStatus = (items) => {
    return items.map((item) => ({
      ...item,
      // Only lock for non-admin, non-verified users who are NOT clients
      isLocked:
        !isAdmin &&
        !isVerified &&
        profileData?.userType !== USER_TYPES.client &&
        LOCKED_ITEMS_FOR_UNVERIFIED.includes(item.id),
      subItems: item.subItems
        ? item.subItems.map((subItem) => ({
            ...subItem,
            isLocked:
              !isAdmin &&
              !isVerified &&
              profileData?.userType !== USER_TYPES.client &&
              LOCKED_ITEMS_FOR_UNVERIFIED.includes(item.id),
            subItems: subItem.subItems
              ? subItem.subItems.map((lastItem) => ({
                  ...lastItem,
                  isLocked:
                    !isAdmin &&
                    !isVerified &&
                    profileData?.userType !== USER_TYPES.client &&
                    LOCKED_ITEMS_FOR_UNVERIFIED.includes(item.id),
                }))
              : undefined,
          }))
        : undefined,
    }));
  };

  const filteredItems =
    isAdmin || !IS_PRODUCTION
      ? isAdmin
        ? addLockStatus(ADMIN_ITEMS)
        : addLockStatus(ITEMS)
      : addLockStatus(
          ITEMS.filter((item) => PRODUCTION_VISIBLE_ITEMS.includes(item.id))
        );

  const [navbarItems, setNavbarItems] = useState(filteredItems);

  useEffect(() => {
    const itemsToUse =
      isAdmin || !IS_PRODUCTION
        ? isAdmin
          ? addLockStatus(ADMIN_ITEMS)
          : addLockStatus(ITEMS)
        : addLockStatus(
            ITEMS.filter((item) => PRODUCTION_VISIBLE_ITEMS.includes(item.id))
          );

    setNavbarItems(itemsToUse.map((item) => ({ ...item })));
  }, [mode, isAdmin, isVerified]);

  return { navbarItems, setNavbarItems };
}

export default useNavbarItems;
