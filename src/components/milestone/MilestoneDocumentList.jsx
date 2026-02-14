import { useTranslation } from "react-i18next";
import MuiTypography from "../common/MuiTypography";
import { Box, Divider, Stack, Tooltip, IconButton, Collapse, Avatar } from "@mui/material";
import { DocumentDownload, Eye, Trash, ExportCurve, Link } from "iconsax-react";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { colors } from "../../styles/theme";
import NoData from "../common/NoData";
import dayjs from "dayjs";
import { getDocIcon, getFileName, getFileFormat } from "../../utils/file";
import useDownloadFile from "../../hooks/useDownloadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import ActionButton from "../common/ActionButton";
import DocumentMuiActionDialog from "./DocumentMuiActionDialog";
import { useState, useCallback } from "react";
import { t } from "i18next";
import { updateMilestoneUrl, deleteDocumentUrl } from "../../apis/apiEndPoints";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import DocumentViewer from "../upload/DocumentViewer";
import MuiDialog from "../common/MuiDialog";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// Component for rendering a single document with actions
export function DocumentItem({ document, onDelete, onView, onCopyLink, showActions = true, uploader }) {
  const { t } = useTranslation();

  const handleDownload = useCallback(async () => {
    try {
      const fileUrl = document.includes("https:") ? document : IMAGE_URL + document;
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName(document);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      const fileUrl = document.includes("https:") ? document : IMAGE_URL + document;
      window.open(fileUrl, '_blank');
    }
  }, [document]);

  return (
    <Box sx={{ mb: 2 }}>
      {/* User info if provided */}
      {uploader && (
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar
            alt={uploader.name}
            src={uploader.avatar}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <MuiTypography sx={{ fontWeight: 500, fontSize: "14px" }}>
              {uploader.name}
            </MuiTypography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "gray" }} />
              <MuiTypography color="text.secondary" sx={{ fontSize: 12 }}>
                {uploader.time}
              </MuiTypography>
            </Box>
          </Box>
        </Box>
      )}
      
      <Box
        sx={{
          border: `1px solid ${colors.grey400}`,
          px: 2,
          py: 1.5,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Box
            component="img"
            src={getDocIcon(document)}
            alt="document"
            sx={{
              width: 35,
              mr: 1.5,
            }}
          />
          <Stack>
            <MuiTypography
              variant={"subtitle1"}
              className="text-ellipsis"
              sx={{ maxWidth: { xs: "180px", sm: "400px", md: "500px" } }}
            >
              {getFileName(document)}
            </MuiTypography>
            <MuiTypography
              variant="caption"
              color="text.secondary"
            >
              {t("upload.file_format")} {getFileFormat(document)}
            </MuiTypography>
          </Stack>
        </Stack>
        
        {showActions && (
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={t("view")} placement="bottom">
              <IconButton
                size="small"
                onClick={() => onView(document)}
              >
                <Eye size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Link" placement="bottom">
              <IconButton
                size="small"
                onClick={() => onCopyLink(document)}
              >
                <Link size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("milestone.download")} placement="bottom">
              <IconButton
                size="small"
                onClick={handleDownload}
              >
                <DocumentDownload size={20} color={colors.primary} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("delete")} placement="bottom">
              <IconButton
                size="small"
                onClick={() => onDelete(document)}
                sx={{ color: "error.main" }}
              >
                <Trash size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Component for rendering milestone documents with collapsible interface
function MilestoneDocuments({ milestone, onDeleteDocument, onViewDocument, onCopyLink }) {
  const [expanded, setExpanded] = useState(false); // Start collapsed

  const formatDate = (date) => {
    return dayjs(date).format("ddd, DD MMM YYYY");
  };

  const documentCount = milestone.documents?.length || 0;

  if (!milestone.documents || milestone.documents.length === 0) {
    return null;
  }

  return (
    <Stack sx={{ mt: 3 }}>
      {/* Milestone Header - Always clickable for collapse/expand */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          mb: 2,
          "&:hover": { opacity: 0.7 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MuiTypography variant={"h6"} sx={{ fontWeight: 500 }}>
            {milestone.title} - {formatDate(milestone.dueDate)}
            <Box component="span" sx={{ color: "text.secondary", ml: 1 }}>
              ({documentCount} {documentCount === 1 ? 'file' : 'files'})
            </Box>
          </MuiTypography>
          {expanded ? (
            <KeyboardArrowDown sx={{ color: "#666" }} />
          ) : (
            <KeyboardArrowRight sx={{ color: "#666" }} />
          )}
        </Box>
      </Box>

      {/* Documents List */}
      <Collapse in={expanded}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {milestone.documents.map((doc, index) => (
            <DocumentItem
              key={`${milestone.id}-${index}`}
              document={doc}
              onDelete={onDeleteDocument}
              onView={onViewDocument}
              onCopyLink={onCopyLink}
            />
          ))}
        </Box>
      </Collapse>
    </Stack>
  );
}

// Component for the documents section header
function DocumentsHeader({ handleDocumentModale, onRefresh }) {
  const { t } = useTranslation();

  return (
    <>
      <Stack
        direction={"row"}
        spacing={1}
        alignItems={"center"}
        justifyContent={"space-between"}
        marginBottom={2}
      >
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <MuiTypography variant="h3" sx={{ fontWeight: 600, mt: 4, mb: 4 }}>
            {t("milestone.documents")}
          </MuiTypography>
        </Stack>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Box
            sx={{
              border: `1px solid #C3E191`,
              px: 1,
              py: 1,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
              cursor: "pointer",
            }}
            onClick={onRefresh}
            title={t("milestone.refresh")}
          >
            <RefreshIcon sx={{ color: "#719C40", cursor: "pointer" }} />
          </Box>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <ActionButton
              sx={{ padding: "10px 22px" }}
              onClick={handleDocumentModale}
            >
              {t("upload.upload")}
            </ActionButton>
          </Box>
        </Stack>
      </Stack>
      <Divider />
    </>
  );
}

// Main component for the milestone documents list
function MilestoneDocumentList({ milestoneSteps, jobId, onRefresh, setMilestoneSteps }) {
  const hasDocuments = milestoneSteps?.some(
    (step) => step.documents?.length > 0
  );
  const [openDocumetModale, setOpenDocumetModale] = useState(false);
  const [milestoneData, setMilestoneData] = useState([]);
  const [uploadedDocumentId, setUploadedDocumentId] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [openViewer, setOpenViewer] = useState(false);
  const [currentViewDocument, setCurrentViewDocument] = useState(null);

  const dispatch = useDispatch();

  const handleDocumentModale = () => {
    setOpenDocumetModale(true);
  };

  const handleConfirmUpload = async () => {
    try {
      const payload = {
        data: {
          type: "update_milestone",
          documents: uploadedDocumentId,
        },
      };

      await updateMilestoneUrl(jobId, selectedMilestoneId, payload);
      setOpenDocumetModale(false);
      
      // Reset form state
      setMilestoneData([]);
      setUploadedDocumentId([]);
      setSelectedMilestoneId({});

      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.success,
        message: "Documents uploaded successfully!",
      }));
      
      // Call refresh function instead of page reload
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.error,
        message: err.message || "Failed to upload documents.",
      }));
    }
  };

  const handleDeleteDocument = (document) => {
    const milestone = milestoneSteps.find(step => 
      step.documents?.includes(document)
    );
    
    setSelectedDocument(document);
    setSelectedMilestone(milestone);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteDocument = async () => {
    try {
      // Extract the key format from the full URL if needed
      let documentPath = selectedDocument;
      
      // If it's a full URL, extract just the key part
      if (selectedDocument.includes('https://useruploads-development.buildeezy.com/')) {
        documentPath = selectedDocument.replace('https://useruploads-development.buildeezy.com/', '');
      }
      
      console.log('Deleting document with path:', documentPath);
      console.log('Original document:', selectedDocument);
      
      await deleteDocumentUrl(jobId, selectedMilestone.id, {
        documentPath: documentPath
      });

      // Update local state immediately for instant UI feedback
      if (setMilestoneSteps) {
        setMilestoneSteps(prevSteps => 
          prevSteps.map(step => {
            if (step.id === selectedMilestone.id) {
              return {
                ...step,
                documents: step.documents.filter(doc => doc !== selectedDocument)
              };
            }
            return step;
          })
        );
      }

      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.success,
        message: "Document deleted successfully!",
      }));

      setOpenDeleteDialog(false);
      setSelectedDocument(null);
      setSelectedMilestone(null);
      
      // Also call refresh function for server sync
      if (onRefresh) {
        setTimeout(onRefresh, 500); // Small delay to allow UI update first
      }
    } catch (err) {
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.error,
        message: err.message || "Failed to delete document.",
      }));
    }
  };

  const handleViewDocument = (document) => {
    const fileUrl = document.includes("https:") ? document : IMAGE_URL + document;
    setCurrentViewDocument(fileUrl);
    setOpenViewer(true);
  };

  const handleCopyLink = async (document) => {
    try {
      const fileUrl = document.includes("https:") ? document : IMAGE_URL + document;
      await navigator.clipboard.writeText(fileUrl);
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.success,
        message: "Link copied to clipboard!",
      }));
    } catch (err) {
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.error,
        message: "Failed to copy link.",
      }));
    }
  };

  const handleMilestoneFileChange = (id, value) => {
    const newFiles = typeof value === "function" ? value(milestoneData) : value;

    setMilestoneData((prev) => {
      const updated = Array.isArray(newFiles)
        ? [...newFiles]
        : [newFiles];
      return updated;
    });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <DocumentMuiActionDialog
        open={openDocumetModale}
        onClose={() => setOpenDocumetModale(false)}
        onConfirm={handleConfirmUpload}
        milestoneData={milestoneData}
        onMilestoneDataChange={handleMilestoneFileChange}
        milestoneSteps={milestoneSteps}
        dialogTitle={t("milestone.upload_document")}
        setUploadedDocumentId={setUploadedDocumentId}
        selectedMilestoneId={selectedMilestoneId}
        setSelectedMilestoneId={setSelectedMilestoneId}
      />

      <DocumentsHeader 
        handleDocumentModale={handleDocumentModale}
        onRefresh={handleRefresh}
      />
      
      {hasDocuments ? (
        milestoneSteps?.map(
          (step) =>
            step.documents?.length > 0 && (
              <MilestoneDocuments 
                key={step.id} 
                milestone={step}
                onDeleteDocument={handleDeleteDocument}
                onViewDocument={handleViewDocument}
                onCopyLink={handleCopyLink}
              />
            )
        )
      ) : (
        <NoData />
      )}

      {/* Delete Confirmation Dialog */}
      <MuiDialog
        title={t("milestone.doc_delete")}
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        handleSuccess={confirmDeleteDocument}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />

      {/* Document Viewer */}
      {currentViewDocument && openViewer && (
        <DocumentViewer
          open={openViewer}
          handleClose={() => setOpenViewer(false)}
          type={getFileName(currentViewDocument).split('.').pop()}
          name={getFileName(currentViewDocument)}
          path={currentViewDocument}
        />
      )}
    </>
  );
}



export default MilestoneDocumentList;