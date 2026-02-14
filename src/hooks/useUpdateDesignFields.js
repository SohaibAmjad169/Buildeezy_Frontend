import { useDispatch, useSelector } from "react-redux";
import { setLoading, setAlert } from "../redux/configSlice";
import { updateProfileDesignUrl } from "../apis/apiEndPoints";
import { setProfileData } from "../redux/profileSlice";
import { USER_DATA } from "../utils/constants/auth";
import { setLocalStorage } from "../utils/localStorageUtils";
import { ALERT_TYPE } from "../utils/constants/config";

function useUpdateDesignFields() {
  const dispatch = useDispatch();
  const currentProfile = useSelector((state) => state.profile.profileData);

  async function updateDesignFields(
    designData,
    successMsg,
    callAction = () => { }
  ) {
    try {
      dispatch(setLoading(true));
      // Normalize skills to array of strings if needed
      if (
        designData?.content?.skills &&
        Array.isArray(designData.content.skills)
      ) {
        designData.content.skills = designData.content.skills.map((v) =>
          typeof v === "object" && v.id ? v.id : v
        );
      }
      // Normalize certifications.organization to always be an object with required fields
      if (
        designData?.content?.certifications &&
        Array.isArray(designData.content.certifications)
      ) {
        designData.content.certifications =
          designData.content.certifications.map((cert) => {
            let org = cert.organization;
            // If org is a string or id, convert to full object
            if (typeof org === "string") {
              // Try to find label/type from options if available (optional, fallback to id only)
              org = {
                id: org,
                type: "organization",
                label: org,
                description: null,
                extraData: { id: org },
              };
            } else if (typeof org === "object" && org !== null) {
              // Ensure all required fields exist
              org = {
                id: org.id || org.extraData?.id || "",
                type: org.type || "organization",
                label: org.label || org.id || "",
                description: org.description || null,
                extraData: org.extraData || { id: org.id || "" },
              };
            } else {
              org = {
                id: "",
                type: "organization",
                label: "",
                description: null,
                extraData: { id: "" },
              };
            }
            return { ...cert, organization: org };
          });
      }
      // Normalize faq field in interactive to required format
      if (
        designData?.interactive?.faq &&
        Array.isArray(designData.interactive.faq)
      ) {
        designData.interactive.faq = designData.interactive.faq.map(
          (item, idx) => ({
            id: item.id ?? null,
            userId: item.userId ?? (currentProfile?.id || null),
            question: item.question || "",
            answer: item.answer || "",
            displayOrder: item.displayOrder ?? idx + 1,
          })
        );
      }
      const response = await updateProfileDesignUrl({ data: designData });
      
      // Merge the new profileDesign into the existing profileData
      const updatedProfile = {
        ...currentProfile,
        profileDesign: response.data.data.profileDesign || response.data.data,
      };

      dispatch(setProfileData(updatedProfile));
      setLocalStorage(USER_DATA, { user: updatedProfile }, true);
      callAction();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: successMsg,
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

  return { updateDesignFields };
}

export default useUpdateDesignFields;
