import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { setAlert, setLoading } from "../redux/configSlice";
import { deactivateAccountUrl } from "../apis/apiEndPoints";
import useEmptyStore from "./useEmptyStore";
import { removeAll } from "../utils/localStorageUtils";
import { ALERT_TYPE } from "../utils/constants/config";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../context/ThemeContext";

function useDeactivateAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { emptyStore } = useEmptyStore();

  const { mode, toggleMode } = useThemeMode();
  async function deactivateAccount() {
    try {
      await deactivateAccountUrl();
      if (mode === "dark") {
        toggleMode();
      }
      emptyStore();
      removeAll();
      navigate("/", { replace: true });
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("profile.account_deactivated"),
        })
      );
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return { deactivateAccount };
}

export default useDeactivateAccount;
