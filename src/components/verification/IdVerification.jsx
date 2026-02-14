import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, useMediaQuery } from "@mui/material";

import SelectBox from "../common/SelectBox";
import {
  mapDocOptions,
  VERIFICATION_DOC,
  VERIFICATION_TYPE,
} from "../../utils/constants/profile";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";
import MuiTypography from "../common/MuiTypography";
import { useTheme } from "@emotion/react";

function IdVerification({ type, doc, onTypeChange, onDocChange }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { profileData } = useSelector((state) => state.profile);
  return (
    <Box sx={{ mt: 3 }}>
      <MuiTypography variant="h5">{t("profile.id_type")}</MuiTypography>
      <Box
        sx={{
          width: { xs: "100%", md: "40%" },
          mt: 1,
        }}
      >
        <SelectBox
          id={VERIFICATION_TYPE.id}
          placeholder={VERIFICATION_TYPE.placeholder}
          options={mapDocOptions[profileData.userType]}
          onSelectChange={onTypeChange}
          value={type}
        />
      </Box>

      <Box sx={{ mt: 2.5, mb: 1 }}>
        <UploadDoc
          id={VERIFICATION_DOC?.id}
          value={doc}
          onSelectFiles={onDocChange}
          acceptedFileTypes={ALL_FILE_TYPES}
          showTitle={false}
          isHorizontal={isMobile ? false : true}
        />
      </Box>
    </Box>
  );
}

IdVerification.propTypes = {
  type: PropTypes.string,
  doc: PropTypes.string,
  onTypeChange: PropTypes.func,
  onDocChange: PropTypes.func,
}

export default IdVerification;
