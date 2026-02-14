import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Add } from "iconsax-react";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";

import { getPortfolioUrl, deletePortfolioProjectUrl } from "../../../apis/apiEndPoints";
import { setAlert } from "../../../redux/configSlice";
import { ALERT_TYPE } from "../../../utils/constants/config";
import MuiTypography from "../../common/MuiTypography";
import PortfolioList from "../../portfolio/PortfolioList";
import { colors } from "../../../styles/theme";

export default function PortfolioTab({ onAddProject, onProfileUpdateComplete, onEditProject, portfolioData, onPortfolioDataUpdate }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.profile);
  const [currentTab, setCurrentTab] = useState("published");
  const [portfolios, setPortfolios] = useState(portfolioData || []);
  const [loading, setLoading] = useState(!portfolioData);
  const navigate = useNavigate();

  useEffect(() => {
    if (portfolioData && portfolioData.length > 0) {
      // Use the passed portfolio data when it exists and has items
      setPortfolios(portfolioData);
      setLoading(false);
    } else if (profileData?.id && (portfolios.length === 0 || !portfolioData)) {
      // Fetch data if:
      // 1. No local portfolios data, OR
      // 2. No portfolioData passed from parent
      fetchPortfolios();
    }
  }, [profileData?.id, portfolioData]);

  // Ensure data is always available when component mounts/remounts
  useEffect(() => {
    if (profileData?.id && portfolios.length === 0 && !loading) {
      fetchPortfolios();
    }
  }, [profileData?.id]);

  // Handle page visibility change to refetch data when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && profileData?.id && portfolios.length === 0) {
        fetchPortfolios();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profileData?.id, portfolios.length]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await getPortfolioUrl(profileData?.id);

      if (response?.data?.data) {
        setPortfolios(response.data.data);
        // Update parent portfolio data
        if (onPortfolioDataUpdate) {
          onPortfolioDataUpdate(response.data.data);
        }
      }
    } catch (error) {
      // Suppress alert if error is just 'No portfolio projects found for user'
      if (!error.message?.includes("No portfolio projects found for user")) {
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

  const handleLocalDelete = async (projectId) => {
    try {
      // Call the API to delete the project
      await deletePortfolioProjectUrl(projectId);

      // Update local state by filtering out the deleted project
      const updatedPortfolios = portfolios.filter((portfolio) => portfolio.projectId !== projectId);
      setPortfolios(updatedPortfolios);
      
      // Update parent portfolio data
      if (onPortfolioDataUpdate) {
        onPortfolioDataUpdate(updatedPortfolios);
      }

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message:"Portfolio project deleted successfully",
        })
      );

      // Trigger profile completion recalculation
      if (onProfileUpdateComplete) {
        onProfileUpdateComplete();
      }
    } catch (error) {
      console.error("Error deleting portfolio project:", error);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: "Failed to delete portfolio project. Please try again.",
        })
      );
    }
  };

  const handleTabChange = (newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddProject = () => {
    onAddProject();
  };

  const handleEditProject = (projectId) => {
    if (onEditProject) {
      onEditProject(projectId);
    }
  };

  const handlePreview = () => {
    if (profileData?.id) {
      navigate(`/dashboard/view/${profileData.id}/profile`);
    }
  };

  // Function to refresh portfolios after status update
  const handlePortfolioUpdated = () => {
    fetchPortfolios();
    // Trigger profile completion recalculation when portfolio is updated
    if (onProfileUpdateComplete) {
      onProfileUpdateComplete();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <MuiTypography variant="h2">Portfolio</MuiTypography>
          <MuiTypography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            {t("profile.portfolio.description")}
          </MuiTypography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            variant="text"
            startIcon={<RemoveRedEyeOutlinedIcon />}
            onClick={handlePreview}
            sx={{
              backgroundColor: colors.green100,
              color: colors.green800,
              "&:hover": {
                backgroundColor: colors.green100,
                color: colors.green800,
              },
            }}
          >
            {t("common.preview")}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add size={20} />}
            onClick={handleAddProject}
            sx={{
              borderRadius: "8px",
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary800,
              },
            }}
          >
            {t("profile.portfolio.add_title")}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ width: "100%", mb: 4 }} />

      <PortfolioList
        status={currentTab}
        portfolios={portfolios}
        loading={loading}
        onStatusChange={handleTabChange}
        onEdit={handleEditProject}
        onDelete={handleLocalDelete}
        onPortfolioUpdated={handlePortfolioUpdated}
      />
    </Box>
  );
}
