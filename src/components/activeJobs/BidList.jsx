import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  styled,
  Tooltip,
} from "@mui/material";
import { TickCircle, CloseCircle } from "iconsax-react";
import { useTranslation } from "react-i18next";
import ActionButton from "../common/ActionButton";
import { useNavigate } from "react-router-dom";

import MuiTypography from "../common/MuiTypography";
import { getFirstCharUpperCase } from "../../utils/common";
import MuiChip from "../common/MuiChip";
import { colors } from "../../styles/theme";
import { useState } from "react";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { IP_LOCAL_DATA } from "../../utils/constants/auth";
import { getExchangeRate } from "../../apis/apiEndPoints";
import { useRef } from "react";
import { debounce } from "lodash";
import { useEffect } from "react";
import { alpha } from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
  "&": {
    borderRadius: "1rem",
    padding: 0,
  },
  "&:not(.disabled):hover": {
    border: `solid ${theme.palette.primary.main} 1px`,
    // background: colors.green200,
    background:
      theme.palette.mode === "dark"
        ? alpha(colors.green200, 0.1)
        : colors.green200,
  },
  [theme.breakpoints.down("sm")]: { width: "100%" },
  [theme.breakpoints.up("sm")]: { width: "100%" },
}));

export default function BidList({
  jobType,
  bidDetails,
  handleBidView,
  handleBidAccept,
  handleBidReject,
  jobDetails,
}) {

  // Ref to keep latest amount value
  const latestAmountRef = useRef(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [convertedTotal, setConvertedTotal] = useState(null);
  const ipLocation = JSON?.parse(getLocalStorage(IP_LOCAL_DATA));

  function onBidAccept(e) {
    e.stopPropagation();
    handleBidAccept();
  }

  function onBidReject(e) {
    e.stopPropagation();
    handleBidReject();
  }

  function onBidCardClick() {
    handleBidView();
  }

  // Exchange rate API
  const allExchangeRate = async (amount) => {
    try {
      const allData = await getExchangeRate();
      const rateString = allData?.data?.config?.value;
      const rates = JSON.parse(rateString);

      const userCurrencyRate = rates[ipLocation?.currency]; // INR etc.
      const converted = Number((amount * userCurrencyRate).toFixed(2));
      setConvertedTotal(converted);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  // Debounce with useCallback so it doesn’t re-create on every render
  const debouncedExchangeRate = useRef(
    debounce((amount) => {
      allExchangeRate(amount);
    }, 6)
  ).current;

  useEffect(() => {
    const amount = Number(bidDetails?.amount);

    if (!bidDetails?.amount || isNaN(amount) || amount <= 0) {
      debouncedExchangeRate.cancel(); // 👈 cancel pending debounce call
      setConvertedTotal(0);
      return;
    }

    latestAmountRef.current = amount;
    debouncedExchangeRate(amount);
  }, [bidDetails?.amount]);

  useEffect(() => {
    return () => {
      debouncedExchangeRate.cancel(); // cleanup on unmount
    };
  }, []);

  return (
    <StyledCard variant="outlined">
      <Box onClick={onBidCardClick} sx={{ cursor: "pointer" }}>
        <CardContent sx={{ p: 0 }}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            px={2}
          >
            <Stack spacing={1} sx={{ p: 2, width: { xs: "100%", sm: "auto" } }}>
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
                  {jobType}
                </MuiTypography>
                <MuiChip value={getFirstCharUpperCase(bidDetails.state)} />
              </Stack>
              <Stack
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                sx={{ mt: "8px !important" }}
              >
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
                  $ {bidDetails.amount}
                </MuiTypography>

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
                  {t("ad.details.created_by")}
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
                  {bidDetails.author.firstName +
                    " " +
                    bidDetails.author.lastName}
                </MuiTypography>
              </Stack>
              {convertedTotal > 0 && (
                <MuiTypography
                  color="text.secondary"
                  sx={{ mt: 1, ml: 0.5, fontSize: "12px" }}
                >
                  {t("milestone.local_currency")}:{" "}
                  <strong>{convertedTotal}</strong> {ipLocation?.currency}
                </MuiTypography>
              )}
              {/* Mobile: show action buttons below text */}
              <Box
                sx={{
                  display: { xs: "block", sm: "none" },
                  width: "100%",
                  mt: 2,
                }}
              >
                {bidDetails.state?.toLowerCase() === "pending" ? (
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={onBidAccept}
                      disabled={bidDetails.state?.toLowerCase() === "rejected"}
                      sx={{ color: "primary.main", width: 40, height: 40 }}
                    >
                      <Tooltip placement="top" title={t("job.details.accept")}>
                        {" "}
                        <TickCircle />{" "}
                      </Tooltip>
                    </IconButton>
                    <IconButton
                      onClick={onBidReject}
                      disabled={bidDetails.state?.toLowerCase() === "rejected"}
                      sx={{ color: "error.main", width: 40, height: 40 }}
                    >
                      <Tooltip placement="top" title={t("job.details.reject")}>
                        {" "}
                        <CloseCircle />{" "}
                      </Tooltip>
                    </IconButton>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/message", {
                          state: {
                            chatUserId: bidDetails.author.id,
                            chatUserName: `${bidDetails.author.firstName || ""
                              } ${bidDetails.author.lastName || ""}`.trim(),
                            avatar: bidDetails.author.avatar,
                          },
                        });
                      }}
                      sx={{
                        minWidth: "auto",
                        mt: 0,
                        maxHeight: 40,
                        padding: "20px 10px",
                        fontSize: "0.8rem",
                        maxWidth: 120,
                        mx: "auto",
                        borderRadius: "8px",
                        fontWeight: 600,
                      }}
                      disabled={jobDetails?.state === "completed"}
                    >
                      {t("job.details.contact_talent", "Contact Talent")}
                    </ActionButton>
                  </Stack>
                ) : bidDetails.state?.toLowerCase() === "accepted" ? (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      mt: 1,
                    }}
                  >
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/message", {
                          state: {
                            chatUserId: bidDetails.author.id,
                            chatUserName: `${bidDetails.author.firstName || ""
                              } ${bidDetails.author.lastName || ""}`.trim(),
                            avatar: bidDetails.author.avatar,
                          },
                        });
                      }}
                      sx={{
                        minWidth: "auto",
                        maxHeight: 40,
                        padding: "20px 10px",
                        fontSize: "0.8rem",
                        maxWidth: 120,
                        mx: "auto",
                        borderRadius: "8px",
                        fontWeight: 600,
                      }}
                      disabled={jobDetails?.state === "completed"}
                    >
                      {t("job.details.contact_talent")}
                    </ActionButton>
                  </Box>
                ) : (
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/message", {
                        state: {
                          chatUserId: bidDetails.author.id,
                          chatUserName: `${bidDetails.author.firstName || ""} ${bidDetails.author.lastName || ""
                            }`.trim(),
                          avatar: bidDetails.author.avatar,
                        },
                      });
                    }}
                    sx={{
                      minWidth: "auto",
                      mt: 0,
                      maxHeight: 40,
                      padding: "20px 10px",
                      fontSize: "0.8rem",
                      maxWidth: 120,
                      mx: "auto",
                      borderRadius: "8px",
                      fontWeight: 600,
                    }}
                    disabled={jobDetails?.state === "completed"}
                  >
                    {t("job.details.contact_talent", "Contact Talent")}
                  </ActionButton>
                )}
              </Box>
            </Stack>
            {/* Desktop: show action buttons to the right */}
            <Box
              display={{ xs: "none", sm: "flex" }}
              justifyContent={{ sm: "space-between" }}
              alignItems={{ sm: "center" }}
              px={2}
              sx={{ mt: { sm: 0 } }}
            >
              {bidDetails.state?.toLowerCase() === "pending" ? (
                <Stack
                  direction={{ sm: "row" }}
                  spacing={{ sm: 1 }}
                  alignItems={{ sm: "center" }}
                  sx={{ width: { sm: "auto" } }}
                >
                  <IconButton
                    onClick={onBidAccept}
                    disabled={bidDetails.state?.toLowerCase() === "rejected"}
                    sx={{ color: "primary.main" }}
                  >
                    <Tooltip placement="top" title={t("job.details.accept")}>
                      {" "}
                      <TickCircle />{" "}
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    onClick={onBidReject}
                    disabled={bidDetails.state?.toLowerCase() === "rejected"}
                    sx={{ color: "error.main" }}
                  >
                    <Tooltip placement="top" title={t("job.details.reject")}>
                      {" "}
                      <CloseCircle />{" "}
                    </Tooltip>
                  </IconButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/message", {
                        state: {
                          chatUserId: bidDetails.author.id,
                          chatUserName: `${bidDetails.author.firstName || ""} ${bidDetails.author.lastName || ""
                            }`.trim(),
                          avatar: bidDetails.author.avatar,
                        },
                      });
                    }}
                    sx={{}}
                    disabled={jobDetails?.state === "completed"}
                  >
                    {t("job.details.contact_talent", "Contact Talent")}
                  </ActionButton>
                </Stack>
              ) : (
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/message", {
                      state: {
                        chatUserId: bidDetails.author.id,
                        chatUserName: `${bidDetails.author.firstName || ""} ${bidDetails.author.lastName || ""
                          }`.trim(),
                        avatar: bidDetails.author.avatar,
                      },
                    });
                  }}
                  disabled={jobDetails?.state === "completed"}
                >
                  {t("job.details.contact_talent", "Contact Talent")}
                </ActionButton>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Box>
    </StyledCard>
  );
}
