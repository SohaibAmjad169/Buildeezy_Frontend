import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  setAccountDetails,
  setAuthDetails,
  setTerm,
  setUserType,
} from "../redux/registerSlice";
import {
  REGISTER_ACCOUNT_DETAILS,
  REGISTER_AUTH,
  USER_TYPES,
} from "../utils/constants/login";
import { setQuestionWizard } from "../redux/onboardingSlice";
import { AD_QUESTIONS } from "../utils/constants/ad";
import { setPostAdData } from "../redux/adSlice";
import { setPostJobData } from "../redux/jobSlice";
import { JOB_QUESTIONS } from "../utils/constants/job";

function useEmptyStore() {
  const dispatch = useDispatch();

  const emptyStore = useCallback(() => {
    dispatch(setUserType(""));
    dispatch(setAccountDetails(REGISTER_ACCOUNT_DETAILS));
    dispatch(setAuthDetails(REGISTER_AUTH));
    dispatch(setQuestionWizard([]));
    dispatch(setTerm(false));
  }, [dispatch]);

  const emptyPostData = useCallback(() => {
    dispatch(setPostAdData(AD_QUESTIONS));
    dispatch(setPostJobData(JOB_QUESTIONS));
  }, [dispatch]);

  return { emptyStore, emptyPostData };
}
export default useEmptyStore;
