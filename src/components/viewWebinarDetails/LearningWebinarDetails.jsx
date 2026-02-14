import { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Avatar,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import { Eye, Building } from "iconsax-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import dayjs from "dayjs";

import {
  getAllFirstCharUpperCase,
  getFirstCharUpperCase,
  getAvatarName,
} from "../../utils/common";
import LearningAdAssetView from "../common/LearningAdAssetView";
import AdActionButtons from "../myAds/AdActionButtons";
import MuiDialog from "../common/MuiDialog";
import ActionButton from "../common/ActionButton";
import { setAlert, setLoading } from "../../redux/configSlice";
import { deleteAdUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import { colors } from "../../styles/theme";
import ShareIcon from "../common/icons/ShareIcon";
import ShareMenu from "../common/ShareMenu";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function LearningWebinarDetails({ webinarDetails, isMyWebinar = false, isPreview = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(32);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "John D.",
      text: "Great content! Really helpful for understanding the process.",
      timestamp: "5 min ago",
    },
  ]);
  const [showAllComments, setShowAllComments] = useState(false);

  function onReactiveAd(e) {
    e.stopPropagation();
    navigate("/my-ads/reactive/" + webinarDetails.id);
  }

  function onEditAd(e) {
    e.stopPropagation();
    navigate("/my-ads/edit/" + webinarDetails.id);
  }

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }

  function onDeleteAd() {
    setOpenDeleteDialog(true);
  }

  function onViewProfile() {
    navigate("profile", {
      state: { userId: webinarDetails.author.id, adId: webinarDetails.id },
    });
  }

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "You",
        text: comment.trim(),
        timestamp: "Just now",
      };
      setComments([...comments, newComment]);
      setComment("");
      setShowAllComments(false);
    }
  };

  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteAdUrl(webinarDetails.id);
      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("webinar.deleted_successfully"),
        })
      );
      navigate("/my-ads");
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto", px: { xs: 2, md: 4 } }}>
      {/* Header Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1,
          mb: 2,
        }}
      >
        {isMyWebinar && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <AdActionButtons
              onEditAd={onEditAd}
              onReactiveAd={onReactiveAd}
              onDeleteAd={onDeleteAd}
              disabledReactiveAd={dayjs(webinarDetails.expireAt) > dayjs(new Date())}
            />
          </Box>
        )}
        {!isMyWebinar && !isPreview && (
          <ActionButton
            variant="contained"
            onClick={onViewProfile}
            startIcon={Eye}
          >
            {t("webinar.details.view_profile")}
          </ActionButton>
        )}
      </Box>

      {/* Two Column Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 6 },
          maxWidth: "1800px",
          mx: "auto",
          height: "auto",
        }}
      >
        {/* Left Column - Assets */}
        <Box
          sx={{
            width: { xs: "100%", md: "70%" },
            position: "relative",
            height: "100%",
            pt: 0,
          }}
        >
          {/* Main Media */}
          <Box
            sx={{
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <LearningAdAssetView file={webinarDetails?.documents?.[0]} />
          </Box>
        </Box>

        {/* Right Column - Details */}
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            pt: 0,
          }}
        >
          {/* Top Section with Tags and Engagement */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            {/* Engagement Stats */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {likesCount}
                </Typography>
                <IconButton
                  onClick={handleLike}
                  sx={{
                    p: 0.5,
                    color: liked ? "error.main" : "inherit",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: liked ? "error.main" : colors.grey500,
                    },
                  }}
                >
                  <FavoriteIcon
                    sx={{
                      fontSize: 24,
                      color: liked ? "error.main" : "text.secondary",
                    }}
                  />
                </IconButton>
              </Box>
              <IconButton
                onClick={handleShare}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    "& img": {
                      filter:
                        "brightness(0) saturate(100%) invert(48%) sepia(67%) saturate(2284%) hue-rotate(202deg) brightness(101%) contrast(101%)",
                    },
                  },
                }}
              >
                <ShareIcon size={20} />
              </IconButton>
            </Box>

            {/* Tags */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Box
                sx={{
                  backgroundColor: "#EEF2FF",
                  color: "#4F46E5",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                  border: "1px solid #E0E7FF",
                  fontWeight: 500,
                }}
              >
                ● New
              </Box>
              <Box
                sx={{
                  backgroundColor: "#F5F3FF",
                  color: "#7C3AED",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                  border: "1px solid #EDE9FE",
                  fontWeight: 500,
                }}
              >
                {webinarDetails?.author?.professionType ||
                  webinarDetails?.author?.userType ||
                  "Contractor"}
              </Box>
            </Box>
          </Box>

          {/* Title & Description */}
          <Typography
            variant="h1"
            sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}
          >
            {getAllFirstCharUpperCase(webinarDetails?.headline)}
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "text.secondary", whiteSpace: "pre-wrap", mb: 4 }}
          >
            {webinarDetails?.description}
          </Typography>

          {/* Business Info */}
          <Box sx={{ mb: 4 }}>
            {/* Business Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
              }}
            >
              {webinarDetails?.logo ? (
                <Box
                  component="img"
                  src={
                    webinarDetails.logo.includes("https:")
                      ? webinarDetails.logo
                      : IMAGE_URL + webinarDetails.logo
                  }
                  alt="business logo"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "primary.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building size={20} color={colors.primary} />
                </Box>
              )}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    lineHeight: 1.2,
                  }}
                >
                  {webinarDetails?.businessName}
                </Typography>
              </Box>
            </Box>

            {/* User Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar
                src={webinarDetails?.author?.avatar}
                alt={`${webinarDetails?.author?.firstName} ${webinarDetails?.author?.lastName}`}
                sx={{ width: 32, height: 32 }}
              >
                {getAvatarName(
                  webinarDetails?.author?.firstName || "",
                  webinarDetails?.author?.lastName || ""
                )}
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    lineHeight: 1.2,
                  }}
                >
                  {getFirstCharUpperCase(webinarDetails?.author?.firstName || "")}{" "}
                  {getFirstCharUpperCase(webinarDetails?.author?.lastName || "")}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Comments Section */}
          <Box sx={{ mt: 7.5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 1.5, fontWeight: 600, color: "text.secondary" }}
            >
              {t("Comments")} ({comments.length})
            </Typography>

            {/* Existing Comments */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(showAllComments ? comments : comments.slice(-2)).map(
                (comment) => (
                  <Box key={comment.id} sx={{ display: "flex", gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {comment.author.slice(0, 2)}
                    </Avatar>
                    <Box sx={{ maxWidth: "80%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: "text.secondary" }}
                        >
                          {comment.author}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {comment.timestamp}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          backgroundColor: "grey.100",
                          borderRadius: "12px",
                          p: 1.5,
                          width: "300px",
                          maxWidth: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {comment.text}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              )}
            </Box>

            {/* See More Button */}
            {comments.length > 2 && (
              <Button
                onClick={() => setShowAllComments(!showAllComments)}
                sx={{
                  mt: 0.5,
                  color: "primary.main",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                {showAllComments
                  ? t("Show Less")
                  : t(`See ${comments.length - 2} more`)}
              </Button>
            )}

            {/* Add Comment */}
            <Box sx={{ mt: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={1}
                placeholder={t("Write a comment...")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{
                  mb: 1,
                  "& .MuiInputBase-root": {
                    width: "300px",
                    maxWidth: "100%",
                    "& textarea": {
                      minHeight: "40px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                disabled={!comment.trim()}
                onClick={handleCommentSubmit}
                sx={{
                  height: 32,
                  borderRadius: "16px",
                  textTransform: "none",
                }}
              >
                {t("Post Comment")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Share Menu */}
      <ShareMenu
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        headline={webinarDetails?.headline}
        url={window.location.href}
      />

      {/* Delete Dialog */}
      <MuiDialog
        title={t("webinar.delete_ad")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

LearningWebinarDetails.propTypes = {
  webinarDetails: PropTypes.object,
  isMyWebinar: PropTypes.bool,
  isPreview: PropTypes.bool,
};

export default LearningWebinarDetails;
