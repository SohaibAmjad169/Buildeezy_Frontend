import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import InputBox from "../common/InputBox";
import ContactBox from "../common/ContactBox";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";

function PastClient({ index, handleDataChange, data }) {
  const { t } = useTranslation();

  function onClientDataChange(id, value) {
    handleDataChange(id, value, index);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        mt: 2,
      }}
    >
      <Box sx={{ width: "48%" }}>
        <InputBox
          id="name"
          placeholder={t("profile.name")}
          value={data?.name}
          onInputChange={onClientDataChange}
        />
      </Box>
      <Box sx={{ width: "48%" }}>
        <ContactBox
          id="phoneNumber"
          placeholder="Tel Number"
          value={data?.phoneNumber}
          onInputChange={onClientDataChange}
        />
      </Box>
      <Box sx={{ width: "100%", mt: 2 }}>
        <InputBox
          id="email"
          placeholder="Email"
          value={data?.email}
          onInputChange={onClientDataChange}
        />
      </Box>
      <UploadDoc
        id="document"
        label={t("onboarding.upload_proof")}
        value={data?.document}
        onSelectFiles={onClientDataChange}
        acceptedFileTypes={ALL_FILE_TYPES}
        sx={{ mt: 2, mb: 1 }}
        multipleFiles={true}
      />
    </Box>
  );
}

PastClient.propTypes = {
  index: PropTypes.any,
  handleDataChange: PropTypes.func,
  data: PropTypes.object,
}
export default PastClient;
