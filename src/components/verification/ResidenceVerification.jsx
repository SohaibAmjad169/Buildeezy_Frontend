import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Box, useMediaQuery } from "@mui/material";
import SelectBox from "../common/SelectBox";
import {
  RESI_ID_OPTION,
  RESIDENCE_DOC,
  VERIFICATION_TYPE,
} from "../../utils/constants/profile";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";
import MuiTypography from "../common/MuiTypography";
import { useTheme } from "@emotion/react";

function ResidenceVerification({ doc, onDocChange }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [idType, setIdType] = useState(RESIDENCE_DOC.value);

  function onTypeChange(id, value) {
    setIdType(value);
  }

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
          options={RESI_ID_OPTION}
          onSelectChange={onTypeChange}
          value={idType}
        />
      </Box>

      <Box sx={{ mt: 2.5, mb: 1 }}>
        <UploadDoc
          id={RESIDENCE_DOC}
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

ResidenceVerification.propTypes = {
  doc: PropTypes.string,
  onDocChange: PropTypes.func,
}

export default ResidenceVerification;
