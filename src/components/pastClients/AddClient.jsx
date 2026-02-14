import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import InputBox from "../common/InputBox";
import ContactBox from "../common/ContactBox";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";
import MuiTypography from "../common/MuiTypography";

function AddClient({ index, handleDataChange, data, errors }) {
  const { t } = useTranslation();

  function onClientDataChange(id, value) {
    handleDataChange(id, value, index);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "center",
        mt: 2,
        width: "100%",
        gap: { xs: 2, sm: 6 },
      }}
    >
      <Box sx={{ width: { xs: "100%", sm: "100%" } }}>
        <Box>
          <MuiTypography variant="h5" sx={{ mb: 1 }}>
            {t("profile.name")}
          </MuiTypography>
          <InputBox
            id="name"
            placeholder={t("profile.name")}
            value={data?.name}
            onInputChange={onClientDataChange}
          />
          {errors?.name && (
            <MuiTypography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#d32f2f",
                fontWeight: 400,
                fontSize: "13px",
              }}
            >
              {errors?.name}
            </MuiTypography>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <MuiTypography variant="h5" sx={{ mb: 1 }}>
            {t("profile.email")}
          </MuiTypography>
          <InputBox
            id="email"
            placeholder="Email"
            value={data?.email}
            onInputChange={onClientDataChange}
          />
          {errors?.email && (
            <MuiTypography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#d32f2f",
                fontWeight: 400,
                fontSize: "13px",
              }}
            >
              {errors?.email}
            </MuiTypography>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <MuiTypography variant="h5" sx={{ mb: 1 }}>
            {t("profile.phone_number")}
          </MuiTypography>
          <ContactBox
            id="phoneNumber"
            placeholder="Tel Number"
            value={data?.phoneNumber}
            onInputChange={onClientDataChange}
          />
          {errors?.phoneNumber && (
            <MuiTypography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#d32f2f",
                fontWeight: 400,
                fontSize: "13px",
              }}
            >
              {errors?.phoneNumber}
            </MuiTypography>
          )}
        </Box>
      </Box>

    </Box>
  );
}

AddClient.propTypes = {
  index: PropTypes.any,
  handleDataChange: PropTypes.func,
  data: PropTypes.object,
};

export default AddClient;
