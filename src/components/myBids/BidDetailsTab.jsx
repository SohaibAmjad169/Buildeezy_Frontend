import { Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";
import DocList from "../upload/DocList";

function BidDetailsTab({ bidDetails }) {
  const { t } = useTranslation();

  return (
    <Stack sx={{ mt: 2.5 }} spacing={2}>
      <Stack direction={"row"} alignItems={"center"} spacing={1}>
        <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>
          {t("job.details.bid_amount")} :
        </MuiTypography>

        <MuiTypography variant="descriptionText">
          {bidDetails?.amount || t("n/a")}
        </MuiTypography>
      </Stack>
      <Stack>
        <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {t("job.details.bid_description")}
        </MuiTypography>
        {bidDetails?.description ? (
          <MuiTypography variant="descriptionText">
            {bidDetails?.description}
          </MuiTypography>
        ) : (
          <MuiTypography variant="subtitle2">
            {t("ad.details.no_description")}
          </MuiTypography>
        )}
      </Stack>

      <MuiTypography variant="h3" sx={{ fontWeight: 600 }}>
        {t("job.details.additional_docs")}
      </MuiTypography>
      <DocList documents={bidDetails?.documents} />
    </Stack>
  );
}
export default BidDetailsTab;
