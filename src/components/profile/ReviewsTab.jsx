import { Box, Stack, Rating, Avatar, Typography, Divider } from "@mui/material";
import { colors } from "../../styles/theme";
import { useTheme } from "@mui/material/styles";
import { t } from "i18next";


// Utility to format job titles/services string
function formatJobTitle(title) {
  if (!title) return "";
  // Split by comma, trim, and format each part
  return title
    .split(",")
    .map((part) => {
      // Insert space before capital letters in camelCase (e.g., airCondition -> Air Condition)
      const withSpaces = part.replace(/([a-z])([A-Z])/g, "$1 $2");
      // Capitalize first letter, lowercase the rest
      return (
        withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase()
      );
    })
    .join(", ");
}

// Utility to format cost string
function formatCost(cost) {
  if (!cost) return "";
  // Remove 'Cost:' prefix if present
  let value = cost.replace(/^Cost:\s*/i, "");
  // Replace 'To' or 'to' (case-insensitive, with or without spaces) with ' to '
  value = value.replace(/([0-9])\s*to\s*([0-9])/gi, "$1 to $2");
  value = value.replace(/([0-9])\s*To\s*([0-9])/gi, "$1 to $2");
  value = value.replace(/([0-9])To([0-9])/gi, "$1 to $2");
  return value;
}

// Utility to format date as YYYY-MM-DD
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to safely convert rating to number
function getRatingAsNumber(review) {
  // Try different possible rating fields and convert to number
  const ratingValue =
    review.ratings?.overallExperience || review.rating || review.experince || 0;

  // Convert string to number if needed
  const numericRating =
    typeof ratingValue === "string" ? parseFloat(ratingValue) : ratingValue;

  // Ensure it's a valid number between 0 and 5
  return isNaN(numericRating) ? 0 : Math.max(0, Math.min(5, numericRating));
}

const ReviewCard = ({ review }) => {
  const theme = useTheme();

  // FIXED: Extract client information using the client object
  const reviewerName = review.client?.attributes
    ? `${review.client.attributes.firstName || ""} ${
        review.client.attributes.lastName || ""
      }`.trim()
    : review.name || "Anonymous";

  // FIXED: Use client avatar from the client object, with fallback to direct avatar
  const reviewerAvatar = review.client?.attributes?.avatar || null;

  const reviewerType =
    review.client?.attributes?.userType || review.userType || "Client";

  // FIXED: Get rating as number safely
  const ratingValue = getRatingAsNumber(review);

  // Build job title from available data
  const jobTitle =
    review.jobTitle ||
    (review.services && Array.isArray(review.services)
      ? review.services.join(", ")
      : "") ||
    review.customJobDetails ||
    "Service";

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        bgcolor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "white",
        borderRadius: "12px",
        border: `1px solid ${
          theme.palette.mode === "dark" ? theme.palette.divider : "#E5E7EB"
        }`,
        width: "100%",
        boxShadow:
          theme.palette.mode === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow:
            theme.palette.mode === "dark"
              ? "none"
              : "0 2px 4px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Job Title */}
      <Typography
        variant="h6"
        sx={{
          color:
            theme.palette.mode === "dark"
              ? theme.palette.text.primary
              : colors.primary,
          textDecoration: "underline",
          fontWeight: 500,
          mb: 2,
        }}
      >
        {formatJobTitle(jobTitle)}
      </Typography>

      {/* Rating and Date */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Rating
          value={ratingValue}
          readOnly
          precision={0.1}
          size="medium"
          sx={{ color: colors.primary }}
        />
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          {ratingValue.toFixed(1)}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {formatDate(review.startDate)} to {formatDate(review.endDate)}
        </Typography>
      </Stack>

      {/* Cost */}
      {review.cost && (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.85rem",
            mb: 1.5,
          }}
        >
          Cost: ${formatCost(review.cost)}
        </Typography>
      )}

      {/* Review Text */}
      {(review.likes || review.like) && (
        <Typography
          variant="body1"
          sx={{
            mb: review.dislikes || review.dislike ? 1 : 3,
            fontStyle: "italic",
            color: theme.palette.text.primary,
          }}
        >
          Likes: &ldquo;
          {(review.likes || review.like).replace(/<\/?p>/gi, "").trim()}&rdquo;
        </Typography>
      )}
      {(review.dislikes || review.dislike) && (
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            fontStyle: "italic",
            color: theme.palette.text.primary,
          }}
        >
          Dislikes: &ldquo;
          {(review.dislikes || review.dislike).replace(/<\/?p>/gi, "").trim()}
          &rdquo;
        </Typography>
      )}

      {/* FIXED: Reviewer Info - Show CLIENT information from client object */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={reviewerAvatar}
          alt={reviewerName}
          sx={{ width: 48, height: 48 }}
        >
          {!reviewerAvatar &&
            reviewerName &&
            reviewerName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
          >
            {reviewerName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem" }}
          >
            {reviewerType}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

function ReviewsTab({ reviews = [] }) {
  // Reverse reviews so newest are first
  const reversedReviews = [...reviews].reverse();

  // FIXED: Calculate average rating safely with number conversion
  const averageRating =
    reversedReviews.length > 0
      ? reversedReviews.reduce(
          (acc, review) => acc + getRatingAsNumber(review),
          0
        ) / reversedReviews.length
      : 0;

  // FIXED: Get last 5 unique reviewers using client object (people who gave reviews)
  const lastReviewers = reversedReviews
    .filter(
      (review, index, self) =>
        index ===
        self.findIndex((r) => {
          const rAvatar = r.client?.attributes?.avatar || r.avatar;
          const reviewAvatar =
            review.client?.attributes?.avatar || review.avatar;
          return rAvatar === reviewAvatar;
        })
    )
    .slice(0, 5)
    .map((review) => ({
      avatar: review.client?.attributes?.avatar,
      name: review.client?.attributes
        ? `${review.client.attributes.firstName || ""} ${
            review.client.attributes.lastName || ""
          }`.trim()
        : review.name || "Anonymous",
    }));

  // FIXED: Get current user info (person being reviewed) from contractor object in reviews
  const firstReview = reversedReviews[0];
  const contractorInfo = firstReview?.contractor;

  const currentUserName = contractorInfo?.attributes
    ? `${contractorInfo.attributes.firstName || ""} ${
        contractorInfo.attributes.lastName || ""
      }`.trim() || "User"
    : "User";

  const currentUserAvatar = contractorInfo?.attributes?.avatar || null;

  // Note: contractor object doesn't seem to have userType, so we'll use a default
  const currentUserType =
    contractorInfo?.attributes?.userType ||
    contractorInfo?.attributes?.category ||
    "Professional";

  if (!reversedReviews.length) {
    return (
      <Box
        sx={{
          width: "100%",
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "#888", fontWeight: 500, mb: 1 }}
        >
          {t("profile.don_t_have_review")}
        </Typography>
        <Typography variant="h5" sx={{ color: "#aaa" }}>
          {t("profile.review_receive")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h2">
            {t("profile.reviews")} ({reversedReviews.length})
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            {t("profile.review_desc")}
          </Typography>
        </Box>

        {/* FIXED: Right side - Show CONTRACTOR info (person being reviewed) with reviewers */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", md: "auto" },
          }}
        >
          {/* Current User Avatar and Info from contractor object */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 2 }}>
            <Avatar
              src={currentUserAvatar}
              alt={currentUserName}
              sx={{
                width: 56,
                height: 56,
                border: "3px solid",
                borderColor: colors.primary,
              }}
            >
              {!currentUserAvatar &&
                currentUserName &&
                currentUserName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#1F2937",
                }}
              >
                {currentUserName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#6B7280",
                  fontWeight: 500,
                }}
              >
                {currentUserType}
              </Typography>
            </Box>
          </Box>

          {/* Reviewers avatars stack (people who gave reviews) */}
          <Stack direction="row" spacing={-1} sx={{ mr: 2 }}>
            {lastReviewers.map((reviewer, index) => (
              <Avatar
                key={index}
                src={reviewer.avatar}
                alt={reviewer.name}
                sx={{
                  width: 32,
                  height: 32,
                  border: "2px solid white",
                  bgcolor: "#F3F4F6",
                }}
              >
                {!reviewer.avatar &&
                  reviewer.name &&
                  reviewer.name.charAt(0).toUpperCase()}
              </Avatar>
            ))}
          </Stack>

          {/* Rating summary for current user */}
          <Box sx={{ textAlign: "right" }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Rating
                value={averageRating}
                readOnly
                precision={0.1}
                size="medium"
                sx={{ color: colors.primary }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#1F2937",
                }}
              >
                {averageRating.toFixed(1)}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                color: "#6B7280",
                fontWeight: 500,
              }}
            >
              {t("profile.reviews_count", { count: reversedReviews.length })}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ width: "100%", mb: 4 }} />

      {/* Reviews List - Shows CLIENT info (people who gave reviews) */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {reversedReviews.map((review, index) => (
          <ReviewCard key={review.id || index} review={review} />
        ))}
      </Box>
    </Box>
  );
}

export default ReviewsTab;
