import { Box, Container } from "@mui/material";
import DesignPreviewMode from "./DesignPreviewMode";
import PreviewTopNavButtons from "./PreviewTopNavButtons";
import PreviewModeButton from "./PreviewModeButton";
import { t } from "i18next";

function PreviewPage({ data, onExitPreview }) {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ py: 2 }}>
        <DesignPreviewMode
          data={data}
          onExitPreview={onExitPreview}
          renderTopNav={(themeColors, themeValue) => (
            <PreviewTopNavButtons
              onExitPreview={onExitPreview}
              themeColors={themeColors}
              themeValue={themeValue}
            />
          )}
          renderSubmitButton={(themeColors, profileData, navigate) => (
            <PreviewModeButton
              themeColors={themeColors}
              sx={{ mr: 15, mb: 15 }}
              onClick={() => {
                const userId = profileData?.id || profileData?.userId;
                if (userId) {
                  navigate(`/dashboard/view/${userId}/profile`);
                }
              }}
            >
              {t("common.submit")}
            </PreviewModeButton>
          )}
        />
      </Box>
    </Container>
  );
}

export default PreviewPage;
