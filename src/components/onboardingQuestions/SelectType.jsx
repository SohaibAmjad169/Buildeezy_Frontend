import MuiTypography from "../common/MuiTypography";
import SelectBox from "../common/SelectBox";

function SelectType({
  id,
  label,
  options,
  placeholder,
  value,
  onValueChange,
  multiple = false,
  validation,
}) {
  return (
    <>
      <MuiTypography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
        {label}
      </MuiTypography>
      <SelectBox
        id={id}
        placeholder={placeholder}
        value={value}
        options={options}
        onSelectChange={onValueChange}
        multiple={multiple}
      />
      {!validation?.valid && (
        <MuiTypography variant="errorText">{validation?.error}</MuiTypography>
      )}
    </>
  );
}
export default SelectType;
