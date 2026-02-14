import {
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ActionButton from "../common/ActionButton";
import UploadDoc from "../upload/UploadDoc";
import { ALL_FILE_TYPES } from "../../utils/file";
import { t } from "i18next";
import { useState } from "react";

const DocumentMuiActionDialog = ({
  open,
  onClose,
  onConfirm,
  dialogTitle = "Upload Document",
  milestoneData,
  onMilestoneDataChange,
  isExtend = false,
  dialogLoading = false,
  setUploadedDocumentId,
  milestoneSteps,
  selectedMilestoneId,
  setSelectedMilestoneId

}) => {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Typography sx={{ fontWeight: "500" }}>{dialogTitle}</Typography>

      <DialogContent>
        <Box sx={{ mt: 3 }}>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="milestone-select-label">{t("milestone.select_milestone")}</InputLabel>
            <Select
              labelId="milestone-select-label"
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              label={t("milestone.select_milestone")}
            >
              {milestoneSteps?.map((milestone) => (
                <MenuItem key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <UploadDoc
            id="documents"
            value={milestoneData}
            onSelectFiles={onMilestoneDataChange}
            acceptedFileTypes={ALL_FILE_TYPES}
            sx={{ mt: 2, mb: 1 }}
            multipleFiles={true}
            isDisabled={isExtend || dialogLoading}
            docId={true}
            setUploadedDocumentId={setUploadedDocumentId}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <ActionButton onClick={onClose} sx={{ padding: "8px 16px" }}>
          {t("job.details.cancel")}
        </ActionButton>
        <ActionButton
          onClick={onConfirm}
          sx={{ padding: "8px 16px" }}
          disabled={dialogLoading}
        >
          {dialogLoading ? <CircularProgress size={20} /> : t("job.details.confirm")}
        </ActionButton>
      </DialogActions>
    </Dialog >
  );
};

export default DocumentMuiActionDialog;