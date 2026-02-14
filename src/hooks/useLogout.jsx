import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { setAlert, setLoading, setShowLogoLeft } from "../redux/configSlice";
import { getLogoutUrl } from "../apis/apiEndPoints";
import useEmptyStore from "./useEmptyStore";
import {
  getLocalStorage,
  removeAll,
  setLocalStorage,
} from "../utils/localStorageUtils";
import { ALERT_TYPE } from "../utils/constants/config";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../context/ThemeContext";
import { IS_ADMIN } from "../utils/constants/auth";

function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { emptyStore } = useEmptyStore();

  const { mode, toggleMode } = useThemeMode();
  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      await getLogoutUrl(getLocalStorage(IS_ADMIN));
      if (mode === "dark") {
        toggleMode();
      }
      setLocalStorage(IS_ADMIN, false);
      emptyStore();
      removeAll();
      navigate("/", { replace: true });
      dispatch(setShowLogoLeft(false));
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("navbar.logout_success"),
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

  return { handleLogout };
}

export default useLogout;
