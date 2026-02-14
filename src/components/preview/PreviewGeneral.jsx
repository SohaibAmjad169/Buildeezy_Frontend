import { Box, Typography, Stack, Chip, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { colors } from "../../styles/theme";
import PreviewPortfolio from "./PreviewPortfolio";
import PreviewReviews from "./PreviewReviews";
import { SKILLS_OPTIONS } from "../profile/design/DesignTab.constants";

// Default skills to show when no skills are selected
const DEFAULT_SKILLS = ["residential", "commercial", "electrical"];

const PreviewGeneral = ({ data }) => {
  const { t } = useTranslation();

  const renderSection = (title, children) => (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
        pl: { xs: 2, sm: 4, md: 8, lg: 23 },
        pr: { xs: 2, sm: 4, md: 8, lg: 25 },
        borderRadius: 2,
        bgcolor: "transparent",
      }}
    >
      <Typography variant="h2" sx={{ mb: 2, color: colors.primary }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );

  const renderInfoItem = (icon, text) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      {icon}
      <Typography variant="body1" sx={{ color: colors.primary }}>
        {text || t("profile.preview.placeholder")}
      </Typography>
    </Stack>
  );

  const renderAffiliationItem = (title, subtitle, description) => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <AccountBalanceIcon sx={{ color: colors.primary }} />
        <Typography variant="h6" sx={{ color: colors.primary }}>
          {title}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, ml: 8 }}
      >
        <Typography variant="body1" sx={{ color: colors.primary }}>
          {subtitle}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.primary }}>
          •
        </Typography>
        <Typography variant="body2" sx={{ color: colors.primary }}>
          {description}
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Box>
      {/* Description */}
      {renderSection(
        t("profile.preview.description"),
        <Typography variant="body1" sx={{ color: colors.primary }}>
          {data?.user?.description ||
            "I'm a broker with 10 years experience to solve problems and answer your needs for your property."}
        </Typography>
      )}

      {/* Skills/Categories */}
      {renderSection(
        t("profile.preview.skills.title"),
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {data?.user?.skills?.length > 0
            ? data.user.skills.map((skillId) => {
                const skill = SKILLS_OPTIONS.find((s) => s.id === skillId);
                if (!skill) return null;
                return (
                  <Chip
                    key={skillId}
                    label={skill.label}
                    size="small"
                    sx={{
                      bgcolor: `${colors.primary}10`,
                      color: colors.primary,
                      borderRadius: "20px",
                      border: `1px solid ${colors.primary}`,
                      px: 2,
                    }}
                  />
                );
              })
            : DEFAULT_SKILLS.map((skillId) => {
                const skill = SKILLS_OPTIONS.find((s) => s.id === skillId);
                if (!skill) return null;
                return (
                  <Chip
                    key={skillId}
                    label={skill.label}
                    size="small"
                    sx={{
                      bgcolor: `${colors.primary}10`,
                      color: colors.primary,
                      borderRadius: "20px",
                      border: `1px solid ${colors.primary}`,
                      px: 2,
                    }}
                  />
                );
              })}
        </Stack>
      )}

      {/* Contact Info */}
      {renderSection(
        t("profile.preview.contact.title"),
        <Stack spacing={2}>
          {renderInfoItem(
            <EmailIcon sx={{ color: colors.primary }} />,
            data?.user?.email
          )}
          {renderInfoItem(
            <PhoneIcon sx={{ color: colors.primary }} />,
            data?.user?.phone
          )}
        </Stack>
      )}

      {/* Operating Hours */}
      {renderSection(
        t("profile.preview.operating_hours.title"),
        <Stack spacing={2}>
          {renderInfoItem(
            <AccessTimeIcon sx={{ color: colors.primary }} />,
            data?.user?.availability ||
              t("profile.preview.operating_hours.default")
          )}
        </Stack>
      )}

      {/* Company Details */}
      {renderSection(
        t("profile.preview.company_details.title"),
        <Stack spacing={2}>
          {renderInfoItem(
            <LanguageIcon sx={{ color: colors.primary }} />,
            data?.user?.website || "brokercompany.com"
          )}
          {renderInfoItem(
            <LocalShippingIcon sx={{ color: colors.primary }} />,
            data?.user?.location || "Anza Street, 8th Avenue, San Fransisco"
          )}
          {renderInfoItem(
            <EmailIcon sx={{ color: colors.primary }} />,
            data?.user?.email || "contact@brokercompany.com"
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalShippingIcon sx={{ color: colors.primary }} />
            <Typography variant="body1" sx={{ color: colors.primary }}>
              {data?.user?.delivery
                ? t("profile.preview.company_details.delivery_available")
                : t("profile.preview.company_details.no_delivery")}
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Professional Affiliations */}
      {renderSection(
        t("profile.preview.professional_affiliations.title"),
        <Stack spacing={2}>
          {data?.user?.professionalAffiliations ? (
            data.user.professionalAffiliations.map((affiliation, index) => (
              <Box key={index}>
                {renderAffiliationItem(
                  affiliation.title,
                  affiliation.subtitle,
                  affiliation.memberSince
                )}
                <Typography
                  variant="body2"
                  sx={{ color: colors.primary, ml: 4, mb: 2 }}
                >
                  {affiliation.description}
                </Typography>
              </Box>
            ))
          ) : (
            <>
              <Box>
                {renderAffiliationItem(
                  t(
                    "profile.preview.professional_affiliations.defaults.ireb.title"
                  ),
                  t(
                    "profile.preview.professional_affiliations.defaults.ireb.subtitle"
                  ),
                  t(
                    "profile.preview.professional_affiliations.defaults.ireb.member_since"
                  )
                )}
                <Typography
                  variant="body2"
                  sx={{ color: colors.primary, ml: 4, mb: 2 }}
                >
                  {t(
                    "profile.preview.professional_affiliations.defaults.ireb.description"
                  )}
                </Typography>
              </Box>
              <Box>
                {renderAffiliationItem(
                  t(
                    "profile.preview.professional_affiliations.defaults.nab.title"
                  ),
                  t(
                    "profile.preview.professional_affiliations.defaults.nab.subtitle"
                  ),
                  t(
                    "profile.preview.professional_affiliations.defaults.nab.member_since"
                  )
                )}
                <Typography
                  variant="body2"
                  sx={{ color: colors.primary, ml: 4, mb: 2 }}
                >
                  {t(
                    "profile.preview.professional_affiliations.defaults.nab.description"
                  )}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      )}

      {/* Certifications */}
      {renderSection(
        t("profile.preview.certifications.title"),
        <Stack spacing={2}>
          {data?.user?.certifications ? (
            data.user.certifications.map((cert, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <SchoolIcon sx={{ color: colors.primary }} />
                <Typography variant="body1" sx={{ color: colors.primary }}>
                  {cert.title}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary }}>
                  •
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary }}>
                  {cert.year}
                </Typography>
              </Stack>
            ))
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <SchoolIcon sx={{ color: colors.primary }} />
              <Typography variant="body1" sx={{ color: colors.primary }}>
                {t(
                  "profile.preview.certifications.defaults.interior_design.title"
                )}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.primary }}>
                •
              </Typography>
              <Typography variant="body2" sx={{ color: colors.primary }}>
                {t(
                  "profile.preview.certifications.defaults.interior_design.year"
                )}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      {/* Awards */}
      {renderSection(
        t("profile.preview.awards.title"),
        <Stack spacing={2}>
          {data?.user?.awards ? (
            data.user.awards.map((award, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <EmojiEventsIcon sx={{ color: colors.primary }} />
                <Typography variant="body1" sx={{ color: colors.primary }}>
                  {award.title}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary }}>
                  •
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary }}>
                  {award.year}
                </Typography>
              </Stack>
            ))
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <EmojiEventsIcon sx={{ color: colors.primary }} />
              <Typography variant="body1" sx={{ color: colors.primary }}>
                {t("profile.preview.awards.defaults.architect.title")}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.primary }}>
                •
              </Typography>
              <Typography variant="body2" sx={{ color: colors.primary }}>
                {t("profile.preview.awards.defaults.architect.year")}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      {/* Projects */}
      {renderSection(
        t("profile.preview.projects.title"),
        <Stack spacing={2}>
          {data?.user?.projects ? (
            data.user.projects.map((project, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <WorkIcon sx={{ color: colors.primary }} />
                <Typography variant="body1" sx={{ color: colors.primary }}>
                  {project.title}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary }}>
                  •
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary }}>
                  {project.year}
                </Typography>
              </Stack>
            ))
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkIcon sx={{ color: colors.primary }} />
              <Typography variant="body1" sx={{ color: colors.primary }}>
                {t("profile.preview.projects.defaults.government.title")}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.primary }}>
                •
              </Typography>
              <Typography variant="body2" sx={{ color: colors.primary }}>
                {t("profile.preview.projects.defaults.government.year")}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      {/* Portfolio */}
      {renderSection(
        t("profile.portfolio.title"),
        <PreviewPortfolio portfolioData={data?.user?.portfolio} />
      )}

      {/* Reviews */}
      {renderSection(
        t("profile.reviews"),
        <PreviewReviews reviewsData={data?.user?.reviews} />
      )}
    </Box>
  );
};

export default PreviewGeneral;
