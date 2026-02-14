import { Box, Card, CardContent, Stack, styled } from "@mui/material";
import { Buildings, UserSquare, Note } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { Edit2, Trash } from "iconsax-react";
import dayjs from "dayjs";

import MuiTypography from "../common/MuiTypography";
import { getDocIcon, getFileType } from "../../utils/file";
import VideoThumb from "../common/VideoThumb";
import { BID_CARD_HEIGHT } from "../../utils/constants/job";
import { getFirstCharUpperCase } from "../../utils/common";
import MuiChip from "./MuiChip";
import ActionButton from "./ActionButton";
import { colors } from "../../styles/theme";
import { alpha } from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
  "&": {
    borderRadius: "1rem",
    minHeight: BID_CARD_HEIGHT,
    padding: 0,
  },
  "&:not(.disabled):hover": {
    border: `solid ${theme.palette.primary.main} 1px`,
    background: theme.palette.mode === "dark" ? alpha(colors.grey200, 0.05) : colors.green200,
  },
  [theme.breakpoints.down("sm")]: { width: "100%" },
  [theme.breakpoints.up("sm")]: { width: "48%" },
  // [theme.breakpoints.up("sm")]: { width: BID_CARD_WIDTH },
}));



const ClickableArea = styled("div")({
  minHeight: BID_CARD_HEIGHT,
  maxHeight: "100%",
  cursor: "pointer",
  "&:hover": {
    background: "inherit",
  },
});

export default function BidCard({
  jobType,
  bidDetails,
  onViewBidDetails,
  handleBidEdit,
  handleBidWithdraw,
}) {
  const { t } = useTranslation();

  function onBidCardClick() {
    onViewBidDetails(bidDetails.id);
  }

  function onBidEdit(e) {
    e.stopPropagation();
    handleBidEdit(bidDetails);
  }

  function onBidWithdraw(e) {
    e.stopPropagation();
    handleBidWithdraw(bidDetails);
  }

  return (
    <StyledCard variant="outlined" onClick={onBidCardClick}>
      <ClickableArea>
        <CardContent
          sx={{
            p: 0,
            minHeight: BID_CARD_HEIGHT,
            maxHeight: "100%",
          }}
        >
          {bidDetails.documents ? (
            getFileType(bidDetails.documents?.[0] || "") === "image" ? (
              <Box
                component="img"
                src={bidDetails.documents?.[0]}
                alt="bid-image"
                sx={{
                  objectFit: "cover",
                  width: "100%",
                  height: 100,
                  mb: 1,
                }}
              />
            ) : getFileType(bidDetails.documents?.[0] || "") === "video" ? (
              <VideoThumb
                videoUrl={bidDetails.documents?.[0] || ""}
                width={"100%"}
                height={100}
                sx={{
                  backgroundColor: "black",
                  mb: 1,
                  cursor: "pointer",
                }}
              />
            ) : (
              <Box
                sx={{
                  placeItems: "center",
                  display: "grid",
                  width: "100%",
                  height: 100,
                  bgcolor: "paginationBg",
                  mb: 1,
                }}
              >
                <Box
                  component="img"
                  src={getDocIcon(bidDetails.documents?.[0] || "")}
                  alt="bid-file"
                  sx={{
                    height: 35,
                    width: 35,
                    mr: 1.5,
                  }}
                />
              </Box>
            )
          ) : (
            <Box
              sx={{
                objectFit: "fill",
                width: "100%",
                height: 100,
                mb: 1,
                backgroundColor: "paginationBg",
              }}
            ></Box>
          )}

          <Stack spacing={1} sx={{ p: 2 }}>
           <Stack direction={"row"} alignItems={"center"} spacing={2}>
  <MuiTypography
    variant="subtitle2"
    className="text-ellipsis"
    sx={{
      maxWidth: 280,
      fontSize: "0.75rem",
      textAlign: "justify",
      color: "primary.main",
      fontWeight: 500,
    }}
  >

  {t(`job.options.types.${jobType}`) || t("n/a")}

  </MuiTypography>
               <MuiChip value={bidDetails.state} />
</Stack>

            <>
              <Stack
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                sx={{ mt: "8px !important" }}
              >
                <Buildings size={19} />
                <Stack>
                  <MuiTypography
                    variant="subtitle2"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      textAlign: "justify",
                      fontWeight: 400,
                    }}
                  >
                    {t("job.details.bid_the_job")}
                  </MuiTypography>
                  <MuiTypography
                    variant="subtitle1"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      textAlign: "justify",
                      fontWeight: 600,
                    }}
                  >
                    {bidDetails.amount}
                  </MuiTypography>
                </Stack>
              </Stack>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <UserSquare size={19} />
                <Stack>
                  <MuiTypography
                    variant="subtitle2"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      textAlign: "justify",
                      fontWeight: 400,
                    }}
                  >
                    {t("job.details.created_at")}
                  </MuiTypography>
                  <MuiTypography
                    variant="subtitle1"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      textAlign: "justify",
                      fontWeight: 600,
                    }}
                  >
                    {dayjs(bidDetails.createdAt).format("DD MMM YYYY")}
                  </MuiTypography>
                </Stack>
              </Stack>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Note size={19} />
                <Stack>
                  <MuiTypography
                    variant="subtitle2"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      textAlign: "justify",
                      fontWeight: 400,
                    }}
                  >
                    {t("job.details.description")}
                  </MuiTypography>
                  <MuiTypography
                    variant="subtitle1"
                    className="text-ellipsis"
                    sx={{
                      maxWidth: 240,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      // minHeight: "44px",
                    }}
                  >
                    {getFirstCharUpperCase(bidDetails.description) || t("n/a")}
                  </MuiTypography>
                </Stack>
              </Stack>
            </>
          </Stack>
          <Box display="flex" justifyContent={"space-between"} px={2} gap={1}>
            <ActionButton
              onClick={onBidEdit}
              disabled={bidDetails.state?.toLowerCase() !== "pending"}
              startIcon={<Edit2 />}
              sx={{ flex: 1 }}
            >
              {t("edit")}
            </ActionButton>
            <ActionButton
              variant="outlined"
              onClick={onBidWithdraw}
              disabled={bidDetails.state?.toLowerCase() !== "pending"}
              color="error"
              startIcon={<Trash />}
              sx={{
                flex: 1,
              }}
            >
              {t("job.details.withdraw")}
            </ActionButton>
          </Box>
        </CardContent>
      </ClickableArea>
    </StyledCard>
  );
}
