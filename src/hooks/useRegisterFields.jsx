import { cloneDeep } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccountDetails,
  setAuthDetails,
  setIsSocialRegister,
  setProvider,
} from "../redux/registerSlice";

function useRegisterFields() {
  const dispatch = useDispatch();

  const { accountDetails, authDetails } = useSelector(
    (state) => state.register
  );

  function updateRegisterFields(firstName, lastName, email, id, type) {
    const newAccountDetails = cloneDeep(accountDetails);
    newAccountDetails[0].value = firstName;
    newAccountDetails[0].disabled = true;
    newAccountDetails[1].value = lastName;
    newAccountDetails[1].disabled = true;
    newAccountDetails[2].value = email;
    newAccountDetails[2].disabled = true;
    dispatch(setAccountDetails(newAccountDetails));

    const newAuthDetails = cloneDeep(authDetails).filter(
      (item) => item.id !== "password" && item.id !== "confirm_password"
    );
    dispatch(setAuthDetails(newAuthDetails));

    dispatch(setIsSocialRegister(true));
    dispatch(
      setProvider({
        id,
        type,
      })
    );
  }

  return { updateRegisterFields };
}

export default useRegisterFields;
