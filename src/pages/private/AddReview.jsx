import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep, debounce, flattenDeep } from "lodash";
import { useNavigate, useLocation } from "react-router-dom";

import MuiTypography from "../../components/common/MuiTypography";
import { getAddReviewQuestions } from "../../utils/constants/review";
import { setAlert, setLoadData, setLoading } from "../../redux/configSlice";
import {
  postReviewUrl,
  getMyContractsUrl,
  getJobDetailsUrl,
  getTempContractorUrl,
  getReviewUsersUrl,
  searchReviewUsersUrl,
} from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import FormFields from "../../components/common/FormFields";
import useValidation from "../../hooks/useValidation";
import useCountry from "../../hooks/useCountry";
import ActionButton from "../../components/common/ActionButton";
import { ROUTES } from "../../utils/constants/route";
import { colors } from "../../styles/theme";
import { USER_TYPES, isContractorType } from "../../utils/constants/login";
import { NotificationBox } from "../../components/common/NotificationBox";




// Helper function to strip HTML tags and get plain text
const stripHtmlTags = (html) => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};

function AddReview() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { profileData } = useSelector((state) => state.profile);
  const queryParams = new URLSearchParams(location.search);

  const contractorId = queryParams.get("contractor");
  const clientId = queryParams.get("client");
  const jobId = queryParams.get("job");

  const [questions, setQuestions] = useState([]);
  const [initLoad, setInitLoad] = useState(true);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const { getCountries } = useCountry();
  const { isValidData, validateData } = useValidation();

  const contractorData = location.state;

  const [localUserId, setLocalUserId] = useState(null);
  const [localJobId, setLocalJobId] = useState("");
  const [contractsList, setContractsList] = useState([]);
  const [selectedContractorDetails, setSelectedContractorDetails] = useState(null);

  // FIXED: Determine review type based on user type - simplified logic
  const reviewType = useMemo(() => {
    const userType = profileData?.userType;
    
    if (userType === USER_TYPES.client) {
      return "client_reviewing_contractor";
    } else if (isContractorType(userType)) {
      return "contractor_reviewing_client";
    }
    
    // FIXED: Vendors can also review clients
    return "contractor_reviewing_client";
  }, [profileData?.userType]);

  const isFromContractsPage = useMemo(() => {
    return !!(contractorId || clientId) && !!jobId;
  }, [contractorId, clientId, jobId]);

  // FIXED: Determine if we can include temp contractors
  const canIncludeTempContractors = useMemo(() => {
    return reviewType === "client_reviewing_contractor";
  }, [reviewType]);

  // FIXED: Memoize user ID from URL to prevent re-processing
  const targetUserIdFromUrl = useMemo(() => {
    return contractorId || clientId;
  }, [contractorId, clientId]);

  async function fetchCountries() {
    await getCountries();
  }

  useEffect(() => {
    fetchCountries();
  }, []);

  // FIXED: Initialize questions only once with proper labels
  useEffect(() => {
    const arr = getAddReviewQuestions(t);

    // Update labels based on review type
    const userIdField = arr.find((q) => q.id === "userId");
    if (userIdField) {
      if (reviewType === "client_reviewing_contractor") {
        userIdField.label = t("review.question1_professional");
        userIdField.placeholder = t("review.question1_subtitle2_professional");
        userIdField.subtitle = t("review.question1_subtitle_professional");
        userIdField.subtitle2 = t("review.question1_subtitle2_professional");
      } else {
        userIdField.label = t("review.question1_client");
        userIdField.placeholder = t("review.question1_subtitle2_client");
        userIdField.subtitle = t("review.question1_subtitle_client");
        userIdField.subtitle2 = t("review.question1_subtitle2_client");
      }
    }

    console.log("🔍 Initializing questions with review type:", reviewType);
    setQuestions(arr);
  }, [t, reviewType]);

  // FIXED: Auto-populate user from URL parameters
  useEffect(() => {
    if (targetUserIdFromUrl && questions.length > 0) {
      console.log("🔍 Auto-populating user from URL:", targetUserIdFromUrl);

      // Search for users to populate options if not already populated
      const userField = questions.find((q) => q.id === "userId");
      if (userField && (!userField.options || userField.options.length === 0)) {
        debouncedSearch("userId", "");
      }
    }
  }, [targetUserIdFromUrl, questions.length]);

  // FIXED: Separate effect to set user once options are available
  useEffect(() => {
    if (targetUserIdFromUrl && questions.length > 0 && !localUserId) {
      const userField = questions.find((q) => q.id === "userId");

      if (userField?.options?.length > 0) {
        const targetOption = userField.options.find(
          (option) =>
            option.id == targetUserIdFromUrl ||
            (option.isTemporary &&
              option.tempContractorId == targetUserIdFromUrl)
        );

        if (targetOption) {
          console.log("🔍 Found target user:", targetOption);
          setLocalUserId({
            id: targetOption.id,
            label: targetOption.label,
          });

          // If it's a temp contractor, get their details
          if (targetOption.isTemporary) {
            fetchTempContractorDetails(targetOption.tempContractorId);
          }
        }
      }
    }
  }, [targetUserIdFromUrl, questions, localUserId]);

  // FIXED: Auto-populate job from URL
  useEffect(() => {
    if (jobId && questions.length > 0 && !localJobId) {
      console.log("🔍 Auto-populating job from URL:", jobId);
      setLocalJobId(String(jobId));
    }
  }, [jobId, questions.length, localJobId]);

  // FIXED: Handle contractor data from state (for external contractors)
  useEffect(() => {
    if (contractorData && !localUserId) {
      console.log("🔍 Setting user from contractor data:", contractorData);
      setLocalUserId({
        id: contractorData.contractorId,
        label: contractorData.contractorName,
      });

      // FIXED: For external contractors, automatically set jobId to "other"
      if (!localJobId) {
        console.log("🔍 Setting job to 'other' for external contractor");
        setLocalJobId("other");
      }
    }
  }, [contractorData, localUserId, localJobId]);

  const fetchTempContractorDetails = useCallback(async (tempContractorId) => {
    try {
      const response = await getTempContractorUrl(tempContractorId);
      const tempContractor = response.data.data;
      setSelectedContractorDetails(tempContractor);

      // Auto-populate location from temp contractor data
      setQuestions((prev) => {
        const arr = cloneDeep(prev);
        const locField = arr.find((q) => q.id === "location");
        if (locField && tempContractor.country && tempContractor.city) {
          locField.value = {
            country: { name: tempContractor.country },
            city: { name: tempContractor.city },
          };
          locField.validation.valid = true;
          locField.validation.error = "";
        }
        return arr;
      });
    } catch (error) {
      console.error("Failed to fetch temp contractor details:", error);
    }
  }, []);

  // FIXED: Initialize user search on component mount with new API
  useEffect(() => {
    if (questions.length > 0 && !targetUserIdFromUrl) {
      debouncedSearch("userId", "");
    }
  }, [questions.length, targetUserIdFromUrl]);

  // FIXED: Update job options when user changes
  useEffect(() => {
    if (localUserId?.id && questions.length > 0) {
      console.log("🔍 Updating job options for user:", localUserId.id);

      // Check if it's a temp contractor or external contractor
      const userOption = questions
        .find((q) => q.id === "userId")
        ?.options?.find((opt) => opt.id === localUserId.id);
      const isTemporaryContractor = userOption?.isTemporary;
      const isExternalContractor = contractorData && contractorData.contractorId === localUserId.id;

      // FIXED: For temp contractors or external contractors, always show "other" option
      if (isTemporaryContractor || isExternalContractor) {
        setQuestions((prev) => {
          const arr = cloneDeep(prev);
          const jobIdField = arr.find((q) => q.id === "jobId");
          if (jobIdField) {
            jobIdField.options = [
              {
                id: "other",
                label: t("review.other_job_option") || "Other (describe below)",
              },
            ];
          }
          return arr;
        });
        if (!localJobId) setLocalJobId("other");
        return;
      }

      // Fetch jobs for regular users
      (async () => {
        try {
          const payload = { page: 0, pageSize: 50 };
          const res = await getMyContractsUrl(payload);

          let contracts;
          if (reviewType === "client_reviewing_contractor") {
            contracts = res.data.data.filter(
              (contract) =>
                Array.isArray(contract.jobContractors) &&
                contract.jobContractors.some(
                  (jc) => jc.contractor && jc.contractor.id === localUserId.id
                )
            );
          } else {
            contracts = res.data.data.filter(
              (contract) =>
                contract.author && contract.author.id === localUserId.id
            );
          }

          setContractsList(res.data.data);

          const jobOptions = contracts.map((contract) => ({
            id: String(contract.id),
            label: `${contract.title || `Job #${contract.id}`} (${
              contract.createdAt
                ? new Date(contract.createdAt).toLocaleDateString()
                : "No date"
            })`,
          }));

          jobOptions.unshift({
            id: "other",
            label: t("review.other_job_option") || "Other (describe below)",
          });

          setQuestions((prev) => {
            const arr = cloneDeep(prev);
            const jobIdField = arr.find((q) => q.id === "jobId");
            if (jobIdField) {
              jobIdField.options = jobOptions;
            }
            return arr;
          });
        } catch (error) {
          console.error("Error fetching contracts:", error);
          setQuestions((prev) => {
            const arr = cloneDeep(prev);
            const jobIdField = arr.find((q) => q.id === "jobId");
            if (jobIdField) {
              jobIdField.options = [
                {
                  id: "other",
                  label:
                    t("review.other_job_option") || "Other (describe below)",
                },
              ];
            }
            return arr;
          });
        }
      })();
    }
  }, [localUserId?.id, reviewType, t, questions.length, localJobId, contractorData]);

  // FIXED: Auto-fill job details when job is selected
  useEffect(() => {
    if (localJobId && localJobId !== "other" && contractsList.length > 0) {
      console.log("🔍 Auto-filling job details for job:", localJobId);

      (async () => {
        try {
          const res = await getJobDetailsUrl(localJobId);
          const job = res.data.data;
          const contract = contractsList.find(
            (c) => String(c.id) === String(localJobId)
          );

          setQuestions((prev) => {
            const arr = cloneDeep(prev);

            // FIXED: Auto-fill location (only if not already set)
            const locField = arr.find((q) => q.id === "location");
            if (
              locField &&
              job.country &&
              job.city &&
              !locField.value?.country?.name
            ) {
              console.log("🔍 Auto-filling location:", job.country, job.city);
              locField.value = {
                country: job.country,
                city: job.city,
              };
              locField.validation.valid = true;
              locField.validation.error = "";
            }

            // FIXED: Auto-fill dates
            const whenField = arr.find((q) => q.id === "when");
            if (
              whenField &&
              (!whenField.value ||
                whenField.value.length === 0 ||
                !whenField.value[0]?.value)
            ) {
              console.log("🔍 Auto-filling dates");
              whenField.value = [
                {
                  id: "startDate",
                  value: job.createdAt ? job.createdAt.slice(0, 10) : "",
                },
                {
                  id: "endDate",
                  value: job.updatedAt ? job.updatedAt.slice(0, 10) : "",
                },
              ];
              whenField.validation.valid = true;
              whenField.validation.error = "";
            }

            // FIXED: Auto-fill cost
            const costField = arr.find((q) => q.id === "cost");
            if (costField && !costField.value && contract) {
              let totalAmount = 0;

              if (
                reviewType === "client_reviewing_contractor" &&
                contract.milestonesByContractor &&
                localUserId?.id
              ) {
                const userMilestones =
                  contract.milestonesByContractor[localUserId.id] || [];
                totalAmount = userMilestones.reduce(
                  (sum, m) => sum + Number(m.amount || 0),
                  0
                );
              } else if (reviewType === "contractor_reviewing_client") {
                totalAmount = Number(job.budget) || 0;
              }

              const matchedOption = costField.options.find((opt) => {
                const label = opt.label.toLowerCase();
                if (label.includes("less than")) {
                  const max = parseInt(label.replace(/[^0-9]/g, ""));
                  return totalAmount < max;
                } else if (label.includes("to")) {
                  const [min, max] = label
                    .split("to")
                    .map((s) => parseInt(s.replace(/[^0-9]/g, "")));
                  return totalAmount >= min && totalAmount <= max;
                } else if (label.includes("+")) {
                  const min = parseInt(label.replace(/[^0-9]/g, ""));
                  return totalAmount >= min;
                }
                return false;
              });

              if (matchedOption) {
                console.log("🔍 Auto-filling cost:", matchedOption);
                costField.value = matchedOption.id;
                costField.validation.valid = true;
                costField.validation.error = "";
              }
            }

            // FIXED: Auto-fill services
            const servicesField = arr.find((q) => q.id === "services");
            if (
              servicesField &&
              job.jobsToBeDone &&
              (!servicesField.value || servicesField.value.length === 0)
            ) {
              let services = [];
              if (Array.isArray(job.jobsToBeDone)) {
                services = job.jobsToBeDone;
              } else if (typeof job.jobsToBeDone === "string") {
                services = [job.jobsToBeDone];
              }

              const availableServiceIds = servicesField.options.map(
                (opt) => opt.id
              );
              const validServices = services.filter(
                (service) =>
                  availableServiceIds.includes(service) ||
                  availableServiceIds.includes(service.toLowerCase())
              );

              if (validServices.length > 0) {
                console.log("🔍 Auto-filling services:", validServices);
                servicesField.value = validServices;
                servicesField.validation.valid = true;
                servicesField.validation.error = "";
              }
            }

            return arr;
          });
        } catch (error) {
          console.error("Error fetching job details:", error);
        }
      })();
    }
  }, [localJobId, contractsList, localUserId?.id, reviewType]);

  function onDataChange(id, value, error, index) {
    if (id === "userId") {
      if (
        !value ||
        (typeof value === "object" && Object.keys(value).length === 0)
      ) {
        setLocalUserId(null);
        setSelectedContractorDetails(null);
      } else {
        setLocalUserId(value);
        const userOption = questions
          .find((q) => q.id === "userId")
          ?.options?.find((opt) => opt.id === value.id);
        if (userOption?.isTemporary) {
          fetchTempContractorDetails(userOption.tempContractorId);
        } else {
          setSelectedContractorDetails(null);
        }
      }
      return;
    }

    if (id === "jobId") {
      setLocalJobId(String(value));
      return;
    }

    // FIXED: Handle services selection to remove "other" when all services are selected
    if (id === "services") {
      const newQuestions = cloneDeep(questions);
      const fieldIndex = newQuestions.findIndex((el) => el.id === id);
      
      if (fieldIndex !== -1) {
        const servicesField = newQuestions[fieldIndex];
        const nonOtherOptions = servicesField.options?.filter(opt => opt.id !== "other") || [];
        
        // If trying to select all services, remove "other" from selection
        if (Array.isArray(value)) {
          const selectedNonOther = value.filter(service => service !== "other");
          
          // If all non-other services are selected, remove "other" from the selection
          if (selectedNonOther.length === nonOtherOptions.length && value.includes("other")) {
            value = selectedNonOther;
          }
        }
        
        newQuestions[fieldIndex].value = value;
        newQuestions[fieldIndex].validation.error = error;
        newQuestions[fieldIndex].validation.valid = error === "" ? true : false;
        setQuestions(newQuestions);
      }
      return;
    }

    const newQuestions = cloneDeep(questions);
    const fieldIndex = newQuestions.findIndex((el) => el.id === id);

    if (fieldIndex === -1) return;

    let updatedValue = value;
    if (index === 0 && Array.isArray(updatedValue) && updatedValue[1]) {
      updatedValue[1].value = "";
    }

    newQuestions[fieldIndex].value = updatedValue;
    newQuestions[fieldIndex].validation.error = error;
    newQuestions[fieldIndex].validation.valid = error === "" ? true : false;
    setQuestions(newQuestions);
  }

  // FIXED: Updated search function to use new review-specific APIs
  const debouncedSearch = useCallback(
    debounce(async (id, query) => {
      const newQuestions = cloneDeep(questions);
      const fieldIndex = newQuestions.findIndex((el) => el.id === id);

      if (fieldIndex === -1) return;

      try {
        setUserSearchLoading(true);
        dispatch(setLoadData(true));
        
        let apiResponse;

        console.log(`🔍 Searching users for review - Query: "${query}", Review type: ${reviewType}`);

        // Use new review-specific APIs
        if (!query || query.trim() === "") {
          // Get all users for reviews
          apiResponse = await getReviewUsersUrl(canIncludeTempContractors);
        } else {
          // Search users for reviews
          apiResponse = await searchReviewUsersUrl(query, canIncludeTempContractors);
        }

        console.log(`🔍 API Response:`, apiResponse);

        if (apiResponse.data && Array.isArray(apiResponse.data)) {
          newQuestions[fieldIndex].options = apiResponse.data.map((item) => ({
            id: item.id,
            label: item.label,
            avatar: item.avatar,
            category: item.category,
            isTemporary: item.isTemporary || false,
            tempContractorId: item.tempContractorId,
          }));

          // Only clear value when doing a fresh search with empty query
          if (!query) {
            newQuestions[fieldIndex].value = "";
          }
          
          setQuestions(newQuestions);
          
          console.log(`🔍 Updated options with ${apiResponse.data.length} users`);
        } else {
          console.error("🔍 Invalid API response format:", apiResponse);
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: "Failed to load users for review",
            })
          );
        }
      } catch (error) {
        console.error("🔍 Search error:", error);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error.message || "Failed to search users",
          })
        );
        
        // Set empty options on error
        newQuestions[fieldIndex].options = [];
        setQuestions(newQuestions);
      } finally {
        setUserSearchLoading(false);
        dispatch(setLoadData(false));
      }
    }, 300), // FIXED: Reduced debounce time for faster search
    [questions, reviewType, canIncludeTempContractors, dispatch]
  );

  function onInputChange(id, value) {
    if (id === "userId") {
      debouncedSearch(id, value);
    }
  }

  async function handleSaveReview() {
    console.log("🔍 Starting review save process...");
    setInitLoad(false);

    const visibleQuestions = getVisibleQuestions();
    const validatedQuestion = validateData(visibleQuestions);
    const patchedQuestions = validatedQuestion.map((item) => {
      if (item.id === "userId") {
        return { userId: localUserId, id: "userId" };
      }
      if (item.id === "jobId") {
        return { jobId: localJobId, id: "jobId" };
      }
      return item;
    });

    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      patchedQuestions.forEach((patchedQ) => {
        const index = newQuestions.findIndex((q) => q.id === patchedQ.id);
        if (index !== -1) {
          newQuestions[index] = patchedQ;
        }
      });
      return newQuestions;
    });

    const isFormValid = isValidData(patchedQuestions);

    if (!isFormValid) {
      console.log("🔍 Form validation failed");
      return;
    }

    // Process the questions for API payload
    const newQuestions = patchedQuestions.map((item) => {
      const id = item.id;
      const value = item.value !== undefined ? item.value : item[id];

      if (id === "userId") {
        if (selectedContractorDetails) {
          return { [item.id]: selectedContractorDetails.id };
        } else {
          let userId;
          if (typeof value === "object" && value !== null) {
            userId = value.id || value.value || value;
          } else {
            userId = value;
          }
          if (typeof userId === "string" && !isNaN(Number(userId))) {
            userId = Number(userId);
          }
          return { [item.id]: userId };
        }
      }

      if (id === "jobId") {
        if (value === "other") {
          const customJobDetailsField = visibleQuestions.find(
            (q) => q.id === "customJobDetails"
          );
          const customJobDetails = customJobDetailsField?.value || "";
          return { jobId: "other", customJobDetails };
        }
        return { [item.id]: value };
      }

      if (id === "services") {
        if (Array.isArray(value) && value.includes("other")) {
          const customServiceDetailsField = visibleQuestions.find(
            (q) => q.id === "customServiceDetails"
          );
          const customServiceDetails = customServiceDetailsField?.value || "";
          return { [item.id]: value, customServiceDetails };
        }
        return { [item.id]: value };
      }

      if (id === "location") {
        return {
          country: value?.country || null,
          city: value?.city || null,
        };
      }

      if (id === "when") {
        return (
          value?.map((el) => {
            let dateValue = el.value;
            if (
              dateValue &&
              typeof dateValue === "string" &&
              dateValue.includes("T")
            ) {
              dateValue = dateValue.split("T")[0];
            }
            return { [el.id]: dateValue };
          }) || []
        );
      }

      if (id === "rating") {
        return (
          value?.map((el) => ({
            [el.id]: el.value,
            [el.reasonId]: el.reason,
          })) || []
        );
      }

      if (id === "likes" || id === "dislikes") {
        const plainText = stripHtmlTags(value);
        return { [item.id]: plainText };
      }

      return { [item.id]: value };
    });

    const reviewPayload = {
      data: {
        type: "post_rating",
        ...Object.assign({}, ...flattenDeep(newQuestions)),
        reviewType,
        isTemporaryContractor: selectedContractorDetails ? true : false,
        tempContractorDetails: selectedContractorDetails
          ? {
              id: selectedContractorDetails.id,
              firstName: selectedContractorDetails.firstName,
              lastName: selectedContractorDetails.lastName,
              email: selectedContractorDetails.email,
            }
          : undefined,
      },
    };

    console.log("🔍 Final payload:", JSON.stringify(reviewPayload, null, 2));

    try {
      dispatch(setLoading(true));
      const response = await postReviewUrl(reviewPayload);
      console.log("🔍 API Response:", response);

      setQuestions(getAddReviewQuestions(t));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("review.review_submitted"),
        })
      );
      navigate(`/${ROUTES.dashboard}`);
    } catch (err) {
      console.error("🔍 API Error:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message:
            err.response?.data?.errors?.[0]?.detail ||
            err.message ||
            "Failed to submit review",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  const handleAddContractor = () => {
    navigate(`/${ROUTES.addContractor}`);
  };

  // Filter questions based on dependencies
  const getVisibleQuestions = () => {
    return questions.filter((question) => {
      if (!question.dependsOn) return true;

      const dependsOnValue = question.dependsOnValue;

      if (question.dependsOn === "jobId") {
        return localJobId === dependsOnValue;
      }

      if (question.dependsOn === "services") {
        const servicesField = questions.find((q) => q.id === "services");
        const selectedServices = servicesField?.value || [];
        
        // FIXED: Don't show customServiceDetails if all services are selected
        if (question.id === "customServiceDetails") {
          const hasOtherSelected = Array.isArray(selectedServices) && selectedServices.includes("other");
          const allServicesSelected = isAllServicesSelected(selectedServices);
          
          // Only show custom service details if "other" is selected AND not all services are selected
          return hasOtherSelected && !allServicesSelected;
        }
        
        return (
          Array.isArray(selectedServices) &&
          selectedServices.includes(dependsOnValue)
        );
      }

      return true;
    });
  };

  // FIXED: Check if notification should be shown
  const shouldShowUserNotification = () => {
    return selectedContractorDetails && localUserId;
  };

  const shouldShowJobNotification = () => {
    return localJobId === "other" && !getVisibleQuestions().find(q => q.id === "customJobDetails")?.value;
  };

  // FIXED: Check if services "other" notification should be shown
  const shouldShowServicesNotification = () => {
    const servicesField = questions.find((q) => q.id === "services");
    const selectedServices = servicesField?.value || [];
    const hasOtherSelected = Array.isArray(selectedServices) && selectedServices.includes("other");
    const customServiceDetails = getVisibleQuestions().find(q => q.id === "customServiceDetails")?.value;
    
    // FIXED: Only show notification if "other" is selected AND it's not all services AND custom details are empty
    return hasOtherSelected && !customServiceDetails && !isAllServicesSelected(selectedServices);
  };

  // FIXED: Helper function to check if all services are selected (excluding "other")
  const isAllServicesSelected = (selectedServices) => {
    const servicesField = questions.find((q) => q.id === "services");
    if (!servicesField?.options) return false;
    
    const nonOtherOptions = servicesField.options.filter(opt => opt.id !== "other");
    const selectedNonOther = selectedServices.filter(service => service !== "other");
    
    return selectedNonOther.length === nonOtherOptions.length;
  };

  // FIXED: Filter services options to remove "other" when all services are selected
  const getFilteredServicesOptions = () => {
    const servicesField = questions.find((q) => q.id === "services");
    if (!servicesField?.options) return [];
    
    const selectedServices = servicesField.value || [];
    const nonOtherOptions = servicesField.options.filter(opt => opt.id !== "other");
    const selectedNonOther = selectedServices.filter(service => service !== "other");
    
    // If all non-other services are selected, hide "other" option
    if (selectedNonOther.length === nonOtherOptions.length) {
      return nonOtherOptions;
    }
    
    return servicesField.options;
  };

  const visibleQuestions = getVisibleQuestions();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "60%" },
          p: { xs: 2, md: 4 },
        }}
      >
        <MuiTypography variant="h2">{t("review.title")}</MuiTypography>

        {visibleQuestions?.length > 0 &&
          visibleQuestions.map((que) => {
            return (
              <Box sx={{ mt: 3 }} key={que.id}>
                <Stack mb={1.5}>
                  <Stack direction={"row"} spacing={0.5}>
                    <MuiTypography variant="h6">{que?.label}</MuiTypography>
                    {que?.label && que?.validation?.required && (
                      <MuiTypography sx={{ color: "error.main" }}>
                        *
                      </MuiTypography>
                    )}
                  </Stack>
                  {(que.id === "userId" ||
                    que.id === "jobId" ||
                    que.id === "customJobDetails" ||
                    que.id === "customServiceDetails") && (
                    <MuiTypography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      {reviewType === "client_reviewing_contractor"
                        ? que?.subtitle
                        : que?.subtitle2}
                    </MuiTypography>
                  )}
                </Stack>

                <FormFields
                  id={que?.id}
                  placeholder={que?.placeholder}
                  value={
                    que?.id === "jobId"
                      ? localJobId
                      : que?.id === "userId"
                      ? localUserId || null
                      : que?.value
                  }
                  options={
                    que?.id === "services" 
                      ? getFilteredServicesOptions() 
                      : que?.options
                  }
                  onValueChange={onDataChange}
                  onInputChange={onInputChange}
                  type={que?.type}
                  multipleFiles={que?.multipleFiles}
                  fileTypes={que?.fileTypes}
                  showTitle={false}
                  initLoad={initLoad}
                  validation={que?.validation}
                  dateType={que?.id === "when" ? "past" : undefined}
                  loading={que?.id === "userId" ? userSearchLoading : false}
                />

                {/* FIXED: Only show Add Contractor button for clients, not when coming from contracts page */}
                {que.id === questions[0]?.id &&
                  !isFromContractsPage &&
                  reviewType === "client_reviewing_contractor" && (
                    <ActionButton
                      onClick={handleAddContractor}
                      sx={{
                        mt: 2,
                        width: { xs: "100%", sm: "auto" },
                        minWidth: "180px",
                        bgcolor: "white",
                        color: colors.black,
                        border: `1px solid ${colors.grey300}`,
                        borderRadius: "24px",
                        textTransform: "none",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        py: 1.2,
                        px: 3,
                        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                        "&:hover": {
                          bgcolor: colors.grey100,
                          borderColor: colors.grey400,
                        },
                      }}
                    >
                      {t("contractor.add_title")}
                    </ActionButton>
                  )}

                {/* FIXED: Updated temp contractor notice with blue theme */}
                {que.id === "userId" && shouldShowUserNotification() && (
                  <NotificationBox
                    type="info"
                    icon={`${selectedContractorDetails.firstName?.charAt(
                      0
                    )}${selectedContractorDetails.lastName?.charAt(0)}`}
                    title="Reviewing Invited Contractor"
                    description={`You are reviewing ${selectedContractorDetails.firstName} ${selectedContractorDetails.lastName} (${selectedContractorDetails.email}) who was invited but hasn't completed their registration yet.`}
                    compact={true}
                    sx={{
                      mt: 2,
                      bgcolor: colors.blue300,
                      borderColor: colors.blue200,
                      "& .MuiTypography-root": {
                        color: colors.blue100,
                      },
                    }}
                  />
                )}

                {/* FIXED: Job notification - only show when "other" is selected and no custom details */}
                {que.id === "jobId" && shouldShowJobNotification() && (
                  <NotificationBox
                    type="warning"
                    icon="✏️"
                    title="Other Job Details Required"
                    description="Please provide details about the job below since it's not in our standard list."
                    compact={true}
                    sx={{ mt: 2 }}
                  />
                )}

                {/* FIXED: Services notification - only show when "other" is selected, not all services, and no custom details */}
                {que.id === "services" && shouldShowServicesNotification() && (
                  <NotificationBox
                    type="secondary"
                    icon="📝"
                    title="Other Service Details Required"
                    description="Please specify the other services below since they're not in our standard list."
                    compact={true}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
            );
          })}

        <ActionButton
          onClick={handleSaveReview}
          sx={{
            display: "block",
            my: 2,
            ml: "auto",
            width: { xs: "100%", sm: "auto" },
            minWidth: "120px",
          }}
        >
          {t("submit")}
        </ActionButton>
      </Box>
    </Box>
  );
}

export default AddReview;