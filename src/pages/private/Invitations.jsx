import { Box, Typography, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import InvitationsList from "../../components/invitations/InvitationsList";
import {
  acceptBidInvitation,
  rejectBidInvitation,
  getUserBidInvitationsUrl,
} from "../../apis/apiEndPoints";
import MuiTypography from "../../components/common/MuiTypography";

function Invitations() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.profile);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, [profileData?.id]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      if (!profileData?.id || isNaN(profileData.id)) return;
      const response = await getUserBidInvitationsUrl(profileData.id);
      setInvitations(response.data.data);
    } catch (error) {
      if (!error?.message?.toLowerCase().includes("must be number")) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error.message,
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      await acceptBidInvitation(invitationId);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("invitation_accepted"),
        })
      );
      fetchInvitations();
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    }
  };

  const handleReject = async (invitationId) => {
    try {
      await rejectBidInvitation(invitationId);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("invitation_rejected"),
        })
      );
      fetchInvitations();
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    }
  };

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ width: "100%" }}>
        <MuiTypography variant="h2" sx={{ mb: 2 }}>
          {t("milestone.invitations")}
        </MuiTypography>
        <Divider sx={{ mb: 2.5 }} />
        {loading ? (
          <Typography sx={{ textAlign: "center", mt: 4 }}>
            {t("loading")}
          </Typography>
        ) : invitations.length === 0 ? (
          <Typography sx={{ textAlign: "center", mt: 4 }}>
            {t("milestone.no_invitations_found")}
          </Typography>
        ) : (
          <InvitationsList
            invitations={invitations}
            onAccept={handleAccept}
            onReject={handleReject}
            isAllJobGrid={true}
          />
        )}
      </Box>
    </Box>
  );
}

export default Invitations;
