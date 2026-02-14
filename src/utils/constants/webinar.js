import { FIELD_TYPES } from "./login";
import i18next from "../../i18n";
import { IMAGE_FILE_TYPES, VIDEO_FILE_TYPES } from "../file";
import { t } from "i18next";

export const AD_CARD_WIDTH = 290;
export const AD_CARD_HEIGHT = 370;

export const AD_TYPE_OPTIONS = [
  {
    id: "productIntroduction",
    label: t("webinar.product_introduction"),
  },
  {
    id: "training",
    label: t("webinar.training"),
  },
  {
    id: "promotionalWorkshop",
    label: t("webinar.promotional_workshop"),
  },
];

export const HOW_LONG_RUN_OPTIONS = [
  {
    id: "pickADate",
    label: "Pick a date",
  },
];

export const AUDIENCE_TYPE_OPTIONS = [
  {
    id: "client",
    label: "Client",
  },
  {
    id: "contractor",
    label: "Contracting Companies",
  },
  {
    id: "specialist",
    label: "Professionals",
  },
  {
    id: "vendor",
    label: "Vendor",
  },
];

export const SETUP_QUESTIONS = [
  {
    id: "setupAdType",
    title: i18next.t("webinar.webinar_type_title"),
    subtitle: i18next.t("webinar.webinar_type_subtitle"),
    label: i18next.t("webinar.webinar_type"),
    placeholder: "webinar.option_label",
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
    id: "setupHeadline",
    title: i18next.t("webinar.headline_title"),
    subtitle: i18next.t("webinar.headline_subtitle"),
    label: i18next.t("webinar.headline"),
    placeholder: "webinar.enter_headline",
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "setupDescription",
    title: i18next.t("webinar.description_title"),
    subtitle: i18next.t("webinar.description_subtitle"),
    label: i18next.t("webinar.description"),
    placeholder: "webinar.enter_description",
  type: FIELD_TYPES.quillEditor,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
      maxLength: 300,
    },
  },
  {
    id: "setupDate",
    title: i18next.t("webinar.start_date"),
    subtitle: i18next.t("webinar.description_subtitle"),
    label: i18next.t("webinar.start_date"),
    type: FIELD_TYPES.dates,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "timeZone",
    title: i18next.t("webinar.timezone"),
    subtitle: i18next.t("webinar.description_subtitle"),
    label: i18next.t("webinar.timezone"),
    type: FIELD_TYPES.timezone,
    value: "UTC",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
   {
    id: "url",
       title: i18next.t("webinar.add_url_title"),
    subtitle: i18next.t("webinar.add_url_subtitle"),
    label: i18next.t("webinar.add_url"),
    placeholder: i18next.t("webinar.enter_url"),
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    show: (values) => values.callToAction === "learn_more",
  },
];

export const AD_QUESTIONS = [
  {
    id: "adType",
    title: i18next.t("webinar.webinar_type_title"),
    subtitle: i18next.t("webinar.webinar_type_subtitle"),
    label: i18next.t("webinar.webinar_type"),
    placeholder: "webinar.option_label",
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
    title: i18next.t("webinar.headline_title"),
    subtitle: i18next.t("webinar.headline_subtitle"),
    label: i18next.t("webinar.headline"),
    placeholder: "webinar.enter_headline",
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
    title: i18next.t("webinar.description_title"),
    subtitle: i18next.t("webinar.description_subtitle"),
    label: i18next.t("webinar.description"),
    placeholder: "webinar.enter_description",
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
    title: i18next.t("webinar.audience_type_title"),
    subtitle: i18next.t("webinar.audience_type_subtitle"),
    label: i18next.t("webinar.audience_type"),
    placeholder: "webinar.option_label",
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
    title: i18next.t("webinar.professional_type_title"),
    subtitle: i18next.t("webinar.professional_type_subtitle"),
    label: i18next.t("webinar.professional_type"),
    placeholder: i18next.t("webinar.option_label"),
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
    title: i18next.t("webinar.upload_assets_title"),
    subtitle: i18next.t("webinar.upload_assets_subtitle"),
    label: i18next.t("webinar.upload_assets"),
    type: FIELD_TYPES.upload,
    fileTypes: { ...IMAGE_FILE_TYPES, ...VIDEO_FILE_TYPES },
    multipleFiles: true,
    value: [],
    validation: {
      required: true,
      error: "",
      valid: false,
      maxSize: 5242880, // 5MB in bytes
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
    title: i18next.t("webinar.business_name"),
    subtitle: i18next.t("webinar.business_name_subtitle"),
    label: i18next.t("webinar.business_name"),
    placeholder: "webinar.enter_business_name",
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "id",
    title: i18next.t("webinar.add_id_title"),
    subtitle: i18next.t("webinar.add_id_subtitle"),
    label: i18next.t("webinar.webinar_id"),
    placeholder: "webinar.enter_id",
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
  {
    id: "logo",
    title: i18next.t("webinar.upload_brand_logo_title"),
    subtitle: i18next.t("webinar.upload_brand_logo_subtitle"),
    label: i18next.t("webinar.upload_brand_logo"),
    type: FIELD_TYPES.upload,
    fileTypes: IMAGE_FILE_TYPES,
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    isLogo: true,
  },
  {
    id: "duration",
    title: i18next.t("webinar.how_long_run_title"),
    subtitle: i18next.t("webinar.how_long_run_subtitle"),
    label: i18next.t("webinar.how_long_run"),
    placeholder: "webinar.option_label",
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

export const AD_PROFESSIONAL_TYPE = {
  id: "professionalType",
  title: i18next.t("webinar.professional_type_title"),
  subtitle: i18next.t("webinar.professional_type_subtitle"),
  label: i18next.t("webinar.professional_type"),
  placeholder: i18next.t("webinar.option_label"),
  type: FIELD_TYPES.multipleSelect,
  options: [],
  value: [],
  required: true,
};

export const mapWebinarCategoryTitle = {
  product: "Product Suggestions",
  profile: "Profile Suggestions",
  promotional: "Promotional",
  // learningSolution: "Learning & Solutions",
  // learningSolution: "Stories",?
  learningSolution: "Ideas Lounge",
  uncategorized: "Uncategorized Ads",
};

export const DESIGN_QUESTIONS = [
  {
    id: "banner",
    type: FIELD_TYPES.upload,
    title: i18next.t("webinar.design.banner.title"),
    subtitle: i18next.t("webinar.design.banner.subtitle"),
    fileTypes: {
      "image/svg+xml": [".svg"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
    },
    maxSize: "800x400px",
    placeholder: "webinar.design.banner.placeholder",
    value: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    mobileConfig: {
      maxWidth: "100%",
      previewSize: "100%",
      uploadButtonText: "Upload Banner",
      supportedFormats: "SVG, PNG, JPG, GIF",
      maxFileSize: "5MB",
    },
  },
  {
    id: "theme",
    type: FIELD_TYPES.select,
    title: i18next.t("webinar.design.theme.title"),
    subtitle: i18next.t("webinar.design.theme.subtitle"),
    placeholder: "webinar.design.theme.placeholder",
    options: [
      {
        id: "default",
        label: "Default (White)",
      },
      {
        id: "dark",
        label: "Dark",
      },
      {
        id: "light",
        label: "Light",
      },
    ],
    value: "default",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
  {
    id: "font",
    type: FIELD_TYPES.select,
    title: i18next.t("webinar.design.font.title"),
    subtitle: i18next.t("webinar.design.font.subtitle"),
    placeholder: "webinar.design.font.placeholder",
    options: [
      {
        id: "inter",
        label: "Default (Inter)",
      },
      {
        id: "roboto",
        label: "Roboto",
      },
      {
        id: "openSans",
        label: "Open Sans",
      },
    ],
    value: "inter",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
    {
      id: "approach",
      type: FIELD_TYPES.quillEditor,
      title: i18next.t("webinar.design.approach.title"),
      span: i18next.t("webinar.design.approach.span"),
      subtitle: i18next.t("webinar.design.approach.subtitle"),
      placeholder: "webinar.design.approach.placeholder",
      value: "",
      validation: {
        required: true,
        error: "",
        valid: false,
        maxLength: 300,
      },
    },
    {
      id: "callToAction",
      type: FIELD_TYPES.select,
      title: i18next.t("webinar.design.callToAction.title"),
      subtitle: i18next.t("webinar.design.callToAction.subtitle"),
      placeholder: "webinar.design.callToAction.placeholder",
      options: [
        {
          id: "register",
          label: i18next.t("webinar.design.callToAction.options.register"),
        },
        // {
        //   id: "learn_more",
        //   label: i18next.t("webinar.design.callToAction.options.learn_more"),
        // },
      ],
      value: "",
      validation: {
        required: false,
        error: "",
        valid: false,
      },
    },
    {
      id: "faq",
    type: FIELD_TYPES.list,
    title: i18next.t("webinar.design.faq.title"),
    subtitle: i18next.t("webinar.design.faq.subtitle"),
    placeholder: "webinar.design.faq.placeholder",
    description: i18next.t("profile.design.interactive.description"),
    value: [
      {
        question: "",
        answer: "",
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
        title: i18next.t("webinar.design.faq.question.title"),
        placeholder: "webinar.design.faq.question.placeholder",
        validation: {
          required: true,
          maxLength: 200,
        },
      },
      {
        id: "answer",
        type: FIELD_TYPES.text,
        title: i18next.t("webinar.design.faq.answer.title"),
        placeholder: "webinar.design.faq.answer.placeholder",
        validation: {
          required: true,
          maxLength: 500,
        },
      },
    ],
  },
 
];
