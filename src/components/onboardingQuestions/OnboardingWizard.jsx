import { useMemo } from "react";
import { QUESTION_TYPES } from "../../utils/constants/onboarding";
import SelectType from "./SelectType";
import DescriptionType from "./DescriptionType";
import PastClientType from "./PastClientType";
import RadioButtonType from "./RadioButtonType";
import UploadDoc from "../upload/UploadDoc";
import CompanyDetailsContainer from "./CompanyDetailsContainer";
import HoursType from "./HoursType";
import { useTranslation } from 'react-i18next';

function OnboardingWizard({
  id,
  title,
  placeholder,
  questionType,
  options,
  value,
  fileTypes,
  onValueChange,
  validation,
}) {

  const { t } = useTranslation();
  
  const renderQuestions = useMemo(() => {
    switch (questionType) {
      case QUESTION_TYPES.select:
      case QUESTION_TYPES.multipleSelect:
        return (
          <SelectType
            id={id}
            label={title}
            options={options}
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
            multiple={questionType === QUESTION_TYPES.multipleSelect && true}
            validation={validation}
          />
        );
      case QUESTION_TYPES.description:
        return (
          <DescriptionType
            id={id}
            label={title}
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
          />
        );
      case QUESTION_TYPES.pastClients:
        return (
          <PastClientType
            id={id}
            label={title}
            value={value}
            onValueChange={onValueChange}
          />
        );
      case QUESTION_TYPES.radio:
        return (
          <RadioButtonType
            id={id}
            label={title}
            value={value}
            options={options}
            onValueChange={onValueChange}
            validation={validation}
          />
        );
      case QUESTION_TYPES.upload:
        return (
          <UploadDoc
            id={id}
            label={title}
            value={value}
            onSelectFiles={onValueChange}
            acceptedFileTypes={fileTypes}
            setUploadedDocumentId={() => {}}
          />
        );
      case QUESTION_TYPES.companyDetails:
        return (
          <CompanyDetailsContainer value={value} onChange={onValueChange} />
        );
      case QUESTION_TYPES.hours:
        return (
          <HoursType
            id={id}
            label={title}
            value={value}
            onValueChange={onValueChange}
            validation={validation}
            isProfile={false}
          />
        );

      default:
        return;
    }
  }, [
    id,
    title,
    placeholder,
    questionType,
    options,
    value,
    onValueChange,
    fileTypes,
    validation,
  ]);
    const translatedOptions = options?.map(option => ({
    ...option,
    label: t(option.label) // Asumiendo que option.label es una key de traducción
  }));
  return <>{renderQuestions}</>;
}

export default OnboardingWizard;
