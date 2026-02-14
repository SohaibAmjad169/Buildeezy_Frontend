import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Chip,
  useMediaQuery,
} from "@mui/material";
import { Eye, Building } from "iconsax-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LearningAdAssetView from "../common/LearningAdAssetView";
import AdActionButtons from "../myAds/AdActionButtons";
import MuiDialog from "../common/MuiDialog";
import ActionButton from "../common/ActionButton";
import { setAlert, setLoading } from "../../redux/configSlice";
import {
  deleteAdUrl,
  toggleLikeAdUrl,
  getAdLikesUrl,
  postAdViewUrl,
  getAdViewsUrl,
  postAdCommentUrl,
  getAdCommentsUrl,
  deleteAdCommentUrl,
} from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import { colors } from "../../styles/theme";
import ShareIcon from "../common/icons/ShareIcon";
import ShareMenu from "../common/ShareMenu";
import BackButton from "../common/BackButton";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

dayjs.extend(relativeTime);

function LearningAdDetailsMobile({
  adDetails,
  isMyAd = false,
  isPreview = false,
  handleSave,
  isLocallySaved,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.profile.profileData?.id);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  function onReactiveAd(e) {
    e.stopPropagation();
    navigate("/my-ads/reactive/" + adDetails.id);
  }

  function onEditAd(e) {
    e.stopPropagation();
    navigate("/my-ads/edit/" + adDetails.id);
  }

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }

  function onDeleteAd() {
    setOpenDeleteDialog(true);
  }

  function onViewProfile() {
    navigate("profile", {
      state: { userId: adDetails.author.id, adId: adDetails.id },
    });
  }

  async function fetchLikes() {
    try {
      const res = await getAdLikesUrl(adDetails.id);
      if (res?.data?.meta?.totalRecords !== undefined) {
        setLikeCount(res.data.meta.totalRecords);
      }
      if (Array.isArray(res?.data?.data)) {
        setLiked(res.data.data.some((like) => like.user?.id === userId));
      }
    } catch {
      /* ignore */
    }
  }

  async function fetchViews() {
    try {
      const res = await getAdViewsUrl(adDetails.id);
      if (res?.data?.meta?.totalRecords !== undefined) {
        setViewCount(res.data.meta.totalRecords);
      }
    } catch {
      /* ignore */
    }
  }

  async function fetchComments() {
    try {
      const res = await getAdCommentsUrl(adDetails.id);
      if (res?.data?.meta?.totalRecords !== undefined) {
        setCommentCount(res.data.meta.totalRecords);
      }
      if (Array.isArray(res?.data?.data)) {
        setComments(res.data.data);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    fetchLikes();
    fetchViews();
    fetchComments();
    postAdViewUrl(adDetails.id);
  }, [adDetails.id]);

  const handleLike = async () => {
    try {
      await toggleLikeAdUrl(adDetails.id);
      fetchLikes();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    }
  };

  const handleShare = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      try {
        await postAdCommentUrl(adDetails.id, comment.trim());
        setComment("");
        fetchComments();
      } catch (err) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: err.message,
          })
        );
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteAdCommentUrl(commentId);
      fetchComments();
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    }
  };

  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteAdUrl(adDetails.id);
      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("ad.deleted_successfully"),
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

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
      {/* Header Actions */}
      {!isMyAd && !isPreview && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // space between left and right sides
            alignItems: "center",
            mt: 1,
            mb: 2,
          }}
        >
          {/* Left side: Back Button */}
          <BackButton
            variant="text"
            showText={false}
            sx={{
              fontSize: "12px",
              py: 0.6,
              borderRadius: "7px",
            }}
          />

          {/* Right side: Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <ActionButton variant="contained" onClick={handleSave}>
              {isLocallySaved ? t("common.saved") : t("common.save")}
            </ActionButton>

            <ActionButton
              variant="contained"
              onClick={onViewProfile}
              startIcon={Eye}
            >
              {t("ad.details.view_profile")}
            </ActionButton>
          </Box>
        </Box>
      )}

      {isMyAd && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <AdActionButtons
              onEditAd={onEditAd}
              onReactiveAd={onReactiveAd}
              onDeleteAd={onDeleteAd}
              disabledReactiveAd={dayjs(adDetails.expireAt) > dayjs(new Date())}
            />
          </Box>
        </Box>
      )}
      {/* Media */}
      <Box
        sx={{ width: "100%", borderRadius: "12px", overflow: "hidden", mb: 2 }}
      >
        <LearningAdAssetView file={adDetails?.documents?.[0]} />
      </Box>

      {/* Engagement Stats and Chips Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
          mb: 2,
          width: "100%",
        }}
      >
        {/* Engagement Stats */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleLike}
            sx={{
              p: 0.5,
              color: liked ? "error.main" : "#131a47",
              "&:hover": {
                backgroundColor: "transparent",
                color: liked ? "error.main" : "#131a47",
              },
            }}
          >
            {liked ? (
              <FavoriteIcon sx={{ fontSize: 18, color: "error.main" }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 18, color: "#131a47" }} />
            )}
          </IconButton>
          <Typography variant="body2" sx={{ color: "#131a47", ml: 0 }}>
            {likeCount}
          </Typography>
          <VisibilityIcon sx={{ fontSize: 18, color: "#131a47" }} />
          <Typography variant="body2" sx={{ color: "#131a47", ml: 0 }}>
            {viewCount}
          </Typography>
          <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: "#131a47" }} />
          <Typography variant="body2" sx={{ color: "#131a47", ml: 0 }}>
            {commentCount}
          </Typography>
          <IconButton
            onClick={handleShare}
            sx={{
              color: "#131a47",
              ml: 2,
              "&:hover": {
                color: "#131a47",
                "& img": {
                  filter:
                    "brightness(0) saturate(100%) invert(48%) sepia(67%) saturate(2284%) hue-rotate(202deg) brightness(101%) contrast(101%)",
                },
              },
            }}
          >
            <ShareIcon size={14} color="#131a47" />
          </IconButton>
        </Box>{" "}
      </Box>
      {/* Chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          pb: 2,
        }}
      >
        <Chip
          label="● New"
          sx={{
            backgroundColor: "#EEF2FF",
            color: "#4F46E5",
            fontWeight: 500,
            fontSize: "0.75rem",
            border: "1px solid #E0E7FF",
            px: 1.5,
            height: 24,
            borderRadius: "16px",
          }}
          variant="outlined"
        />
        <Chip
          label={adDetails?.author?.category}
          sx={{
            backgroundColor: "#F5F3FF",
            color: "#7C3AED",
            fontWeight: 500,
            fontSize: "0.75rem",
            border: "1px solid #EDE9FE",
            px: 1.5,
            height: 24,
            borderRadius: "16px",
          }}
          variant="outlined"
        />
      </Box>
      {/* Title & Description */}
      <Typography
        variant="h2"
        sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}
      >
        {adDetails?.headline}
      </Typography>
      <Typography
        variant="h5"
        sx={{ color: "text.secondary", whiteSpace: "pre-wrap", mb: 4 }}
      >
        {adDetails?.description}
      </Typography>

      {/* Business Info */}
      <Box sx={{ mb: 4 }}>
        {/* Business Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          {adDetails?.logo ? (
            <Box
              component="img"
              src={
                adDetails.logo.includes("https:")
                  ? adDetails.logo
                  : IMAGE_URL + adDetails.logo
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
              sx={{ fontWeight: 500, color: "text.secondary", lineHeight: 1.2 }}
            >
              {adDetails?.businessName}
            </Typography>
          </Box>
        </Box>
        {/* User Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={adDetails?.author?.avatar}
            alt={`${adDetails?.author?.firstName} ${adDetails?.author?.lastName}`}
            sx={{ width: 32, height: 32 }}
          >
            {adDetails?.author?.firstName?.[0] || "U"}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 500, color: "text.secondary", lineHeight: 1.2 }}
            >
              {adDetails?.author?.firstName} {adDetails?.author?.lastName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Call to Action Section */}
      {adDetails?.state && (
        <Box
          sx={{
            width: "100%",
            my: 4,
            p: 2,
            background: "#F8FAF5",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {t("ad.details.call_to_action")}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {/* {t("ad.details.call_to_action_subtitle")} */}
            {t("ad.details.call_to_action_contact_description")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: 2 }}
            onClick={() => {
              if (adDetails.state === "learnMore" && adDetails.url) {
                window.open(adDetails.url, "_blank");
              } else if (adDetails.state === "contact") {
                // Handle contact action
              }
            }}
          >
            {t("ad.details.contact")}
          </Button>
        </Box>
      )}

      {/* Display on Dashboard Section */}
      <Box
        sx={{
          width: "100%",
          my: 4,
          p: 2,
          background: "#F8FAF5",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {t("ad.display_on_dashboard.subtitle")}
        </Typography>
        <Typography variant="body2">
          {t("ad.display_on_dashboard_subtitle")}
        </Typography>
      </Box>

      {/* Comments Section */}
      <Box sx={{ mt: 7.5 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1.5, fontWeight: 600, color: "text.secondary" }}
        >
          {t("Comments")} ({commentCount})
        </Typography>
        {/* Existing Comments */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {(showAllComments ? comments : comments.slice(-2)).map(
            (commentObj) => (
              <Box key={commentObj.id} sx={{ display: "flex", gap: 2 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {commentObj.user?.firstName?.slice(0, 2) || "U"}
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
                      {commentObj.user?.firstName} {commentObj.user?.lastName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {dayjs(commentObj.createdAt).fromNow()}
                    </Typography>
                    {commentObj.user?.id === userId && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteComment(commentObj.id)}
                        sx={{ ml: 1, minWidth: 0, fontSize: "0.75rem" }}
                      >
                        {t("Delete")}
                      </Button>
                    )}
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
                      {commentObj.comment}
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
            sx={{ height: 32, borderRadius: "16px", textTransform: "none" }}
          >
            {t("Post Comment")}
          </Button>
        </Box>
      </Box>

      {/* Share Menu */}
      <ShareMenu
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        headline={adDetails?.headline}
        url={window.location.href}
      />

      {/* Delete Dialog */}
      <MuiDialog
        title={t("ad.delete_ad")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

LearningAdDetailsMobile.propTypes = {
  adDetails: PropTypes.object,
  isMyAd: PropTypes.bool,
  isPreview: PropTypes.bool,
};

export default LearningAdDetailsMobile;
