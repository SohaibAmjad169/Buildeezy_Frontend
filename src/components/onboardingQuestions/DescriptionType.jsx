import InputBox from "../common/InputBox";
import MuiTypography from "../common/MuiTypography";
import { FIELD_TYPES } from "../../utils/constants/login";

function DescriptionType({ id, label, placeholder, onValueChange, value }) {
  return (
    <>
      <MuiTypography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
        {label}
      </MuiTypography>
      <InputBox
        id={id}
        placeholder={placeholder}
        value={value}
        onInputChange={onValueChange}
        type={FIELD_TYPES.description}
      />
    </>
  );
}
export default DescriptionType;
