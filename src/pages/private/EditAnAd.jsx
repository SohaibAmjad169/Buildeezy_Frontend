import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { cloneDeep, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { ArrowLeft } from "iconsax-react";

import MuiTypography from "../../components/common/MuiTypography";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import { ROUTES } from "../../utils/constants/route";
import PostAnAd from "./PostAnAd";
import useFetchAdDetails from "../../hooks/useFetchAdDetails";
import { AD_QUESTIONS, DESIGN_QUESTIONS } from "../../utils/constants/ad";
import { setPostAdData } from "../../redux/adSlice";
import { getLabelFromId } from "../../utils/common";
import { FIELD_TYPES } from "../../utils/constants/login";

function EditAnAd() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { adDetails } = useSelector((state) => state.ad);

  const { fetchAdById } = useFetchAdDetails();

  const pastLinks = [
    {
      label: t("breadcrumbs.my_ads"),
      path: "/" + ROUTES.myAds,
    },
  ];
  const activeLink = {
    label: getLabelFromId(adDetails?.adType, "adType"),
  };

  useEffect(() => {
    fetchAdById(id);
  }, [fetchAdById, id]);

  // useEffect(() => {
  //   if (!isEmpty(adDetails)) {
  //     const newAdQuestions = cloneDeep(AD_QUESTIONS);
  //     newAdQuestions.forEach((question) => {
  //       if (question.child && adDetails[question.id] === "pickADate") {
  //         question.value = adDetails[question.id] ?? "";
  //         question.child.show = true;
  //         question.child.data[0].value = adDetails[question.child.data[0].id];
  //         question.child.data[1].value = adDetails[question.child.data[1].id];
  //       } else if (question.id === "audience") {
  //         question.value = adDetails[question.id] ?? "";
  //         const fieldProfessionalIndex = newAdQuestions.findIndex(
  //           (el) => el.id === "professionalType"
  //         );
  //         if (question.value.length === 1 && question.value[0] === "client") {
  //           newAdQuestions.splice(fieldProfessionalIndex, 1);
  //         }
  //       } else {
  //         question.value = adDetails[question.id] ?? "";
  //       }
  //     });
  //     dispatch(setPostAdData(newAdQuestions));
  //   }
  // }, [dispatch, adDetails]);


  // useEffect(() => {
  //   if (!isEmpty(adDetails)) {
  //     // Initialize both AD_QUESTIONS and DESIGN_QUESTIONS
  //     const newAdQuestions = cloneDeep(AD_QUESTIONS);
  //     const newDesignQuestions = cloneDeep(DESIGN_QUESTIONS);

  //     // Map AD_QUESTIONS with adDetails
  //     newAdQuestions.forEach((question) => {
  //       if (question.child && adDetails[question.id] === "pickADate") {
  //         question.value = adDetails[question.id] ?? "";
  //         question.child.show = true;
  //         question.child.data[0].value = adDetails[question.child.data[0].id];
  //         question.child.data[1].value = adDetails[question.child.data[1].id];
  //       } else if (question.id === "audience") {
  //         question.value = adDetails[question.id] ?? "";
  //         const fieldProfessionalIndex = newAdQuestions.findIndex(
  //           (el) => el.id === "professionalType"
  //         );
  //         if (question.value.length === 1 && question.value[0] === "client") {
  //           newAdQuestions.splice(fieldProfessionalIndex, 1);
  //         }
  //       } else {
  //         question.value = adDetails[question.id] ?? "";
  //       }
  //     });

  //     // Map DESIGN_QUESTIONS with adDetails
  //     newDesignQuestions.forEach((question) => {
  //       // Map design field values from adDetails
  //       if (adDetails[question.id] !== undefined) {
  //         question.value = adDetails[question.id];
  //       } else {
  //         // Set default values for design questions
  //         question.value = question.defaultValue || question.value ||
  //           (question.type === FIELD_TYPES.multipleSelect ? [] : "");
  //       }

  //       // Ensure show function is properly set for design fields
  //       if (question.show) {
  //         // Keep the original show function
  //         question.show = question.show;
  //       }
  //     });

  //     // Combine both AD_QUESTIONS and DESIGN_QUESTIONS
  //     dispatch(setPostAdData([...newAdQuestions, ...newDesignQuestions]));
  //   }
  // }, [dispatch, adDetails]);

  useEffect(() => {
    if (!isEmpty(adDetails)) {
      // Initialize both AD_QUESTIONS and DESIGN_QUESTIONS
      const newAdQuestions = cloneDeep(AD_QUESTIONS);
      const newDesignQuestions = cloneDeep(DESIGN_QUESTIONS);

      // Map AD_QUESTIONS with adDetails
      newAdQuestions.forEach((question) => {
        if (question.child && adDetails[question.id] === "pickADate") {
          question.value = adDetails[question.id] ?? "";
          question.child.show = true;
          question.child.data[0].value = adDetails[question.child.data[0].id];
          question.child.data[1].value = adDetails[question.child.data[1].id];
        } else if (question.id === "audience") {
          question.value = adDetails[question.id] ?? "";
          const fieldProfessionalIndex = newAdQuestions.findIndex(
            (el) => el.id === "professionalType"
          );
          if (question.value.length === 1 && question.value[0] === "client") {
            newAdQuestions.splice(fieldProfessionalIndex, 1);
          }
        } else {
          question.value = adDetails[question.id] ?? "";
        }
      });

      // Map DESIGN_QUESTIONS with adDetails
      newDesignQuestions.forEach((question) => {
        // Map design field values from adDetails
        if (adDetails[question.id] !== undefined) {
          if (question.id === "displayOnDashboard") {
            // Map true/false to 'yes'/'no' for select field
            if (adDetails[question.id] === true) {
              question.value = "yes";
            } else if (adDetails[question.id] === false) {
              question.value = "no";
            } else {
              question.value = adDetails[question.id];
            }
          } else {
            question.value = adDetails[question.id];
          }
        } else {
          // Set default values for design questions
          question.value = question.defaultValue || question.value ||
            (question.type === FIELD_TYPES.multipleSelect ? [] : "");
        }

        // Ensure show function is properly set for design fields
        if (question.show) {
          // Keep the original show function
          question.show = question.show;
        }
      });

      // Combine both AD_QUESTIONS and DESIGN_QUESTIONS
      dispatch(setPostAdData([...newAdQuestions, ...newDesignQuestions]));
    }
  }, [dispatch, adDetails]);

  function navigateBack() {
    navigate(-1);
  }

  return (
    <>
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
          <Stack direction={"row"} alignItems={"center"} spacing={2} mb={2}>
            <ArrowLeft
              size="20"
              style={{ cursor: "pointer" }}
              onClick={navigateBack}
            />
            <MuiTypography variant="h2">{t("ad.edit_an_ad")}</MuiTypography>
          </Stack>
          <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
        </Box>
      </Box>
      <PostAnAd isEdit={true} adId={id} />
    </>
  );
}

export default EditAnAd;
