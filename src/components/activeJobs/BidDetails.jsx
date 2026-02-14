import { Avatar, Box, Divider, Stack } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import dayjs from "dayjs";
import DocList from "../upload/DocList";

function BidDetails({ bidDetails }) {
  const { t } = useTranslation();

  const getAuthorName = useMemo(() => {
    return bidDetails?.author.firstName + " " + bidDetails?.author.lastName;
  }, [bidDetails?.author]);

  return (
    <Box sx={{ mt: 2 }}>
      <Stack
        divider={<Divider orientation="vertical" flexItem />}
        flexWrap={"wrap"}
        direction={"row"}
        rowGap={1}
        columnGap={3}
        sx={{ mb: 2 }}
      >
        <Stack flex={1}>
          <Box sx={{ mb: 1 }}>
            <MuiTypography variant="h5">
              {t("job.details.bid_amount")}
            </MuiTypography>

            <MuiTypography variant="h5" sx={{ fontWeight: "400", mt: 0.5 }}>
              {bidDetails?.amount}
            </MuiTypography>
          </Box>
          <Box>
            <MuiTypography variant="h5">
              {t("job.details.bid_description")}
            </MuiTypography>
            <MuiTypography variant="h5" sx={{ fontWeight: "400", mt: 0.5 }}>
              {bidDetails?.description || t("n/a")}
            </MuiTypography>
          </Box>
        </Stack>
        <Stack flex={1}>
          <MuiTypography variant="h5" sx={{ mb: 2 }}>
            {t("job.details.bidder_details")}
          </MuiTypography>

          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Avatar
              src={bidDetails?.author?.avatar}
              alt="profile"
              sx={{
                width: 46,
                height: 46,
              }}
            />
            <Box>
              <MuiTypography
                variant="h5"
                sx={{ fontWeight: 500, whiteSpace: "nowrap" }}
              >
                {getAuthorName}
              </MuiTypography>
              <MuiTypography variant="subtitle3">
                {t("job.details.bid_placed_on")}{" "}
                {dayjs(bidDetails?.createdAt).format("DD-MM-YYYY")}
              </MuiTypography>
            </Box>
          </Stack>
        </Stack>
      </Stack>

      <DocList documents={bidDetails.documents} />
    </Box>
  );
}

export default BidDetails;
