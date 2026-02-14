import axiosInstance from "./api";
import axios from "axios";

//login
export const loginUrl = (payload) => axiosInstance.post("/login", payload);

export const socialLoginUrl = (payload) =>
  axiosInstance.post("/social-login", payload);

export const reactivateAccountUrl = (payload) =>
  axiosInstance.post("/rectivate-request", payload);

export const checkEmailAvailabilityUrl = (email) =>
  axiosInstance.get(`/email/${email}/check-availability`);

export const checkPhoneAvailabilityUrl = (phone) =>
  axiosInstance.get(`/phone-number/${phone}/check-availability`);

export const sendOTPUrl = (payload) => axiosInstance.post("send-otp", payload);

export const registerUrl = (payload) =>
  axiosInstance.post("/register", payload);

export const socialRegisterUrl = (payload) =>
  axiosInstance.post("/social-register?include=session", payload);

export const deactivateAccountUrl = () => axiosInstance.put("/deactivate");

//onboarding
export const cancelRegistrationUrl = () =>
  axiosInstance.delete("/users/cancel-registration");

export const updateProfileUrl = (payload) =>
  axiosInstance.patch("/user/update-profile", payload);

export const updateProfileDesignUrl = (payload) =>
  axiosInstance.put("/profile/design", payload);

export const uploadFileUrl = (payload, config = {}) =>
  axiosInstance.post("/upload", payload, {
    isFormData: true,
    ...config, // This allows onUploadProgress to be passed through
  });

export const deleteFileUrl = (folderName, fileName) =>
  axiosInstance.delete(`/upload/${folderName}/${fileName}`);

export const getProfileUrl = (userId) =>
  axiosInstance.get(
    `/user/${userId}?additionalinfo=true&profiledesign=true&unhideInfo=true&pastclients=true`
  );

// Get only profile completion percentage (lightweight)
export const getProfileCompletionUrl = () =>
  axiosInstance.get('/user/profile-completion');

//forgot - reset password
export const forgotPasswordUrl = (payload) =>
  axiosInstance.post("/forgot-password", payload);

export const verifyOTPUrl = (payload) =>
  axiosInstance.post("/verify-otp", payload);

export const resetPasswordUrl = (payload) =>
  axiosInstance.post("/change-password", payload);

export const profileChangePasswordUrl = (payload) =>
  axiosInstance.post("/user/change-password", payload);

//profile
export const getProductCategoriesUrl = () =>
  axiosInstance.get("/users/get-product-categories");

// export const getUserUrl = (userId) => axiosInstance.get(`/user/${userId}`);
export const getUserUrl = (userId) => axiosInstance.get(`/user/${userId}`);

export const getUserCategoriesByTypeUrl = (userType) =>
  axiosInstance.get(`/users/user-wise-categories?type=${userType}`);

export const deleteClientUrl = (clientId) =>
  axiosInstance.delete(`/user/${clientId}`);

//logout
export const getLogoutUrl = (isAdmin = false) =>
  axiosInstance.delete("/logout", { useProdUrl: isAdmin });

//veriff
export const getVeriffSessionUrl = () =>
  axiosInstance.get("/user/veriff-session");

export const getVeriffStatusUrl = () =>
  axiosInstance.get("/user/veriff-current-status");

//jobs
export const postJobUrl = (payload) => axiosInstance.post("/user/job", payload);

export const editJobUrl = (jobId, payload) =>
  axiosInstance.put(`/user/job/${jobId}`, payload);

export const deleteJobUrl = (jobId) =>
  axiosInstance.delete(`/user/job/${jobId}`);

// export const getAllJobsUrl = (payload, searchQuery) => {
//   if (searchQuery.length >= 3) {
//     return axiosInstance.get(
//       `/user/all-jobs?page=${payload.page + 1}&pageSize=${
//         payload.pageSize
//       }&query=${searchQuery}`
//     );
//   }
//   return axiosInstance.get(
//     `/user/all-jobs?page=${payload.page + 1}&pageSize=${payload.pageSize}`
//   );
// };

export const getAllJobsUrl = (
  payload,
  searchQuery = "",
  userSettings,
  userInfo
) => {
  const baseUrl = `/user/all-jobs`;
  const page = payload.page + 1;
  const pageSize = payload.pageSize;
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("pageSize", pageSize);

  const isGlobal = userSettings?.isGlobalLocation;
  const countryName = userInfo?.country_name;

  // Add search query if it's valid
  if (searchQuery.length >= 3) {
    params.append("query", searchQuery);
  }

  // ✅ Only if NOT global, add country
  if (!isGlobal && countryName) {
    params.append("country", countryName);
  }

  const finalUrl = `${baseUrl}?${params.toString()}`;

  return axiosInstance.get(finalUrl);
};

export const getActiveJobsUrl = (payload) =>
  axiosInstance.get(
    `/user/my-jobs?state=active&page=${payload.page + 1}&pageSize=${
      payload.pageSize
    }`
  );

export const getFilledJobsUrl = (payload) =>
  axiosInstance.get(
    `/user/my-jobs?state=filled,completed&page=${payload.page + 1}&pageSize=${
      payload.pageSize
    }`
  );

export const getDraftedJobsUrl = (payload) =>
  axiosInstance.get(
    `/user/my-jobs?state=draft&page=${payload.page + 1}&pageSize=${
      payload.pageSize
    }`
  );

export const getJobDetailsUrl = (jobId, include) =>
  axiosInstance.get(`/jobs/${jobId}${include ? `?include=${include}` : ""}`);

//bids
export const getMyBidsUrl = (payload) =>
  axiosInstance.get(
    `/user/my-bids?page=${payload.page + 1}&pageSize=${payload.pageSize}`
  );

export const postBidUrl = (jobId, payload) =>
  axiosInstance.post(`/bid/${jobId}`, payload);

export const updateBidUrl = (jobId, bidId, payload) =>
  axiosInstance.put(`/user/bid/${jobId}/${bidId}`, payload);

export const getBidDetailsUrl = (bidId) => axiosInstance.get(`/bids/${bidId}`);

export const acceptBidUrl = (jobId, bidId) =>
  axiosInstance.put(`/bid/${jobId}/${bidId}/accept`);

export const rejectBidUrl = (jobId, bidId) =>
  axiosInstance.put(`/bid/${jobId}/${bidId}/reject`);

export const withdrawBidUrl = (jobId, bidId) =>
  axiosInstance.delete(`/bid/${jobId}/${bidId}`);

//contracts
export const getMyContractsUrl = (payload) =>
  axiosInstance.get(
    `/user/my-contracts?page=${payload.page + 1}&pageSize=${
      payload.pageSize
    }&include=milestonesByContractor,milestones,jobContractors`
  );

//ads
export const postAdUrl = async (payload) => {
  const response = await axiosInstance.post("/user/advertisement", payload);
  return response;
};

export const editAdUrl = async (id, payload) => {
  const response = await axiosInstance.put(
    `/user/advertisement/${id}`,
    payload
  );
  return response;
};

export const deleteAdUrl = (adId) =>
  axiosInstance.delete(`/user/advertisement/${adId}`);

// export const getMyAdUrl = (page = 1, pageSize = 100) =>
//   axiosInstance.get(
//     `/user/my-advertisements?page=${page}&pageSize=${pageSize}`
//   );

export const getMyAdUrl = (page = 1, pageSize = 100, adType) => {
  let url = `/user/my-advertisements?page=${page}&pageSize=${pageSize}`;
  if (adType) {
    url += `&adType=${adType}`;
  }
  return axiosInstance.get(url);
};

// export const getAllAdUrl = () =>
//   axiosInstance.get("/user/advertisements?page=1&pageSize=8");

export const getAllAdUrl = (page = 1, pageSize = 7, adType = "") => {
  return axiosInstance.get(
    `/user/advertisements?page=${page}&pageSize=${pageSize}&adType=${adType}`
  );
};

export const getAdDetailsUrl = (adId) =>
  axiosInstance.get(`/user/advertisement/${adId}`);

export const getAdLikesUrl = (adId) =>
  axiosInstance.get(`/user/advertisement/${adId}/likes?page=1&pageSize=20`);

//webinars
export const addWebinarUrl = async (payload) => {
  const response = await axiosInstance.post("/webinar", payload);
  return response;
};

export const getFilteredUsers = async (query) => {
  const response = await axiosInstance.get(`/user?query=${query}&masked=true`);
  return response;
};

export const registerForWebinar = async (payload) => {
  const response = await axiosInstance.post("/webinar/register", payload);
  return response;
};

export const editWebinarUrl = async (id, payload) => {
  const response = await axiosInstance.patch(`/webinar/${id}`, payload);
  return response;
};

export const deleteWebinarUrl = (webinarId) =>
  axiosInstance.delete(`/webinar/${webinarId}`);

export const getMyWebinarUrl = (webinarId) =>
  axiosInstance.get(`/webinar/${webinarId}`);

export const getAllWebinars = () => axiosInstance.get(`/webinar`);

//notifications
export const getAllNotifications = () =>
  axiosInstance.get("/me/notifications?page=1&pageSize=100");
export const setReadNotifications = (id) =>
  axiosInstance.post(`/me/notifications/${id}/read`);

//review
export const postJobReviewUrl = (jobId, payload) =>
  axiosInstance.post(`/jobs/${jobId}/rate`, payload);

export const setRegistrationTokenForPushNotifications = (payload) =>
  axiosInstance.post(`/registration_tokens`, payload);

export const searchUserUrl = (query, includeTempContractors = false) => {
  const params = new URLSearchParams();
  if (query) params.append("query", query); // Note: 'query' not 'q'
  if (includeTempContractors)
    params.append("includeTempContractors", includeTempContractors);

  return axiosInstance.get(`/user?${params.toString()}`); // Note: '/user' not '/users/search'
};

export const getTempContractorUrl = (tempContractorId) => {
  console.log("🔍 Fetching temp contractor:", tempContractorId);
  return axiosInstance.get(`/user/temp-contractors/${tempContractorId}`);
};

export const postReviewUrl = (payload) => {
  console.log("🔍 Making API call to /rating with payload:", payload);
  return axiosInstance.post(`/rating`, payload);
};

export const getReviewsUrl = (userId) =>
  axiosInstance.get(`/user/${userId}/ratings`);

//country city
export const getCountry = () => axiosInstance.get(`/country`);

export const getCity = (isoCode) => axiosInstance.get(`/city/${isoCode}`);

//admin
export const adminLoginUrl = (payload) =>
  axiosInstance.post("/admin/login", payload);
export const adminUpdateProfileUrl = (payload) =>
  axiosInstance.patch("/admin/update-profile", payload);
// // method:
// 'PATCH',
// url: '/admin/update-profile',

// admin (Dashboard)
export const getAdminDashboardUrl = (params = {}) =>
  axiosInstance.get("/admin/dashboard", { params });
// admin (Revenue)
export const getAdminRevenueUrl = (params = {}) =>
  axiosInstance.get("/admin/revenue", { params });
// admin (Users)
export const getAdminUsersDataUrl = (params = {}) =>
  axiosInstance.get("/admin/users-data", { params });
// admin (Catalogue)
export const getAdminCatalogueUrl = async (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 10,
  }).toString();

  return axiosInstance.get(`/admin/catalogues?${queryParams}`);
};
export const getAllAdminCatalogueCategory = () =>
  axiosInstance.get("/admin/catalogue/category/list");

export const getAdminCatalogueCategoryType = () =>
  axiosInstance.get("/admin/catalogue/category/types/all");

export const createAdminCatalogueCategory = (data) =>
  axiosInstance.post("/admin/catalogue/category/create", data);

export const updateAdminCatalogueCategory = (categoryId, data) =>
  axiosInstance.put(`/admin/catalogue/category/${categoryId}`, data);

export const deleteAdminCatalogueCategory = (categoryId) =>
  axiosInstance.delete(`/admin/catalogue/category/${categoryId}`);

// admin (Verification)
export const getAdminUsersUrl = () => axiosInstance.get("/admin/users");
// admin (Reactivation)
export const getAdminReactivationUrl = () =>
  axiosInstance.get("/admin/reactivate-requests");
export const adminActivateUserUrl = (userId) =>
  axiosInstance.put(`/admin/${userId}/activate-user`);
export const adminDeactivateUserUrl = (userId) =>
  axiosInstance.put(`/admin/${userId}/deactivate-user`);
// admin (Ad Post)
export const getAdminAdpostUrl = (params = {}) =>
  axiosInstance.get("/admin/ads", { params });

export const approveAdpostUrl = (adId) =>
  axiosInstance.post(`/admin/ads/${adId}/approve`);

export const rejectAdpostUrl = (adId, reason) =>
  axiosInstance.post(`/admin/ads/${adId}/reject`, { reason });
// admin (Escrow)
export const getAdminEscrowUrl = () => axiosInstance.get("/admin/escrow");

export const releaseEscrowAmountRequest = (milestoneId) =>
  axiosInstance.post(`/milestone/${milestoneId}/release-payment`);

// admin (Dispute)
export const getAdminDisputeUrl = () => axiosInstance.get("/admin/disputes");
// admin (Marketing)
export const getAdminMarketingUrl = () =>
  axiosInstance.get("marketing/campaigns");

export const createMailAdminMarketingUrl = (payload) =>
  axiosInstance.post("marketing/campaigns", payload.data, {
    isFormData: payload.isFormData,
  });
// admin (Categories)
export const getAdminCategoriesUrl = () =>
  axiosInstance.get("/admin/categories");

export const createAdminCategoryUrl = (data) =>
  axiosInstance.post("/admin/categories", data);

export const updateAdminCategoryUrl = (categoryId, data) =>
  axiosInstance.put(`/admin/categories/${categoryId}`, data);

export const deleteAdminCategoryUrl = (categoryId) =>
  axiosInstance.delete(`/admin/categories/${categoryId}`);

// admin (Admin Roles)
// Admin Roles Endpoints
export const getAdminRolesUrl = () => axiosInstance.get("/admin/roles");

export const createAdminRoleUrl = (data) =>
  axiosInstance.post("/admin/roles", data);

export const updateAdminRoleUrl = (roleId, data) =>
  axiosInstance.put(`/admin/roles/${roleId}`, data);

export const deleteAdminRoleUrl = (roleId) =>
  axiosInstance.delete(`/admin/roles/${roleId}`);

export const getAllPermissionsUrl = () =>
  axiosInstance.get("/admin/permissions");

export const getAllAdminUsers = () =>
  axiosInstance.get("/admin/users?page=1&pageSize=1000");

export const activateUserUrl = (userId) =>
  axiosInstance.put(`/admin/${userId}/activate-user`);

export const deactivateUserUrl = (userId) =>
  axiosInstance.put(`/admin/${userId}/deactivate-user`);

export const banUserUrl = (userId) =>
  axiosInstance.put(`/admin/${userId}/ban-user`);

//milestones
export const addNewMilestoneUrl = (jobId, milestoneData) =>
  axiosInstance.post(`/milestone/${jobId}`, milestoneData);

export const updateMilestoneUrl = (jobId, milestoneId, milestoneData) =>
  axiosInstance.put(`/milestone/${jobId}/${milestoneId}`, milestoneData);

export const acceptRejectMilestoneUrl = (jobId, milestoneId, state) =>
  axiosInstance.put(`/milestone/${jobId}/${milestoneId}/${state}`);

export const requestPaymentMilestoneUrl = (milestoneId) =>
  axiosInstance.put(`/milestone/${milestoneId}/request-payment`);

export const payMilestoneUrl = (milestoneId, payData) =>
  axiosInstance.post(`/milestone/${milestoneId}/pay`, payData);

export const queryMilestoneUrl = (milestoneId, disputeData) =>
  axiosInstance.post(`/milestone/${milestoneId}/dispute`, disputeData);

export const deleteMilestoneUrl = (jobId, milestoneId) =>
  axiosInstance.delete(`/milestone/${jobId}/${milestoneId}`);

export const cancelMilestoneUrl = (milestoneId) =>
  axiosInstance.post(`/milestone/${milestoneId}/cancel`);

//messages
export const getUsers = (includeTempContractors = false) =>
  axiosInstance.get(
    `/users?page=1&pageSize=50${
      includeTempContractors ? "&includeTempContractors=true" : ""
    }`
  );

//contractors
export const createContractorUrl = (payload) =>
  axiosInstance.post("/user/contractors", payload);

//portfolio
export const createPortfolioUrl = (payload) =>
  axiosInstance.post("/user/portfolio", payload);

export const updatePortfolioUrl = (portfolioId, payload) =>
  axiosInstance.patch(`/user/portfolio/${portfolioId}`, payload);

export const getPortfolioUrl = (userId) =>
  axiosInstance.get(`/users/${userId}/portfolio`);

export const deletePortfolioUrl = (portfolioId) =>
  axiosInstance.delete(`/user/portfolio/${portfolioId}`);

export const inviteUserToBidUrl = (jobId, userId, payload) =>
  axiosInstance.post(`/jobs/${jobId}/invite/${userId}`, payload);

export const acceptBidInvitationUrl = (jobId, invitationId) =>
  axiosInstance.post(`/jobs/${jobId}/invitations/${invitationId}/accept`);

export const rejectBidInvitationUrl = (jobId, invitationId) =>
  axiosInstance.post(`/jobs/${jobId}/invitations/${invitationId}/reject`);

// Fetch all reviews for a specific user (contractor)
export const getUserReviewsUrl = (userId) =>
  axiosInstance.get(`/users/${userId}/reviews`);

// Like/Unlike an advertisement
export const toggleLikeAdUrl = (adId) =>
  axiosInstance.post(`/user/advertisement/${adId}/toggle-like`);

export const postAdViewUrl = (adId) =>
  axiosInstance.post(`/user/advertisement/${adId}/view`);

export const getAdViewsUrl = (adId) =>
  axiosInstance.get(`/user/advertisement/${adId}/views?page=1&pageSize=20`);

export const postAdCommentUrl = (adId, comment) =>
  axiosInstance.post(`/user/advertisement/${adId}/comment`, {
    data: {
      type: "create_comment",
      comment,
    },
  });

export const deleteAdCommentUrl = (commentId) =>
  axiosInstance.delete(`/user/advertisement/comment/${commentId}`);

export const getAdCommentsUrl = (adId) =>
  axiosInstance.get(`/user/advertisement/${adId}/comments?page=1&pageSize=20`);

// Fetch full user profile with additional info, profile design, and portfolio
export const getFullUserProfileUrl = (userId) =>
  axiosInstance.get(
    `/user/${userId}?additionalinfo=true&profiledesign=true&portfolio=true`
  );

export const patchReviewHighlightUrl = (reviewId, payload) =>
  axiosInstance.patch(`/users/reviews/${reviewId}`, payload);

// Fetch highlighted review for a specific user (contractor)
export const getUserHighlightReviewUrl = (userId) =>
  axiosInstance.get(`/users/${userId}/reviews?highlight=true`);

export const postStripeCheckout = async (payload) => {
  return axiosInstance.post("/stripe/create-checkout-session", payload);
};

export const postPawapayCheckout = async (payload) => {
  return axiosInstance.post("/pawapay/request-payment-page", payload);
};

export const postMilestonePaymentReuest = async (milestoneId, payload) => {
  return axiosInstance.post(
    `/milestone/${milestoneId}/request-payment`,
    payload
  );
};

export const getPaymentSupportedCurrencies = async () => {
  return axiosInstance.get(`/payment/supported-currencies`);
};

export const postWebinarCalculatefee = async (payload) => {
  return axiosInstance.post(`/webinar/calculate-fee`, payload);
};

export const postWebinarPaymentReuest = async (payload) => {
  return axiosInstance.post(`/webinar/request-payment`, payload);
};

export const postAdsCalculatefee = async (payload) => {
  return axiosInstance.post(`/user/advertisement/calculate-fee`, payload);
};

export const postAdsPaymentReuest = async (payload) => {
  return axiosInstance.post(`/user/advertisement/request-payment`, payload);
};

// Get user's bid invitations
export const getUserBidInvitationsUrl = (userId) =>
  axiosInstance.get(`/users/${userId}/bid-invitations`);

// Validate contractor invitation token and get invitation details
export const validateContractorInvitationTokenUrl = (token) =>
  axiosInstance.get(`/contractors/complete-registration?token=${token}`);

// Create new contractor invitation (client-only access)
export const inviteContractorUrl = (payload) =>
  axiosInstance.post("/user/contractors", payload);

export const fetchIPLocation = async () => {
  try {
    const response = await axios.get("https://ipapi.co/json/");
    return response.data;
  } catch (error) {
    console.error("Error fetching IP data:", error);
    return null;
  }
};

export const getExchangeRate = async () => {
  return axiosInstance.get(`/config/exchange-rate/usd`);
};

export const postCreateStripeAccount = async (payload) => {
  return axiosInstance.post(`/stripe/create-stripe-account`, payload);
};

export const getAccountOnboarding = async () => {
  return axiosInstance.get(`/stripe/account-onboarding`);
};

export const postWebinarconfirmPayment = async (payload) => {
  return axiosInstance.post(`/webinar/confirm-payment`, payload);
};

export const postAdsConfirmPayment = async (payload) => {
  return axiosInstance.post(`/user/advertisement/confirm-payment`, payload);
};

export const postMilestoneConfirmPayment = async (milestoneId) => {
  return axiosInstance.post(`/milestone/${milestoneId}/confirm-payment`);
};

export const getStripeOnboardingComplete = async () => {
  return axiosInstance.get(`/stripe/account-onboarding/complete`);
};
//category
export const getCatalogueCategory = async () => {
  return axiosInstance.get(`/catalogue/category`);
};
//category
export const getCatalogueType = async (categoryId) => {
  return axiosInstance.get(`/catalogue/type?categoryId=${categoryId}`);
};
//category
export const getCatalogue = async (categoryId) => {
  return axiosInstance.get(`/catalogue?categoryId=${categoryId}`);
};
//category
export const getSingleCatalogue = async (catalogueId) => {
  return axiosInstance.get(`/catalogue/${catalogueId}`);
};

//webinar
export const getSingleWebinar = async (webinarId) => {
  return axiosInstance.get(`/webinar/${webinarId}`);
};

// Grant access to the pubnub channel
export const grantAccessToRoom = (payload) =>
  axiosInstance.post("/pubnub/grant-room", payload);

// Add alias for backward compatibility
export const acceptBidInvitation = acceptBidInvitationUrl;
export const rejectBidInvitation = rejectBidInvitationUrl;

// Get supported currencies
export const getSupportedCurrencies = () => axiosInstance.get("/currencies");

// Get user's bid invitations
export const getSubscribedChannels = () => axiosInstance.get(`/pubnub/rooms`);

// Grant access to the pubnub channel
export const notifyForNewMessage = (payload) =>
  axiosInstance.post("/message/notify-user", payload);

//Portfolio details
export const PortfolioDetails = async (projectId) => {
  return axiosInstance.get(`/portfolio/${projectId}`);
};

export const getWalletSummary = () => axiosInstance.get(`/wallet/summary`);

// export const getWalletMilestoneTransactions = () =>
//   axiosInstance.get(`/wallet/milestone-transactions`);

export const getWalletMilestoneTransactions = (page = 1, pageSize = 10) =>
  axiosInstance.get(`/wallet/milestone-transactions`, {
    params: { page, pageSize },
  });

export const getExpressStripeDashboardLink = async (accountId) =>
  axiosInstance.get(`/stripe/dashboard-link/${accountId}`);

// Retrieve details of a connected Stripe account.
export const getStripeAccountDetails = async () =>
  axiosInstance.get(`/stripe/account-retrieve`);

// Retrieves the current user’s location preference, language, and notification preferences.
export const getUserSettings = async () => axiosInstance.get(`/userSettings`);

// Allows updating global location preference, language, and preferred notification methods
export const updateUserSettings = (payload) =>
  axiosInstance.put(`/userSettings`, payload);

//Fetch paginated list of users with userType = "specialist", including profileDesign
export const getSpecialists = async (params = {}) =>
  axiosInstance.get(`/specialists`, { params });

export const postAdImpressionUrl = (adId) =>
  axiosInstance.post(`/user/advertisements/${adId}/impression`);

export const getStreamToken = async (userId) =>
  axiosInstance.post(`/get-token`, { userId });

// export const getStreamToken = async (userId) =>
//   axiosInstance.post(`/stream/generate-call-token`, {
//     "callId": "d6b1678c813db91fe9985148762383c7",
//     "validityInSeconds": 18000
//   });

// NEW: Get available payment methods for current user
export const getAdsPaymentMethods = async () => {
  return axiosInstance.get(`/user/advertisement/payment-methods`);
};

// NEW: Preview payment amounts in user's local currency
export const previewAdsPayment = async (payload) => {
  return axiosInstance.post(`/user/advertisement/preview-payment`, payload);
};

// NEW: Check payment status (useful for mobile money)
export const checkAdsPaymentStatus = async (adId) => {
  return axiosInstance.get(`/user/advertisement/${adId}/payment-status`);
};

export const getReviewStatusUrl = (userId, jobIds) => {
  const jobIdsString = Array.isArray(jobIds) ? jobIds.join(",") : jobIds;
  return axiosInstance.get(
    `/users/${userId}/review-status?jobIds=${jobIdsString}`
  );
};

export const getReviewUsersUrl = async (includeTempContractors = false) => {
  const queryParam = includeTempContractors
    ? "?includeTempContractors=true"
    : "";

  try {
    const response = await axiosInstance.get(`/reviews/users${queryParam}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching review users:", error);
    throw error;
  }
};

export const searchReviewUsersUrl = async (
  query,
  includeTempContractors = false
) => {
  const params = new URLSearchParams({
    q: query || "",
    includeTempContractors: includeTempContractors.toString(),
  });

  try {
    const response = await axiosInstance.get(`/reviews/users/search?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error searching review users:", error);
    throw error;
  }
};


export const searchTalents = (params = {}) => {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    userType = [],
    category = '',
    includeTempContractors = false
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (search && search.trim()) {
    queryParams.append('search', search.trim());
  }

  if (userType && userType.length > 0) {
    userType.forEach(type => queryParams.append('userType', type));
  }

  if (category && category.trim()) {
    queryParams.append('category', category.trim());
  }

  if (includeTempContractors) {
    queryParams.append('includeTempContractors', 'true');
  }

  return axiosInstance.get(`/search/talents?${queryParams.toString()}`);
};


// Get advertisement analytics
export const getAdAnalyticsUrl = (adId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `/user/advertisement/${adId}/analytics${queryParams ? `?${queryParams}` : ''}`;
  return axiosInstance.get(url);
};

// Get advertisement details with basic analytics
export const getAdDetailsWithAnalyticsUrl = (adId) => {
  return axiosInstance.get(`/user/advertisement/${adId}?includeAnalytics=true`);
};

export const getUserCountsUrl = (payload) =>
  axiosInstance.post("/user/advertisement/user-counts", payload);

export const getProfessionalTypesUrl = (payload) =>
  axiosInstance.post("/user/advertisement/professional-types", payload);

export const getUserSummaryUrl = (country) => {
  const params = country ? `?country=${encodeURIComponent(country)}` : '';
  return axiosInstance.get(`/user/advertisement/user-summary${params}`);
};

// Delete specific document from milestone
export const deleteDocumentUrl = (jobId, milestoneId, payload) =>
  axiosInstance.delete(`/milestone/${jobId}/${milestoneId}/document`, {
    data: payload
  });

// You can also add a function to get document details if needed
export const getDocumentDetailsUrl = (documentPath) =>
  axiosInstance.get(`/document/details/${encodeURIComponent(documentPath)}`);

// Leads automation
export const checkLeadsUrl = (payload) =>
  axiosInstance.post("/check-leads", payload);

export const sendWhatsappMessageUrl = (payload) =>
  axiosInstance.post("/leads/send-whatsapp-message", payload);

// bird messages apis
export const getMarketingMessagesHistoryUrl = (params = {}) => {
  console.log("params", params);
  const queryParams = new URLSearchParams(params).toString();
  const url = `/marketing/messages-history${queryParams ? `?${queryParams}` : ''}`;
  return  axiosInstance.get(url);
}

export const sendLeadEmailUrl = (payload) =>
  axiosInstance.post("/leads/send-email", payload);

// StartButton Payout APIs
export const getStartButtonPayoutSettingsUrl = () =>
  axiosInstance.get("/startbutton/payout-settings");

export const saveStartButtonPayoutSettingsUrl = (payload) =>
  axiosInstance.post("/startbutton/payout-settings", payload);

export const getStartButtonBanksUrl = (currency, params = {}) =>
  axiosInstance.get(`/startbutton/banks/${currency}`, { params });

export const verifyStartButtonAccountUrl = (params) =>
  axiosInstance.get("/startbutton/verify-account", { params });

export const getStartButtonMobileOperatorsUrl = (currency, params = {}) =>
  axiosInstance.get(`/startbutton/mobile-operators/${currency}`, { params });

// StartButton Wallet Balance - NEW
export const getStartButtonWalletBalance = () => {
  return axiosInstance.get('/startbutton/wallet-balances');
};

// StartButton Wallet Transactions - NEW
export const getStartButtonWalletTransactions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `/startbutton/wallet-transactions${queryParams ? `?${queryParams}` : ''}`;
  return axiosInstance.get(url);
};

// Get Suggested Profiles - NEW
export const getSuggestedProfiles = (params = {}) => {
  const queryString = new URLSearchParams();
  
  if (params.page) queryString.append('page', params.page);
  if (params.pageSize) queryString.append('pageSize', params.pageSize);
  if (params.onlyVerified) queryString.append('onlyVerified', params.onlyVerified);

  const url = queryString.toString() ? `/suggested-profiles?${queryString}` : '/suggested-profiles';
  return axiosInstance.get(url);
};

// Portfolio project management
export const updatePortfolioProjectUrl = (projectId, payload) =>
  axiosInstance.patch(`/user/portfolio/${projectId}`, payload);

export const deletePortfolioProjectUrl = (projectId) =>
  axiosInstance.delete(`/user/portfolio/${projectId}`);