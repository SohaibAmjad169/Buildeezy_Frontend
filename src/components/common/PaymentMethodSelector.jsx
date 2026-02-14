import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  useTheme,
  Chip,
  Alert,
  Skeleton,
  Paper,
  Avatar,
  Stack,
} from "@mui/material";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import {
  postAdsPaymentReuest,
  postMilestonePaymentReuest,
  postWebinarPaymentReuest,
  getAdsPaymentMethods,
  previewAdsPayment
} from "../../apis/apiEndPoints";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import SpinnerLoader from "./SpinnerLoader";
import smartphone from "../../assets/images/smartphone.png";
import securepayment from "../../assets/images/secure-payment.png";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const PaymentMethodSelector = ({ onClose, milstoneDetails, page }) => {
  const webinarResponse = useSelector((state) => state.webinar.webinarResponse);
  const adResponse = useSelector((state) => state.ad.adsResponse);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const theme = useTheme();

  const getTranslatedErrorMessage = (errorMessage) => {
    // If the error message is a translation key, try to translate it
    if (errorMessage && typeof errorMessage === "string") {
      // Check if it's a key from the errors object
      const translatedError = t(`errors.${errorMessage}`, null);
      if (translatedError && translatedError !== errorMessage) {
        return translatedError;
      }
      // Try direct translation
      const directTranslation = t(errorMessage, null);
      if (directTranslation && directTranslation !== errorMessage) {
        return directTranslation;
      }
    }
    // Return original message if no translation found
    return errorMessage;
  };

  useEffect(() => {
    console.log("PaymentMethodSelector - useEffect triggered", {
      page,
      adResponse,
    });
    if (page === "ads") {
      fetchPaymentInfo();
    }
  }, [page, adResponse]);

  // Debug logging
  useEffect(() => {
    console.log("PaymentMethodSelector - State Debug", {
      page,
      adResponse,
      paymentMethods,
      paymentPreview,
      currencyInfo,
      paymentInfoLoading,
    });
  }, [
    page,
    adResponse,
    paymentMethods,
    paymentPreview,
    currencyInfo,
    paymentInfoLoading,
  ]);

  const fetchPaymentInfo = async () => {
    console.log("fetchPaymentInfo - Starting", { page, adResponse });
    setPaymentInfoLoading(true);
    try {
      // Always try to get payment methods
      console.log("fetchPaymentInfo - Getting payment methods");
      const methodsResponse = await getAdsPaymentMethods();
      console.log(
        "fetchPaymentInfo - Payment methods response",
        methodsResponse
      );
      setPaymentMethods(methodsResponse.data);

      // Try to get payment preview if ad data is available
      if (adResponse?.startAt && adResponse?.expireAt) {
        // CORRECTED LOGIC: Use audience as the primary basis for fee calculation
        let targetAudience;
        let calculationCount;

        if (
          adResponse.audience &&
          Array.isArray(adResponse.audience) &&
          adResponse.audience.length > 0
        ) {
          targetAudience = adResponse.audience;

          // If audience includes specialists AND we have specific professional types
          if (
            adResponse.audience.includes("specialist") &&
            adResponse.professionalType &&
            Array.isArray(adResponse.professionalType) &&
            adResponse.professionalType.length > 0
          ) {
            // Use professional types count for specialists
            calculationCount = adResponse.professionalType.length;
            console.log(
              "Using professionalType count for specialist audience:",
              calculationCount
            );
          } else {
            // Use audience count for non-specialist or when no specific professions
            calculationCount = adResponse.audience.length;
            console.log("Using audience count:", calculationCount);
          }
        } else {
          // Fallback
          targetAudience = ["client"];
          calculationCount = 1;
          console.log("Using default client audience");
        }

        console.log("fetchPaymentInfo - Getting payment preview", {
          targetAudience: targetAudience,
          calculationCount: calculationCount,
          startDate: adResponse.startAt,
          endDate: adResponse.expireAt,
          hasSpecialistProfessions: adResponse.professionalType?.length > 0,
        });

        // Send the correct data for fee calculation
        let apiPayload;
        if (
          adResponse.audience.includes("specialist") &&
          adResponse.professionalType &&
          Array.isArray(adResponse.professionalType) &&
          adResponse.professionalType.length > 0
        ) {
          // For specialists, send the professional types for accurate calculation
          apiPayload = {
            professionalTypes: adResponse.professionalType,
            startDate: adResponse.startAt,
            endDate: adResponse.expireAt,
          };
        } else {
          // For non-specialists, send the audience
          apiPayload = {
            professionalTypes: targetAudience,
            startDate: adResponse.startAt,
            endDate: adResponse.expireAt,
          };
        }

        console.log("PaymentMethodSelector - API payload:", apiPayload);
        const previewResponse = await previewAdsPayment(apiPayload);

        console.log(
          "fetchPaymentInfo - Payment preview response",
          previewResponse
        );
        setPaymentPreview(previewResponse.data);
        setCurrencyInfo({
          country: previewResponse.data.country,
          local: previewResponse.data.local,
          usd: previewResponse.data.usd,
          supportsMobileMoney: previewResponse.data.supportsMobileMoney,
          supportsStartButton: previewResponse.data.supportsStartButton, // NEW
        });
      } else {
        console.log("fetchPaymentInfo - Missing ad response data", {
          startAt: adResponse?.startAt,
          expireAt: adResponse?.expireAt,
        });
      }
    } catch (error) {
      console.error("Error fetching payment info:", error);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Failed to load payment information",
        })
      );
    } finally {
      setPaymentInfoLoading(false);
    }
  };

  const getPaymentMethodConfig = (methodId) => {
    const configs = {
      stripe: {
        icon: <CreditCardIcon sx={{ fontSize: 18 }} />,
        color: theme.palette.primary.main,
        bgColor: theme.palette.mode === "dark" ? "#709A1C1A" : "#709A1C0F",
      },
      paystack: {
        icon: <AccountBalanceIcon sx={{ fontSize: 18 }} />,
        color: theme.palette.primary.main,
        bgColor: theme.palette.mode === "dark" ? "#709A1C1A" : "#709A1C0F",
      },
      startbutton: {
        icon: <PaymentIcon sx={{ fontSize: 18 }} />,
        color: theme.palette.primary.main,
        bgColor: theme.palette.mode === "dark" ? "#709A1C1A" : "#709A1C0F",
      },
      paystack_mobile_money: {
        icon: <PhoneAndroidIcon sx={{ fontSize: 18 }} />,
        color: theme.palette.primary.main,
        bgColor: theme.palette.mode === "dark" ? "#709A1C1A" : "#709A1C0F",
      },
    };
    return configs[methodId] || configs.stripe;
  };

  // Calculate days correctly without time zone issues
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Reset time to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If same day, return 1, otherwise return the calculated difference
    return diffDays === 0 ? 1 : diffDays;
  };

  const getPaymentMethodsForDisplay = () => {
    if (page === "ads" && paymentMethods) {
      const methods = [];

      // Always show Stripe regardless of availability
      methods.push({
        id: "stripe",
        name: "International payment",
        currency: paymentMethods.stripe?.currency || "USD",
        recommended: currencyInfo?.local?.currency === "USD",
      });

      // NEW: Show StartButton if supported
      // if (paymentMethods.startbutton?.available || currencyInfo?.supportsStartButton) {
        methods.push({
          id: "startbutton",
          name: "Local payment",
          currency: paymentMethods.startbutton?.currency || currencyInfo?.local?.currency || "Local",
          providers: paymentMethods.startbutton?.providers || [],
          recommended: currencyInfo?.supportsStartButton && currencyInfo?.local?.currency !== "USD",
        });
      // }

      // Show Paystack regardless of availability (but less prominent if StartButton available)
      // methods.push({
      //   id: "paystack",
      //   name: "Card/Bank Transfer",
      //   currency: paymentMethods.paystack?.currency || "Local",
      //   recommended: false,
      // });

      // COMMENTED OUT: Paystack Mobile Money (replaced by StartButton)
      /*
      methods.push({
        id: "paystack_mobile_money",
        name: "Mobile Money",
        currency: paymentMethods.paystack_mobile_money?.currency || "Local",
        providers: paymentMethods.paystack_mobile_money?.providers || [],
        recommended: currencyInfo?.local?.currency !== "USD" && !currencyInfo?.supportsStartButton,
      });
      */

      return methods;
    }

    // Default methods for non-ads pages
    return [
      {
        id: "stripe",
        name: "International payment",
        currency: "USD",
        recommended: true,
      },
      {
        id: "startbutton",
        name: "Local payment",
        currency: "Local",
        recommended: false,
        providers: [],
      },
      // {
      //   id: "paystack",
      //   name: "Card/Bank Transfer",
      //   currency: "Local",
      //   recommended: false,
      // },
    ];
  };

  const handleSelect = async (methodName) => {
    const milestoneId = milstoneDetails?.id || "";
    setLoading(true);

    try {
      if (page === "milestone") {
        const payload = {
          data: {
            paymentMethodProvider: methodName,
          },
        };

        const response = await postMilestonePaymentReuest(milestoneId, payload);
        const redirectUrl =
          response?.data?.data?.paymentDetailRequest?.url ||
          response?.data?.data?.paymentDetailRequest?.authorization_url;
        if (redirectUrl) window.open(redirectUrl, "_self");
      } else if (page === "webinar" && webinarResponse) {
        const payload = {
          webinarId: webinarResponse.id,
          paymentMethodProvider: methodName,
          pricePerMinute: webinarResponse.totalFees,
        };

        const response = await postWebinarPaymentReuest(payload);
        const redirectUrl =
          response?.data?.paymentDetailRequest?.url ||
          response?.data?.paymentDetailRequest?.authorization_url;
        if (redirectUrl) window.open(redirectUrl, "_self");
      } else if (page === "ads" && adResponse) {
        // CORRECTED LOGIC: Separate audience targeting from fee calculation
        let targetAudience;
        let feeCalculationCount;

        if (
          adResponse.audience &&
          Array.isArray(adResponse.audience) &&
          adResponse.audience.length > 0
        ) {
          targetAudience = adResponse.audience;

          // Fee calculation logic:
          if (
            adResponse.audience.includes("specialist") &&
            adResponse.professionalType &&
            Array.isArray(adResponse.professionalType) &&
            adResponse.professionalType.length > 0
          ) {
            // For specialists with specific professions, use profession count
            feeCalculationCount = adResponse.professionalType.length;
          } else {
            // For clients or specialists without specific professions, use audience count
            feeCalculationCount = adResponse.audience.length;
          }
        } else {
          // Fallback
          targetAudience = ["client"];
          feeCalculationCount = 1;
        }

        const payload = {
          adId: adResponse.id,
          paymentMethodProvider: methodName,
          currency: currencyInfo?.local?.currency || "INR",
          // Send audience types (not professional types)
          audienceTypes: targetAudience,
          // Send actual professional types if they exist
          professionalTypes: adResponse.professionalType || [],
          // Send the count for fee calculation
          feeCalculationCount: feeCalculationCount,
          // Metadata for backend to understand the calculation basis
          calculationBasis:
            adResponse.audience.includes("specialist") &&
            adResponse.professionalType?.length > 0
              ? "professionalType"
              : "audience",
        };

        console.log("Ads payment payload:", payload);
        console.log("Payment calculation details:", {
          selectedAudience: adResponse.audience,
          professionalTypes: adResponse.professionalType,
          finalCalculationCount: feeCalculationCount,
          calculationBasis: payload.calculationBasis,
          selectedMethod: methodName,
        });

        const response = await postAdsPaymentReuest(payload);
        const redirectUrl =
          response?.data?.paymentDetailRequest?.url ||
          response?.data?.paymentDetailRequest?.authorization_url;
        if (redirectUrl) window.open(redirectUrl, "_self");
      }
    } catch (error) {
      console.error("Payment API error", error);

      const apiErrorMessage = error.response?.data?.message || error.message;
      const translatedMessage =
        getTranslatedErrorMessage(apiErrorMessage) ||
        t("errors.default_error", "Payment failed");

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: translatedMessage,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (page) {
      case "ads":
        return t("payment.submit_payment", "Submit Payment for Advertisement");
      case "webinar":
        return t(
          "payment.submit_webinar_payment",
          "Submit Payment for Webinar"
        );
      case "milestone":
      default:
        return t("milestone.submit_milestone", "Submit Milestone Payment");
    }
  };

  const displayMethods = getPaymentMethodsForDisplay();

  if (paymentInfoLoading) {
    return (
      <Box sx={{ p: 2, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ maxWidth: 500, mx: "auto" }}>
          <Skeleton
            variant="text"
            width="60%"
            height={32}
            sx={{ mx: "auto", mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={50}
            sx={{ borderRadius: 2, mb: 2 }}
          />
          <Grid container spacing={1.5}>
            {[1, 2].map((i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      position: "relative",
      minWidth: { xs: '100%', sm: '500px', md: '600px' },
      width: '100%',
      maxWidth: '800px'
    }}>
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.1)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        {/* Compact Header */}
        <Typography variant="h2" textAlign="center" sx={{ mb: 2, pr: 4 }}>
          {getTitle()}
        </Typography>

        {/* Compact Payment Summary - Always visible for ads with better fallbacks */}
        {page === "ads" && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
              borderRadius: 2,
            }}
          >
            {/* Show loading state first */}
            {paymentInfoLoading ? (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Loading payment details...
                </Typography>
              </Stack>
            ) : currencyInfo && adResponse ? (
              /* Full payment details */
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "fit-content",
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {calculateDays(adResponse.startAt, adResponse.expireAt)}{" "}
                      day
                      {calculateDays(
                        adResponse.startAt,
                        adResponse.expireAt
                      ) !== 1
                        ? "s"
                        : ""}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "center", minWidth: "fit-content" }}>
                  <Typography variant="h3" fontWeight={700}>
                    {currencyInfo.local?.symbol || ""}
                    {Number(currencyInfo.local?.amount || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </Typography>
                  <Typography variant="caption">
                    {currencyInfo.local?.currency || "N/A"}
                  </Typography>
                </Box>

                {currencyInfo.local?.currency !== "USD" &&
                  currencyInfo.usd?.amount && (
                    <Box sx={{ textAlign: "center", minWidth: "fit-content" }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        ≈ $
                        {Number(currencyInfo.usd.amount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </Typography>
                      <Typography variant="caption">
                        Rate: 1 USD ={" "}
                        {Number(
                          (currencyInfo.local?.amount || 0) /
                            (currencyInfo.usd?.amount || 1)
                        ).toFixed(2)}{" "}
                        {currencyInfo.local?.currency || ""}
                      </Typography>
                    </Box>
                  )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "fit-content",
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 16 }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    {currencyInfo.country || "Global"}
                  </Typography>
                </Box>
              </Stack>
            ) : paymentPreview ? (
              /* Show preview data when currencyInfo is not available */
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {paymentPreview.totalDays} day
                  {paymentPreview.totalDays !== 1 ? "s" : ""}
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  ${paymentPreview.breakdown?.total?.toFixed(2) || "0.00"}
                </Typography>
                <Typography variant="caption">USD</Typography>
              </Stack>
            ) : adResponse ? (
              /* Basic calculation from adResponse */
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {calculateDays(adResponse.startAt, adResponse.expireAt)} day
                  {calculateDays(adResponse.startAt, adResponse.expireAt) !== 1
                    ? "s"
                    : ""}
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  Calculating...
                </Typography>
              </Stack>
            ) : (
              /* No data available */
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Payment details will load shortly...
                </Typography>
              </Stack>
            )}
          </Paper>
        )}

        {/* Payment Methods - Smaller cards with theme colors */}
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          Choose your preferred payment method
        </Typography>

        <Grid container spacing={1.5} sx={{ width: '100%' }}>
          {displayMethods.map((method) => {
            const config = getPaymentMethodConfig(method.id);

            return (
              <Grid item xs={12} sm={6} md={6} key={method.id} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    position: "relative",
                    width: '100%',
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: method.recommended
                      ? theme.palette.primary.main
                      : theme.palette.borderColor200 || "divider",
                    backgroundColor: method.recommended
                      ? config.bgColor
                      : "background.paper",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    p: 0,
                    minHeight: 'auto',
                    height: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column',
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      transform: "translateY(-1px)",
                      boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                    },
                  }}
                  onClick={() => handleSelect(method.id)}
                >
                  {/* Recommended Badge */}
                  {method.recommended && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 10 }} />}
                      label="Best"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: theme.palette.primary.main,
                        color: "white",
                        fontSize: "0.65rem",
                        height: 18,
                        "& .MuiChip-icon": { color: "white" },
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 0.5, "&:last-child": { pb: 1.5 } }}>
                    {/* Method Header - Compact */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          mr: 1,
                        }}
                      >
                        {config.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{ lineHeight: 1.2 }}
                        >
                          {method.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {method.currency}
                        </Typography>
                      </Box>
                    </Box>

                    {/* StartButton/Mobile Money Providers - Compact */}
                    {method.providers && method.providers.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {method.providers
                            .map((p) => p.toUpperCase())
                            .join(", ")}
                        </Typography>
                      </Box>
                    )}

                    {/* Action Button - Compact */}
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 0.75,
                        fontSize: "0.75rem",
                        minHeight: 32,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                        "&:disabled": {
                          backgroundColor:
                            theme.palette.disabledColor || "rgba(0,0,0,0.12)",
                        },
                      }}
                    >
                      {loading ? "Processing..." : "Select"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Security Note */}
        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          sx={{ display: "block", mt: 2 }}
        >
          🔒 All payments are secured with bank-grade encryption
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentMethodSelector;