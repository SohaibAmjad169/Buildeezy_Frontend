import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MOBILE_AD_DATA } from "../../utils/constants/auth";
import { removeLocalStorage } from "../../utils/localStorageUtils";


const RouteChangeListener = () => {
  const location = useLocation();

  useEffect(() => {
    removeLocalStorage(MOBILE_AD_DATA);
  }, [location.pathname]);

  return null; // This component doesn’t render anything
};

export default RouteChangeListener;
