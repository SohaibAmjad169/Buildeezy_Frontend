import { FIELD_TYPES } from "./login";
import i18next from "../../i18n";
import { IMAGE_FILE_TYPES, VIDEO_FILE_TYPES } from "../file";
import { t } from "i18next";

export const AD_CARD_WIDTH = 290;
export const AD_CARD_HEIGHT = 370;

// For PostAnAd component - restricts to learningSolution in production
export const AD_TYPE_OPTIONS = import.meta.env.VITE_NODE_ENV === 'production' 
  ? [
      { id: "learningSolution", label: i18next.t("ad.types.learningSolution") },
    ]
  : [
      { id: "product", label: i18next.t("ad.types.product") },
      { id: "profile", label: i18next.t("ad.types.profile") },
      { id: "promotional", label: i18next.t("ad.types.promotional") },
      { id: "learningSolution", label: i18next.t("ad.types.learningSolution") },
      {
        id: "productIntroduction",
        label: i18next.t("ad.types.productIntroduction"),
      },
      {
        id: "promotionalWorkshop",
        label: i18next.t("ad.types.promotionalWorkshop"),
      },
      {
        id: "training",
        label: i18next.t("ad.types.training"),
      },
    ];

// For Dashboard and other components - shows all ad types regardless of environment
export const DASHBOARD_AD_TYPE_OPTIONS = [
  { id: "product", label: i18next.t("ad.types.product") },
  { id: "profile", label: i18next.t("ad.types.profile") },
  { id: "promotional", label: i18next.t("ad.types.promotional") },
  { id: "learningSolution", label: i18next.t("ad.types.learningSolution") },
  {
    id: "productIntroduction",
    label: i18next.t("ad.types.productIntroduction"),
  },
  {
    id: "promotionalWorkshop",
    label: i18next.t("ad.types.promotionalWorkshop"),
  },
  {
    id: "training",
    label: i18next.t("ad.types.training"),
  },
];

export const HOW_LONG_RUN_OPTIONS = [
  { id: "oneDay", label: i18next.t("ad.duration.oneDay") },
  { id: "pickADate", label: i18next.t("ad.duration.pickADate") },
];

export const AUDIENCE_TYPE_OPTIONS = [
  { id: "client", label: i18next.t("ad.audience.client") },
  { id: "contractor", label: i18next.t("ad.audience.contractor") },
  { id: "specialist", label: i18next.t("ad.audience.specialist") },
  { id: "vendor", label: i18next.t("ad.audience.vendor") },
];

export const AD_QUESTIONS = [
  {
    id: "adType",
    title: i18next.t("ad.ad_type_title"),
    subtitle: i18next.t("ad.ad_type_subtitle"),
    label: i18next.t("ad.ad_type"),
    placeholder: "ad.option_label",
    type: FIELD_TYPES.select,
    options: AD_TYPE_OPTIONS,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "headline",
    title: i18next.t("ad.headline_title"),
    subtitle: i18next.t("ad.headline_subtitle"),
    label: i18next.t("ad.headline"),
    placeholder: "ad.enter_headline",
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "description",
    title: i18next.t("ad.description_title"),
    subtitle: i18next.t("ad.description_subtitle"),
    label: i18next.t("ad.description"),
    placeholder: "ad.enter_description",
    type: FIELD_TYPES.description,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
      maxLength: 300,
    },
  },
  {
    id: "audience",
    title: i18next.t("ad.audience_type_title"),
    subtitle: i18next.t("ad.audience_type_subtitle"),
    label: i18next.t("ad.audience_type"),
    placeholder: "ad.option_label",
    type: FIELD_TYPES.multipleSelect,
    options: AUDIENCE_TYPE_OPTIONS,
    value: [],
    validation: {
      required: true,
      error: "",
      valid: false,
      minItems: 1,
    },
    defaultOptions: (values) => {
      if (values.adType === "learningSolution") {
        return ["contractingCompany", "professional"];
      }
      return undefined;
    },
    disabledOptions: (values) => {
      if (values.adType === "learningSolution" && !values.displayOnDashboard) {
        return ["client", "vendor"];
      }
      return undefined;
    },
  },
  {
    id: "professionalType",
    title: i18next.t("ad.professional_type_title"),
    subtitle: i18next.t("ad.professional_type_subtitle"),
    label: i18next.t("ad.professional_type"),
    placeholder: i18next.t("ad.option_label"),
    type: FIELD_TYPES.multipleSelect,
    options: [],
    value: [],
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "documents",
    title: i18next.t("ad.upload_assets_title"),
    subtitle: i18next.t("ad.upload_assets_subtitle"),
    label: i18next.t("ad.upload_assets"),
    type: FIELD_TYPES.upload,
    fileTypes: { ...IMAGE_FILE_TYPES, ...VIDEO_FILE_TYPES },
    multipleFiles: true,
    value: [],
    validation: {
      required: true,
      error: "",
      valid: false,
      maxSize: 262144000, // 250MB in bytes
    },
    isAssets: true,
    maxFiles: (values) =>
      values.adType === "learningSolution" ? 1 : undefined,
    allowedFormats: (values) =>
      values.adType === "learningSolution"
        ? ["video", "gif", "slideshow"]
        : undefined,
    isLearningSolution: (values) => values.adType === "learningSolution",
  },
  {
    id: "businessName",
    title: i18next.t("ad.business_name"),
    subtitle: i18next.t("ad.business_name_subtitle"),
    label: i18next.t("ad.business_name"),
    placeholder: "ad.enter_business_name",
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: (values) => values.adType !== "learningSolution",
      error: "",
      valid: false,
    },
  },
  // {
  //   id: "url",
  //   title: i18next.t("ad.add_url_title"),
  //   subtitle: i18next.t("ad.add_url_subtitle"),
  //   label: i18next.t("ad.add_url"),
  //   placeholder: i18next.t("ad.enter_url"),
  //   type: FIELD_TYPES.text,
  //   value: "",
  //   validation: {
  //     required: false,
  //     error: "",
  //     valid: false,
  //   },
  //   show: (values) => values.adType !== "learningSolution",
  // },
  {
    id: "logo",
    title: i18next.t("ad.upload_brand_logo_title"),
    subtitle: i18next.t("ad.upload_brand_logo_subtitle"),
    label: i18next.t("ad.upload_brand_logo"),
    type: FIELD_TYPES.upload,
    fileTypes: IMAGE_FILE_TYPES,
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    isLogo: true,
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "callToAction",
    type: FIELD_TYPES.select,
    title: i18next.t("ad.design.callToAction.title"),
    subtitle: i18next.t("ad.design.callToAction.subtitle"),
    placeholder: "ad.design.callToAction.placeholder",
    options: [
      // {
      //   id: "learn_more",
      //   label: i18next.t("ad.design.callToAction.options.learn_more"),
      // },
      // {
      //   id: "register",
      //   label: i18next.t("ad.design.callToAction.options.register"),
      // },
      {
        id: "contact_only",
        label: i18next.t("ad.design.callToAction.options.contact_only"),
      },
    ],
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
  {
    id: "duration",
    title: i18next.t("ad.how_long_run_title"),
    subtitle: i18next.t("ad.how_long_run_subtitle"),
    label: i18next.t("ad.how_long_run"),
    placeholder: "ad.option_label",
    type: FIELD_TYPES.select,
    options: HOW_LONG_RUN_OPTIONS,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
    child: {
      show: false,
      data: [
        {
          id: "startAt",
          value: "",
          validation: {
            required: true,
            error: "",
            valid: false,
          },
        },
        {
          id: "expireAt",
          value: "",
          validation: {
            required: true,
            error: "",
            valid: false,
          },
        },
      ],
    },
  },
];

// the ad questions that will be shown after the design questions in mobile version
export const SUFFIX_AD_QUESTIONS_KEYS = [
  "audience",
  "professionalType",
  "duration",
];

export const AD_PROFESSIONAL_TYPE = {
  id: "professionalType",
  title: i18next.t("ad.professional_type_title"),
  subtitle: i18next.t("ad.professional_type_subtitle"),
  label: i18next.t("ad.professional_type"),
  placeholder: i18next.t("ad.option_label"),
  type: FIELD_TYPES.multipleSelect,
  options: [],
  value: [],
  required: true,
};

export const mapAdCategoryTitle = {
  product: i18next.t("ad.category.product"),
  profile: i18next.t("ad.category.profile"),
  promotional: i18next.t("ad.category.promotional"),
  learningSolution: i18next.t("ad.category.learningSolution"),
  uncategorized: i18next.t("ad.category.uncategorized"),
  productIntroduction: i18next.t("ad.types.productIntroduction"),
  training: i18next.t("ad.types.training"),
  promotionalWorkshop: i18next.t("ad.types.promotionalWorkshop"),
};

export const DESIGN_QUESTIONS = [
  {
    id: "banner",
    type: FIELD_TYPES.upload,
    title: i18next.t("ad.design.banner.title"),
    subtitle: i18next.t("ad.design.banner.subtitle"),
    fileTypes: {
      "image/svg+xml": [".svg"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
    },
    maxSize: "800x400px",
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    mobileConfig: {
      maxWidth: "100%",
      previewSize: "100%",
      uploadButtonText: i18next.t("ad.design.banner.uploadButtonText"),
      supportedFormats: i18next.t("ad.design.banner.supportedFormats"),
      maxFileSize: "5MB",
    },
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "theme",
    type: FIELD_TYPES.select,
    title: i18next.t("ad.design.theme.title"),
    subtitle: i18next.t("ad.design.theme.subtitle"),
    options: [
      {
        id: "default",
        label: i18next.t("ad.design.theme.options.default"),
      },
      {
        id: "dark",
        label: i18next.t("ad.design.theme.options.dark"),
      },
      {
        id: "light",
        label: i18next.t("ad.design.theme.options.light"),
      },
    ],
    value: "default",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "font",
    type: FIELD_TYPES.select,
    title: i18next.t("ad.design.font.title"),
    subtitle: i18next.t("ad.design.font.subtitle"),
      options: [
        { id: "inter", label: "Inter (Sans-serif)" },
        { id: "roboto", label: "Roboto (Sans-serif)" },
        { id: "oswald", label: "Oswald (Display)" },
        { id: "playfair", label: "Playfair Display (Serif)" },
        { id: "anton", label: "Anton (Display Bold)" },
        { id: "courier", label: "Courier New (Monospace)" },
        { id: "lora", label: "Lora (Serif)" },
        { id: "montserrat", label: "Montserrat (Sans-serif)" },
        { id: "orbitron", label: "Orbitron (Display)" },
        { id: "pacifico", label: "Pacifico (Handwriting)" }, 
    { id: "dancing", label: "Dancing Script (Handwriting)" }, 
      ],
      value: "inter",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "approach",
    type: FIELD_TYPES.quillEditor,
    title: i18next.t("ad.design.approach.title"),
    subtitle: i18next.t("ad.design.approach.subtitle"),
    placeholder: "ad.design.approach.design_placeholder",
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
      maxLength: 300,
    },
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "highlightReview",
    type: FIELD_TYPES.select,
    title: i18next.t("ad.design.highlightReview.title"),
    subtitle: i18next.t("ad.design.highlightReview.subtitle"),
    options: [],
    placeholder: "ad.design.highlightReview.placeholder",
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "faq",
    type: FIELD_TYPES.list,
    title: i18next.t("ad.design.faq.title"),
    subtitle: i18next.t("ad.design.faq.subtitle"),
    placeholder: "profile.design.interactive.faq_placeholder",
    description: i18next.t("profile.design.interactive.description"),
    value: [
      {
        id: 1,
        question: "",
        answer: "",
        displayOrder: 1,
      },
    ],
    validation: {
      required: false,
      error: "",
      valid: false,
      maxItems: 5,
    },
    fields: [
      {
        id: "question",
        type: FIELD_TYPES.text,
        title: i18next.t("profile.design.interactive.faq_question"),
        placeholder: i18next.t(
          "profile.design.interactive.faq_question_placeholder"
        ),
        validation: {
          required: true,
          maxLength: 200,
        },
      },
      {
        id: "answer",
        type: FIELD_TYPES.text,
        title: i18next.t("profile.design.interactive.faq_answer"),
        placeholder: i18next.t(
          "profile.design.interactive.faq_answer_placeholder"
        ),
        validation: {
          required: true,
          maxLength: 500,
        },
      },
    ],
    show: (values) => values.adType !== "learningSolution",
  },
  {
    id: "displayOnDashboard",
    title: i18next.t("learning.display_on_dashboard"),
    subtitle: i18next.t("learning.display_on_dashboard_subtitle"),
    label: i18next.t("learning.display_on_dashboard"),
    placeholder: "learning.display_on_dashboard_placeholder",
    type: FIELD_TYPES.select,
    options: [
      {
        id: "yes",
        label: i18next.t("yes"),
      },
      {
        id: "no",
        label: i18next.t("no"),
      },
    ],
    value: "",
    validation: {
      required: import.meta.env.VITE_NODE_ENV !== 'production',
      error: "",
      valid: false,
    },
    show: (values) => values.adType === "learningSolution" && import.meta.env.VITE_NODE_ENV !== 'production',
    required: import.meta.env.VITE_NODE_ENV !== 'production',
  },
];
