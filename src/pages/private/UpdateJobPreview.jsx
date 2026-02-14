import { useTranslation } from "react-i18next";
import { Box, Stack, Divider } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import MuiTypography from "../../components/common/MuiTypography";
import ActionButton from "../../components/common/ActionButton";
import { editJobUrl, inviteUserToBidUrl } from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setJobDetails } from "../../redux/jobSlice";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import { ROUTES } from "../../utils/constants/route";
import ViewJobDetails from "../../components/viewJobDetails";
import UpdateJobAndInviteDialog from "../../components/viewJobDetails/UpdateJobAndInviteDialog";
import { useState } from "react";

function UpdateJobPreview() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // Get form data and original job details from location state
  const { formData, originalJobDetails, selectedUsers } = location.state || {};

  // Format selected users' names
  const selectedUsersNames = selectedUsers
    ? selectedUsers
        .map((user) => `${user.firstName} ${user.lastName}`.trim())
        .join(", ")
    : "";

  const pastLinks = [
    {
      label: t("breadcrumbs.my_contracts"),
      path: "/" + ROUTES.myContracts,
    },
    {
      label: t("details"),
      path: `/my-contracts/view/${id}`,
    },
  ];
  const activeLink = {
    label: t("preview"),
  };

  // Handle navigation back to update form
  const handleBack = () => {
    navigate(`/my-contracts/view/${id}`);
  };

  const handleSubmitClick = () => {
    setShowUpdateDialog(true);
  };

  // Handle both job update and talent invitation
  const handleUpdateAndInvite = async () => {
    try {
      dispatch(setLoading(true));

      // First update the job
      const payload = {
        data: {
          type: "update_job",
          title: formData.title,
          comments: formData.comments,
          budget: formData.budget,
          startDate: formData.startDate,
        },
      };

      const response = await editJobUrl(id, payload);
      dispatch(setJobDetails(response.data.data));

      // Then send invitations to all selected users with job data as payload
      if (selectedUsers?.length > 0) {
        for (const user of selectedUsers) {
          try {
            await inviteUserToBidUrl(id, user.id, {
              data: {
                title: formData.title,
                comments: formData.comments,
                budget: formData.budget,
                startDate: formData.startDate,
              },
            });
            dispatch(
              setAlert({
                show: true,
                type: ALERT_TYPE.success,
                message: `Invitation to user ${user.firstName} ${user.lastName} sent successfully`,
              })
            );
          } catch (inviteErr) {
            if (
              inviteErr?.message
                ?.toLowerCase()
                .includes("invitation already pending")
            ) {
              dispatch(
                setAlert({
                  show: true,
                  type: ALERT_TYPE.warning,
                  message: `Invitation to user already pending`,
                })
              );
            } else {
              dispatch(
                setAlert({
                  show: true,
                  type: ALERT_TYPE.error,
                  message: inviteErr.message,
                })
              );
            }
          }
        }
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("job.details.job_updated_successfully"),
          })
        );
      } else {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("job.details.job_updated_successfully"),
          })
        );
      }

      // Navigate back to job details
      navigate(`/my-contracts/view/${id}`);
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
      setShowUpdateDialog(false);
    }
  };

  // If no form data is available, redirect back
  if (!formData) {
    navigate(`/my-contracts/view/${id}`);
    return null;
  }

  // Create a preview version of the job details by merging original details with updates
  const previewJobDetails = {
    ...originalJobDetails,
    ...(formData.title !== undefined ? { title: formData.title } : {}),
    ...(formData.comments !== undefined ? { comments: formData.comments } : {}),
    ...(formData.budget !== undefined ? { budget: formData.budget } : {}),
    ...(formData.startDate !== undefined
      ? { startDate: formData.startDate }
      : {}),
  };

  return (
    <Box sx={{ height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", lg: "70%" },
          }}
        >
          <Box>
            <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              my={2}
            >
              <MuiTypography variant="h1" sx={{ fontWeight: 600 }}>
                {t("job.details.preview")}
              </MuiTypography>
              <Stack direction="row" spacing={2}>
                <ActionButton variant="text" onClick={handleBack}>
                  {t("back")}
                </ActionButton>
                <ActionButton variant="contained" onClick={handleSubmitClick}>
                  {t("submit")}
                </ActionButton>
              </Stack>
            </Stack>
            <Divider />
          </Box>

          <ViewJobDetails
            jobDetails={previewJobDetails}
            showClient={false}
            showContractor={true}
          />

          <UpdateJobAndInviteDialog
            open={showUpdateDialog}
            onClose={() => setShowUpdateDialog(false)}
            onConfirm={handleUpdateAndInvite}
            talentName={selectedUsersNames}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default UpdateJobPreview;
