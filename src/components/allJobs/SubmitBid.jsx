import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import InputBox from "../common/InputBox";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";
import { FIELD_TYPES } from "../../utils/constants/login";
import MuiTypography from "../common/MuiTypography";

function SubmitBid({ initLoad, bid, handleBidDataChange }) {
  const { t } = useTranslation();

  function onBidDataChange(id, value) {
    handleBidDataChange(id, value);
  }
  return (
    <Box>
      <Box>
        <Box sx={{ mt: 3 }}>
          <InputBox
            id="amount"
            placeholder={t("job.details.amount")}
            value={bid.amount}
            onInputChange={onBidDataChange}
          />
          {!initLoad && !bid.amount && (
            <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
              {t("errors.amount_required")}
            </MuiTypography>
          )}
        </Box>
        <Box sx={{ mt: 3 }}>
          <InputBox
            id="description"
              placeholder={t("job.details.bid_description")}
            value={bid.description}
            onInputChange={onBidDataChange}
            type={FIELD_TYPES.description}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <UploadDoc
          id="documents"
          label={t("job.details.bid_upload")}
          value={bid.documents}
          onSelectFiles={onBidDataChange}
          acceptedFileTypes={ALL_FILE_TYPES}
          sx={{ mt: 2, mb: 1 }}
          multipleFiles={true}
        />
      </Box>
    </Box>
  );
}

SubmitBid.propTypes = {
  initLoad: PropTypes.any,
  bid: PropTypes.object,
  handleBidDataChange: PropTypes.func,
};

export default SubmitBid;
