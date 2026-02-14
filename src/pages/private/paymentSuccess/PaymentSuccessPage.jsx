import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CelebrationIcon from "@mui/icons-material/Celebration";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  postAdsConfirmPayment,
  postMilestoneConfirmPayment,
  postWebinarconfirmPayment,
} from "../../../apis/apiEndPoints";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAlert } from "../../../redux/configSlice";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const PaymentSuccessPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [paymentResponse, setPaymentResponse] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("loading");

  const { type, id } = useParams();
  const navigate = useNavigate();

  const paymentLabels = {
    webinar: t("payment.webinar"),
    ads: t("payment.ads"),
    milestone: t("payment.milestone"),
  };

  const labelMap = {
    webinar: "Post Webinar",
    ads: "Go to Ads",
    milestone: "Go to Milestone",
  };

  const label = labelMap[type] || "Go Back";

  // Get status-specific content
  const getStatusContent = () => {
    switch (paymentStatus) {
      case "loading":
        return {
          icon: <HourglassEmptyIcon sx={{ fontSize: 80, color: "#ff9800" }} />,
          title: t("payment.processing"),
          message: "Processing your payment...",
          showButton: false,
        };
      case "pending":
        return {
          icon: <HourglassEmptyIcon sx={{ fontSize: 80, color: "#ff9800" }} />,
          title: t("payment.pending"),
          message: "Payment is being processed. You will be notified once it's completed.",
          showButton: false,
        };
      case "success":
      case "completed":
        return {
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#4caf50" }} />,
          title: t("payment.payment"),
          message: paymentLabels[type] || "",
          showButton: true,
          showCelebration: true,
        };
      case "failed":
      default:
        return {
          icon: <ErrorOutlineIcon sx={{ fontSize: 80, color: "#f44336" }} />,
          title: "Payment Failed",
          message: "There was an issue processing your payment. Please try again.",
          showButton: false,
        };
    }
  };

  const statusContent = getStatusContent();

  const handleClick = () => {
    switch (type) {
      case "webinar":
        console.log("response", paymentResponse);
        navigate(`/add-webinar?id=${id}`, {
          state: {
            webinarId: paymentResponse?.data?.webinar?.id,
            activeTab: 1,
            fromPayment: true,
          },
        });
        break;
      case "ads":
        navigate(`/my-ads/view/${id}`);
        break;
      case "milestone":
        navigate(`/my-contracts/view/${jobId}`);
        break;
      default:
        navigate("/dashboard");
    }
  };
  useEffect(() => {
    if (!id || !type) return;

    const confirmPayment = async () => {
      try {
        let response;

        if (type === "webinar") {
          response = await postWebinarconfirmPayment({ webinarId: id });
        } else if (type === "ads") {
          response = await postAdsConfirmPayment({ adId: id });
        } else if (type === "milestone") {
          response = await postMilestoneConfirmPayment(id);
        }
        setPaymentResponse(response);

        // Enhanced payment status detection with more comprehensive logic
        const responsePaymentStatus = response?.data?.data?.paymentStatus || 
                                    response?.data?.paymentStatus || 
                                    response?.data?.status ||
                                    response?.data?.data?.status ||
                                    "success"; // Default to success for backward compatibility
        
        // Additional checks for StartButton and other payment providers
        const transactionStatus = response?.data?.data?.transaction?.status;
        const narration = response?.data?.data?.transaction?.narration;
        const paymentSuccess = response?.data?.success;
        
        console.log("Payment response debug:", {
          responsePaymentStatus,
          transactionStatus,
          narration,
          paymentSuccess,
          fullResponse: response?.data
        });

        // Determine final payment status with comprehensive logic
        let finalPaymentStatus;
        
        if (
          responsePaymentStatus === "paid" ||
          responsePaymentStatus === "completed" ||
          responsePaymentStatus === "success" ||
          transactionStatus === "verified" ||
          narration === "Approved" ||
          (paymentSuccess === true && transactionStatus === "verified")
        ) {
          finalPaymentStatus = "success";
        } else if (
          responsePaymentStatus === "pending" ||
          responsePaymentStatus === "pending_payment" ||
          transactionStatus === "pending" ||
          narration === "Pending"
        ) {
          finalPaymentStatus = "pending";
        } else if (
          responsePaymentStatus === "failed" ||
          transactionStatus === "failed" ||
          narration === "Failed" ||
          paymentSuccess === false
        ) {
          finalPaymentStatus = "failed";
        } else {
          // Default to success if we can't determine the status clearly
          finalPaymentStatus = "success";
        }
        
        setPaymentStatus(finalPaymentStatus);

        // Show appropriate alert based on final payment status
        if (finalPaymentStatus === "pending") {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.warning,
              message: "Payment is being processed. Please wait for confirmation.",
            })
          );
        } else if (finalPaymentStatus === "success") {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.success,
              message: response?.data?.data?.message ||
                      response?.data?.message ||
                      "Payment completed successfully!",
            })
          );
        } else {
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: response?.data?.data?.message ||
                      response?.data?.message ||
                      "Payment processing failed. Please try again.",
            })
          );
        }
      } catch (error) {
        setPaymentStatus("failed");
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error?.message || "Payment failed",
          })
        );
      }
    };

    confirmPayment();
  }, []); // Only runs once on mount

  return (
    <Container maxWidth="sm">
      <Box
        sx={(theme) => ({
          mt: 10,
          p: 5,
          boxShadow: 6,
          borderRadius: 3,
          // backgroundColor: "#ffffff",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[800] // or theme.palette.grey[900]
              : "#ffffff",
          textAlign: "center",
        })}
      >
        {statusContent.icon}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt={4}
          mb={2}
        >
          <Typography variant="h1" fontWeight="bold" gutterBottom>
            {statusContent.title}
          </Typography>
          {statusContent.showCelebration && (
            <CelebrationIcon
              sx={{
                color: "#ff9800",
                fontSize: 30,
                ml: 2,
                mb: 2,
              }}
            />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {statusContent.message}
        </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          spacing={1}
          alignItems="center"
          mb={3}
        ></Stack>
        {statusContent.showButton && (
          <Button
            onClick={handleClick}
            variant="contained"
            sx={{
              backgroundColor: "#779F26",
              color: "#ffffff",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#678c20",
              },
            }}
          >
            {label}
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default PaymentSuccessPage;
