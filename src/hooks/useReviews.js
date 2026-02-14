import { useDispatch } from "react-redux";
import { setAlert, setLoading } from "../redux/configSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import {
  getUserReviewsUrl,
  getUserUrl,
  getUserHighlightReviewUrl,
} from "../apis/apiEndPoints";
import { setReviews as setReviewsRedux } from "../redux/profileSlice";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// Check if user is contractor type - matching backend logic
export const CONTRACTOR_USER_TYPES = [
  "contractor",
  "specialist", 
  "Professionals",
  "Contracting Companies"
];

export const isContractorType = (userType) => {
  return CONTRACTOR_USER_TYPES.includes(userType);
};

function useReviews() {
  const dispatch = useDispatch();

  const fetchReviews = async (userId, currentUserType = null) => {
    try {
      dispatch(setLoading(true));
      const response = await getUserReviewsUrl(userId);
      const apiReviews = response.data.data || [];
      
      // SIMPLIFIED: The backend now handles filtering, so we just process the response
      // The backend already filters based on user type and sets highlight field correctly
      
      // Map API data to UI format
      const mappedReviews = apiReviews.map((item) => {
        // Determine who gave the review based on reviewType
        const isClientReviewingContractor = item.reviewType === "client_reviewing_contractor";
        const reviewGiver = isClientReviewingContractor ? item.client : item.contractor;
        
        return {
          id: item.id,
          jobTitle: item.job?.title || item.services?.join(", ") || "Service",
          
          // Use the person who GAVE the review (not received it)
          name: reviewGiver?.attributes?.firstName
            ? `${reviewGiver.attributes.firstName} ${reviewGiver.attributes.lastName || ""}`.trim()
            : "Anonymous",
          userType: reviewGiver?.attributes?.userType || reviewGiver?.type || 
                   (isClientReviewingContractor ? "Client" : "Contractor"),
          
          // Generate avatar based on review giver's name
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            reviewGiver?.attributes?.firstName || "A"
          )}&background=random`,
          
          startDate: item.startDate,
          endDate: item.endDate,
          
          // Handle string ratings properly
          rating: typeof item.ratings?.overallExperience === 'string' 
            ? parseFloat(item.ratings.overallExperience) 
            : (item.ratings?.overallExperience || 0),
            
          likes: item.like || item.likes || "",
          dislikes: item.dislike || item.dislikes || "",
          country: item.country?.name || "",
          city: item.city?.name || "",
          cost: item.cost || "",
          
          // FIXED: Use highlight field from backend (already determined dynamically)
          highlight: item.highlight || false,
          
          createdAt: item.createdAt,
          overallExperienceReason: item.ratings?.overallExperienceReason || "",
          
          // Include complete objects for reusability
          client: item.client || null,
          contractor: item.contractor || null,
          contractorId: item.contractor?.id,
          clientId: item.client?.id,
          reviewType: item.reviewType,
          
          // Store the review giver info
          reviewGiver: reviewGiver,
          reviewGiverId: reviewGiver?.id
        };
      });

      // Fetch user data for each review giver and enrich the review
      const enrichedReviews = await Promise.all(
        mappedReviews.map(async (review) => {
          if (review.reviewGiverId) {
            try {
              const userRes = await getUserUrl(review.reviewGiverId);
              const userData = userRes.data.data;
              
              // Update with actual user data
              const updatedReview = {
                ...review,
                avatar: userData.avatar 
                  ? `${IMAGE_URL}${userData.avatar}`
                  : review.avatar,
                userType: userData.userType || review.userType,
                name: userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`.trim()
                  : review.name,
              };
              
              // Also update the review giver object with enriched data
              if (updatedReview.reviewGiver?.attributes) {
                updatedReview.reviewGiver.attributes = {
                  ...updatedReview.reviewGiver.attributes,
                  avatar: userData.avatar || updatedReview.reviewGiver.attributes.avatar,
                  firstName: userData.firstName || updatedReview.reviewGiver.attributes.firstName,
                  lastName: userData.lastName || updatedReview.reviewGiver.attributes.lastName,
                  userType: userData.userType || updatedReview.reviewGiver.attributes.userType,
                };
              }
              
              return updatedReview;
            } catch (error) {
              console.warn(`Failed to fetch user data for review ${review.id}:`, error);
              return review;
            }
          }
          return review;
        })
      );

      dispatch(setReviewsRedux(enrichedReviews));
      return enrichedReviews;
    } catch (error) {
      if (
        error.message &&
        error.message.startsWith("No reviews found for user ID")
      ) {
        // Suppress this specific warning from being shown to the user
        return [];
      }
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchHighlightReview = async (userId, currentUserType = null) => {
    try {
      dispatch(setLoading(true));
      const response = await getUserHighlightReviewUrl(userId);
      const apiReviews = response.data.data || [];
      if (apiReviews.length === 0) return [];
      
      // SIMPLIFIED: Backend now handles filtering and highlight detection
      const item = apiReviews[0];
      
      // Determine who gave the review based on reviewType
      const isClientReviewingContractor = item.reviewType === "client_reviewing_contractor";
      const reviewGiver = isClientReviewingContractor ? item.client : item.contractor;
      
      // Map highlight review using review giver info
      const mappedReview = {
        id: item.id,
        jobTitle: item.job?.title || item.services?.join(", ") || "Service",
        
        // Use review giver information (person who gave the review)
        name: reviewGiver?.attributes?.firstName
          ? `${reviewGiver.attributes.firstName} ${reviewGiver.attributes.lastName || ""}`.trim()
          : "Anonymous",
        userType: reviewGiver?.attributes?.userType || reviewGiver?.type || 
                 (isClientReviewingContractor ? "Client" : "Contractor"),
        
        // Generate avatar based on review giver's name
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          reviewGiver?.attributes?.firstName || "A"
        )}&background=random`,
        
        startDate: item.startDate,
        endDate: item.endDate,
        
        // Handle string ratings properly
        rating: typeof item.ratings?.overallExperience === 'string' 
          ? parseFloat(item.ratings.overallExperience) 
          : (item.ratings?.overallExperience || 0),
          
        likes: item.like || item.likes || "",
        dislikes: item.dislike || item.dislikes || "",
        country: item.country?.name || "",
        city: item.city?.name || "",
        cost: item.cost || "",
        
        // FIXED: Use highlight field from backend (backend determines if it's highlighted)
        highlight: item.highlight || true, // Highlight reviews are always highlighted
        
        createdAt: item.createdAt,
        overallExperienceReason: item.ratings?.overallExperienceReason || "",
        
        // Include complete objects
        client: item.client || null,
        contractor: item.contractor || null,
        clientId: item.client?.id,
        contractorId: item.contractor?.id,
        reviewType: item.reviewType,
        
        // Store the review giver info
        reviewGiver: reviewGiver,
        reviewGiverId: reviewGiver?.id
      };

      // Enrich with review giver user data
      if (mappedReview.reviewGiverId) {
        try {
          const userRes = await getUserUrl(mappedReview.reviewGiverId);
          const userData = userRes.data.data;
          
          // Use review giver's actual avatar and info
          mappedReview.avatar = userData.avatar 
            ? `${IMAGE_URL}${userData.avatar}`
            : mappedReview.avatar;
          mappedReview.userType = userData.userType || mappedReview.userType;
          mappedReview.name = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : mappedReview.name;
            
          // Also update the review giver object with enriched data
          if (mappedReview.reviewGiver?.attributes) {
            mappedReview.reviewGiver.attributes = {
              ...mappedReview.reviewGiver.attributes,
              avatar: userData.avatar || mappedReview.reviewGiver.attributes.avatar,
              firstName: userData.firstName || mappedReview.reviewGiver.attributes.firstName,
              lastName: userData.lastName || mappedReview.reviewGiver.attributes.lastName,
              userType: userData.userType || mappedReview.reviewGiver.attributes.userType,
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch user data for highlight review ${mappedReview.id}:`, error);
        }
      }

      return [mappedReview];
    } catch (error) {
      if (
        error.message &&
        error.message.startsWith("No reviews found for user ID")
      ) {
        // Suppress this specific warning from being shown to the user
        return [];
      }
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  const submitReview = async () => {
    try {
      dispatch(setLoading(true));
      // const reviewPayload = {
      //   data: {
      //     type: "post_rating",
      //     ...reviewData,
      //   },
      // };

      // await postReviewUrl(reviewPayload);

      // Mock successful submission
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: "Review submitted successfully (mock)",
        })
      );
      return true;
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    fetchReviews,
    fetchHighlightReview,
    submitReview,
  };
}

export default useReviews;