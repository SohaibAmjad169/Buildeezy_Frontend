import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import {
  getUserBidInvitationsUrl,
  acceptBidInvitationUrl,
  rejectBidInvitationUrl,
  getJobDetailsUrl,
} from "../../apis/apiEndPoints";
import JobCard from "../common/JobCard";

function BidInvitationsOnContracts({ onlyInvitationsPage = false }) {
  const { profileData } = useSelector((state) => state.profile);
  const [invitations, setInvitations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvitationsAndJobs() {
      if (!profileData?.id) return;
      setLoading(true);
      try {
        const res = await getUserBidInvitationsUrl(profileData.id);
        const invs = res.data.data || []; 
        setInvitations(invs);
        // Fetch job details for each invitation
        const jobPromises = invs.map((inv) =>
          getJobDetailsUrl(inv.jobId).then((r) => r.data.data) 
        );
        const jobsData = await Promise.all(jobPromises);
        setJobs(jobsData);
      } catch (err) {
        dispatch(
          setAlert({ show: true, type: ALERT_TYPE.error, message: err.message })
        );
      } finally {
        setLoading(false);
      }
    }
    fetchInvitationsAndJobs();
  }, [profileData?.id]);

  const handleAccept = async (invitation) => {
    setLoading(true);
    try {
      await acceptBidInvitationUrl(invitation.jobId, invitation.id);
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      setJobs((prev) => prev.filter((j) => j.id !== invitation.jobId));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.bid_invitation_accepted"),
        })
      );
    } catch (err) {
      dispatch(
        setAlert({ show: true, type: ALERT_TYPE.error, message: err.message })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (invitation) => {
    setLoading(true);
    try {
      await rejectBidInvitationUrl(invitation.jobId, invitation.id);
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      setJobs((prev) => prev.filter((j) => j.id !== invitation.jobId));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.bid_invitation_rejected"),
        })
      );
    } catch (err) {
      dispatch(
        setAlert({ show: true, type: ALERT_TYPE.error, message: err.message })
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && invitations.length === 0) return null;
  if (!invitations.length || !jobs.length) return null;

  return (
    <Box sx={{ mb: 3, mt: onlyInvitationsPage ? 4 : 0 }}>
      {!onlyInvitationsPage && <h3>{t("Bid Invitations")}</h3>}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {invitations.map((invitation) => {
          const job = jobs.find((j) => j.id === invitation.jobId);
          if (!job) return null;
          // Merge invitation fields into job object
          const mergedJob = {
            ...job,
            title: invitation.title || job.title,
            comments: invitation.comments || job.comments,
            budget: invitation.budget || job.budget,
            startDate: invitation.startDate || job.startDate,
            createdAt: invitation.createdAt || job.createdAt,
            // Add more fields as needed
          };
          return (
            <JobCard
              key={invitation.id}
              job={mergedJob}
              bidInvitation={invitation}
              bidActionLoading={loading}
              isAllJob={true}
              onAcceptBidInvitation={() => handleAccept(invitation)}
              onRejectBidInvitation={() => handleReject(invitation)}
              onViewDetail={() =>
                navigate(`/job-invitation-details/${job.id}`, {
                  state: { invitation },
                })
              }
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default BidInvitationsOnContracts;
