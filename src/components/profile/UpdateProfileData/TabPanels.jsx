import { Box } from "@mui/material";
import MuiTabPanel from "../../common/MuiTabPanel";
import PersonalInformation from "./TabPanels/PersonalInformation";
import ReviewsTab from "../../profile/ReviewsTab";
import PastClients from "../../../pages/private/PastClients";
import DesignTab from "../../profile/DesignTab";
import PortfolioTab from "../../profile/portfolio/PortfolioTab";
import { USER_TYPES } from "../../../utils/constants/login";

function TabPanels({
  value,
  localFields,
  loading,
  tempAvatar,
  onPicChange,
  onSaveProfile,
  onFieldChange,
  setSaveProfile,
  handleSaveClick,
  handleCancel,
  profileData,
  reviews,
}) {
  const renderTabPanels = () => {
    // Common panels for all user types
    const panels = [
      <MuiTabPanel key="personal" value={value} index={0}>
        <PersonalInformation
          loading={loading}
          tempAvatar={tempAvatar}
          onPicChange={onPicChange}
          fields={localFields}
          onSaveProfile={onSaveProfile}
          onFieldChange={onFieldChange}
          setSaveProfile={setSaveProfile}
          handleSaveClick={handleSaveClick}
          handleCancel={handleCancel}
        />
      </MuiTabPanel>,
      <MuiTabPanel key="reviews" value={value} index={1}>
        <ReviewsTab
          reviews={reviews}
          onSave={handleSaveClick}
          onCancel={handleCancel}
        />
      </MuiTabPanel>,
    ];

    if (profileData?.userType === USER_TYPES.vendor) {
      panels.push(
        <MuiTabPanel key="design" value={value} index={2}>
          <DesignTab onSave={handleSaveClick} onCancel={handleCancel} />
        </MuiTabPanel>,
        <MuiTabPanel key="portfolio" value={value} index={3}>
          <PortfolioTab onAddProject={() => {}} />
        </MuiTabPanel>
      );
    }

    if ( 
      profileData?.userType === USER_TYPES.contractor ||
      profileData?.userType === USER_TYPES.specialist
    ) {
      panels.push(
        <MuiTabPanel key="design" value={value} index={2}>
          <DesignTab onSave={handleSaveClick} onCancel={handleCancel} />
        </MuiTabPanel>,
        <MuiTabPanel key="portfolio" value={value} index={3}>
          <PortfolioTab onAddProject={() => {}} />
        </MuiTabPanel>,
        <MuiTabPanel key="pastClients" value={value} index={4}>
          <PastClients />
        </MuiTabPanel>
      );
    }

    return panels;
  };

  return <Box sx={{ width: "100%", mt: 2 }}>{renderTabPanels()}</Box>;
}

export default TabPanels;
