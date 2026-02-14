import { YES_NO_OPTIONS } from "./job";
import { FIELD_TYPES } from "./login";
import i18next from "../../i18n";
import { ALL_FILE_TYPES } from "../file";
import { validateIsEmpty } from "../common";

export const MILESTONE_STATE = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ACTIVE: "active",
  PAYMENT_REQUESTED: "payment_requested",
  PAYMENT_PENDING: "pending_payment",
  PARTIAL: "partial",
  COMPLETED: "completed",
  QUERY: "disputed",
  CANCELLED: "cancelled",
};

export const ACTIONS = {
  IS_EDIT: "isEdit",
  IS_ADD_MORE: "isAddMore",
  IS_EXTEND: "isExtend",
  IS_PAY: "isPay",
  IS_QUERY: "isQuery",
};

export const PAY_QUESTIONS = [
  {
    id: "isCompleted",
    label: i18next.t("milestone.pay_question1"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "hasWorkChecked",
    label: i18next.t("milestone.pay_question2"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "hasDeliveredReportsAndCertifications",
    label: i18next.t("milestone.pay_question3"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "satisfiedWithMilestone",
    label: i18next.t("milestone.pay_question4"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "fullPaymentReleased",
    label: i18next.t("milestone.pay_question5"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
];

export const AMOUNT = {
  id: "amount",
  label: i18next.t("milestone.pay_question6"),
  placeholder: i18next.t("milestone.pay_que6_placeholder"),
  type: FIELD_TYPES.text,
  value: "",
  validation: {
    required: true,
    rules: validateIsEmpty,
    msg: i18next.t("errors.field_required"),
    error: "",
    valid: false,
  },
};

export const QUERY_QUESTIONS = [
  {
    id: "sourceOfQuery",
    label: i18next.t("milestone.query_question1"),
    placeholder: i18next.t("milestone.query_que1_placeholder"),
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "resolutionOptions",
    label: i18next.t("milestone.query_question2"),
    placeholder: i18next.t("milestone.query_que2_placeholder"),
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "optionsDiscussed",
    label: i18next.t("milestone.query_question3"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "compromiseAreas",
    label: i18next.t("milestone.query_question4"),
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "nonCompromisableItems",
    label: i18next.t("milestone.query_question5"),
    placeholder: i18next.t("milestone.query_que5_placeholder"),
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "rectificationProcedureAgreed",
    label: i18next.t("milestone.query_question6"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "anyUnmovableDeadlines",
    label: i18next.t("milestone.query_question7"),
    type: FIELD_TYPES.radio,
    options: YES_NO_OPTIONS,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "statement",
    label: i18next.t("milestone.query_question8"),
    placeholder: i18next.t("milestone.query_que8_placeholder"),
    type: FIELD_TYPES.text,
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "documents",
    type: FIELD_TYPES.upload,
    value: [],
    multipleFiles: true,
    fileTypes: ALL_FILE_TYPES,
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
];

export const CANCEL_QUESTIONS = [
  {
    id: "cancelReason",
    label: i18next.t("milestone.cancel_reason"),
    type: FIELD_TYPES.select,
    options: [
      { label: i18next.t("milestone.reason_not_required"), id: "not_required" },
      { label: i18next.t("milestone.reason_provider_unavailable"), id: "provider_unavailable" },
      { label: i18next.t("milestone.reason_budget"), id: "budget" },
      { label: i18next.t("milestone.reason_provider_cancelled"), id: "provider_cancelled" },
      { label: i18next.t("milestone.reason_skill_mismatch"), id: "skill_mismatch" },
    ],
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "agreedWithProvider",
    label: i18next.t("milestone.agreed_with_provider"),
    type: FIELD_TYPES.radio,
    options: [
      { label: i18next.t("milestone.common.yes"), id: "yes" },
      { label: i18next.t("milestone.common.no"), id: "no" },
    ],
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
  {
    id: "paymentSettlement",
    label: i18next.t("milestone.payment_settlement"),
    type: FIELD_TYPES.radio,
    options: [
      { label: i18next.t("milestone.full_refund"), id: "full_refund" },
      { label: i18next.t("milestone.partial_payment"), id: "partial_payment" },
    ],
    value: "",
    validation: {
      required: true,
      rules: validateIsEmpty,
      msg: i18next.t("errors.field_required"),
      error: "",
      valid: false,
    },
  },
];

export const PARTIAL_AMOUNT = {
  id: "partialAmount",
  label: i18next.t("milestone.partial_amount"),
  type: FIELD_TYPES.text,
  placeholder: i18next.t("milestone.enter_amount"),
  value: "",
  validation: {
    required: true,
    rules: validateIsEmpty,
    msg: i18next.t("errors.field_required"),
    error: "",
    valid: false,
  },
};
