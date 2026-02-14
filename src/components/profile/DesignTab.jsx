import { Box, Divider, Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";
import Typography from "../common/MuiTypography";
import SaveCancelButtons from "../common/SaveCancelButtons";
import { useState, useCallback, useRef } from "react";
import LayoutSection from "./design/LayoutSection";
import ContentSection from "./design/ContentSection";
import EngagementSection from "./design/EngagementSection";
import InteractiveSection from "./design/InteractiveSection";
import PreviewButton from "./design/PreviewButton";
import { PreviewPage } from "../preview";
import { useTheme } from "@mui/material/styles";

function  DesignTab({ onSave, onCancel, onPreview }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [localDesign, setLocalDesign] = useState({
    layout: {},
    content: {},
    engagement: {},
    interactive: {},
  });

  // Store section refs
  const sectionRefs = useRef({
    layout: null,
    content: null,
    engagement: null,
    interactive: null,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePreview = useCallback(() => {
    const currentSection = Object.keys(sectionRefs.current)[activeTab];
    const currentRef = sectionRefs.current[currentSection];
    if (currentRef?.getValues) {
      const currentValues = currentRef.getValues();
      setLocalDesign((prev) => {
        const updated = { ...prev, [currentSection]: currentValues };
        if (typeof onPreview === "function") {
          onPreview(updated);
        }
        setIsPreviewMode(true);
        return updated;
      });
    } else if (typeof onPreview === "function") {
      onPreview(localDesign);
      setIsPreviewMode(true);
    }
  }, [localDesign, activeTab, onPreview]);

  const handleExitPreview = useCallback(() => {
    setIsPreviewMode(false);
  }, []);

  const validateAllSections = useCallback(() => {
    let isValid = true;
    const sections = Object.keys(sectionRefs.current);

    for (const section of sections) {
      const sectionRef = sectionRefs.current[section];
      if (sectionRef?.validateFields) {
        const sectionValid = sectionRef.validateFields();
        if (!sectionValid) {
          isValid = false;
          // Switch to the invalid tab
          setActiveTab(sections.indexOf(section));
          break;
        }
        // Update values from the section
        if (sectionRef.getValues) {
          localDesign[section] = sectionRef.getValues();
        }
      }
    }

    return isValid;
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (!validateAllSections()) {
        // Do not show any alert for errors
      }

      setIsSaving(true);
      await onSave(localDesign);
      // Do not show any alert for success
    } catch (error) {
      console.error("Error saving design:", error);
      // Do not show any alert for errors
    } finally {
      setIsSaving(false);
    }
  }, [onSave, validateAllSections]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <LayoutSection ref={(el) => (sectionRefs.current.layout = el)} />
        );
      case 1:
        return (
          <ContentSection ref={(el) => (sectionRefs.current.content = el)} />
        );
      case 2:
        return (
          <EngagementSection
            ref={(el) => (sectionRefs.current.engagement = el)}
          />
        );
      case 3:
        return (
          <InteractiveSection
            ref={(el) => (sectionRefs.current.interactive = el)}
          />
        );
      default:
        return null;
    }
  };

  if (isPreviewMode) {
    return <PreviewPage data={localDesign} onExitPreview={handleExitPreview} />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h2">{t("profile.design_my_profile")}</Typography>
          <Typography
            data-tour="design-tab"
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            {t("profile.design_description")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <PreviewButton onClick={handlePreview} />
          <SaveCancelButtons
            onSave={handleSave}
            onCancel={onCancel}
            label={t("common.save")}
            disabled={isSaving}
          />
        </Box>
      </Box>

      <Divider sx={{ width: "100%", mb: 4 }} />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 4,
          background:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : undefined,
          color:
            theme.palette.mode === "dark"
              ? theme.palette.text.primary
              : undefined,
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "h5",
            minWidth: 120,
          },
        }}
      >
        <Tab label={t("profile.design.layout.title")} />
        <Tab label={t("profile.design.content.title")} />
        <Tab label={t("profile.design.engagement.title")} />
        <Tab label={t("profile.design.interactive.title")} />
      </Tabs>

      <Box sx={{ mb: 4 }}>{renderTabContent()}</Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
        <PreviewButton onClick={handlePreview} />
        <SaveCancelButtons
          onSave={handleSave}
          onCancel={onCancel}
          label={t("common.save")}
          disabled={isSaving}
        />
      </Box>
    </Box>
  );
}

export default DesignTab;
