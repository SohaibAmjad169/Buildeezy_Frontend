import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import Star from "@mui/icons-material/Star";
import PushPinIcon from "@mui/icons-material/PushPin";
import { colors } from "../../styles/theme";
import { useState } from "react";

const PreviewReviews = ({ reviewsData }) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  // Default reviews if no data is provided
  const defaultReviews = [
    {
      rating: 5,
      date: "3 Oct 2024",
      comment:
        "Great work and communication. Very reliable. The best electrical job made ever!",
      author: "Electrical",
      highlight: true,
    },
    {
      rating: 4,
      date: "3 Oct 2024",
      comment:
        "Great work and communication. Very reliable. The best electrical job made ever!",
      author: "Jane Smith",
    },
    {
      rating: 5,
      date: "2 Oct 2024",
      comment: "Excellent service and very professional approach.",
      author: "Michael Brown",
    },
    {
      rating: 4,
      date: "1 Oct 2024",
      comment: "Great attention to detail and timely delivery.",
      author: "Sarah Wilson",
    },
  ];

  const reviews = reviewsData?.length > 0 ? reviewsData : defaultReviews;
  const displayedReviews = showAll ? reviews.slice(0, 10) : reviews.slice(0, 3);
  const hasMoreReviews = reviews.length > 3 && !showAll;

  const renderStars = (rating) => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          sx={{
            color: star <= rating ? "#FFA726" : "#FFE0B2",
            fontSize: 20,
          }}
        />
      ))}
      <Typography
        variant="body1"
        sx={{
          ml: 1,
          color: colors.primary,
          fontWeight: 500,
        }}
      >
        {rating.toFixed(1)}
      </Typography>
    </Box>
  );

  return (
    <Box>
      {displayedReviews.map((review, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            bgcolor: "#FFFBF2",
            border: review.highlight
              ? `2px solid ${colors.primary}`
              : `1px solid ${colors.primary}`,
            position: "relative",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            {renderStars(review.rating)}
            <Typography
              variant="body2"
              sx={{
                color: colors.primary,
                opacity: 0.8,
              }}
            >
              • {review.date}
            </Typography>
          </Stack>
          {review.highlight && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "transparent",
                py: 0.5,
                px: 1.5,
                borderRadius: 1,
                color: colors.primary,
                border: `1px solid ${colors.primary}`,
                "&:hover": {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`,
                },
              }}
            >
              <PushPinIcon
                sx={{
                  fontSize: 16,
                  color: "inherit",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "inherit",
                  fontWeight: 500,
                }}
              >
                {t("profile.preview.highlight")}
              </Typography>
            </Box>
          )}
          <Typography
            variant="body1"
            sx={{
              color: colors.primary,
              mb: 1,
              fontSize: "0.95rem",
              fontWeight: 400,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            &ldquo;{review.comment}&rdquo;
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: colors.primary,
              opacity: 0.8,
              fontWeight: 500,
            }}
          >
            - {review.author}
          </Typography>
        </Paper>
      ))}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          sx={{
            color: colors.primary,
            borderColor: colors.primary,
            "&:hover": {
              borderColor: colors.primary,
              bgcolor: `${colors.primary}10`,
            },
            opacity: hasMoreReviews ? 1 : 0.5,
            cursor: hasMoreReviews ? "pointer" : "not-allowed",
          }}
          onClick={() => hasMoreReviews && setShowAll(true)}
          disabled={!hasMoreReviews}
        >
          {t("profile.preview.see_more")}
        </Button>
      </Box>
    </Box>
  );
};

export default PreviewReviews;
