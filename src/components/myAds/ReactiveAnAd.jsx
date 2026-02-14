// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { cloneDeep, isEmpty } from "lodash";
// import { useTranslation } from "react-i18next";
// import { Box, Stack } from "@mui/material";
// import { ArrowLeft } from "iconsax-react";

// import MuiTypography from "../common/MuiTypography";
// import MuiBreadcrumbs from "../common/Breadcrumbs";
// import { ROUTES } from "../../utils/constants/route";
// import useFetchAdDetails from "../../hooks/useFetchAdDetails";
// import { AD_QUESTIONS } from "../../utils/constants/ad";
// import { setPostAdData } from "../../redux/adSlice";
// import { getLabelFromId } from "../../utils/common";
// import PostAnAd from "../../pages/private/PostAnAd";

// function ReactiveAnAd() {
//   const { id } = useParams();
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   const dispatch = useDispatch();

//   const { adDetails } = useSelector((state) => state.ad);

//   const { fetchAdById } = useFetchAdDetails();

//   const pastLinks = [
//     {
//       label: t("breadcrumbs.my_ads"),
//       path: "/" + ROUTES.myAds,
//     },
//   ];
//   const activeLink = {
//     label: getLabelFromId(adDetails?.adType, "adType"),
//   };

//   useEffect(() => {
//     fetchAdById(id);
//   }, [fetchAdById, id]);

//   useEffect(() => {
//     if (!isEmpty(adDetails)) {
//       const newAdQuestions = cloneDeep(AD_QUESTIONS);
//       newAdQuestions.forEach((question) => {
//         if (question.child && adDetails[question.id] === "pickADate") {
//           question.value = adDetails[question.id] ?? "";
//           question.child.show = true;
//           question.child.data[0].value = adDetails[question.child.data[0].id];
//           question.child.data[1].value = adDetails[question.child.data[1].id];
//         } else {
//           question.value = adDetails[question.id] ?? "";
//         }
//       });

//       dispatch(setPostAdData(newAdQuestions));
//     }
//   }, [dispatch, adDetails]);

//   function navigateBack() {
//     navigate(-1);
//   }

//   return (
//     <>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//         }}
//       >
//         <Box
//           sx={{
//             width: { xs: "100%", lg: "70%" },
//           }}
//         >
//           <Stack direction={"row"} alignItems={"center"} spacing={2}>
//             <ArrowLeft
//               size="20"
//               style={{ cursor: "pointer" }}
//               onClick={navigateBack}
//             />
//             <MuiTypography variant="h2">
//               {t("ad.reactivate_an_ad")}
//             </MuiTypography>
//           </Stack>
//           <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
//         </Box>
//       </Box>
//       <PostAnAd isEdit={true} adId={id} isReactivated={true} />
//     </>
//   );
// }

// export default ReactiveAnAd;


import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { cloneDeep, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { ArrowLeft } from "iconsax-react";

import MuiTypography from "../common/MuiTypography";
import MuiBreadcrumbs from "../common/Breadcrumbs";
import { ROUTES } from "../../utils/constants/route";
import useFetchAdDetails from "../../hooks/useFetchAdDetails";
import { AD_QUESTIONS, DESIGN_QUESTIONS } from "../../utils/constants/ad";
import { setPostAdData } from "../../redux/adSlice";
import { getLabelFromId } from "../../utils/common";
import PostAnAd from "../../pages/private/PostAnAd";
import { FIELD_TYPES } from "../../utils/constants/login";

function ReactiveAnAd() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";

  const dispatch = useDispatch();

  const { adDetails } = useSelector((state) => state.ad);

  const { fetchAdById } = useFetchAdDetails();

  const pastLinks = [
    {
      label: t("breadcrumbs.my_ads"),
      path: "/" + ROUTES.myAds,
    },
  ];
  const pastAdminLinks = [
    {
      label: t("breadcrumbs.my_ads"),
      path: "/" + ROUTES.adminMyAds,
    },
  ];
  const activeLink = {
    label: getLabelFromId(adDetails?.adType, "adType"),
  };

  useEffect(() => {
    fetchAdById(id);
  }, [fetchAdById, id]);

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
        } else {
          question.value = adDetails[question.id] ?? "";
        }
      });

      // Map DESIGN_QUESTIONS with adDetails
      newDesignQuestions.forEach((question) => {
        // Map design field values from adDetails
        if (adDetails[question.id] !== undefined) {
          question.value = adDetails[question.id];
        } else {
          // Set default values for design questions
          question.value =
            question.defaultValue ||
            question.value ||
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
          <Stack direction={"row"} alignItems={"center"} spacing={2}>
            <ArrowLeft
              size="20"
              style={{ cursor: "pointer" }}
              onClick={navigateBack}
            />
            <MuiTypography variant="h2">
              {t("ad.reactivate_an_ad")}
            </MuiTypography>
          </Stack>
          <MuiBreadcrumbs
            pastLinks={!isAdmin ? pastLinks : pastAdminLinks}
            activeLink={activeLink}
          />
        </Box>
      </Box>
      <PostAnAd isEdit={true} adId={id} isReactivated={true} />
    </>
  );
}

export default ReactiveAnAd;
