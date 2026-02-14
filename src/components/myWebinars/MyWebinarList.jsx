import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";

import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { deleteWebinarUrl, getMyWebinarUrl } from "../../apis/apiEndPoints";
import WebinarCard from "./WebinarCard";
import MuiTypography from "../common/MuiTypography";
import { categorizeAds } from "../../utils/common";
import WebinarListSkeleton from "../skeleton/WebinarListSkeleton";
import MuiDialog from "../common/MuiDialog";
import { setWebinarList } from "../../redux/webinarSlice";
import { cloneDeep } from "lodash";
import NoData from "../common/NoData";
import { mapWebinarCategoryTitle } from "../../utils/constants/webinar";

function MyWebinarList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [webinarListData, setWebinarListData] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [webinarId, setWebinarId] = useState("");

  const { loading } = useSelector((state) => state.config);
  const { webinarList } = useSelector((state) => state.webinar);

  useEffect(() => {
    if (webinarList.length > 0) {
      // Filter out learning ads before categorizing
      const filteredWebinars = webinarList.filter(
        (webinar) =>
          webinar.adType !== "learningSolution" && ad.type !== "learningSolution"
      );
      setWebinarListData(categorizeAds(filteredWebinars));
    }
  }, [webinarList]);

  const fetchMyAds = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getMyWebinarUrl();
      dispatch(setWebinarList(res.data));
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
  }, [dispatch]);

  useEffect(() => {
    fetchMyAds();
  }, [fetchMyAds]);

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }

  function onDeleteWebinar(id) {
    setWebinarId(id);
    setOpenDeleteDialog(true);
  }

  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteWebinarUrl(webinarId);
      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("ad.deleted_successfully"),
        })
      );
      //update Ad list
      const newWebinarList = cloneDeep(webinarList);
      const findIndex = newWebinarList.findIndex((ad) => ad.id === webinarId);
      if (findIndex !== -1) {
        newWebinarList.splice(findIndex, 1);
        dispatch(setWebinarList(newWebinarList));
      }
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

  if (loading) {
    return <WebinarListSkeleton />;
  }

  return (
    <Box sx={{ mt: 2, minHeight: "75vh" }}>
      {Object.keys(webinarListData).length > 0 ? (
        Object.keys(webinarListData)?.map((category) => (
          <Box key={category}>
            <MuiTypography
              variant="h4"
              sx={{
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              {mapWebinarCategoryTitle[category] || "Uncategorized Ads"}
            </MuiTypography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
              {webinarListData[category]?.map(({ id, ...rest }) => (
                <WebinarCard
                  key={id}
                  id={id}
                  mappedType={mapWebinarCategoryTitle[category] || "Uncategorized"}
                  handleDeleteWebinar={onDeleteWebinar}
                  showActions={true}
                  {...rest}
                />
              ))}
            </Box>
          </Box>
        ))
      ) : (
        <NoData />
      )}

      <MuiDialog
        title={t("ad.delete_ad")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

export default MyWebinarList;
