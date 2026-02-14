import { Avatar, Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Calendar, Location, Wallet3, Note1, Notepad2 } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";
import DocList from "../upload/DocList";
import MuiChip from "../common/MuiChip";
import { useMemo } from "react";
import MuiTypography from "../common/MuiTypography";
import { JOB_DETAILS_CHIPS } from "../../utils/constants/job";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CallIcon from "@mui/icons-material/Call";
import { useSelector } from "react-redux";

import {
  getLabelFromId,
  mapJobState,
  mapOtherFieldId,
} from "../../utils/common";
import { useLocation } from "react-router-dom";

dayjs.extend(relativeTime);

const renderChip = (labelKey, id, jobDetails, t) => {
  if (!jobDetails[id]) {
    return null;
  }

  const label = t(labelKey)

  let updatedValue = jobDetails[id];
  if (jobDetails[id] === "others") {
    updatedValue = jobDetails?.[mapOtherFieldId[id]];
  }

  return (
    <MuiChip
      value={`${label} : ${getLabelFromId(updatedValue, id) || t("n/a")} `}
    />
  );
};

// Utility to format category string
function formatCategory(category) {
  if (!category) return "";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ViewJobDetails({
  jobDetails,
  showClient = true,
  showContractor = false,
  talentUser = null,
  allUsers = [],
  invitation,
}) {

  const location = useLocation();
  const isViewPage = location.pathname.startsWith("/my-contracts/view/");

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userList } = useSelector((state) => state.pubnub);
  const { profileData } = useSelector((state) => state.profile);

  const getSpecifiedDetails =
    jobDetails?.specifyDetails
      ?.map((item) =>
        item === "others"
          ? jobDetails?.otherSpecifyDetails
          : getLabelFromId(item, "specifyDetails")
      )
      .join(", ") || t("n/a");

  const getRequirements = useMemo(() => {
    let requirements = jobDetails?.jobsToBeDone;
    if (requirements === "others") {
      requirements = jobDetails?.[mapOtherFieldId["jobsToBeDone"]];
    }
    let reqLabel = getLabelFromId(requirements, "jobsToBeDone");
    // For general job type, jobsToBeDone is the material supply field
    if (jobDetails?.title === "general") {
      // Map to MATERIAL_SUPPLY_OPTIONS label
      const materialOption = [
        {
          id: "youEstimateAndISupply",
          labelKey: "job.material_supply_you_estimate_i_supply",
        },
        {
          id: "youEstimateAndYouSupply",
          labelKey: "job.material_supply_you_estimate_you_supply",
        },
        { id: "alreadyAvailable", labelKey: "job.material_supply_already_available" },
      ].find((opt) => opt.id === requirements);
      reqLabel = materialOption ? t(materialOption.labelKey) : reqLabel;
    } else if (jobDetails?.materialSupply) {
      // fallback to previous logic for other job types
      let materialSupplyText = "";
      if (jobDetails.materialSupply === "youEstimateAndISupply") {
        materialSupplyText = "I estimate materials and you supply";
      } else if (jobDetails.materialSupply === "youEstimateAndYouSupply") {
        materialSupplyText = "You estimate materials and you supply";
      } else if (jobDetails.materialSupply === "alreadyAvailable") {
        materialSupplyText = "All materials available";
      }
      reqLabel = reqLabel
        ? `${reqLabel}, ${materialSupplyText}`
        : materialSupplyText;
    }
    return reqLabel;
  }, [jobDetails, t]);

  if (!jobDetails) return null;

  return (
    <Box sx={{ my: 2.5 }}>
      <Stack direction={"row"} spacing={2} alignItems={"center"} mb={2}>
        <MuiTypography variant="h2" sx={{ mb: 2, color: "primary.main" }}>
          {/* {getLabelFromId(jobDetails?.title, "title")} */}
          {invitation?.title || getLabelFromId(jobDetails?.title, "title")}
        </MuiTypography>
        {jobDetails?.state && (
          <MuiChip value={mapJobState[jobDetails?.state]} />
        )}
      </Stack>

      <MuiTypography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
        {t("job.details.job_description")}
      </MuiTypography>

      {/* {jobDetails?.comments ? (
        <MuiTypography variant="descriptionText">
          {jobDetails?.comments}
        </MuiTypography>
      ) : (
        <MuiTypography variant="subtitle2">{t("no_comments")}</MuiTypography>
      )} */}

      {invitation?.comments ? (
        <MuiTypography variant="descriptionText">
          {invitation?.comments}
        </MuiTypography>
      ) : (
        <MuiTypography variant="subtitle2">{t("no_comments")}</MuiTypography>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          mt: 2,
        }}
      >
        <MuiChip
          value={
            getLabelFromId(
              jobDetails?.startTimePreference,
              "startTimePreference"
            ) || t("n/a")
          }
          id="startTimePreference"
          showDot={true}
        />
        {jobDetails?.areaSize && (
          <MuiChip value={jobDetails?.areaSize} id="areaSize" showDot={true} />
        )}
        {/* Show site preparation chip for general job type using 'units' field */}
        {jobDetails?.title === "general" &&
          typeof jobDetails?.units !== "undefined" &&
          jobDetails?.units !== "" && (
            <MuiChip
              value={
                jobDetails?.units === "yes"
                  ? t("job.site_preparation_required")
                  : t("job.site_preparation_not_required")
              }
              id="sitePreparation"
              showDot={true}
            />
          )}
        {jobDetails?.newConstruction === "yes" && (
          <MuiChip
            value={t("job.new_construction_chip")}
            id="newConstruction"
            showDot={true}
          />
        )}
        {JOB_DETAILS_CHIPS[jobDetails?.title]?.map(({ id, labelKey }) => (
          <Fragment key={id}>{renderChip(labelKey, id, jobDetails, t)}</Fragment>
        ))}
        {jobDetails && "noOfBids" in jobDetails && (
          <MuiChip
            value={`${jobDetails?.noOfBids} ${jobDetails?.noOfBids <= 1
              ? t("job.details.bid")
              : t("job.details.bids")
              }`}
          />
        )}
      </Box>

      <Stack mt={2} spacing={2}>
        <MuiTypography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
          {t("job.details.job_specification")}
        </MuiTypography>

        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Calendar size={22} />
          <Box>
            <MuiTypography
              variant="subtitle2"
              className="text-ellipsis"
              sx={{ fontSize: "0.75rem" }}
            >
              {t("job.details.created_at")}
            </MuiTypography>
            <MuiTypography
              variant="h6"
              className="text-ellipsis"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
              }}
            >
              {dayjs(jobDetails?.createdAt).format("DD MMM YYYY")}
            </MuiTypography>
          </Box>
        </Stack>

        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Location size={22} />
          <Box>
            <MuiTypography
              variant="subtitle2"
              className="text-ellipsis"
              sx={{ fontSize: "0.75rem" }}
            >
              {t("job.details.work_location")}
            </MuiTypography>
            <MuiTypography
              variant="h6"
              className="text-ellipsis"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
              }}
            >
              {jobDetails?.city?.name || t("n/a")},{" "}
              {jobDetails?.country?.name || t("n/a")}
            </MuiTypography>
          </Box>
        </Stack>

        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Wallet3 size={22} />
          <Box>
            <MuiTypography
              variant="subtitle2"
              className="text-ellipsis"
              sx={{ fontSize: "0.75rem" }}
            >
              {t("job.details.budget")}
            </MuiTypography>
            <MuiTypography
              variant="h6"
              className="text-ellipsis"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
              }}
            >
              {(() => {
                return jobDetails?.budget ? `$${jobDetails.budget}` : t("n/a");
              })()}
            </MuiTypography>
          </Box>
        </Stack>

        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Note1 size={22} />
          <Box>
            <MuiTypography
              variant="subtitle2"
              className="text-ellipsis"
              sx={{ fontSize: "0.75rem" }}
            >
              {t("job.details.requirements")}
            </MuiTypography>
            <MuiTypography
              variant="h6"
              className="text-ellipsis"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
              }}
            >
              {getRequirements}
            </MuiTypography>
          </Box>
        </Stack>

        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Notepad2 size={22} />
          <Box>
            <MuiTypography
              variant="subtitle2"
              className="text-ellipsis"
              sx={{ fontSize: "0.75rem" }}
            >
              {t("job.details.other_details")}
            </MuiTypography>
            <MuiTypography
              variant="h6"
              className="text-ellipsis"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
              }}
            >
              {getSpecifiedDetails}
            </MuiTypography>
          </Box>
        </Stack>
      </Stack>

      {/* Talent or Client section */}
      {talentUser && (
        <Box sx={{ mt: 3 }}>
          <MuiTypography variant="h3" sx={{ mb: 1.5 }}>
            {t("job.details.contractor_details")}
          </MuiTypography>
          <Stack
            direction={"row"}
            spacing={1}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Avatar
                src={
                  talentUser.avatar
                    ? talentUser.avatar.startsWith("http")
                      ? talentUser.avatar
                      : `https://useruploads-development.buildeezy.com/${talentUser.avatar}`
                    : ""
                }
                alt="profile"
                sx={{
                  width: 48,
                  height: 48,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (talentUser.id) {
                    navigate(`/dashboard/view/${talentUser.id}/profile`);
                  }
                }}
              />
              <Box>
                <MuiTypography
                  variant="h6"
                  className="text-ellipsis"
                  sx={{
                    maxWidth: { xs: 276, sm: 400 },
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    fontSize: "0.8rem",
                  }}
                >
                  {talentUser.firstName} {talentUser.lastName}
                </MuiTypography>
                {talentUser.city?.name && talentUser.country?.name && (
                  <MuiTypography
                    variant="subtitle2"
                    className="text-ellipsis"
                    sx={{ maxWidth: { xs: 276, sm: 400 }, fontSize: "0.75rem" }}
                  >
                    {talentUser.city.name}, {talentUser.country.name}
                  </MuiTypography>
                )}
                {/* Category from /users */}
                {(() => {
                  const user = allUsers.find(
                    (u) => String(u.id) === String(talentUser.id)
                  );
                  const category = user?.category || talentUser.category;
                  return category ? (
                    <MuiTypography
                      variant="subtitle2"
                      className="text-ellipsis"
                      sx={{
                        maxWidth: { xs: 276, sm: 400 },
                        fontSize: "0.75rem",
                      }}
                    >
                      {formatCategory(category)}
                    </MuiTypography>
                  ) : null;
                })()}
              </Box>
            </Stack>
            {talentUser?.id !== profileData?.id && isViewPage && (
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                {/* Chat Icon Box */}
                <Box
                  sx={{
                    border: "1px solid #709A1C", // Green outline
                    px: 1, // Reduced padding
                    py: 1,
                    borderRadius: "8px", // Slightly smaller radius
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 2,
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(112,154,28,0.1)", // subtle green hover
                    },
                  }}
                  onClick={() => {
                    const chatUser = userList?.find(
                      (u) => String(u.id) === String(talentUser?.id)
                    );
                    const navState = chatUser
                      ? {
                        chatUserId: chatUser.id,
                        chatUserName: `${chatUser.firstName || ""} ${chatUser.lastName || ""
                          }`.trim(),
                        avatar: chatUser.avatar,
                      }
                      : {
                        chatUserId: talentUser?.id,
                        chatUserName: `${talentUser?.firstName || ""} ${talentUser?.lastName || ""
                          }`.trim(),
                        avatar: talentUser?.avatar,
                      };
                    navigate("/message", { state: navState });
                  }}
                >
                  <ChatBubbleOutlineIcon
                    sx={{ color: "#709A1C", fontSize: "20px" }}
                  />
                </Box>

                {/* Call Icon Box */}
                <Box
                  sx={{
                    border: "1px solid #709A1C",
                    px: 1,
                    py: 1,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 2,
                    cursor: "not-allowed",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(112,154,28,0.1)",
                    },
                  }}
                >
                  <CallIcon
                    sx={{
                      color: "#709A1C",
                      fontSize: "20px",
                      cursor: "not-allowed",
                    }}
                  />
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      )}
      {showClient && jobDetails.author && (
        <Box sx={{ mt: 3 }}>
          <MuiTypography variant="h3" sx={{ mb: 1.5 }}>
            {t("job.details.client_details")}
          </MuiTypography>
          <Stack
            direction={"row"}
            spacing={1}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Avatar
                src={
                  jobDetails.author.avatar
                    ? jobDetails.author.avatar.startsWith("http")
                      ? jobDetails.author.avatar
                      : `https://useruploads-development.buildeezy.com/${jobDetails.author.avatar}`
                    : ""
                }
                alt="profile"
                sx={{
                  width: 48,
                  height: 48,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (jobDetails.author.id) {
                    navigate(`/dashboard/view/${jobDetails.author.id}/profile`);
                  }
                }}
              />
              <Box>
                <MuiTypography
                  variant="h6"
                  className="text-ellipsis"
                  sx={{
                    maxWidth: { xs: 276, sm: 400 },
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    fontSize: "0.8rem",
                  }}
                >
                  {jobDetails.author.firstName} {jobDetails.author.lastName}
                </MuiTypography>
                {/* Show client category if available, using allUsers lookup */}
                {(() => {
                  const user = allUsers.find(
                    (u) => String(u.id) === String(jobDetails.author.id)
                  );
                  const category = user?.category || jobDetails.author.category;
                  return category ? (
                    <MuiTypography
                      variant="subtitle2"
                      className="text-ellipsis"
                      sx={{
                        maxWidth: { xs: 276, sm: 400 },
                        fontSize: "0.75rem",
                      }}
                    >
                      {formatCategory(category)}
                    </MuiTypography>
                  ) : null;
                })()}
              </Box>
            </Stack>
            {isViewPage && (
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Box
                  sx={{
                    border: "1px solid #709A1C", // Green outline
                    px: 1, // Reduced padding
                    py: 1,
                    borderRadius: "8px", // Slightly smaller radius
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 2,
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(112,154,28,0.1)", // subtle green hover
                    },
                  }}
                  onClick={() => {
                    // Handle contact action
                    const chatUser = userList?.find(
                      (u) => String(u.id) === String(jobDetails?.author?.id)
                    );
                    if (!chatUser) {
                      console.warn(
                        "[Contact Button] User not found in userList:",
                        jobDetails.author?.id
                      );
                    } else {
                      console.log(
                        "[Contact Button] Found user in userList:",
                        chatUser
                      );
                    }
                    const navState = chatUser
                      ? {
                        chatUserId: chatUser.id,
                        chatUserName: `${chatUser.firstName || ""} ${chatUser.lastName || ""
                          }`.trim(),
                        avatar: chatUser.avatar,
                      }
                      : {
                        chatUserId: jobDetails.author?.id,
                        chatUserName: `${jobDetails?.author?.firstName || ""
                          } ${jobDetails?.author?.lastName || ""}`.trim(),
                        avatar: jobDetails?.author?.avatar,
                      };
                    navigate("/message", { state: navState });
                  }}
                >
                  <ChatBubbleOutlineIcon
                    sx={{ color: "#709A1C", fontSize: "20px" }}
                  />
                </Box>
                {/* Call Icon Box */}
                <Box
                  sx={{
                    border: "1px solid #709A1C",
                    px: 1,
                    py: 1,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 2,
                    cursor: "not-allowed",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(112,154,28,0.1)",
                    },
                  }}
                >
                  <CallIcon
                    sx={{
                      color: "#709A1C",
                      fontSize: "20px",
                      cursor: "not-allowed",
                    }}
                  />
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      )}
      {showContractor && jobDetails.contractor && (
        <Box sx={{ mt: 3 }}>
          <MuiTypography variant="h3" sx={{ mb: 1.5 }}>
            {t("job.details.contractor_details")}
          </MuiTypography>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Avatar
              src={
                jobDetails.contractor.avatar
                  ? jobDetails.contractor.avatar.startsWith("http")
                    ? jobDetails.contractor.avatar
                    : `https://useruploads-development.buildeezy.com/${jobDetails.contractor.avatar}`
                  : ""
              }
              alt="profile"
              sx={{
                width: 48,
                height: 48,
                cursor: "pointer",
              }}
              onClick={() => {
                if (jobDetails.contractor.id) {
                  navigate(
                    `/dashboard/view/${jobDetails.contractor.id}/profile`
                  );
                }
              }}
            />
            <Box>
              <MuiTypography
                variant="h6"
                className="text-ellipsis"
                sx={{
                  maxWidth: { xs: 276, sm: 400 },
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {jobDetails.contractor.firstName}{" "}
                {jobDetails.contractor.lastName}
              </MuiTypography>
              {jobDetails.contractor.category && (
                <MuiTypography
                  variant="subtitle2"
                  className="text-ellipsis"
                  sx={{ maxWidth: { xs: 276, sm: 400 }, fontSize: "0.75rem" }}
                >
                  {formatCategory(jobDetails.contractor.category)}
                </MuiTypography>
              )}
            </Box>
          </Stack>
        </Box>
      )}

      <Stack mt={2}>
        <MuiTypography variant="h3" sx={{ fontWeight: 600, mb: 1.5 }}>
          {t("job.details.additional_docs")}
        </MuiTypography>
      </Stack>
      <DocList documents={jobDetails?.documents} />
    </Box>
  );
}

export default ViewJobDetails;
