import { useMemo } from "react";
import { FIELD_TYPES } from "../../utils/constants/login";
import AutocompleteBox from "../common/AutocompleteBox";
import ContactBox from "../common/ContactBox";
import InputBox from "../common/InputBox";
import SelectBox from "../common/SelectBox";
import DoubleInputBox from "../common/DoubleInputBox";
import FormFields from "../common/FormFields";
import { QUESTION_TYPES } from "../../utils/constants/onboarding";
import HoursType from "../onboardingQuestions/HoursType";
import ProfessionalAffiliationsContainer from "./ProfessionalAffiliationsContainer";
import CompanyDetailsContainer from "../onboardingQuestions/CompanyDetailsContainer";

function ProfileFields({
  id,
  placeholder,
  title,
  value,
  options,
  onValueChange,
  type,
  validation,
  initLoad,
  disabled,
  fields,
}) {
  const renderField = useMemo(() => {
    switch (type) {
      case FIELD_TYPES.text:
      case FIELD_TYPES.description:
        return (
          <InputBox
            id={id}
            placeholder={placeholder}
            value={value}
            onInputChange={onValueChange}
            type={type}
            validation={validation}
            initLoad={initLoad}
            disabled={disabled}
          />
        );
      case FIELD_TYPES.select:
      case FIELD_TYPES.multipleSelect:
        return (
          <SelectBox
            id={id}
            placeholder={placeholder}
            value={value}
            options={options}
            onSelectChange={onValueChange}
            validation={validation}
            initLoad={initLoad}
            multiple={type === FIELD_TYPES.multipleSelect}
            disabled={disabled}
          />
        );
      case FIELD_TYPES.autoComplete:
        return (
          <AutocompleteBox
            id={id}
            placeholder={placeholder}
            value={value}
            options={options}
            onSelectChange={onValueChange}
            validation={validation}
            initLoad={initLoad}
            disabled={disabled}
          />
        );
      case FIELD_TYPES.contact:
        return (
          <ContactBox
            id={id}
            placeholder={placeholder}
            value={value}
            onInputChange={onValueChange}
            validation={validation}
            initLoad={initLoad}
            disabled={disabled}
          />
        );
      case FIELD_TYPES.list:
        return (
          <FormFields
            id={id}
            title={title}
            value={value}
            fields={fields}
            onValueChange={onValueChange}
            validation={validation}
            disabled={disabled}
            type={type}
          />
        );
      case FIELD_TYPES.doubleInput:
        return (
          <DoubleInputBox
            id={id}
            placeholder={placeholder}
            value={value}
            onInputChange={onValueChange}
            validation={validation}
            initLoad={initLoad}
            disabled={disabled}
          />
        );
      case QUESTION_TYPES.hours:
        return (
          <HoursType
            id={id}
            label={title}
            value={value}
            onValueChange={onValueChange}
            validation={validation}
            isProfile={true}
            disabled={disabled}
          />
        );
      case QUESTION_TYPES.professionalAffiliation:
        return (
          <ProfessionalAffiliationsContainer
            value={value}
            onChange={onValueChange}
          />
        );
      case QUESTION_TYPES.companyDetails:
        return (
          <CompanyDetailsContainer
            value={value}
            onChange={onValueChange}
            disabled={disabled}
          />
        );
      default:
        return;
    }
  }, [
    id,
    title,
    placeholder,
    value,
    options,
    onValueChange,
    type,
    validation,
    initLoad,
    disabled,
    fields,
  ]);

  return <>{renderField}</>;
}

export default ProfileFields;
