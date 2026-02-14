// Utility to get correct details for contractor tab in job details view
export default function getContractorTabDetails({
  jobDetails,
  bidInvitations,
  contractor,
}) {
  // Check if there is an invitation for this contractor (by user id) and job id
  let invitation = null;
  if (contractor && Array.isArray(bidInvitations)) {
    invitation = bidInvitations.find(
      (inv) =>
        inv.jobId === jobDetails.id &&
        (inv.userId === contractor.id || inv.contractorId === contractor.id)
    );
  }
  return invitation
    ? {
        title: invitation.title || jobDetails.title,
        comments: invitation.comments || jobDetails.comments,
        createdAt:
          invitation.startDate || invitation.createdAt || jobDetails.createdAt,
      }
    : {
        title: jobDetails.title,
        comments: jobDetails.comments,
        createdAt: jobDetails.createdAt,
      };
}
