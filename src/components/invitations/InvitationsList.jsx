import { CircularProgress, Grid, Box } from "@mui/material";
import PropTypes from "prop-types";
import JobCard from "../common/JobCard";
import { useEffect, useState } from "react";
import { getJobDetailsUrl } from "../../apis/apiEndPoints";
import { useNavigate } from "react-router-dom";

function InvitationsList({ invitations, isAllJobGrid }) {
  const [jobDetailsMap, setJobDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function fetchJobs() {
      setLoading(true);
      const jobs = {};
      await Promise.all(
        invitations.map(async (invitation) => {
          try {
            const res = await getJobDetailsUrl(invitation.jobId);
            jobs[invitation.jobId] = res.data.data;
          } catch {
            // Optionally handle error
          }
        })
      );
      if (isMounted) {
        setJobDetailsMap(jobs);
        setLoading(false);
      }
    }
    if (invitations.length > 0) {
      fetchJobs();
    } else {
      setJobDetailsMap({});
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [invitations]);

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;
  }

  if (isAllJobGrid) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {invitations.map((invitation) => {
          const job = jobDetailsMap[invitation.jobId];
          if (!job) return null;
          const handleCardClick = () => {
            navigate(`/invitations/job/${invitation.jobId}/${invitation.id}`, {
              state: { invitation },
            });
          };
          return (
            <JobCard
              key={invitation.id}
              job={job}
              onViewDetail={handleCardClick}
              isAllJob={true}
            />
          );
        })}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {invitations.map((invitation) => {
        const job = jobDetailsMap[invitation.jobId];
        if (!job) return null;
        return (
          <Grid item xs={12} sm={6} key={invitation.id}>
            <JobCard job={job} onViewDetail={() => {}} isAllJob={true} />
          </Grid>
        );
      })}
    </Grid>
  );
}

InvitationsList.propTypes = {
  invitations: PropTypes.array.isRequired,
  isAllJobGrid: PropTypes.bool,
};

export default InvitationsList;
