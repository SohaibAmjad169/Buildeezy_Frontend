import { useMemo } from "react";
import {
  Briefcase,
  ToggleOn,
  Book1,
  Profile,
  AddSquare,
  // People,
} from "iconsax-react";
import { useTranslation } from "react-i18next";
import { USER_TYPES } from "../utils/constants/login";
import { ROUTES } from "../utils/constants/route";

function useDashboardCards(userType, onMyLearningClick) {
  const { t } = useTranslation();

  const COMMON_DASHBOARD_CARDS = useMemo(
    () => [
      {
        id: 1,
        isDisabled: false,
        mediaIcon: <Briefcase size={20} variant="Outline" />,
        title: t("dashboard.jobs"),
        navigateTo: "/all-jobs",
      },
      {
        id: 2,
        isDisabled: false,
        mediaIcon: <Book1 size={20} variant="Outline" />,
        title: t("dashboard.ideas_lounge"),
        navigateTo: "/ideas-lounge",
      },
      {
        id: 3,
        isDisabled: false,
        mediaIcon: <Profile size={20} variant="Outline" />,
        title: t("dashboard.accounts"),
        navigateTo: "/accounts",
      },
      {
        id: 4,
        isDisabled: false,
        mediaIcon: <AddSquare size={20} variant="Outline" />,
        title: t("dashboard.post_an_ad"),
        navigateTo: "/" + ROUTES.postAnAd,
      },
    ],
    [t, onMyLearningClick]
  );

  const CLIENT_DASHBOARD_CARDS = [
    {
      id: 1,
      isDisabled: false,
      mediaIcon: <Briefcase size={20} variant="Outline" />,
      title: t("dashboard.post_a_job"),
      navigateTo: "/" + ROUTES.postAJob,
    },
    {
      id: 2,
      isDisabled: false,
      mediaIcon: <Book1 size={20} variant="Outline" />,
      title: t("dashboard.contract"),
      navigateTo: "/" + ROUTES.myContracts,
    },
    {
      id: 3,
      isDisabled: false,
      mediaIcon: <Profile size={20} variant="Outline" />,
      title: t("dashboard.accounts"),
      navigateTo: "/accounts",
    },
    {
      id: 4,
      isDisabled: false,
      mediaIcon: <AddSquare size={20} variant="Outline" />,
      title: t("dashboard.post_a_review"),
      navigateTo: "/" + ROUTES.addReview,
    },
  ];

  const VENDOR_DASHBOARD_CARDS = [
    {
      id: 1,
      isDisabled: false,
      mediaIcon: <Briefcase size={20} variant="Outline" />,
      title: t("dashboard.post_an_ad"),
      navigateTo: "/" + ROUTES.postAnAd,
    },
    {
      id: 2,
      isDisabled: false,
      mediaIcon: <Book1 size={20} variant="Outline" />,
      title: t("dashboard.add_to_catalogue"),
    },
    {
      id: 3,
      isDisabled: false,
      mediaIcon: <Profile size={20} variant="Outline" />,
      title: t("dashboard.billing"),
    },
    {
      id: 4,
      isDisabled: false,
      mediaIcon: <ToggleOn size={20} variant="Outline" />,
      title: t("dashboard.webinar"),
      navigateTo: "/" + ROUTES.addWebinar,
    },
  ];

  const mapCards = {
    [USER_TYPES.client]: CLIENT_DASHBOARD_CARDS,
    [USER_TYPES.contractor]: COMMON_DASHBOARD_CARDS,
    [USER_TYPES.specialist]: COMMON_DASHBOARD_CARDS,
    [USER_TYPES.vendor]: VENDOR_DASHBOARD_CARDS,
  };
  return [mapCards[userType] || []];
}

export default useDashboardCards;
