import { Box, Stack, Radio } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useState } from "react";

import MuiActionDialog from "../common/MuiActionDialog";
import MuiTypography from "../common/MuiTypography";
import { MILESTONE_STATE } from "../../utils/constants/milestone";

function SelectMilestoneDialog({
  open,
  onClose,
  milestones,
  onSelectMilestone,
}) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(null);

  const submitableMilestones = milestones?.filter(
    (milestone) =>
      milestone.state === MILESTONE_STATE.ACTIVE ||
      milestone.state === MILESTONE_STATE.PAYMENT_REQUESTED
  );

  const handleSelect = () => {
    if (selectedIndex !== null) {
      onSelectMilestone(submitableMilestones[selectedIndex], selectedIndex);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
    onClose();
  };

  return (
    <MuiActionDialog
      width={600}
      open={open}
      handleClose={handleClose}
      title={t("milestone.select_milestone")}
      handleSuccess={handleSelect}
      actionTitle={t("milestone.select")}
      disabled={selectedIndex === null}
    >
      <Box sx={{ my: 2 }}>
        {submitableMilestones?.length > 0 ? (
          <>
            {submitableMilestones.map((milestone, index) => (
              <Box
                key={milestone.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => setSelectedIndex(index)}
              >
                <Radio
                  checked={selectedIndex === index}
                  onChange={() => setSelectedIndex(index)}
                  sx={{ mt: -0.5, mr: 1 }}
                />
                <Stack spacing={1} flex={1}>
                  <MuiTypography variant="h6">{milestone.title}</MuiTypography>
                  <MuiTypography>
                    {t("milestone.amount")}: ${milestone.amount}
                  </MuiTypography>
                  <Stack direction="row" spacing={1}>
                    <MuiTypography>{t("milestone.due_date")}:</MuiTypography>
                    <MuiTypography>
                      {dayjs(milestone.dueDate).format("DD MMM YYYY")}
                    </MuiTypography>
                  </Stack>
                  <MuiTypography
                    sx={{
                      color:
                        milestone.state === MILESTONE_STATE.PAYMENT_REQUESTED
                          ? "warning.main"
                          : "success.main",
                    }}
                  >
                    {milestone.state === MILESTONE_STATE.PAYMENT_REQUESTED
                      ? t("milestone.payment_requested")
                      : t("milestone.active")}
                  </MuiTypography>
                </Stack>
              </Box>
            ))}
          </>
        ) : (
          <MuiTypography align="center">
            {t("milestone.no_submittable_milestones")}
          </MuiTypography>
        )}
      </Box>
    </MuiActionDialog>
  );
}

export default SelectMilestoneDialog;
