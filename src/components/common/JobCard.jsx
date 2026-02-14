import { useSelector } from "react-redux";
import { useMemo } from "react";
import { Box, Card, CardContent, Stack, styled } from "@mui/material";
import { Calendar, Location, UserSquare, Edit2, Trash } from "iconsax-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import MuiTypography from "./MuiTypography";
import { JOB_CARD_HEIGHT } from "../../utils/constants/job";
import { getInitialUpperCase, getLabelFromId } from "../../utils/common";
import MuiChip from "./MuiChip";
import { colors } from "../../styles/theme";
import ActionButton from "./ActionButton";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material";
import { USER_TYPES, isContractorType } from "../../utils/constants/login";

const StyledCard = styled(Card)(({ theme }) => ({
  "&": {
    borderRadius: "1rem",
    minHeight: JOB_CARD_HEIGHT,
    padding: 0,
  },
  "&:not(.disabled):hover": {
    border: `solid ${theme.palette.primary.main} 1px`,
    background:
      theme.palette.mode === "light" ? colors.green200 : alpha(colors.green200, 0.05),
  },
  [theme.breakpoints.down("sm")]: { width: "100%" },
  [theme.breakpoints.up("sm")]: { width: "48%" },
}));

const ClickableArea = styled("div")({
  minHeight: JOB_CARD_HEIGHT,
  maxHeight: "100%",
  cursor: "pointer",
  "&:hover": {
    background: "inherit",
  },
});

export default function JobCard({
  job,
  onViewDetail,
  isAllJob = false,
  isActiveJob = false,
  isDraftedJob = false,
  isContract = false,
  handleJobEdit,
  handlejobDelete,
  handleJobComplete,
  reviewStatus, // NEW: Single review status object for this job
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profileData } = useSelector((state) => state.profile);

  function onCardClick() {
    onViewDetail(job.id);
  }

  const bidAmount = useMemo(() => {
    const bidDetails = job.bids?.filter((bid) => bid.jobId === job.id)[0];
    return bidDetails?.amount || 0;
  }, [job]);

  function onJobEdit(e) {
    e.stopPropagation();
    handleJobEdit(job);
  }

  function onJobDelete(e) {
    e.stopPropagation();
    handlejobDelete(job);
  }

  function onCompleteJob(e) {
    e.stopPropagation();
    handleJobComplete(job);
  }

  function onAddReview(e) {
    e.stopPropagation();
    
    if (profileData?.userType === USER_TYPES.client) {
      // Client reviewing contractor
      const contractorId = job?.contractorId || job?.jobContractors?.[0]?.contractor?.id;
      if (contractorId) {
        navigate(`/add-review?contractor=${contractorId}&job=${job.id}`);
      }
    } else if (isContractorType(profileData?.userType)) {
      // ANY contractor type reviewing client
      const clientId = job?.author?.id;
      if (clientId) {
        navigate(`/add-review?client=${clientId}&job=${job.id}`);
      }
    }
  }

  // NEW: Simplified logic using the new reviewStatus prop
  const shouldShowAddReview = useMemo(() => {
    console.log('🔍 =========================');
    console.log('🔍 SHOULD SHOW ADD REVIEW CHECK (JobCard)');
    console.log('🔍 =========================');
    console.log('🔍 Job ID:', job.id);
    console.log('🔍 Job state:', job.state);
    console.log('🔍 Review status:', reviewStatus);
    console.log('🔍 Profile data:', {
      id: profileData?.id,
      userType: profileData?.userType
    });
    
    // Check 1: Job must be completed
    if (job.state.toLowerCase() !== "completed") {
      console.log('🔍 ❌ Job not completed:', job.state);
      return false;
    }
    console.log('🔍 ✅ Job is completed');
    
    // Check 2: Review status must be available
    if (!reviewStatus) {
      console.log('🔍 ❌ No review status available');
      return false;
    }
    console.log('🔍 ✅ Review status available');
    
    // Check 3: Current user must not have already reviewed
    if (reviewStatus.currentUserHasReviewed) {
      console.log('🔍 ❌ Current user already reviewed this job');
      return false;
    }
    console.log('🔍 ✅ Current user has not reviewed yet');
    
    // Check 4: Current user must be eligible to review
    if (!reviewStatus.currentUserCanReview) {
      console.log('🔍 ❌ Current user is not eligible to review this job');
      return false;
    }
    console.log('🔍 ✅ Current user is eligible to review');
    
    const result = true;
    console.log('🔍 Final shouldShowAddReview result:', result ? '✅ TRUE' : '❌ FALSE');
    console.log('🔍 Review status summary:', {
      hasClientReviewed: reviewStatus.hasClientReviewed,
      hasContractorReviewed: reviewStatus.hasContractorReviewed,
      currentUserHasReviewed: reviewStatus.currentUserHasReviewed,
      currentUserCanReview: reviewStatus.currentUserCanReview
    });
    console.log('🔍 =========================');
    
    return result;
  }, [job, reviewStatus]);

  return (
    <StyledCard variant="outlined" onClick={onCardClick}>
      <ClickableArea>
        <CardContent sx={{ p: 0, minHeight: JOB_CARD_HEIGHT, maxHeight: "100%" }}>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            <MuiTypography
              variant="h3"
              className="text-ellipsis"
              sx={{ maxWidth: 280, fontWeight: 600, textAlign: "justify", mb: "12px !important" }}
            >
              {job?.title
                ? t(`job.options.types.${job?.title}`, getLabelFromId(job?.title, "title"))
                : t("n/a")}
            </MuiTypography>

            <Stack direction={"row"} spacing={1} alignItems={"center"} sx={{ mt: "8px !important" }}>
              <Calendar size={19} />
              <Stack>
                <MuiTypography
                  variant="subtitle2"
                  className="text-ellipsis"
                  sx={{ maxWidth: 240, fontSize: "0.75rem", textAlign: "justify", fontWeight: 400 }}
                >
                  {t("job.details.created_at")}
                </MuiTypography>
                <MuiTypography
                  variant="subtitle1"
                  className="text-ellipsis"
                  sx={{ maxWidth: 240, fontSize: "0.75rem", textAlign: "justify", fontWeight: 600 }}
                >
                  {dayjs(job.createdAt).format("DD MMM YYYY")}
                </MuiTypography>
              </Stack>
            </Stack>
            
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Location size={19} />
              <Stack>
                <MuiTypography
                  variant="subtitle2"
                  className="text-ellipsis"
                  sx={{ maxWidth: 240, fontSize: "0.75rem", textAlign: "justify", fontWeight: 400 }}
                >
                  {t("job.details.location")}
                </MuiTypography>
                <MuiTypography
                  variant="subtitle1"
                  className="text-ellipsis"
                  sx={{ maxWidth: 240, fontSize: "0.75rem", textAlign: "justify", fontWeight: 600 }}
                >
                  {job?.city?.name
                    ? `${job.city.name}, ${job.country?.name || t("n/a")}`
                    : job?.country?.name || t("n/a")}
                </MuiTypography>
              </Stack>
            </Stack>
            
            {(isAllJob || isContract) && (
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <UserSquare size={19} />
                <Stack>
                  <MuiTypography
                    variant="subtitle2"
                    className="text-ellipsis"
                    sx={{ maxWidth: 240, fontSize: "0.75rem", textAlign: "justify", fontWeight: 400 }}
                  >
                    {t("ad.details.created_by")}
                  </MuiTypography>
                  <MuiTypography
                    variant="subtitle1"
                    sx={{ maxWidth: 240, fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {job?.author.firstName + " " + job?.author.lastName}
                  </MuiTypography>
                </Stack>
              </Stack>
            )}

            {isAllJob && (
              <Stack direction={"row"} mt="16px !important" flexWrap={"wrap"} sx={{ minHeight: "36px" }}>
                {job?.startTimePreference && (
                  <MuiChip value={job?.startTimePreference} id="startTimePreference" showDot={true} />
                )}
                <MuiChip
                  value={`${job?.noOfBids} ${job?.noOfBids <= 1 ? t("job.details.bid") : t("job.details.bids")}`}
                />
                {job?.isBidPlaced && (
                  <MuiChip value={`${t("job.details.my_bid")}: $${bidAmount}`} />
                )}
              </Stack>
            )}

            {isActiveJob && (
              <Stack direction={"row"} mt="16px !important" flexWrap={"wrap"} sx={{ minHeight: "36px" }}>
                {job?.startTimePreference && (
                  <MuiChip value={job?.startTimePreference} id="startTimePreference" showDot={true} />
                )}
                <MuiChip
                  value={`${job?.noOfBids} ${job?.noOfBids <= 1 ? t("job.details.bid") : t("job.details.bids")}`}
                />
              </Stack>
            )}

            {isDraftedJob && (
              <Stack direction={"row"} mt="16px !important" flexWrap={"wrap"} sx={{ minHeight: "36px" }}>
                {job?.startTimePreference && (
                  <MuiChip value={job?.startTimePreference} id="startTimePreference" showDot={true} />
                )}
              </Stack>
            )}

            {isContract && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                mt="16px !important"
                alignItems={{ sm: "center" }}
                justifyContent={"space-between"}
              >
                <Stack direction={"row"} flexWrap={"wrap"} alignItems={"center"}>
                  <MuiChip
                    value={
                      job.state.toLowerCase() !== "completed"
                        ? t("job.options.status.inProgress")
                        : t("job.options.status.completed")
                    }
                  />
                </Stack>

                {/* UPDATED: New bidirectional review logic */}
                {job.state.toLowerCase() === "completed" ? (
                  // Show Add Review button only if current user hasn't reviewed AND is eligible
                  shouldShowAddReview && (
                    <ActionButton 
                      onClick={onAddReview}
                      sx={{ mt: { xs: 2, sm: 0 } }}
                    >
                      {t("navbar.addReview")}
                    </ActionButton>
                  )
                ) : (
                  // Show Complete Job button only for job author (client)
                  job?.author?.id === profileData?.id && (
                    <ActionButton
                      onClick={onCompleteJob}
                      sx={{ mt: { xs: 2, sm: 0 } }}
                    >
                      {t("job.complete_job")}
                    </ActionButton>
                  )
                )}
              </Stack>
            )}

            {(isActiveJob || isDraftedJob) && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <ActionButton onClick={onJobEdit} sx={{ flex: 1 }}>
                  <Edit2 size={16} style={{ marginRight: '8px' }} />
                  {t("edit")}
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  onClick={onJobDelete}
                  color="error"
                  sx={{ flex: 1 }}
                >
                  <Trash size={16} style={{ marginRight: '8px' }} />
                  {t("delete")}
                </ActionButton>
              </Box>
            )}
          </Stack>
        </CardContent>
      </ClickableArea>
    </StyledCard>
  );
}