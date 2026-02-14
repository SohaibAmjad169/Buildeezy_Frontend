import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { editJobUrl, inviteUserToBidUrl } from "../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import InputBox from "../common/InputBox";
import MuiTypography from "../common/MuiTypography";
import MuiDatePickerBox from "../common/MuiDatePickerBox";
import { FIELD_TYPES } from "../../utils/constants/login";
import ActionButton from "../common/ActionButton";
import UpdateJobAndInviteDialog from "./UpdateJobAndInviteDialog";

// Initial form state
const INITIAL_FORM = {
  title: "",
  comments: "",
  budget: "",
  startDate: "",
};

function UpdateJobDialog({
  open,
  onClose,
  jobDetails,
  selectedUsers: propSelectedUsers = [],
  isInviteToBid = false,
  onPreview,
  onSubmit,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for form validation and data
  const [initLoad, setInitLoad] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: jobDetails?.title || "",
    comments: jobDetails?.comments || jobDetails?.description || "",
    budget: jobDetails?.budget || jobDetails?.amount || "",
    startDate: jobDetails?.startDate || jobDetails?.createdAt || "",
  });

  // Reset form fields to jobDetails every time dialog is opened
  useEffect(() => {
    if (open && jobDetails) {
      setFormData({
        title: jobDetails.title || "",
        comments: jobDetails.comments || jobDetails.description || "",
        budget: jobDetails.budget || jobDetails.amount || "",
        startDate: jobDetails.startDate || jobDetails.createdAt || "",
      });
    }
  }, [open, jobDetails]);

  // Use selectedUsers from props
  const selectedUsers = propSelectedUsers;

  // Handle input changes
  const handleChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData(INITIAL_FORM);
    onClose();
    setInitLoad(true);
  };

  // Handle preview
  const handlePreview = () => {
    setInitLoad(false);
    // Validate form before showing preview
    if (
      !formData.title ||
      !formData.comments ||
      !formData.budget ||
      !formData.startDate
    ) {
      return;
    }
    // If onPreview is provided, use it (for multi-user flow)
    if (onPreview) {
      onPreview(formData);
      return;
    }
    // Otherwise, fallback to original navigation (single user/job details page)
    navigate(`/my-contracts/view/${jobDetails.id}/preview`, {
      state: {
        formData,
        originalJobDetails: jobDetails,
        selectedUsers,
        isInviteToBid: true,
      },
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    setInitLoad(false);
    // Validate form
    if (
      !formData.title ||
      !formData.comments ||
      !formData.budget ||
      !formData.startDate
    ) {
      return;
    }
    setShowConfirmDialog(true);
  };

  // Handle confirmation
  const handleConfirmSubmit = async () => {
    try {
      dispatch(setLoading(true));

      if (isInviteToBid) {
        // Only create invitations for selected users without updating job details
        const jobId = jobDetails?.id;
        if (!jobId) {
          console.error(
            "[DEBUG] No valid jobId found in jobDetails:",
            jobDetails
          );
          alert("Invalid jobId for invitation!");
          return;
        }
        const invitationPromises = selectedUsers.map((user) => {
          const invitedUserId = user.id; // number
          // Basic UUID format check for jobId
          const isValidUuid = (val) =>
            typeof val === "string" && val.length === 36 && val.includes("-");
          if (!isValidUuid(jobId)) {
            alert("Invalid jobId for invitation!");
            return Promise.resolve(); // skip this invite
          }
          if (typeof invitedUserId !== "number") {
            alert("Invalid user ID for invitation!");
            return Promise.resolve(); // skip this invite
          }
          return inviteUserToBidUrl(jobId, invitedUserId, {
            data: {
              title: formData.title || jobDetails.title,
              comments: formData.comments || jobDetails.comments,
              budget: formData.budget || jobDetails.budget,
              startDate: new Date(
                formData.startDate || jobDetails.startDate
              ).toISOString(),
            },
          });
        });

        await Promise.all(invitationPromises);

        // Prepare success message with usernames
        let successMessage = t("job.details.invitations_sent_successfully");
        if (selectedUsers.length === 1) {
          const user = selectedUsers[0];
          successMessage = `Invitation sent successfully to user ${user.firstName} ${user.lastName}`;
        } else if (selectedUsers.length > 1) {
          const names = selectedUsers
            .map((u) => `${u.firstName} ${u.lastName}`)
            .join(", ");
          successMessage = `Invitations sent successfully to users: ${names}`;
        }

        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: successMessage,
          })
        );
        // Only close dialog, do not navigate
        onClose();
        if (onSubmit) {
          onSubmit(formData);
        }
      } else {
        // Handle regular job update
        const jobPayload = {
          data: {
            type: "update_job",
            title: formData.title,
            comments: formData.comments,
            budget: formData.budget,
            startDate: formData.startDate,
          },
        };

        await editJobUrl(jobDetails.id, jobPayload);

        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.success,
            message: t("job.details.job_updated_successfully"),
          })
        );
        // Only close dialog, do not navigate
        onClose();
        if (onSubmit) {
          onSubmit(formData);
        }
      }
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
      setShowConfirmDialog(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            p: 3,
            width: "100%",
            maxWidth: 600,
            mx: 2,
            position: "relative",
          }}
        >
          {/* Dialog Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <MuiTypography variant="h2">
              {isInviteToBid
                ? t("job.details.invite_to_bid")
                : t("job.details.update_job")}
            </MuiTypography>
            <Button
              onClick={handleClose}
              startIcon={<Close />}
              sx={{
                minWidth: "auto",
                padding: "6px",
                "&:hover": {
                  backgroundColor: "rgba(75, 175, 80, 0.04)",
                },
              }}
            />
          </Stack>

          {/* Form Fields */}
          <Box>
            {/* Title Field */}
            <Box sx={{ mt: 3 }}>
              <InputBox
                id="title"
                placeholder={t("job.details.title")}
                value={formData.title}
                onInputChange={handleChange}
              />
              {!initLoad && !formData.title && (
                <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                  {t("errors.title_required")}
                </MuiTypography>
              )}
            </Box>

            {/* Description Field */}
            <Box sx={{ mt: 3 }}>
              <InputBox
                id="comments"
                placeholder={t("job.details.description")}
                value={formData.comments}
                onInputChange={handleChange}
                type={FIELD_TYPES.description}
              />
              {!initLoad && !formData.comments && (
                <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                  {t("errors.description_required")}
                </MuiTypography>
              )}
            </Box>

            {/* Budget Field */}
            <Box sx={{ mt: 3 }}>
              <InputBox
                id="budget"
                placeholder={t("job.details.budget")}
                value={formData.budget}
                onInputChange={handleChange}
              />
              {!initLoad && !formData.budget && (
                <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                  {t("errors.budget_required")}
                </MuiTypography>
              )}
            </Box>

            {/* Start Date Field */}
            <Box sx={{ mt: 3 }}>
              <MuiDatePickerBox
                id="startDate"
                onDateChange={handleChange}
                value={formData.startDate}
                placeholder={t("job.details.start_date")}
                sx={{
                  width: "100%",
                }}
              />
              {!initLoad && !formData.startDate && (
                <MuiTypography variant="errorText" sx={{ ml: 0.5 }}>
                  {t("errors.start_date_required")}
                </MuiTypography>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
            <Button
              variant="text"
              onClick={handleClose}
              sx={{
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "rgba(75, 175, 80, 0.04)",
                },
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="outlined"
              onClick={handlePreview}
              sx={{
                color: "primary.main",
                borderColor: "primary.main",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "rgba(75, 175, 80, 0.04)",
                  borderColor: "primary.main",
                },
              }}
            >
              {t("preview")}
            </Button>
            <ActionButton variant="contained" onClick={handleSubmit}>
              {t("submit")}
            </ActionButton>
          </Stack>
        </Box>
      </Box>

      <UpdateJobAndInviteDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        talentName={selectedUsers
          .map((user) => `${user.firstName} ${user.lastName}`)
          .join(", ")}
        jobId={jobDetails?.id}
      />
    </>
  );
}

export default UpdateJobDialog;
