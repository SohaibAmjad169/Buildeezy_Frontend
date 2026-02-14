import { lazy } from "react";
import PublicPages from "../../pages/public";
import Login from "../../pages/public/Login";
const Register = lazy(() => import("../../pages/public/Register"));
const ForgotPassword = lazy(() => import("../../pages/public/ForgotPassword"));
const ReactivateAccount = lazy(() =>
  import("../../pages/public/ReactivateAccount")
);
const ForgotPassVerification = lazy(() =>
  import("../../pages/public/ForgotPassVerification")
);
const ResetPassword = lazy(() => import("../../pages/public/ResetPassword"));
const RegisterVerification = lazy(() =>
  import("../../pages/public/RegisterVerification")
);
const Onboarding = lazy(() => import("../../pages/public/Onboarding"));

const PrivatePages = lazy(() => import("../../pages/private"));
const Dashboard = lazy(() => import("../../pages/private/dashboard/DashboardHome"));
const Profile = lazy(() => import("../../pages/private/Profile"));
const Notifications = lazy(() => import("../../pages/private/Notifications"));
const PastClients = lazy(() => import("../../pages/private/PastClients"));
const Verification = lazy(() => import("../../pages/private/Verification"));
const PostAJob = lazy(() => import("../../pages/private/PostAJob"));
const AllJobs = lazy(() => import("../../pages/private/AllJobs"));
const Accounts = lazy(() => import("../../pages/private/Accounts"));
const PaymentSuccessPage = lazy(() =>
  import("../../pages/private/paymentSuccess/PaymentSuccessPage")
);
const Catalogue = lazy(() => import("../../pages/private/catalogue/Catalogue"));
const SubCatalogue = lazy(() =>
  import("../../pages/private/catalogue/SubCatalogue")
);
const CatalogueType = lazy(() =>
  import("../../pages/private/catalogue/CatalogueType")
);
const SingleCatalogue = lazy(() =>
  import("../../pages/private/catalogue/SingleCatalogue")
);
const Points = lazy(() => import("../../pages/private/Points"));
const AllJobsViewDetails = lazy(() =>
  import("../../pages/private/AllJobsViewDetails")
);
const ActiveJobs = lazy(() => import("../../pages/private/ActiveJobs"));
const ActiveJobsViewDetails = lazy(() =>
  import("../../pages/private/ActiveJobsViewDetails")
);
const DraftedJobs = lazy(() => import("./../../pages/private/DraftedJobs"));
const MyBids = lazy(() => import("./../../pages/private/MyBids"));
const MyBidsViewDetails = lazy(() =>
  import("../../pages/private/MyBidsViewDetails")
);
const MyContracts = lazy(() => import("./../../pages/private/MyContracts"));
const MyContractsViewDetails = lazy(() =>
  import("../../pages/private/MyContractsViewDetails")
);
const PostAnAd = lazy(() => import("./../../pages/private/PostAnAd"));
const MyAds = lazy(() => import("./../../pages/private/MyAds"));
const MyAdsViewDetails = lazy(() =>
  import("./../../pages/private/MyAdsViewDetails")
);
const AllAdsViewDetails = lazy(() =>
  import("./../../pages/private/AllAdsViewDetails")
);
const WebinarViewDetails = lazy(() =>
  import("./../../pages/private/WebinarViewDetails")
);
const MyWebinarViewDetails = lazy(() =>
  import("./../../pages/private/MyWebinarViewDetails")
);
const Learning = lazy(() => import("./../../pages/private/Learning"));
const EditAJob = lazy(() => import("../../pages/private/EditAJob"));
const EditAnAd = lazy(() => import("../../pages/private/EditAnAd"));
const ReactiveAnAd = lazy(() => import("../../components/myAds/ReactiveAnAd"));
const Review = lazy(() => import("../../components/myContracts/Review"));
const ContractorProfile = lazy(() =>
  import("../../components/ContractorProfile")
);
const AddReview = lazy(() => import("../../pages/private/AddReview"));
const Message = lazy(() => import("../../pages/private/Message"));
const Admin = lazy(() => import("../../pages/public/AdminLogin"));

// Admin pages path start
const AdminProfile = lazy(() => import("../../pages/private/admin/Profile"));
const AdminPostAd = lazy(() =>
  import("../../components/dashboard/AdminPostAd")
);
const AdminDashboard = lazy(() =>
  import("../../pages/private/admin/Dashboard")
);
const AdminRevenue = lazy(() => import("../../pages/private/admin/Revenue"));
const AdminUsers = lazy(() => import("../../pages/private/admin/Users"));
const AdminCatalogue = lazy(() =>
  import("../../pages/private/admin/Catalogue")
);
const AdminCatalogueCategory = lazy(() =>
  import("../../pages/private/admin/CatalogueCategory")
);
const AdminVerification = lazy(() =>
  import("../../pages/private/admin/userManagment/Verification")
);
const AdminReactivation = lazy(() =>
  import("../../pages/private/admin/userManagment/Reactivation")
);
const AdminAdposts = lazy(() =>
  import("../../pages/private/admin/userManagment/Adpost")
);
const AdminPaymentManagment = lazy(() =>
  import("../../pages/private/admin/userManagment/PaymentManagment")
);
const AdminDispute = lazy(() =>
  import("../../pages/private/admin/userManagment/Dispute")
);
const AdminMarketing = lazy(() =>
  import("../../pages/private/admin/Marketing")
);
const AdminLeads = lazy(() =>
  import("../../pages/private/admin/Leads")
);

const AdminMessagesLog = lazy(() =>
  import("../../pages/private/admin/MessagesLog")
);
const AdminCategories = lazy(() =>
  import("../../pages/private/admin/settings/Categories")
);
const AdminRoles = lazy(() =>
  import("../../pages/private/admin/settings/AdminRoles")
);

const Clarity = lazy(() =>
  import("../../pages/private/admin/ClarityDashboard")
);


// Admin pages path end
const AddContractor = lazy(() => import("../../pages/private/AddContractor"));
const Portfolio = lazy(() => import("../../pages/private/Portfolio"));
const AddPortfolio = lazy(() =>
  import("../../components/portfolio/AddPortfolio")
);
const UpdateJobPreview = lazy(() =>
  import("../../pages/private/UpdateJobPreview")
);
const AddTalent = lazy(() => import("../../pages/private/AddTalent"));
const AddWebinar = lazy(() => import("./../../pages/private/AddWebinar"));
const WebinarLiveCall = lazy(() =>
  import("./../../pages/private/WebinarLiveCall")
);
const WebinarMeeting = lazy(() =>
  import("../../pages/private/webinarMeeting/WebinarMeeting")
);
// const JobInvitationViewDetails = lazy(() =>
//   import("../../pages/private/JobInvitationViewDetails")
// );
const Invitations = lazy(() => import("../../pages/private/Invitations"));
const ViewPortfolioPage = lazy(() =>
  import("../../pages/private/ViewPortfolioPage")
);
const InvitationJobDetails = lazy(() =>
  import("../../pages/private/InvitationJobDetails")
);
const Professionals = lazy(() => import("../../pages/private/Professionals"));

import { USER_TYPES } from "./login";

export const INDIVIDUAL_ROUTES = [
  "profile",
  "notifications",
  "past-clients",
  "verification",
];

export const ROUTES = {
  root: "/",
  login: "login",
  register: "register",
  forgotPassword: "forgot-password",
  reactivateAccount: "reactivate-account",
  forgotPasswordVerification: "forgot-password-verification",
  resetPassword: "reset-password",
  registerVerification: "register-verification",
  onboarding: "onboarding",

  dashboard: "dashboard",
  viewAllAdDetails: "dashboard/view/:id",
  contractorProfile: "dashboard/view/:id/profile",
  accounts: "accounts",
  catalogue: "catalogue",
  catalogueType: "catalogue/type/:id",
  SubCatalogue: "catalogue/type/sub-catalogue/:id",
  SingleCatalogue: "catalogue/type/sub-catalogue/sigle-catalogue/:id",
  points: "points",
  connect_bank_account: "bank-account",
  profile: "profile",
  portfolio: "profile/portfolio",
  addPortfolio: "profile/portfolio/add",
  editPortfolio: "profile/portfolio/edit/:id",
  viewPortfolio: "profile/portfolio/view/:projectId",
  notifications: "notifications",
  pastClients: "past-clients",
  verification: "verification",
  postAJob: "post-a-job",
  allJobs: "all-jobs",
  viewAllJobDetails: "all-jobs/view/:id",
  activeJobs: "active-jobs",
  viewActiveJobDetails: "active-jobs/view/:id",
  editActiveJobDetails: "active-jobs/edit/:id",
  filledJobs: "filled-jobs",
  viewFilledJobDetails: "filled-jobs/view/:id",
  draftedJobs: "drafted-jobs",
  editDraftedJobDetails: "drafted-jobs/edit/:id",
  myBids: "my-bids",
  viewMyBidDetails: "my-bids/view/:id",
  myContracts: "my-contracts",
  viewMyContractsDetails: "my-contracts/view/:id",
  preview_job_update: "my-contracts/view/:id/preview",
  add_talent: "my-contracts/view/:id/add-talent",
  review: "my-contracts/review/:id",
  postAnAd: "post-an-ad",
  myAds: "my-ads",
  // learning: "stories",
  learning: "ideas-lounge",
  editAdDetails: "my-ads/edit/:id",
  reactiveAnAd: "my-ads/reactive/:id",
  viewMyAdDetails: "my-ads/view/:id",
  addReview: "add-review",
  message: "message",
  addWebinar: "add-webinar",
  invitations: "invitations",
  invitationJobDetails: "invitations/job/:jobId/:invitationId",
  webinarLiveCall: "webinar/start-live-call",
  WebinarMeeting: "webinar/meeting/:callId",
  webinarViewDetails: "webinar-view-details",
  MyWebinarViewDetails: "my-webinar-view-details",
  // admin url points start
  admin: "admin",
  adminProfile: "admin/profile",
  adminPostAd: "admin/post-ad",
  adminMyAds: "admin/my-ads",
  adminEditAdDetails: "admin/my-ads/edit/:id",
  adminReactiveAnAd: "admin/my-ads/reactive/:id",
  adminViewMyAdDetails: "admin/my-ads/view/:id",
  adminDashboard: "admin/dashboard",
  adminRevenue: "admin/revenue",
  adminUsers: "admin/users",
  adminCatalogue: "admin/catalogue",
  adminCatalogueCategory: "admin/catalogue-category",
  adminVerification: "admin/verifications",
  adminReactivation: "admin/reactivation",
  adminAdpost: "admin/ad-post",
  adminPaymentManagment: "admin/payment-managment",
  adminDispute: "admin/dispute",
  adminMarketing: "admin/marketing",
  adminCategories: "admin/categories",
  adminRoles: "admin/admin-roles",
  clarity: "admin/clarity",
  adminLeads: "admin/leads",
  messagesLog: "admin/messages-log",
  // admin url points end
  addContractor: "add-contractor",
  paymentSuccessPage: "/:type/:id/success",
  professionals: "professionals",
};

export const publicRouteList = {
  id: "publicPages",
  path: ROUTES.root,
  component: PublicPages,
  child: [
    {
      id: "login",
      path: ROUTES.login,
      component: Login,
    },
    {
      id: "register",
      path: ROUTES.register,
      component: Register,
    },
    {
      id: "forgotPassword",
      path: ROUTES.forgotPassword,
      component: ForgotPassword,
    },
    {
      id: "ForgotPassVerification",
      path: ROUTES.forgotPasswordVerification,
      component: ForgotPassVerification,
    },
    {
      id: "resetPassword",
      path: ROUTES.resetPassword,
      component: ResetPassword,
    },
    {
      id: "registerVerification",
      path: ROUTES.registerVerification,
      component: RegisterVerification,
    },
    {
      id: "onboarding",
      path: ROUTES.onboarding,
      component: Onboarding,
    },
    {
      id: "reactivateAccount",
      path: ROUTES.reactivateAccount,
      component: ReactivateAccount,
    },
    {
      id: "admin",
      path: ROUTES.admin,
      component: Admin,
    },
  ],
};

export const protectedRouteList = [
  {
    id: "protectedPages",
    path: ROUTES.root,
    component: PublicPages,
    child: [
      // {
      //   id: "reactivateAccount",
      //   path: ROUTES.reactivateAccount,
      //   component: ReactivateAccount,
      // },
    ],
  },
];

export const privateRouteList = {
  id: "privatePages",
  path: ROUTES.root,
  component: PrivatePages,
  roles: [
    USER_TYPES.admin,
    USER_TYPES.client,
    USER_TYPES.contractor,
    USER_TYPES.specialist,
    USER_TYPES.vendor,
  ],
  child: [
    {
      id: "dashboard",
      path: ROUTES.dashboard,
      component: Dashboard,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "accounts",
      path: ROUTES.accounts,
      component: Accounts,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "points",
      path: ROUTES.points,
      component: Points,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "profile",
      path: ROUTES.profile,
      component: Profile,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "portfolio",
      path: ROUTES.portfolio,
      component: Portfolio,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "addPortfolio",
      path: ROUTES.addPortfolio,
      component: AddPortfolio,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "notifications",
      path: ROUTES.notifications,
      component: Notifications,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "pastClients",
      path: ROUTES.pastClients,
      component: PastClients,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "verification",
      path: ROUTES.verification,
      component: Verification,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "postAJob",
      path: ROUTES.postAJob,
      component: PostAJob,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "allJobs",
      path: ROUTES.allJobs,
      component: AllJobs,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "allJobsViewDetails",
      path: ROUTES.viewAllJobDetails,
      component: AllJobsViewDetails,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "activeJobs",
      path: ROUTES.activeJobs,
      component: ActiveJobs,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "activeJobsViewDetails",
      path: ROUTES.viewActiveJobDetails,
      component: ActiveJobsViewDetails,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "editActiveJobDetails",
      path: ROUTES.editActiveJobDetails,
      component: EditAJob,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    // {
    //   id: "filledJobs",
    //   path: ROUTES.filledJobs,
    //   component: FilledJobs,
    //   roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    // },
    // {
    //   id: "filledJobsViewDetails",
    //   path: ROUTES.viewFilledJobDetails,
    //   component: FilledJobsViewDetails,
    //   roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    // },
    {
      id: "draftedJobs",
      path: ROUTES.draftedJobs,
      component: DraftedJobs,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "editDraftedJobDetails",
      path: ROUTES.editDraftedJobDetails,
      component: EditAJob,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "myBid",
      path: ROUTES.myBids,
      component: MyBids,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "myBidsViewDetails",
      path: ROUTES.viewMyBidDetails,
      component: MyBidsViewDetails,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "myContracts",
      path: ROUTES.myContracts,
      component: MyContracts,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "myContractsViewDetails",
      path: ROUTES.viewMyContractsDetails,
      component: MyContractsViewDetails,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "invitations",
      path: ROUTES.invitations,
      component: Invitations,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "review",
      path: ROUTES.review,
      component: Review,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "postAnAd",
      path: ROUTES.postAnAd,
      component: PostAnAd,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "myAds",
      path: ROUTES.myAds,
      component: MyAds,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "learning",
      path: ROUTES.learning,
      component: Learning,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "editAdDetails",
      path: ROUTES.editAdDetails,
      component: EditAnAd,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "reactiveAnAd",
      path: ROUTES.reactiveAnAd,
      component: ReactiveAnAd,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "viewAllAdDetails",
      path: ROUTES.viewAllAdDetails,
      component: AllAdsViewDetails,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "viewMyAdDetails",
      path: ROUTES.viewMyAdDetails,
      component: MyAdsViewDetails,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "contractorProfile",
      path: ROUTES.contractorProfile,
      component: ContractorProfile,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "addReview",
      path: ROUTES.addReview,
      component: AddReview,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "message",
      path: ROUTES.message,
      component: Message,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "addWebinar",
      path: ROUTES.addWebinar,
      component: AddWebinar,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "webinarViewDetails",
      path: ROUTES.webinarViewDetails,
      component: WebinarViewDetails,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    {
      id: "MyWebinarViewDetails",
      path: ROUTES.MyWebinarViewDetails,
      component: MyWebinarViewDetails,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist, USER_TYPES.vendor],
    },
    // Admin routes start
    {
      id: "adminProfile",
      path: ROUTES.adminProfile,
      component: AdminProfile,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminPostAd",
      path: ROUTES.adminPostAd,
      component: AdminPostAd,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminMyAds",
      path: ROUTES.adminMyAds,
      component: MyAds,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminEditAdDetails",
      path: ROUTES.adminEditAdDetails,
      component: EditAnAd,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminReactiveAnAd",
      path: ROUTES.adminReactiveAnAd,
      component: ReactiveAnAd,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminViewMyAdDetails",
      path: ROUTES.adminViewMyAdDetails,
      component: AllAdsViewDetails,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminDashboard",
      path: ROUTES.adminDashboard,
      component: AdminDashboard,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminRevenue",
      path: ROUTES.adminRevenue,
      component: AdminRevenue,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminUsers",
      path: ROUTES.adminUsers,
      component: AdminUsers,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminCatalogue",
      path: ROUTES.adminCatalogue,
      component: AdminCatalogue,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminCatalogueCategory",
      path: ROUTES.adminCatalogueCategory,
      component: AdminCatalogueCategory,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminVerification",
      path: ROUTES.adminVerification,
      component: AdminVerification,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminReactivation",
      path: ROUTES.adminReactivation,
      component: AdminReactivation,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminAdpost",
      path: ROUTES.adminAdpost,
      component: AdminAdposts,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminPaymentManagment",
      path: ROUTES.adminPaymentManagment,
      component: AdminPaymentManagment,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminDispute",
      path: ROUTES.adminDispute,
      component: AdminDispute,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminMarketing",
      path: ROUTES.adminMarketing,
      component: AdminMarketing,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminLeads",
      path: ROUTES.adminLeads,
      component: AdminLeads,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminMessagesLog",
      path: ROUTES.messagesLog,
      component: AdminMessagesLog,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminCategories",
      path: ROUTES.adminCategories,
      component: AdminCategories,
      roles: [USER_TYPES.admin],
    },
    {
      id: "adminRoles",
      path: ROUTES.adminRoles,
      component: AdminRoles,
      roles: [USER_TYPES.admin],
    },

        {
      id: "clarity",
      path: ROUTES.clarity,
      component: Clarity,
      roles: [USER_TYPES.admin],
    },
    // Admin routes end
    {
      id: "addContractor",
      path: ROUTES.addContractor,
      component: AddContractor,
      roles: [USER_TYPES.client],
    },
    {
      id: "previewJobUpdate",
      path: ROUTES.preview_job_update,
      component: UpdateJobPreview,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "add_talent",
      path: ROUTES.add_talent,
      component: AddTalent,
      roles: [USER_TYPES.client, USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "catalogue",
      path: ROUTES.catalogue,
      component: Catalogue,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "catalogueType",
      path: ROUTES.catalogueType,
      component: CatalogueType,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "SingleCatalogue",
      path: ROUTES.SingleCatalogue,
      component: SingleCatalogue,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "SubCatalogue",
      path: ROUTES.SubCatalogue,
      component: SubCatalogue,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "paymentSuccessPage",
      path: ROUTES.paymentSuccessPage,
      component: PaymentSuccessPage,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "viewPortfolio",
      path: ROUTES.viewPortfolio,
      component: ViewPortfolioPage,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    // {
    //   id: "viewPortfolio",
    //   path: ROUTES.viewPortfolio,
    //   component: ViewPortfolioPage,
    //   roles: [
    //     USER_TYPES.client,
    //     USER_TYPES.contractor,
    //     USER_TYPES.specialist,
    //     USER_TYPES.vendor,
    //   ],
    // },
    // {
    //   id: "viewPortfolio",
    //   path: ROUTES.viewPortfolio,
    //   component: ViewPortfolioPage,
    //   roles: [
    //     USER_TYPES.client,
    //     USER_TYPES.contractor,
    //     USER_TYPES.specialist,
    //     USER_TYPES.vendor,
    //   ],
    // },
    {
      id: "webinarLiveCall",
      path: ROUTES.webinarLiveCall,
      component: WebinarLiveCall,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "WebinarMeeting",
      path: ROUTES.WebinarMeeting,
      component: WebinarMeeting,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
    {
      id: "invitationJobDetails",
      path: ROUTES.invitationJobDetails,
      component: InvitationJobDetails,
      roles: [USER_TYPES.contractor, USER_TYPES.specialist],
    },
    {
      id: "professionals",
      path: ROUTES.professionals,
      component: Professionals,
      roles: [
        USER_TYPES.client,
        USER_TYPES.contractor,
        USER_TYPES.specialist,
        USER_TYPES.vendor,
      ],
    },
  ],
};
