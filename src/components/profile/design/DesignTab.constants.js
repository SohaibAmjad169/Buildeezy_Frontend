import { FIELD_TYPES } from "../../../utils/constants/login";
import i18next from "../../../i18n";
import { t } from "i18next";

export const THEME_OPTIONS = [
  {
    id: "default",
    label: i18next.t("profile.design.layout.theme_default"),
    color: "#F7FFE6",
  },
  {
    id: "white",
    label: i18next.t("profile.design.layout.theme_white"),
    color: "#fff",
  },
  {
    id: "blue",
    label: i18next.t("profile.design.layout.theme_blue"),
    color: "#EEF4FF",
  },
  {
    id: "grey",
    label: i18next.t("profile.design.layout.theme_grey"),
    color: "#e4e7ec",
  },
  {
    id: "purple",
    label: i18next.t("profile.design.layout.theme_purple"),
    color: "#F3E5F5",
  },
  {
    id: "yellow",
    label: i18next.t("profile.design.layout.theme_yellow"),
    color: "#FEDF89",
  },
  {
    id: "rose",
    label: i18next.t("profile.design.layout.theme_rose"),
    color: "#FEF3F2",
  },
  {
    id: "orange_gradient",
    label: i18next.t("profile.design.layout.theme_woodin"),
    previewImage: "/background/bk-7.png",
    backgroundImage: "/background/bk-1.png",
    color: "#F79009",
    type: "gradient",
  },
  {
    id: "decorative_frame",
    label: i18next.t("profile.design.layout.theme_kenya"),
    previewImage: "/background/bk-3.png",
    backgroundImage: "/background/bk-2.png",
    decorativeImage: "/background/bk-3.png",
    imagePosition: "top-bottom",
    type: "image",
  },
  {
    id: "decorative_frame_alt",
    label: i18next.t("profile.design.layout.theme_masai"),
    previewImage: "/background/bk-4.png",
    backgroundImage: "/background/bk-2.png",
    decorativeImage: "/background/bk-4.png",
    imagePosition: "top-bottom",
    type: "image",
  },
  {
    id: "new_orange_frame",
    label: i18next.t("profile.design.layout.theme_asante"),
    previewImage: "/background/bk-5.png",
    backgroundImage: "/background/bk-5.png",
    decorativeImage: "/background/bk-5.png",
    imagePosition: "left-right",
    type: "image",
  },
  {
    id: "green_gradient",
    label: i18next.t("profile.design.layout.theme_woodin_alt"),
    previewImage: "/background/bk-6.png",
    backgroundImage: "/background/bk-1.png",
    decorativeImage: "/background/bk-1.png",
    type: "gradient",
  },
];

export const FONT_OPTIONS = [
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
];

export const SKILLS_OPTIONS = [
  {
    id: "residential",
    label: i18next.t("profile.design.content.skills_residential"),
  },
  {
    id: "commercial",
    label: i18next.t("profile.design.content.skills_commercial"),
  },
  {
    id: "renovation",
    label: i18next.t("profile.design.content.skills_renovation"),
  },
  {
    id: "remodeling",
    label: i18next.t("profile.design.content.skills_remodeling"),
  },
  {
    id: "electrical",
    label: i18next.t("profile.design.content.skills_electrical"),
  },
  {
    id: "plumbing",
    label: i18next.t("profile.design.content.skills_plumbing"),
  },
  {
    id: "hvac",
    label: i18next.t("profile.design.content.skills_hvac"),
  },
  {
    id: "carpentry",
    label: i18next.t("profile.design.content.skills_carpentry"),
  },
  {
    id: "masonry",
    label: i18next.t("profile.design.content.skills_masonry"),
  },
  {
    id: "painting",
    label: i18next.t("profile.design.content.skills_painting"),
  },
  {
    id: "flooring",
    label: i18next.t("profile.design.content.skills_flooring"),
  },
  {
    id: "roofing",
    label: i18next.t("profile.design.content.skills_roofing"),
  },
  {
    id: "landscaping",
    label: i18next.t("profile.design.content.skills_landscaping"),
  },
  {
    id: "interior",
    label: i18next.t("profile.design.content.skills_interior"),
  },
  {
    id: "project_management",
    label: i18next.t("profile.design.content.skills_project_management"),
  },
];

export const CERTIFICATION_ORG_OPTIONS = [
  {
    id: "interior_design",
    label: t("profile.design.content.certification_org_interior"),
  },
  {
    id: "architecture",
    label: t("profile.design.content.certification_org_architecture"),
  },
  {
    id: "construction",
    label: t("profile.design.content.certification_org_construction"),
  },
  {
    id: "project_management",
    label: t("profile.design.content.certification_org_project"),
  },
  {
    id: "other",
    label: t("profile.design.content.certification_org_other"),
  },
];

export const LAYOUT_FIELDS = [
  {
    id: "banner",
    type: FIELD_TYPES.upload,
    translationKey: i18next.t("profile.design.layout.banner"),
    placeholder: "profile.design.layout.banner_placeholder",
    defaultValue: null,
    validation: {
      required: false,
      error: "",
      valid: false,
    },
    maxSize: "800x400",
    acceptedFormats: ["image/svg+xml", "image/png", "image/jpeg", "image/gif"],
    dataTour: "banner-upload",
  },
  {
    id: "theme",
    type: FIELD_TYPES.select,
    translationKey: i18next.t("profile.design.layout.theme"),
    placeholder: i18next.t("profile.design.layout.theme_placeholder"),
    options: THEME_OPTIONS,
    defaultValue: "default",
    dataTour: "theme-selector",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
  {
    id: "font",
    type: FIELD_TYPES.select,
    translationKey: i18next.t("profile.design.layout.font"),
    placeholder: "Choose font style",
    options: FONT_OPTIONS,
    defaultValue: "inter",
    dataTour: "font-selector",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
];

export const CONTENT_FIELDS = [
  {
    id: "slogan",
    type: FIELD_TYPES.description,
    translationKey: i18next.t("profile.design.content.slogan"),
    placeholder: i18next.t("profile.design.content.slogan_placeholder"),
    defaultValue: "",
    validation: {
      required: false,
      error: "",
      valid: false,
      maxLength: 200,
    },
    multiline: true,
    rows: 3,
    sx: {
      "& .MuiOutlinedInput-root": {
        height: 93,
      },
      "& .MuiInputBase-input": {
        height: "auto !important",
        paddingLeft: "14px !important",
      },
    },
  },
  {
    id: "skills",
    type: FIELD_TYPES.multipleSelect,
    translationKey: i18next.t("profile.design.content.skills"),
    placeholder: i18next.t("profile.design.content.skills_placeholder"),
    defaultValue: [],
    options: SKILLS_OPTIONS,
    validation: {
      required: false,
      error: "",
      valid: false,
      minItems: 1,
      maxItems: 10,
    },
  },
  {
    id: "certifications",
    type: "list",
    translationKey: i18next.t("profile.design.content.certifications"),
    description: i18next.t("profile.design.content.certifications_description"),
    placeholder: i18next.t("profile.design.content.certifications_placeholder"),
    defaultValue: [{}],
    validation: {
      required: false,
      error: "",
      valid: false,
      maxItems: 10,
    },
    fields: [
      {
        id: "title",
        type: "text",
        label: i18next.t("profile.design.content.certification_title"),
        placeholder: i18next.t(
          "profile.design.content.certification_title_placeholder"
        ),
        validation: {
          required: false,
          maxLength: 100,
        },
      },
      {
        id: "year",
        type: "text",
        label: i18next.t("profile.design.content.certification_year"),
        placeholder: i18next.t(
          "profile.design.content.certification_year_placeholder"
        ),
        validation: {
          required: false,
          pattern: "^\\d{4}$",
          maxLength: 4,
        },
      },
      {
        id: "organization",
        type: "select",
        placeholder: i18next.t(
          "profile.design.content.certification_org_placeholder"
        ),
        options: CERTIFICATION_ORG_OPTIONS,
        validation: {
          required: false,
        },
      },
    ],
  },
  {
    id: "awards",
    type: "list",
    translationKey: i18next.t("profile.design.content.awards"),
    description: i18next.t("profile.design.content.awards_description"),
    placeholder: i18next.t("profile.design.content.awards_placeholder"),
    defaultValue: [],
    validation: {
      required: false,
      error: "",
      valid: false,
      maxItems: 5,
    },
    fields: [
      {
        id: "title",
        type: "text",
        label: i18next.t("profile.design.content.award_title"),
        placeholder: i18next.t(
          "profile.design.content.award_title_placeholder"
        ),
        validation: {
          required: false,
          maxLength: 100,
        },
      },
      {
        id: "year",
        type: "text",
        label: i18next.t("profile.design.content.award_year"),
        placeholder: i18next.t("profile.design.content.award_year_placeholder"),
        validation: {
          required: false,
          pattern: "^\\d{4}$",
          maxLength: 4,
        },
      },
    ],
  },
  {
    id: "introVideo",
    type: "video",
    translationKey: i18next.t("profile.design.content.intro_video"),
    description: i18next.t("profile.design.content.intro_video_description"),
    placeholder: i18next.t("profile.design.content.intro_video_placeholder"),
    defaultValue: null,
    validation: {
      required: false,
      maxSize: 20971520, // 20MB in bytes
      acceptedFormats: ["video/mp4"],
    },
  },
];

export const ENGAGEMENT_FIELDS = [
  {
    id: "highlightReview",
    type: FIELD_TYPES.select,
    translationKey: i18next.t("profile.design.engagement.highlight_review"),
    placeholder: t("profile.design.engagement.choose_review"),
    options: [],
    value: [],
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
  {
    id: "callToAction",
    type: FIELD_TYPES.select,
    translationKey: i18next.t("profile.design.engagement.call_to_action"),
    placeholder: i18next.t(
      "profile.design.engagement.call_to_action_placeholder"
    ),
    options: [
      { id: "learnMore", label: "Learn More" },
      { id: "contact", label: "Contact" },
    ],
    defaultValue: "",
    validation: {
      required: false,
      error: "",
      valid: false,
    },
  },
];

export const INTERACTIVE_FIELDS = [
  {
    id: "faq",
    type: "list",
    translationKey: i18next.t("profile.design.interactive.faq"),
    placeholder: i18next.t("profile.design.interactive.faq_placeholder"),
    description: i18next.t("profile.design.interactive.description"),
    defaultValue: [],
    validation: {
      required: false,
      error: "",
      valid: false,
      maxItems: 5,
    },
    fields: [
      {
        id: "question",
        type: "text",
        label: i18next.t("profile.design.interactive.faq_question"),
        placeholder: i18next.t(
          "profile.design.interactive.faq_question_placeholder"
        ),
        validation: {
          required: false,
          maxLength: 200,
        },
      },
      {
        id: "answer",
        type: "text",
        label: i18next.t("profile.design.interactive.faq_answer"),
        placeholder: i18next.t(
          "profile.design.interactive.faq_answer_placeholder"
        ),
        validation: {
          required: false,
          maxLength: 500,
        },
      },
    ],
  },
  {
    id: "approach",
    type: "richText",
    translationKey: i18next.t("profile.design.interactive.approach"),
    placeholder:
      "Describe the way you work with clients. For example\n1. Contact me immediately you have an approved plan and contractor\n2. I will discuss the project with you in detail and give you a quote.\n3. On acceptance of the quote I will submit all details on Buildeezy to help you set up a project",
    defaultValue: "",
    validation: {
      required: false,
      error: "",
      valid: false,
      maxLength: 300,
    },
  },
];

export const FONT_MAP = {
  inter: "Inter, sans-serif",
  roboto: "Roboto, sans-serif",
  oswald: "Oswald, sans-serif",
  playfair: "Playfair Display, serif",
  anton: "Anton, sans-serif",
  courier: "Courier New, monospace",
  lora: "Lora, serif",
  montserrat: "Montserrat, sans-serif",
  orbitron: "Orbitron, sans-serif",
  pacifico: "Pacifico, cursive",
  dancing: "Dancing Script, cursive",
};

// Helper to generate highlight review options from reviews
export function getHighlightReviewOptions(reviews) {
  if (!Array.isArray(reviews)) return [];
  return reviews.map((review) => {
    // Truncate job title to first 3 words
    const truncatedTitle =
      review.jobTitle.split(" ").slice(0, 3).join(" ") +
      (review.jobTitle.split(" ").length > 3 ? "..." : "");

    return {
      id: String(review.id),
      label: `${truncatedTitle} • ${review.rating.toFixed(1)} ★ • ${
        review.name
      }`,
      sx: {
        "& .MuiRating-root": {
          color: "#4CAF50",
        },
        "& .MuiTypography-root": {
          color: "#333",
          fontWeight: 500,
        },
      },
    };
  });
}
