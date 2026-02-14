import { Box, Typography, Stack, Paper, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { colors } from "../../styles/theme";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState } from "react";

const PreviewWorkflow = ({ data }) => {
  const { t } = useTranslation();
  const workflow = data?.workflow || {};
  const [expandedFaq, setExpandedFaq] = useState(null);

  const defaultApproach = {
    title: "My approach for you generally:",
    steps: [
      "I'm apply on your request",
      "You choose me as your Broker to do your request",
      "You pay to Buildeezy as a guarantee",
      "We'll do quick call for details",
      "I'm do your request and finish!",
    ],
  };

  const defaultFaqs = [
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
    {
      question: "Can I change my plan later?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new rate will be prorated for the remainder of your billing cycle. If you downgrade, the new rate will take effect at the start of your next billing cycle.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "You can cancel your subscription at any time, and you'll retain access to the service until the end of your current billing period. We don't offer refunds for partial months.",
    },
    {
      question: "Can other info be added to an invoice?",
      answer:
        "Yes, you can add additional information to your invoices, such as your VAT number, specific billing address, or any other required details. You can manage this in your account settings.",
    },
  ];

  const handleFaqClick = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const renderSection = (title, children) => (
    <Paper
      elevation={0}
      sx={{
        px: 2.5,
        py: 3,
        pl: 23,
        pr: 25,
        borderRadius: 2,
        bgcolor: "transparent",
      }}
    >
      <Typography variant="h2" sx={{ mb: 2, color: colors.primary }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );

  const renderFaqItem = (question, answer, index) => (
    <Box
      key={index}
      sx={{
        borderBottom:
          index !== (workflow.faqs?.length || defaultFaqs.length) - 1
            ? `1px solid ${colors.primary}20`
            : "none",
      }}
    >
      <Box
        onClick={() => handleFaqClick(index)}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          cursor: "pointer",
          "&:hover": {
            opacity: 0.8,
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: colors.primary,
            fontWeight: expandedFaq === index ? 600 : 400,
          }}
        >
          {question}
        </Typography>
        <IconButton
          size="small"
          sx={{
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
            borderRadius: "50%",
            width: 24,
            height: 24,
            p: 0.5,
          }}
        >
          {expandedFaq === index ? (
            <RemoveIcon sx={{ fontSize: 16 }} />
          ) : (
            <AddIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Box>
      {expandedFaq === index && (
        <Typography
          variant="h6"
          sx={{
            color: colors.primary,
            pb: 2,
            pl: 1,
          }}
        >
          {answer}
        </Typography>
      )}
    </Box>
  );

  const renderApproachSection = () => (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
        pl: { xs: 2, sm: 4, md: 8, lg: 23 },
        pr: { xs: 2, sm: 4, md: 8, lg: 25 },
        borderRadius: 2,
        bgcolor: "transparent",
        mb: 4,
      }}
    >
      <Typography variant="h2" sx={{ mb: 3, color: colors.primary }}>
        {t("profile.preview.approach")}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: colors.primary,
          mb: 2,
          fontWeight: 500,
        }}
      >
        {workflow.approach?.title || defaultApproach.title}
      </Typography>
      <Stack spacing={2}>
        {(workflow.approach?.steps || defaultApproach.steps).map(
          (step, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: colors.primary,
                  fontWeight: 500,
                  minWidth: "24px",
                }}
              >
                {index + 1}.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.primary,
                  flex: 1,
                }}
              >
                {step}
              </Typography>
            </Box>
          )
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box>
      {/* Workflow Steps */}
      {renderSection(
        <Stack spacing={3}>
          {workflow.steps?.map((step, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "transparent",
                border: `1px solid ${colors.primary}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: colors.primary,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Stack spacing={2}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: colors.primary, fontWeight: 600 }}
                >
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: colors.primary }}>
                  {step.description}
                </Typography>
                {step.duration && (
                  <Typography variant="body2" sx={{ color: colors.primary }}>
                    {t("profile.preview.workflow.duration")}: {step.duration}
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Additional Workflow Info */}
      {workflow.additionalInfo &&
        renderSection(
          t("profile.preview.workflow.additional_info"),
          <Typography variant="body1" sx={{ color: colors.primary }}>
            {workflow.additionalInfo}
          </Typography>
        )}

      {/* FAQ Section */}
      {renderSection(
        t("profile.preview.workflow.faq"),
        <Stack spacing={0}>
          {(workflow.faqs?.length > 0 ? workflow.faqs : defaultFaqs).map(
            (faq, index) => renderFaqItem(faq.question, faq.answer, index)
          )}
        </Stack>
      )}

      {/* Approach Section */}
      {renderApproachSection()}
    </Box>
  );
};

export default PreviewWorkflow;
