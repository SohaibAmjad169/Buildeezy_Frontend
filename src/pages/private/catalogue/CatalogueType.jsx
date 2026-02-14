import { Box, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CatalogueTabsAndSearch from "../../../components/catalogue/CatalogueTabsAndSearch";
import CommonCard from "../../../components/catalogue/CommonCard";
import Defultimage from "../../../assets/images/Defultimage.jpg";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAlert } from "../../../redux/configSlice";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { getCatalogueType } from "../../../apis/apiEndPoints";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";

// Sample room data
export default function CatalogueType() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [catalogTypeList, setCatalogTypeList] = useState({});

  const handleCardClick = (categoryId) => {
    navigate(`/catalogue/type/sub-catalogue/${categoryId}`);
  };

  useEffect(() => {
    async function CatalogueCategoryList() {
      try {
        setLoading(true);

        const response = await getCatalogueType(id);
        setCatalogTypeList(response?.data);
        setLoading(false);
      } catch (error) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error?.message,
          })
        );
        setLoading(false);
      }
    }
    CatalogueCategoryList();
  }, []);

  if (loading) {
    return <AdListSkeleton />;
  }

  return (
    <Box p={0}>
      <CatalogueTabsAndSearch
        catalogTypeList={catalogTypeList?.data}
        page={"/catalogue/type"}
      />
      <Grid container spacing={3} mt={2}>
        {catalogTypeList?.data && catalogTypeList?.data.length > 0 ? (
          catalogTypeList?.data?.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
              <CommonCard
                title={item?.title || "No Title"}
                image={item?.image || Defultimage}
                onClick={() => {
                  handleCardClick(item.id);
                }}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px" // Adjust based on your layout
            >
              <Typography variant="h6" color="textSecondary">
                No Data
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
