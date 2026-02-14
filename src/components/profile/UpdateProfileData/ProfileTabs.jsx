import { Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";
import { USER_TYPES } from "../../../utils/constants/login";
import { TABS } from "../../../utils/constants/job";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";

function ProfileTabs({ value, onChange, profileData }) {
  const { t } = useTranslation();
  const theme = useTheme();


  // Add this useEffect to your ProfileTabs component
useEffect(() => {
  const handleTourTabChange = (event) => {
    const { tabValue } = event.detail;
    console.log('🔍 Tour requesting tab change to:', tabValue);
    if (onChange) {
      onChange(null, tabValue);
    }
  };

  window.addEventListener('tourTabChange', handleTourTabChange);
  return () => window.removeEventListener('tourTabChange', handleTourTabChange);
}, [onChange]);

  const renderTabs = () => {
    const commonTabs = [
      <Tab
        key="personal"
        label={t("profile.personal_information")}
        value={0}
      />,
      <Tab key="reviews" label={t("profile.reviews")} value={1} />,
    ];

    if (profileData?.userType === USER_TYPES.client) {
      return commonTabs;
    }
    if (profileData?.userType === USER_TYPES.admin) {
      return commonTabs;
    }

    if (profileData?.userType === USER_TYPES.vendor) {
      return [
        ...commonTabs,
        <Tab key="design" label={t("profile.design_tab")} value={2} data-tour="design-tab"/>,
        <Tab key="portfolio" label={t("profile.portfolio.title")} value={3} />,
      ];
    }

    // For contractor and specialist
    if (
      profileData?.userType === USER_TYPES.contractor ||
      profileData?.userType === USER_TYPES.specialist
    ) {
      return [
        ...commonTabs,
        <Tab key="design" label={t("profile.design_tab")} value={2} />,
        <Tab key="portfolio" label={t("profile.portfolio.title")} value={3} />,
        <Tab key="pastClients" label={TABS.PAST_CLIENT} value={4} />,
      ];
    }

    return commonTabs;
  };

  return (
    <Tabs
      value={value}
      onChange={onChange}
      aria-label="profile tabs"
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: 1,
        borderColor:
          theme.palette.mode === "dark" ? theme.palette.divider : "divider",
        background:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : undefined,
        mb: 2,
      }}
    >
      {renderTabs()}
    </Tabs>
  );
}

export default ProfileTabs;
