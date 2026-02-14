import { useState } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye } from "iconsax-react";

import MuiTypography from "../../components/common/MuiTypography";
import PortfolioList from "../../components/portfolio/PortfolioList";

export default function Portfolio() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("published");

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddProject = () => {
    navigate("add");
  };

  const handlePreview = () => {
    console.log("Preview portfolio");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <MuiTypography variant="h1" sx={{ mb: 1 }}>
            {t("profile.portfolio.title")}
          </MuiTypography>
          <MuiTypography variant="body2" color="text.secondary">
            {t("profile.portfolio.description")}
          </MuiTypography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Button
            variant="outlined"
            startIcon={<Eye size={20} />}
            onClick={handlePreview}
          >
            {t("common.preview")}
          </Button>
          <Button variant="contained" onClick={handleAddProject}>
            {t("profile.portfolio.add_title")}
          </Button>
        </Box>
      </Box>

      {/* <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab
            label={t("profile.portfolio.status.published")}
            value="published"
            sx={{ textTransform: "none" }}
          />
          <Tab
            label={t("profile.portfolio.status.draft")}
            value="draft"
            sx={{ textTransform: "none" }}
          />
        </Tabs>
      </Box> */}

      <PortfolioList status={currentTab} />
    </Box>
  );
}
