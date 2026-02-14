import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import { Box } from "@mui/material";
import { Key } from "iconsax-react";

import IconBtn from "../appBar/IconBtn";
import MuiActionDialog from "../common/MuiActionDialog";
import useValidation from "../../hooks/useValidation";
import { encryptData } from "../../utils/encrypt";
import { setAlert, setLoading } from "../../redux/configSlice";
import { profileChangePasswordUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import FormFields from "../common/FormFields";
import MuiTypography from "../common/MuiTypography";
import { CHANGE_PASSWORD } from "../../utils/constants/profile";

function ChangeProfilePassword({ open, onClose, showButton = true }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.config);

  const [initLoad, setInitLoad] = useState(true);
  const [formData, setFormData] = useState(CHANGE_PASSWORD);
  const [error, setError] = useState("");

  const { isValidData, validateData } = useValidation();

  function onOpenDialog() {
    setFormData(CHANGE_PASSWORD);
    setError("");
    setInitLoad(true);
  }

  function onValueChange(id, value, error) {
    if (error) {
      setError("");
    }
    const newFormData = cloneDeep(formData);
    const fieldIndex = newFormData.findIndex((el) => el.id === id);
    newFormData[fieldIndex].value = value;
    newFormData[fieldIndex].validation.error = error;
    newFormData[fieldIndex].validation.valid = error === "" ? true : false;
    setFormData(newFormData);
  }

  async function onChangePassword() {
    setInitLoad(false);
    const validatedFormData = validateData(formData);
    setFormData(validatedFormData);
    const isFormValid = isValidData(validatedFormData);
    //validate passwords
    if (!isFormValid) {
      return;
    }
    //compare password and confirm passwords
    if (formData[1].value !== formData[2].value) {
      setError(t("login.passwords_not_match"));
      return;
    }

    const credPayload = {
      currentPassword: formData[0].value,
      newPassword: formData[1].value,
    };
    const resetPasswordPayload = {
      data: {
        type: "change_password",
        credentials: encryptData(credPayload),
      },
    };

    try {
      dispatch(setLoading(true));
      await profileChangePasswordUrl(resetPasswordPayload);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("profile.password_changed"),
        })
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <>
      {showButton && (
        <IconBtn
          icon={Key}
          onClick={onOpenDialog}
          disabled={loading}
          tooltip={"Change Password"}
        />
      )}
      <MuiActionDialog
        width={400}
        open={open}
        handleClose={onClose}
        title={t("profile.change_pass_title")}
        handleSuccess={onChangePassword}
        actionTitle={t("profile.save")}
      >
        {formData.map(({ id, placeholder, type, value, validation }) => (
          <Box sx={{ mt: 3 }} key={id}>
            <MuiTypography variant="h5" sx={{ mb: 1 }}>
              {placeholder}
            </MuiTypography>
            <FormFields
              id={id}
              placeholder={placeholder}
              value={value}
              onValueChange={onValueChange}
              type={type}
              validation={validation}
              initLoad={initLoad}
            />
          </Box>
        ))}
        {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
      </MuiActionDialog>
    </>
  );
}

export default ChangeProfilePassword;
