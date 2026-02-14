import { FIELD_TYPES } from "./login";
import i18next from "../../i18n";
import { ALL_FILE_TYPES } from "../file";
import { t } from "i18next";

export const BID_LIST_HEIGHT = 380;

export const BID_CARD_WIDTH = 530;
export const BID_CARD_HEIGHT = 380;

export const JOB_CARD_WIDTH = 530;
export const JOB_CARD_HEIGHT = 266;

export const TABS = {
  JOB_DETAILS: t("job.details.job_details"),
  BIDS: i18next.t("job.details.bids"),
  BID_DETAILS: t("job.details.bid"),
  MILESTONE: "Milestone",
  INFORMATION: t("job.information"),
  PAST_CLIENT: t("job.details.client_details"),
};

export const JOB_TYPE_OPTIONS = [
  { id: "general", labelKey: "job.options.types.general" },
  { id: "construction", labelKey: "job.options.types.construction" },
  { id: "renovation", labelKey: "job.options.types.renovation" },
  { id: "painting", labelKey: "job.options.types.painting" },
  { id: "plumbing", labelKey: "job.options.types.plumbing" },
  { id: "electrical", labelKey: "job.options.types.electrical" },
  { id: "airCondition", labelKey: "job.options.types.airCondition" },
  { id: "tiling", labelKey: "job.options.types.tiling" },
  { id: "gardeningLandscaping", labelKey: "job.options.types.gardeningLandscaping" },
  { id: "cleaning", labelKey: "job.options.types.cleaning" },
  { id: "laundry", labelKey: "job.options.types.laundry" },
];

export const START_BY_BUTTON_OPTIONS = [
  { id: "urgent", labelKey: "job.options.start_by.urgent" },
  { id: "withinAWeek", labelKey: "job.options.start_by.withinAWeek" },
  { id: "quoteOnly", labelKey: "job.options.start_by.quoteOnly" },
];

export const START_BY_OPTIONS = [
  { id: "urgent", labelKey: "job.options.start_by.urgent" },
  { id: "withinAWeek", labelKey: "job.options.start_by.withinAWeek" },
  { id: "quoteOnly", labelKey: "job.options.start_by.quoteOnly" },
  { id: "active", labelKey: "job.options.status.active" },
  { id: "inProgress", labelKey: "job.options.status.inProgress" },
  { id: "completed", labelKey: "job.options.status.completed" },
  { id: "preview_mode", labelKey: "job.options.status.preview_mode" },
  { id: "accepted", labelKey: "job.options.status.accepted" },
  { id: "rejected", labelKey: "job.options.status.rejected" },
  { id: 0, labelKey: "job.options.status.registered" },
  { id: 1, labelKey: "job.options.status.unverified" },
  { id: 2, labelKey: "job.options.status.verified" },
  { id: 3, labelKey: "job.options.status.deactivated" },
  { id: 4, labelKey: "job.options.status.banned" },
];

export const WHAT_NEED_CONS_OPTIONS = [
  { id: "newConstruction", labelKey: "job.options.cons.newConstruction" },
  { id: "renovation", labelKey: "job.options.cons.renovation" },
  { id: "maintenance", labelKey: "job.options.cons.maintenance" },
];

export const WHAT_NEED_PAINTING_OPTIONS = [
  { id: "exteriorInterior", labelKey: "job.options.painting.exteriorInterior" },
  { id: "Medium", labelKey: "job.options.painting.medium" },
];

export const WHAT_NEED_PLUMBING_OPTIONS = [
  { id: "Installation", labelKey: "job.what_need_plumbing.installation" },
  { id: "reparation", labelKey: "job.what_need_plumbing.reparation" },
  { id: "septic", labelKey: "job.what_need_plumbing.septic" },
];

export const WHAT_NEED_ELECTRICAL_OPTIONS = [
  { id: "reparation", labelKey: "job.what_need_electrical.reparation" },
  { id: "installation", labelKey: "job.what_need_electrical.installation" },
  { id: "complaince", labelKey: "job.what_need_electrical.complaince" },
  { id: "electricControl", labelKey: "job.what_need_electrical.electric_control" },
  { id: "electricCircuit", labelKey: "job.what_need_electrical.electric_circuit" },
  { id: "electricLeakDetection", labelKey: "job.what_need_electrical.electric_leak_detection" },
  { id: "others", labelKey: "job.what_need_electrical.others" },
];

export const WHAT_NEED_AC_TILING_OPTIONS = [
  { id: "reparation", labelKey: "job.what_need_ac_tiling.reparation" },
  { id: "maintenance", labelKey: "job.what_need_ac_tiling.maintenance" },
  { id: "installation", labelKey: "job.what_need_ac_tiling.installation" },
];

export const WHAT_NEED_GARD_OPTIONS = [
  { id: "gardenMaintenance", labelKey: "job.what_need_gard.maintenance" },
  { id: "gardenArchitect", labelKey: "job.what_need_gard.architect" },
];

export const WHAT_NEED_CLEANING_OPTIONS = [
  { id: "windowCleaning", labelKey: "job.what_need_cleaning.window" },
  { id: "gutterCleaning", labelKey: "job.what_need_cleaning.gutter" },
  { id: "generalHouseCleaning", labelKey: "job.what_need_cleaning.general" },
];

export const WHAT_NEED_UPHOLSTERY_OPTIONS = [
  { id: "reparation", labelKey: "job.what_need_upholstery.reparation" },
  { id: "maintenance", labelKey: "job.what_need_upholstery.maintenance" },
];

export const SPECIFY_AVAIL_OPTIONS = [
  { id: "Ownership title", labelKey: "job.specify_avail.ownership_title" },
  { id: "buildingPermits", labelKey: "job.specify_avail.building_permits" },
  { id: "architecturalPlans", labelKey: "job.specify_avail.architectural_plans" },
  { id: "sitePlan", labelKey: "job.specify_avail.site_plan" },
];

export const SPECIFY_ROOMS_OPTIONS = [
  { id: "1-2", labelKey: "job.specify_rooms_select.1_2" },
  { id: "3-4", labelKey: "job.specify_rooms_select.3_4" },
  { id: "above5", labelKey: "job.specify_rooms_select.above5" },
];

export const SPECIFY_PLUMBING_OPTIONS = [
  { id: "piping", labelKey: "job.specify_plumbing.piping" },
  { id: "toiletFlushCistern", labelKey: "job.specify_plumbing.toilet_flush_cistern" },
  { id: "taps", labelKey: "job.specify_plumbing.taps" },
  { id: "waterTanks", labelKey: "job.specify_plumbing.water_tanks" },
  { id: "pumps", labelKey: "job.specify_plumbing.pumps" },
  { id: "sinkShowerBath", labelKey: "job.specify_plumbing.sink_shower_bath" },
  { id: "waterSoftener", labelKey: "job.specify_plumbing.water_softener" },
  { id: "fullInstallation", labelKey: "job.specify_plumbing.full_installation" },
  { id: "others", labelKey: "job.specify_plumbing.others" },
];

export const SPECIFY_ELECTRICAL_OPTIONS = [
  { id: "outlets", labelKey: "job.specify_electrical.outlets" },
  { id: "wiring", labelKey: "job.specify_electrical.wiring" },
  { id: "lights", labelKey: "job.specify_electrical.lights" },
  { id: "generator", labelKey: "job.specify_electrical.generator" },
  { id: "fuseBox", labelKey: "job.specify_electrical.fuse_box" },
  { id: "switches", labelKey: "job.specify_electrical.switches" },
  { id: "ceilingFan", labelKey: "job.specify_electrical.ceiling_fan" },
  { id: "others", labelKey: "job.specify_electrical.others" },
];

export const SPECIFY_AC_OPTIONS = [
  { id: "ac", labelKey: "job.specify_ac.ac" },
];

export const SPECIFY_TILING_OPTIONS = [
  { id: "wood", labelKey: "job.specify_tiling.wood" },
  { id: "glass", labelKey: "job.specify_tiling.glass" },
  { id: "pvcVinyl", labelKey: "job.specify_tiling.pvc_vinyl" },
  { id: "stoneGranite", labelKey: "job.specify_tiling.stone_granite" },
  { id: "slate", labelKey: "job.specify_tiling.slate" },
  { id: "ceramic", labelKey: "job.specify_tiling.ceramic" },
  { id: "others", labelKey: "job.specify_tiling.others" },
];

export const SPECIFY_CLEANING_OPTIONS = [
  { id: "largeHouse", labelKey: "job.specify_cleaning.large_house" },
  { id: "mediumHouse", labelKey: "job.specify_cleaning.medium_house" },
  { id: "smallHouse", labelKey: "job.specify_cleaning.small_house" },
];

export const SPECIFY_UPHOLSTERY_OPTIONS = [
  { id: "furniture", labelKey: "job.specify_upholstery.furniture" },
  { id: "curtains", labelKey: "job.specify_upholstery.curtains" },
];

export const HOW_MANY_ROOMS_OPTIONS = [
  {
    id: "1",
    labelKey: "1",
  },
  {
    id: "2",
    labelKey: "2",
  },
  {
    id: "3",
    labelKey: "3",
  },
  {
    id: "4",
    labelKey: "4",
  },
  {
    id: "5+",
    labelKey: "5+",
  },
];

export const HOW_MANY_AC_OPTIONS = [
  { id: "1To2", labelKey: "job.how_many_ac.1_2" },
  { id: "3To4", labelKey: "job.how_many_ac.3_4" },
  { id: "above5", labelKey: "job.how_many_ac.above5" },
  { id: "others", labelKey: "job.how_many_ac.others" },
];

export const HOW_BIG_AREA_OPTIONS = [
  { id: "large", labelKey: "job.how_big_area_select.large" },
  { id: "medium", labelKey: "job.how_big_area_select.medium" },
  { id: "small", labelKey: "job.how_big_area_select.small" },
];

export const WHERE_TILING_OPTIONS = [
  { id: "interior", labelKey: "job.where_tiling.interior" },
  { id: "exterior", labelKey: "job.where_tiling.exterior" },
];

export const EST_OPTIONS = [
  { id: "few", labelKey: "job.est_select.few" },
  { id: "medium", labelKey: "job.est_select.medium" },
  { id: "many", labelKey: "job.est_select.many" },
];

export const YES_NO_OPTIONS = [
  { id: "yes", labelKey: "yes" },
  { id: "no", labelKey: "no" }
];

export const MATERIAL_SUPPLY_OPTIONS = [
  {
    id: "youEstimateAndISupply",
    labelKey: "job.material_supply_you_estimate_i_supply",
  },
  {
    id: "youEstimateAndYouSupply",
    labelKey: "job.material_supply_you_estimate_you_supply",
  },
  { id: "alreadyAvailable", labelKey: "job.material_supply_already_available" },
];

export const JOB_QUESTIONS = [
  {
    id: "title",
    titleKey: "job.what_job_title",
    subtitleKey: "job.what_job_subtitle",
    labelKey: "job.what_job",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: JOB_TYPE_OPTIONS,
    value: "",
    required: true,
  },
];

export const WHERE_WHEN_QUESTIONS = [
  {
    id: "whereJob",
    titleKey: "job.where_job_title",
    subtitleKey: "job.where_job_subtitle",
    labelKey: "job.where_job",
    placeholderKey: "job.location_label",
    type: FIELD_TYPES.address,
    value: {
      address: "",
      country: { name: "" },
      city: { name: "" },
    },
    required: true,
  },
  {
    id: "startTimePreference",
    titleKey: "job.when_job_title",
    subtitleKey: "job.when_job_subtitle",
    labelKey: "job.when_job",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: START_BY_BUTTON_OPTIONS,
    value: "",
    required: true,
  },
];

export const GENERAL_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_CONS_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_availability_title",
    subtitleKey: "job.specify_availability_subtitle",
    labelKey: "job.specify_availability",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.multipleSelect,
    options: SPECIFY_AVAIL_OPTIONS,
    value: [],
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
    required: true,
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    required: true,
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const CONSTRUCTION_QUESTIONS = [...GENERAL_QUESTIONS];

export const RENOVATION_QUESTIONS = [...GENERAL_QUESTIONS];

export const PAINTING_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_PAINTING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_rooms_title",
    subtitleKey: "job.specify_rooms_subtitle",
    labelKey: "job.specify_rooms",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: SPECIFY_ROOMS_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "newConstruction",
    titleKey: "job.new_construction_title",
    subtitleKey: "job.new_construction_subtitle",
    labelKey: "job.new_construction",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "roofPainting",
    titleKey: "job.roof_painting_title",
    subtitleKey: "job.roof_painting_subtitle",
    labelKey: "job.roof_painting",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const PLUMBING_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_PLUMBING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_title",
    subtitleKey: "job.specify_subtitle",
    labelKey: "job.specify",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.multipleSelect,
    options: SPECIFY_PLUMBING_OPTIONS,
    value: [],
    required: true,
    child: {
      show: false,
      id: "otherSpecifyDetails",
      value: "",
    },
  },
  {
    id: "newConstruction",
    titleKey: "job.new_construction_title",
    subtitleKey: "job.new_construction_subtitle",
    labelKey: "job.new_construction",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const ELECTRICAL_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_ELECTRICAL_OPTIONS,
    value: "",
    required: true,
    child: {
      show: false,
      id: "otherJobsToBeDone",
      value: "",
    },
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_title",
    subtitleKey: "job.specify_subtitle",
    labelKey: "job.specify",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.multipleSelect,
    options: SPECIFY_ELECTRICAL_OPTIONS,
    value: [],
    required: true,
    child: {
      show: false,
      id: "otherSpecifyDetails",
      value: "",
    },
  },
  {
    id: "roomsAffected",
    titleKey: "job.how_many_rooms_title",
    subtitleKey: "job.how_many_rooms_subtitle",
    labelKey: "job.how_many_rooms",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: HOW_MANY_ROOMS_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "newConstruction",
    titleKey: "job.new_construction_title",
    subtitleKey: "job.new_construction_subtitle",
    labelKey: "job.new_construction",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const AC_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_AC_TILING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_title",
    subtitleKey: "job.specify_subtitle",
    labelKey: "job.specify",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: SPECIFY_AC_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "units",
    titleKey: "job.how_many_title",
    subtitleKey: "job.how_many_subtitle",
    labelKey: "job.how_many",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: HOW_MANY_AC_OPTIONS,
    value: "",
    required: true,
    child: {
      show: false,
      id: "otherUnitsDetails",
      value: "",
    },
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const TILING_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_AC_TILING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_title",
    subtitleKey: "job.specify_subtitle",
    labelKey: "job.specify",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: SPECIFY_TILING_OPTIONS,
    value: "",
    required: true,
    child: {
      show: false,
      id: "otherSpecifyDetails",
      value: "",
    },
  },
  {
    id: "areaSize",
    titleKey: "job.how_big_area_title",
    subtitleKey: "job.how_big_area_subtitle",
    labelKey: "job.how_big_area",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: HOW_BIG_AREA_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "areaLocation",
    titleKey: "job.where_is_title",
    subtitleKey: "job.where_is_subtitle",
    labelKey: "job.where_is",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHERE_TILING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "newConstruction",
    titleKey: "job.new_construction_title",
    subtitleKey: "job.new_construction_subtitle",
    labelKey: "job.new_construction",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const GARDENING_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_GARD_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const CLEANING_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_CLEANING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_title",
    subtitleKey: "job.specify_subtitle",
    labelKey: "job.specify",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: SPECIFY_CLEANING_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const UPHOLSTERY_QUESTIONS = [
  ...WHERE_WHEN_QUESTIONS,
  {
    id: "jobsToBeDone",
    titleKey: "job.what_need_title",
    subtitleKey: "job.what_need_subtitle",
    labelKey: "job.what_need",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: WHAT_NEED_UPHOLSTERY_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.specify_title",
    subtitleKey: "job.specify_subtitle",
    labelKey: "job.specify",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: SPECIFY_UPHOLSTERY_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "estimatedItems",
    titleKey: "job.est_title",
    subtitleKey: "job.est_subtitle",
    labelKey: "job.est",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: EST_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
];

export const GENERAL_JOB_FIELDS = [
  {
    id: "whereJob",
    titleKey: "job.where_job_title",
    subtitleKey: "job.where_job_subtitle",
    labelKey: "job.where_job",
    placeholderKey: "job.location_label",
    type: FIELD_TYPES.address,
    value: {
      address: "",
      country: { name: "" },
      city: { name: "" },
    },
    required: true,
  },
  {
    id: "startTimePreference",
    titleKey: "job.when_job_title",
    subtitleKey: "job.when_job_subtitle",
    labelKey: "job.when_job",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: START_BY_BUTTON_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "description",
    titleKey: "job.description",
    subtitleKey: "job.description_subtitle",
    labelKey: "job.description",
    placeholderKey: "job.enter_description",
    type: FIELD_TYPES.text,
    value: "",
    required: true,
  },
  {
    id: "comments",
    titleKey: "job.comments_title",
    subtitleKey: "job.comments_subtitle",
    labelKey: "job.comments",
    placeholderKey: "job.enter_comments",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "budget",
    titleKey: "job.budget_title",
    subtitleKey: "job.budget_subtitle",
    labelKey: "job.budget",
    placeholderKey: "job.budget",
    type: FIELD_TYPES.text,
    value: "",
  },
  {
    id: "areaSize",
    titleKey: "job.area_size_title",
    subtitleKey: "job.area_size_subtitle",
    labelKey: "job.area_size",
    placeholderKey: "job.enter_area_size",
    type: FIELD_TYPES.text,
    value: "",
    required: true,
  },
  {
    id: "units",
    titleKey: "job.site_preparation_title",
    subtitleKey: "job.site_preparation_subtitle",
    labelKey: "job.site_preparation",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "specifyDetails",
    titleKey: "job.fixture_installation_title",
    subtitleKey: "job.fixture_installation_subtitle",
    labelKey: "job.fixture_installation",
    placeholderKey: "job.enter_fixture_details",
    type: FIELD_TYPES.text,
    value: "",
    required: false,
  },
  {
    id: "newConstruction",
    titleKey: "job.new_construction_title",
    subtitleKey: "job.new_construction_subtitle",
    labelKey: "job.new_construction",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: YES_NO_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "jobsToBeDone",
    titleKey: "job.material_supply_title",
    subtitleKey: "job.material_supply_subtitle",
    labelKey: "job.material_supply",
    placeholderKey: "job.option_label",
    type: FIELD_TYPES.select,
    options: MATERIAL_SUPPLY_OPTIONS,
    value: "",
    required: true,
  },
  {
    id: "documents",
    titleKey: "job.upload_title",
    subtitleKey: "job.upload_subtitle",
    labelKey: "job.upload",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
  },
];

export const mapQuestions = {
  general: GENERAL_JOB_FIELDS,
  construction: CONSTRUCTION_QUESTIONS,
  renovation: RENOVATION_QUESTIONS,
  painting: PAINTING_QUESTIONS,
  plumbing: PLUMBING_QUESTIONS,
  electrical: ELECTRICAL_QUESTIONS,
  airCondition: AC_QUESTIONS,
  tiling: TILING_QUESTIONS,
  gardeningLandscaping: GARDENING_QUESTIONS,
  cleaning: CLEANING_QUESTIONS,
  laundry: UPHOLSTERY_QUESTIONS,
};

export const JOB_DETAILS_CHIPS = {
  construction: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
  ],
  renovation: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
  ],
  painting: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
    { id: "newConstruction", labelKey: "job.details.new_construction" },
    { id: "roofPainting", labelKey: "job.details.roof_painting" },
  ],
  plumbing: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
    { id: "newConstruction", labelKey: "job.details.new_construction" },
  ],
  electrical: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
    { id: "roomsAffected", labelKey: "job.details.rooms_affected" },
    { id: "newConstruction", labelKey: "job.details.new_construction" },
  ],
  airCondition: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
    { id: "units", labelKey: "job.details.no_of_ac" },
  ],
  tiling: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
    { id: "areaSize", labelKey: "job.details.area_size" },
    { id: "areaLocation", labelKey: "job.details.location" },
    { id: "newConstruction", labelKey: "job.details.new_construction" },
  ],
  gardeningLandscaping: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
  ],
  cleaning: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
  ],
  laundry: [
    // { id: "startTimePreference", labelKey: "job.details.start_by" },
    // { id: "jobsToBeDone", labelKey: "job.details.requirements" },
    { id: "estimatedItems", labelKey: "job.details.no_of_items" },
  ],
};
