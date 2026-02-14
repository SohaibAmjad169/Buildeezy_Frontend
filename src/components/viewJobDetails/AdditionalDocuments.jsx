import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";
import { DocumentDownload } from "iconsax-react";

import { colors } from "../../styles/theme";
import MuiChip from "../common/MuiChip";

function AdditionalDocuments({ documents }) {
  const { t } = useTranslation();

  function onDownloadFiles() {
    documents.forEach((file) => {
      const blob = new Blob([file.content], { type: file.type });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #D5D7DA",
        borderRadius: "8px",
        padding: "8px 16px",
      }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={1}>
        <MuiTypography
          variant="h6"
          className="text-ellipsis"
          sx={{
            fontWeight: 500,
            color: colors.black700,
          }}
        >
          {t("job.details.additional_docs")}
        </MuiTypography>
        <MuiChip
          value={`${documents?.length || 0} ${
            documents?.length <= 1
              ? t("job.details.file")
              : t("job.details.files")
          }`}
        />
      </Stack>
      <IconButton
        disabled={!documents?.length}
        aria-label="icon"
        edge="start"
        size="small"
        onClick={onDownloadFiles}
        sx={{
          p: 1,
          color: colors.primary,
          "&.Mui-disabled": {},
        }}
      >
        <Tooltip placement="top" title={t("job.details.download")}>
          <DocumentDownload size={20} />
        </Tooltip>
      </IconButton>
    </Box>
  );
}

export default AdditionalDocuments;
