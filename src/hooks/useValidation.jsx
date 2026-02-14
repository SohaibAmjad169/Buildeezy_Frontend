import { cloneDeep, isEmpty } from "lodash";

function useValidation() {
  const validateData = (inputData) => {
    const newInputData = cloneDeep(inputData);
    return newInputData.map((el) => {
      const { validation, value } = el;
      let validationError = "";
      if (!isEmpty(validation)) {
        if (validation.rules) {
          validationError = validation.rules(
            value,
            "msg" in validation && validation.msg
          );
        }
        if (!validationError && validation.required) {
          validationError = value ? "" : "invalid";
        }
        validation.error = validationError;
        validation.valid = !validationError;
      }
      return { ...el };
    });
  };

  const isValidData = (inputData) => {
    return inputData.every(
      (el) => el.validation?.valid || isEmpty(el.validation)
    );
  };

  return { isValidData, validateData };
}

export default useValidation;
