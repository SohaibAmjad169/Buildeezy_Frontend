import { useSelector, useDispatch } from "react-redux";
import "../styles/BidInvitations.css";
import {
  acceptBidInvitationUrl,
  rejectBidInvitationUrl,
} from "../apis/apiEndPoints";
import { setAlert } from "../redux/configSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import { useTranslation } from "react-i18next";

const BidInvitations = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const notifications = useSelector((state) => state.notifications.items);
  const bidInvitations = notifications.filter(
    (notification) => notification.type === "bid_invitation"
  );

  const handleAccept = async (invitationId, jobId) => {
    try {
      await acceptBidInvitationUrl(jobId, invitationId);
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: { id: invitationId, status: "accepted" },
      });
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.bid_invitation_accepted"),
        })
      );
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message || t("milestone.failed_to_accept_invitation"),
        })
      );
    }
  };

  const handleReject = async (invitationId, jobId) => {
    try {
      await rejectBidInvitationUrl(jobId, invitationId);
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: { id: invitationId, status: "rejected" },
      });
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("milestone.bid_invitation_rejected"),
        })
      );
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message || t("milestone.failed_to_reject_invitation"),
        })
      );
    }
  };

  return (
    <div className="bid-invitations-container">
      <h3>Bid Invitations</h3>
      {bidInvitations.length === 0 ? (
        <p>No bid invitations available</p>
      ) : (
        bidInvitations.map((invitation) => (
          <div key={invitation.id} className="bid-invitation-card">
            <div className="invitation-content">
              <h4>{invitation.title}</h4>
              <p>{invitation.message}</p>
            </div>
            <div className="invitation-actions">
              <button
                className="accept-btn"
                onClick={() => handleAccept(invitation.id, invitation.jobId)}
                disabled={invitation.status === "accepted"}
              >
                Accept
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(invitation.id, invitation.jobId)}
                disabled={invitation.status === "rejected"}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BidInvitations;
