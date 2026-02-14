import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import {
  getPortfolioUrl,
  getUserUrl,
  PortfolioDetails,
} from "../../apis/apiEndPoints";
import { SKILLS_OPTIONS } from "../../components/profile/design/DesignTab.constants";
import BackButton from "../../components/common/BackButton";

export default function ViewPortfolioPage() {
  const { projectId } = useParams();
  const { profileData } = useSelector((state) => state.profile);
  const userId = profileData?.userId || profileData?.id;
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);


  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        if (!userId) throw new Error("User not found");
        const response = await getPortfolioUrl(userId);
        const portfolios = response.data?.data || response.data;
        const found = portfolios.find(
          (p) => String(p.projectId) === String(projectId)
        );
        setPortfolio(found);
        setError(null);
        if (found === undefined || found === null) {
          const response = await PortfolioDetails(projectId);
          setPortfolio(response?.data?.data);
          setError(null);
        }
      } catch (err) {
        setError(err.message || "Failed to load portfolio");
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [userId, projectId]);

  // Fetch user details for avatar and name
  useEffect(() => {
    const fetchUser = async () => {
      if (portfolio?.user?.userId) {
        try {
          const res = await getUserUrl(portfolio.user.userId);
          setUserDetails(res.data.data);
        } catch {
          setUserDetails(null);
        }
      }
    };
    fetchUser();
  }, [portfolio?.user?.userId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!portfolio) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Portfolio not found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, md: 3 },
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center" 
      >
        <MuiBreadcrumbs
          pastLinks={[{ label: "Portfolio", path: "/profile?portfolio=1" }]}
          activeLink={{ label: "Portfolio Details" }}
        />
        <BackButton
          sx={{
            marginBottom: "0.2rem",
          }}
        />
      </Box>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 3,
          p: { xs: 2, md: 4 },
        }}
      >
        {/* Main Image Section */}
        {portfolio.thumbnail && (
          <Box
            sx={{
              width: "100%",
              height: { xs: 200, md: 400 },
              mb: 3,
              borderRadius: { xs: 2, md: 4 },
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.100",
            }}
          >
            <Box
              component="img"
              src={portfolio.thumbnail}
              alt="Portfolio Main"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: { xs: 2, md: 4 },
              }}
            />
          </Box>
        )}
        {/* Title & Status Section */}
        <Typography
          variant="h1"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: "1.7rem", md: "2.2rem" },
            lineHeight: 1.2,
          }}
        >
          {portfolio.title || "Untitled Project"}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "primary.main",
              fontWeight: 500,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
            }}
          >
            {portfolio.role || "No Role"}
          </Typography>
        </Stack>
        {/* Add extra space before Description section */}
        <Box sx={{ mt: 4 }} />
        {/* Description Section */}
        <Typography
          variant="h3"
          sx={{
            color: "primary.main",
            fontWeight: 500,
            mb: 2,
            fontSize: { xs: "1.1rem", md: "1.3rem" },
          }}
        >
          Description
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ mb: 3, color: "primary.main" }}
        >
          {portfolio.description || "No description available"}
        </Typography>
        {/* Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h3"
              sx={{
                color: "primary.main",
                fontWeight: 500,
                mb: 1,
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {portfolio.skills.map((skillId) => {
                const skill = SKILLS_OPTIONS.find((s) => s.id === skillId);
                if (!skill) return null;
                return (
                  <Chip
                    key={skillId}
                    label={skill.label}
                    sx={{
                      bgcolor: "primary.main" + "10",
                      color: "primary.main",
                      borderRadius: "20px",
                      border: `1px solid #709a1c`,
                      px: 2,
                      fontFamily: "inherit",
                      height: 36,
                      fontSize: "1rem",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
        {/* Files Section */}
        {portfolio.files && portfolio.files.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h3"
              sx={{
                color: "primary.main",
                fontWeight: 500,
                mb: 1,
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Files
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 2, mb: 2, fontSize: "0.92rem", lineHeight: 1.3, m: 0 }}
            >
              {portfolio.files
                .filter(
                  (f) =>
                    (typeof f === "object" && f?.url) ||
                    (typeof f === "string" && f)
                )
                .map((f, i) => {
                  const url = typeof f === "object" ? f.url : f;
                  const name =
                    typeof f === "object"
                      ? f.name || f.url?.split("/").pop()
                      : f.split("/").pop();
                  return (
                    <li
                      key={url + i}
                      style={{
                        marginBottom: 2,
                        padding: 0,
                        listStyle: "disc inside",
                      }}
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#709a1c",
                          textDecoration: "underline",
                          fontSize: "inherit",
                        }}
                      >
                        {name || "Download file"}
                      </a>
                    </li>
                  );
                })}
            </Box>
          </Box>
        )}
        {/* User Section */}
        {userDetails && (
          <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={userDetails.avatar} sx={{ bgcolor: "primary.main" }}>
              {userDetails.firstName?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ color: "primary.main" }}
              >
                {userDetails.firstName} {userDetails.lastName}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
